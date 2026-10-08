import { useState, useEffect, useCallback } from 'react';
import { bookService } from '../services/bookService';

export function useBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [availability, setAvailability] = useState('all');

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await bookService.getBooks({ search, category, availability });
      setBooks(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch books.');
    } finally {
      setLoading(false);
    }
  }, [search, category, availability]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const addBook = async (bookData) => {
    const newBook = await bookService.createBook(bookData);
    await fetchBooks();
    return newBook;
  };

  const editBook = async (id, bookData) => {
    const updated = await bookService.updateBook(id, bookData);
    await fetchBooks();
    return updated;
  };

  const removeBook = async (id) => {
    await bookService.deleteBook(id);
    await fetchBooks();
  };

  return {
    books,
    loading,
    error,
    search,
    setSearch,
    category,
    setCategory,
    availability,
    setAvailability,
    addBook,
    editBook,
    removeBook,
    refreshBooks: fetchBooks
  };
}
