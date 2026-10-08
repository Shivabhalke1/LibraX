import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { BORROWING_PERIOD, FINE_PER_DAY, BORROWING_STATUS, MEMBER_STATUS } from '../lib/constants';
import { calculateDaysLate, calculateFine, isOverdue, addDays, toInputDateFormat } from '../lib/utils';

export const borrowingService = {
  /**
   * Fetch all borrowings (active, returned, overdue) with joined book and member data
   */
  async getAllBorrowings({ search = '', status = 'all' } = {}) {
    if (!isSupabaseConfigured) return [];

    let query = supabase
      .from('borrowings')
      .select(`
        id,
        book_id,
        member_id,
        issued_at,
        due_date,
        returned_at,
        status,
        created_at,
        books ( id, title, author, isbn, category ),
        members ( id, member_code, name, email, department, status )
      `)
      .order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching borrowings:', error);
      throw error;
    }

    let records = (data || []).map((b) => {
      const daysLate = calculateDaysLate(b.due_date, b.returned_at);
      const fine = calculateFine(b.due_date, b.returned_at, FINE_PER_DAY);
      const overdue = isOverdue(b.due_date, b.returned_at);

      let computedStatus = b.status;
      if (b.returned_at) {
        computedStatus = BORROWING_STATUS.RETURNED;
      } else if (overdue) {
        computedStatus = BORROWING_STATUS.OVERDUE;
      } else {
        computedStatus = BORROWING_STATUS.ACTIVE;
      }

      return {
        ...b,
        computedStatus,
        daysLate,
        fine,
        isOverdue: overdue
      };
    });

    // Apply status filter
    if (status && status !== 'all') {
      records = records.filter((r) => r.computedStatus.toLowerCase() === status.toLowerCase());
    }

    // Apply search filter
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      records = records.filter((r) =>
        r.books?.title?.toLowerCase().includes(q) ||
        r.members?.name?.toLowerCase().includes(q) ||
        r.members?.member_code?.toLowerCase().includes(q) ||
        r.id?.toLowerCase().includes(q)
      );
    }

    return records;
  },

  /**
   * Fetch currently active borrowings (unreturned loans)
   */
  async getActiveBorrowings() {
    const all = await this.getAllBorrowings();
    return all.filter((b) => !b.returned_at);
  },

  /**
   * Fetch only overdue borrowings
   */
  async getOverdueBorrowings() {
    const all = await this.getAllBorrowings();
    return all.filter((b) => !b.returned_at && b.isOverdue);
  },

  /**
   * Issue a book to a member
   * Workflow & Validations:
   * 1. Member must be Active (Rule 3)
   * 2. Book available_copies must be > 0 (Rule 4)
   * 3. Insert borrowing transaction
   * 4. Decrement available_copies by 1
   */
  async issueBook({
    book_id,
    member_id,
    issued_at = toInputDateFormat(new Date()),
    due_date = addDays(new Date(), BORROWING_PERIOD)
  }) {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured.');
    }

    if (!book_id) throw new Error('Please select a book.');
    if (!member_id) throw new Error('Please select a member.');

    // 1. Verify Member status
    const { data: member, error: memberErr } = await supabase
      .from('members')
      .select('id, name, status')
      .eq('id', member_id)
      .single();

    if (memberErr || !member) throw new Error('Selected member not found.');
    if (member.status !== MEMBER_STATUS.ACTIVE) {
      throw new Error(`Member "${member.name}" is Inactive. Inactive members cannot borrow books.`);
    }

    // 2. Verify Book availability
    const { data: book, error: bookErr } = await supabase
      .from('books')
      .select('id, title, available_copies, total_copies')
      .eq('id', book_id)
      .single();

    if (bookErr || !book) throw new Error('Selected book not found.');
    if (book.available_copies <= 0) {
      throw new Error(`No copies available for "${book.title}". (Available: 0)`);
    }

    // 3. Create Borrowing Record
    const { data: borrowing, error: borrowErr } = await supabase
      .from('borrowings')
      .insert([{
        book_id,
        member_id,
        issued_at: new Date(issued_at).toISOString(),
        due_date,
        returned_at: null,
        status: BORROWING_STATUS.ACTIVE
      }])
      .select()
      .single();

    if (borrowErr) throw borrowErr;

    // 4. Decrement available_copies by 1
    const { error: updateBookErr } = await supabase
      .from('books')
      .update({ available_copies: Math.max(0, book.available_copies - 1) })
      .eq('id', book_id);

    if (updateBookErr) {
      console.error('Error updating book copies after issuance:', updateBookErr);
    }

    return borrowing;
  },

  /**
   * Return a borrowed book
   * Workflow:
   * 1. Check borrowing is active (Rule 5 & 6)
   * 2. Set returned_at = now() and status = 'Returned'
   * 3. Increment book available_copies by 1 (Rule 2)
   * 4. Calculate fine if overdue
   */
  async returnBook(borrowing_id) {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured.');
    }

    // 1. Fetch borrowing record
    const { data: borrowing, error: fetchErr } = await supabase
      .from('borrowings')
      .select('*, books (id, title, available_copies, total_copies)')
      .eq('id', borrowing_id)
      .single();

    if (fetchErr || !borrowing) {
      throw new Error('Borrowing record not found.');
    }

    if (borrowing.returned_at) {
      throw new Error('This book has already been returned.');
    }

    const returnedAt = new Date().toISOString();
    const daysLate = calculateDaysLate(borrowing.due_date, returnedAt);
    const fine = calculateFine(borrowing.due_date, returnedAt, FINE_PER_DAY);

    // 2. Update borrowing record
    const { data: updatedBorrowing, error: updateErr } = await supabase
      .from('borrowings')
      .update({
        returned_at: returnedAt,
        status: BORROWING_STATUS.RETURNED
      })
      .eq('id', borrowing_id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    // 3. Increment book available_copies by 1
    if (borrowing.books) {
      const book = borrowing.books;
      const newCopies = Math.min(book.total_copies, (book.available_copies || 0) + 1);

      await supabase
        .from('books')
        .update({ available_copies: newCopies })
        .eq('id', book.id);
    }

    return {
      borrowing: updatedBorrowing,
      daysLate,
      fine,
      isLate: daysLate > 0
    };
  }
};
