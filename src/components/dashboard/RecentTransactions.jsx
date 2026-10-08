import Badge from '../ui/Badge';
import { formatDate, formatCurrency } from '../../lib/utils';
import { ArrowRight, History } from 'lucide-react';

export default function RecentTransactions({ transactions = [], onNavigate }) {
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <History size={18} color="var(--color-primary)" />
          Recent Transactions
        </h3>
        <button
          type="button"
          onClick={() => onNavigate && onNavigate('transactions')}
          className="btn btn-secondary btn-sm"
        >
          <span>View All</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {transactions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          No borrowing transactions logged yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {transactions.map((tx) => {
            const isLate = tx.daysLate > 0;
            return (
              <div
                key={tx.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-subtle)',
                  border: '1px solid var(--border-light)',
                  fontSize: '0.875rem'
                }}
              >
                <div>
                  <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>
                    {tx.books?.title || 'Book Title'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Borrowed by <strong>{tx.members?.name || 'Member'}</strong> &bull; Due: {formatDate(tx.due_date)}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {isLate && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-danger)', fontWeight: '700' }}>
                      {formatCurrency(tx.fine)} fine
                    </span>
                  )}
                  <Badge variant={
                    tx.computedStatus === 'Returned' ? 'success' :
                    tx.computedStatus === 'Overdue' ? 'danger' : 'warning'
                  }>
                    {tx.computedStatus}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
