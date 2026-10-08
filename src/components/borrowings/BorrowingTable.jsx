import Table from '../ui/Table';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { formatDate, formatCurrency } from '../../lib/utils';
import { BORROWING_STATUS } from '../../lib/constants';
import { RotateCcw, AlertTriangle } from 'lucide-react';

export default function BorrowingTable({
  borrowings = [],
  loading = false,
  onReturn,
  showActions = true,
  emptyMessage = 'No borrowing transactions recorded yet.'
}) {
  const headers = [
    { label: 'TX ID', style: { width: '10%' } },
    { label: 'Book', style: { width: '25%' } },
    { label: 'Member', style: { width: '20%' } },
    { label: 'Issued / Due', style: { width: '18%' } },
    { label: 'Status', style: { width: '12%', textAlign: 'center' } },
    { label: 'Fine', style: { width: '10%', textAlign: 'right' } },
    ...(showActions ? [{ label: 'Action', style: { width: '10%', textAlign: 'right' } }] : [])
  ];

  const getStatusBadge = (b) => {
    switch (b.computedStatus) {
      case BORROWING_STATUS.OVERDUE:
        return <Badge variant="danger">{BORROWING_STATUS.OVERDUE}</Badge>;
      case BORROWING_STATUS.ACTIVE:
        return <Badge variant="warning">{BORROWING_STATUS.ACTIVE}</Badge>;
      case BORROWING_STATUS.RETURNED:
        return <Badge variant="success">{BORROWING_STATUS.RETURNED}</Badge>;
      default:
        return <Badge variant="neutral">{b.status}</Badge>;
    }
  };

  return (
    <Table
      headers={headers}
      loading={loading}
      isEmpty={borrowings.length === 0}
      emptyMessage={emptyMessage}
    >
      {borrowings.map((b) => {
        const isActionable = !b.returned_at;
        const isLate = b.daysLate > 0;

        return (
          <tr key={b.id}>
            <td>
              <code style={{
                fontSize: '0.75rem',
                backgroundColor: 'var(--bg-subtle)',
                padding: '0.125rem 0.375rem',
                borderRadius: 'var(--radius-sm)'
              }}>
                #{b.id.substring(0, 8)}
              </code>
            </td>
            <td>
              <div style={{ fontWeight: '600', color: 'var(--text-main)', lineHeight: '1.2' }}>
                {b.books?.title || 'Unknown Book'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {b.books?.author ? `by ${b.books.author}` : ''}
              </div>
            </td>
            <td>
              <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>
                {b.members?.name || 'Unknown Member'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {b.members?.member_code || ''}
              </div>
            </td>
            <td>
              <div style={{ fontSize: '0.8125rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Out:</span> {formatDate(b.issued_at)}
              </div>
              <div style={{ fontSize: '0.8125rem', fontWeight: isLate ? '600' : 'normal', color: isLate ? 'var(--color-danger)' : 'var(--text-main)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Due:</span> {formatDate(b.due_date)}
              </div>
            </td>
            <td style={{ textAlign: 'center' }}>
              {getStatusBadge(b)}
            </td>
            <td style={{ textAlign: 'right' }}>
              {isLate ? (
                <div style={{ color: 'var(--color-danger)', fontWeight: '700', fontSize: '0.875rem' }}>
                  {formatCurrency(b.fine)}
                  <div style={{ fontSize: '0.6875rem', fontWeight: 'normal', color: 'var(--text-muted)' }}>
                    ({b.daysLate}d late)
                  </div>
                </div>
              ) : (
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>—</span>
              )}
            </td>
            {showActions && (
              <td style={{ textAlign: 'right' }}>
                {isActionable && onReturn && (
                  <Button
                    variant={isLate ? 'danger' : 'secondary'}
                    size="sm"
                    icon={RotateCcw}
                    onClick={() => onReturn(b)}
                    title="Process Return"
                  >
                    Return
                  </Button>
                )}
                {!isActionable && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-success)', fontWeight: '500' }}>
                    Returned
                  </span>
                )}
              </td>
            )}
          </tr>
        );
      })}
    </Table>
  );
}
