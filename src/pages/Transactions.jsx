import { useState } from 'react';
import { useBorrowings } from '../hooks/useBorrowings';
import BorrowingTable from '../components/borrowings/BorrowingTable';
import BorrowingFilters from '../components/borrowings/BorrowingFilters';
import ReturnBookModal from '../components/borrowings/ReturnBook';
import Modal from '../components/ui/Modal';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

export default function Transactions() {
  const {
    borrowings,
    loading,
    error,
    search,
    setSearch,
    status,
    setStatus,
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
          `Book returned successfully! Overdue fine of ${formatCurrency(result.fine)} collected (${result.daysLate} day(s) late).`
        );
      } else {
        showNotice('success', 'Book returned on time! Available copies increased by 1.');
      }
    } catch (err) {
      showNotice('error', err.message || 'Error processing return.');
      setReturningBorrowing(null);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReset = () => {
    setSearch('');
    setStatus('all');
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-header-title">Borrowing Transactions</h1>
          <p className="page-header-subtitle">
            Complete transaction ledger of all issued, returned, and overdue loans
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

      {/* Filter Bar */}
      <BorrowingFilters
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        onReset={handleReset}
      />

      {/* Table */}
      <BorrowingTable
        borrowings={borrowings}
        loading={loading}
        onReturn={(b) => setReturningBorrowing(b)}
        showActions={true}
        emptyMessage="No transaction history matches your criteria."
      />

      {/* Return Modal */}
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
