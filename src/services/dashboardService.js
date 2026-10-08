import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { isOverdue, calculateDaysLate, calculateFine } from '../lib/utils';
import { FINE_PER_DAY } from '../lib/constants';

export const dashboardService = {
  /**
   * Calculate all real-time library statistics directly from database
   */
  async getDashboardStats() {
    if (!isSupabaseConfigured) {
      return {
        totalBooks: 0,
        totalCopies: 0,
        availableBooks: 0,
        borrowedBooks: 0,
        totalMembers: 0,
        activeMembers: 0,
        overdueBooks: 0,
        dueToday: 0,
        recentTransactions: [],
        popularBooks: [],
        activityData: []
      };
    }

    // Run parallel queries to fetch books, members, and borrowings
    const [booksRes, membersRes, borrowingsRes] = await Promise.all([
      supabase.from('books').select('id, title, author, total_copies, available_copies, category'),
      supabase.from('members').select('id, name, status'),
      supabase.from('borrowings').select(`
        id,
        book_id,
        member_id,
        issued_at,
        due_date,
        returned_at,
        status,
        created_at,
        books ( id, title, author ),
        members ( id, name, member_code )
      `).order('created_at', { ascending: false })
    ]);

    const books = booksRes.data || [];
    const members = membersRes.data || [];
    const borrowings = borrowingsRes.data || [];

    // 1. Book metrics
    const totalTitles = books.length;
    const totalCopies = books.reduce((sum, b) => sum + (b.total_copies || 0), 0);
    const availableCopies = books.reduce((sum, b) => sum + (b.available_copies || 0), 0);
    const borrowedCopies = totalCopies - availableCopies;

    // 2. Member metrics
    const totalMembers = members.length;
    const activeMembers = members.filter((m) => m.status === 'Active').length;

    // 3. Overdue & Due Today calculations
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let overdueCount = 0;
    let dueTodayCount = 0;

    const enrichedBorrowings = borrowings.map((b) => {
      const isRecordOverdue = isOverdue(b.due_date, b.returned_at);
      const isUnreturned = !b.returned_at;

      if (isUnreturned) {
        if (isRecordOverdue) {
          overdueCount += 1;
        }

        const due = new Date(b.due_date);
        due.setHours(0, 0, 0, 0);
        if (due.getTime() === today.getTime()) {
          dueTodayCount += 1;
        }
      }

      return {
        ...b,
        computedStatus: b.returned_at ? 'Returned' : isRecordOverdue ? 'Overdue' : 'Active',
        daysLate: calculateDaysLate(b.due_date, b.returned_at),
        fine: calculateFine(b.due_date, b.returned_at, FINE_PER_DAY)
      };
    });

    // 4. Most popular / borrowed books
    const borrowFrequency = {};
    borrowings.forEach((b) => {
      if (b.book_id) {
        borrowFrequency[b.book_id] = (borrowFrequency[b.book_id] || 0) + 1;
      }
    });

    const popularBooks = books
      .map((b) => ({
        ...b,
        borrowCount: borrowFrequency[b.id] || 0
      }))
      .sort((a, b) => b.borrowCount - a.borrowCount)
      .slice(0, 4);

    return {
      totalBooks: totalTitles,
      totalCopies,
      availableBooks: availableCopies,
      borrowedBooks: Math.max(0, borrowedCopies),
      totalMembers,
      activeMembers,
      overdueBooks: overdueCount,
      dueToday: dueTodayCount,
      recentTransactions: enrichedBorrowings.slice(0, 5),
      popularBooks
    };
  }
};
