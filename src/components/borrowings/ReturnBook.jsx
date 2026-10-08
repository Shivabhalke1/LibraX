import Button from '../ui/Button';
import { formatDate, formatCurrency } from '../../lib/utils';
import { FINE_PER_DAY } from '../../lib/constants';
import { RotateCcw, AlertTriangle, CheckCircle } from 'lucide-react';

export default function ReturnBookModal({
  borrowing,
  onConfirmReturn,
  onCancel,
  loading = false
}) {
  if (!borrowing) return null;

  const isLate = borrowing.daysLate > 0;

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        {/* Book & Member Info Card */}
        <div style={{
          backgroundColor: 'var(--bg-subtle)',
          padding: '1rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1rem',
          border: '1px solid var(--border-light)'
        }}>
          <div style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '1rem' }}>
            {borrowing.books?.title}
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            Borrowed by: <strong>{borrowing.members?.name}</strong> ({borrowing.members?.member_code})
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8125rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Issue Date: </span>
              <strong>{formatDate(borrowing.issued_at)}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Due Date: </span>
              <strong>{formatDate(borrowing.due_date)}</strong>
            </div>
          </div>
        </div>

        {/* Overdue / Fine Notice */}
        {isLate ? (
          <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
            <AlertTriangle size={20} style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: '700' }}>Book is {borrowing.daysLate} day(s) Overdue!</div>
              <div style={{ fontSize: '0.8125rem', marginTop: '0.25rem' }}>
                Daily fine rate: <strong>{formatCurrency(FINE_PER_DAY)}/day</strong>.
                Total fine to collect: <strong style={{ fontSize: '1rem' }}>{formatCurrency(borrowing.fine)}</strong>.
              </div>
            </div>
          </div>
        ) : (
          <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
            <CheckCircle size={20} style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: '600' }}>Returned on time!</div>
              <div style={{ fontSize: '0.8125rem' }}>No fine applicable.</div>
            </div>
          </div>
        )}

        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          Processing this return will mark the borrowing transaction as returned and increment available copies by 1.
        </p>
      </div>

      <div className="modal-footer" style={{ margin: '1.25rem -1.5rem -1.5rem -1.5rem' }}>
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant={isLate ? 'danger' : 'primary'}
          onClick={() => onConfirmReturn(borrowing.id)}
          loading={loading}
          icon={RotateCcw}
        >
          {isLate ? `Accept Return & Collect ${formatCurrency(borrowing.fine)}` : 'Confirm Return'}
        </Button>
      </div>
    </div>
  );
}
