import { useState } from 'react';
import IssueBookForm from '../components/borrowings/IssueBook';
import BorrowingTable from '../components/borrowings/BorrowingTable';
import ReturnBookModal from '../components/borrowings/ReturnBook';
import Modal from '../components/ui/Modal';
import { useBorrowings } from '../hooks/useBorrowings';
import { CheckCircle, AlertCircle, BookPlus } from 'lucide-react';

export default function IssueBook({ onNavigate }) {
  const {
    borrowings,
    loading,
    error,
    issueNewBook,
    processReturn
  } = useBorrowings({ status: 'Active' });

  const [actionLoading, setActionLoading] = useState(false);
  const [returningBorrowing, setReturningBorrowing] = useState(null);
  const [notice, setNotice] = useState(null);

  const showNotice = (type, message) => {
    setNotice({ type, message });
    setTimeout(() => setNotice(null), 5000);
  };

  const handleIssue = async (formData) => {
    setActionLoading(true);
    try {
      await issueNewBook(formData);
      showNotice('success', 'Book issued successfully! Copy count has been updated.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmReturn = async (borrowingId) => {
    setActionLoading(true);
    try {
      const result = await processReturn(borrowingId);
      setReturningBorrowing(null);
      if (result.isLate) {
        showNotice(
          'success',
          `Book returned successfully! Late fine of ₹${result.fine} calculated (${result.daysLate} days late). Available copies increased.`
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

  const activeLoans = borrowings.filter((b) => !b.returned_at);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-header-title">Issue Book</h1>
          <p className="page-header-subtitle">
            Assign library titles to active members with automated due-date calculation
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

      {/* Main Issue Card */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ maxWidth: '640px' }}>
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookPlus size={18} color="var(--color-primary)" />
              New Book Issuance Form
            </h3>
          </div>
          <IssueBookForm
            onSubmit={handleIssue}
            onCancel={() => onNavigate && onNavigate('dashboard')}
            loading={actionLoading}
          />
        </div>
      </div>

      {/* Recently Issued Active Loans Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Current Active Loans ({activeLoans.length})</h3>
        </div>
        <BorrowingTable
          borrowings={activeLoans.slice(0, 5)}
          loading={loading}
          onReturn={(b) => setReturningBorrowing(b)}
          emptyMessage="No active book loans at present."
        />
      </div>

      {/* Return Confirmation Modal */}
      <Modal
        isOpen={Boolean(returningBorrowing)}
        onClose={() => setReturningBorrowing(null)}
        title="Process Book Return"
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
