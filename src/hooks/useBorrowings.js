import { useState, useEffect, useCallback } from 'react';
import { borrowingService } from '../services/borrowingService';

export function useBorrowings(initialFilter = {}) {
  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState(initialFilter.search || '');
  const [status, setStatus] = useState(initialFilter.status || 'all');

  const fetchBorrowings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await borrowingService.getAllBorrowings({ search, status });
      setBorrowings(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch borrowing records.');
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    fetchBorrowings();
  }, [fetchBorrowings]);

  const issueNewBook = async (payload) => {
    const result = await borrowingService.issueBook(payload);
    await fetchBorrowings();
    return result;
  };

  const processReturn = async (id) => {
    const result = await borrowingService.returnBook(id);
    await fetchBorrowings();
    return result;
  };

  return {
    borrowings,
    loading,
    error,
    search,
    setSearch,
    status,
    setStatus,
    issueNewBook,
    processReturn,
    refreshBorrowings: fetchBorrowings
  };
}
