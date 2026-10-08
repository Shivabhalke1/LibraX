import { useState } from 'react';
import { useBorrowings } from '../hooks/useBorrowings';
import BorrowingTable from '../components/borrowings/BorrowingTable';
import ReturnBookModal from '../components/borrowings/ReturnBook';
import Modal from '../components/ui/Modal';
import { Search, RotateCcw, CheckCircle, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

export default function Returns() {
  const {
    borrowings,
    loading,
    error,
    search,
    setSearch,
    processReturn
  } = useBorrowings();

  const [returningBorrowing, setReturningBorrowing] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [notice, setNotice] = useState(null);

  const showNotice = (type, message) => {
    setNotice({ type, message });
    setTimeout(() => setNotice(null), 5000);
  };

  const handleConfirmReturn = async (borrowingId) => {
    setActionLoading(true);
    try {
      const result = await processReturn(borrowingId);
      setReturningBorrowing(null);
      if (result.isLate) {
        showNotice(
          'success',
          `Book returned successfully! Overdue fine of ${formatCurrency(result.fine)} collected (${result.daysLate} day(s) late). Available copies increased.`
        );
      } else {
        showNotice('success', 'Book returned on time! Available copies increased by 1.');
      }
    } catch (err) {
      showNotice('error', err.message || 'Error processing book return.');
      setReturningBorrowing(null);
    } finally {
      setActionLoading(false);
    }
  };

  // Only active loans need to be returned
  const activeLoans = borrowings.filter((b) => !b.returned_at);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-header-title">Process Returns</h1>
          <p className="page-header-subtitle">
            Accept returned books, restore inventory counts, and calculate overdue fines
          </p>
        </div>
      </div>

      {notice && (
        <div className={`alert alert-${notice.type}`}>
          {notice.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <div>{notice.message}</div>
        </div>
      )}

      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={18} />
          <div>{error}</div>
        </div>
      )}

      {/* Search Bar */}
      <div className="filter-bar">
        <div className="filter-search" style={{ position: 'relative' }}>
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.25rem' }}
            placeholder="Search active loans by book title or member name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-subtle)',
              pointerEvents: 'none'
            }}
          />
        </div>
      </div>

      {/* Active Borrowings Table */}
      <BorrowingTable
        borrowings={activeLoans}
        loading={loading}
        onReturn={(b) => setReturningBorrowing(b)}
        showActions={true}
        emptyMessage="No pending books to return. All issued books are currently accounted for!"
      />

      {/* Return Confirmation Modal */}
      <Modal
        isOpen={Boolean(returningBorrowing)}
        onClose={() => setReturningBorrowing(null)}
        title="Confirm Book Return"
      >
        <ReturnBookModal
          borrowing={returningBorrowing}
          onConfirmReturn={handleConfirmReturn}
          onCancel={() => setReturningBorrowing(null)}
          loading={actionLoading}
        />
      </Modal>
    </div>
  );
}
