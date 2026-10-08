import { useState } from 'react';
import { useBorrowings } from '../hooks/useBorrowings';
import BorrowingTable from '../components/borrowings/BorrowingTable';
import ReturnBookModal from '../components/borrowings/ReturnBook';
import Modal from '../components/ui/Modal';
import StatCard from '../components/ui/StatCard';
import { AlertTriangle, DollarSign, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { FINE_PER_DAY } from '../lib/constants';
import { formatCurrency } from '../lib/utils';

export default function Overdue({ _onNavigate }) {
  const {
    borrowings,
    loading,
    error,
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
      showNotice(
        'success',
        `Overdue book returned successfully! ${formatCurrency(result.fine)} fine collected (${result.daysLate} day(s) late). Inventory updated.`
      );
    } catch (err) {
      showNotice('error', err.message || 'Error processing overdue return.');
      setReturningBorrowing(null);
    } finally {
      setActionLoading(false);
    }
  };

  // Filter only active loans that are overdue
  const overdueBorrowings = borrowings.filter((b) => !b.returned_at && b.isOverdue);
  const totalFineOutstanding = overdueBorrowings.reduce((sum, b) => sum + (b.fine || 0), 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-header-title">Overdue Tracking &amp; Fines</h1>
          <p className="page-header-subtitle">
            Automated detection of loans past due date with dynamic penalty calculation
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

      {/* Overdue Metric Overview */}
      <div className="stats-grid">
        <StatCard
          title="Total Overdue Loans"
          value={overdueBorrowings.length}
          icon={AlertTriangle}
          color="danger"
        />
        <StatCard
          title="Total Outstanding Fines"
          value={formatCurrency(totalFineOutstanding)}
          icon={DollarSign}
          color="warning"
        />
        <StatCard
          title="Configured Fine Rate"
          value={`${formatCurrency(FINE_PER_DAY)} / day`}
          icon={Calendar}
          color="info"
          trend="Configured in constants.js"
        />
      </div>

      {/* Overdue Records Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-danger)' }}>
            <AlertTriangle size={18} />
            Delinquent Loan Records ({overdueBorrowings.length})
          </h3>
        </div>
        <BorrowingTable
          borrowings={overdueBorrowings}
          loading={loading}
          onReturn={(b) => setReturningBorrowing(b)}
          showActions={true}
          emptyMessage="Great news! There are currently zero overdue books across the entire library system."
        />
      </div>

      {/* Return Modal */}
      <Modal
        isOpen={Boolean(returningBorrowing)}
        onClose={() => setReturningBorrowing(null)}
        title="Resolve Overdue Loan"
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
