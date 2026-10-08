import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const bookService = {
  /**
   * Fetch all books with optional search & filters
   */
  async getBooks({ search = '', category = '', availability = 'all' } = {}) {
    if (!isSupabaseConfigured) {
      return [];
    }

    let query = supabase
      .from('books')
      .select('*')
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    if (availability === 'available') {
      query = query.gt('available_copies', 0);
    } else if (availability === 'unavailable') {
      query = query.eq('available_copies', 0);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching books:', error);
      throw error;
    }

    let books = data || [];

    // Client-side text search across title, author, isbn
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      books = books.filter((b) =>
        b.title?.toLowerCase().includes(q) ||
        b.author?.toLowerCase().includes(q) ||
        b.isbn?.toLowerCase().includes(q)
      );
    }

    return books;
  },

  /**
   * Get single book by ID
   */
  async getBookById(id) {
    if (!isSupabaseConfigured) return null;
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Create a new book
   * When created, available_copies = total_copies
   */
  async createBook(book) {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured.');
    }

    const totalCopies = parseInt(book.total_copies, 10) || 1;
    if (totalCopies < 0) {
      throw new Error('Total copies cannot be negative.');
    }

    const payload = {
      title: book.title.trim(),
      author: book.author.trim(),
      isbn: book.isbn.trim(),
      category: book.category.trim(),
      publisher: book.publisher ? book.publisher.trim() : null,
      publication_year: book.publication_year ? parseInt(book.publication_year, 10) : null,
      total_copies: totalCopies,
      available_copies: totalCopies // Rule: available_copies = total_copies on creation
    };

    const { data, error } = await supabase
      .from('books')
      .insert([payload])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error(`A book with ISBN "${book.isbn}" already exists.`);
      }
      throw error;
    }

    return data;
  },

  /**
   * Update an existing book
   */
  async updateBook(id, book) {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured.');
    }

    // Retrieve current book to calculate available copy adjustment
    const current = await this.getBookById(id);
    if (!current) throw new Error('Book not found.');

    const newTotal = parseInt(book.total_copies, 10);
    if (newTotal < 0) throw new Error('Total copies cannot be negative.');

    const borrowedCount = current.total_copies - current.available_copies;
    if (newTotal < borrowedCount) {
      throw new Error(
        `Cannot reduce total copies below ${borrowedCount} because ${borrowedCount} copy/copies are currently borrowed.`
      );
    }

    const newAvailable = newTotal - borrowedCount;

    const payload = {
      title: book.title.trim(),
      author: book.author.trim(),
      isbn: book.isbn.trim(),
      category: book.category.trim(),
      publisher: book.publisher ? book.publisher.trim() : null,
      publication_year: book.publication_year ? parseInt(book.publication_year, 10) : null,
      total_copies: newTotal,
      available_copies: newAvailable
    };

    const { data, error } = await supabase
      .from('books')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error(`A book with ISBN "${book.isbn}" already exists.`);
      }
      throw error;
    }

    return data;
  },

  /**
   * Delete book safely.
   * Prevents deletion if active borrowing records exist (Rule 9).
   */
  async deleteBook(id) {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured.');
    }

    // Check for active borrowings
    const { data: activeBorrowings, error: checkError } = await supabase
      .from('borrowings')
      .select('id')
      .eq('book_id', id)
      .is('returned_at', null);

    if (checkError) throw checkError;

    if (activeBorrowings && activeBorrowings.length > 0) {
      throw new Error(
        `Cannot delete this book. It currently has ${activeBorrowings.length} active borrowed copy/copies.`
      );
    }

    const { error } = await supabase
      .from('books')
      .delete()
      .eq('id', id);

    if (error) {
      if (error.code === '23503') {
        throw new Error('Cannot delete this book as it has past transaction history.');
      }
      throw error;
    }

    return true;
  }
};
