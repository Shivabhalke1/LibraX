import Table from '../ui/Table';
import Badge from '../ui/Badge';
import { Edit2, Trash2, BookOpen } from 'lucide-react';
import { BOOK_STATUS } from '../../lib/constants';

export default function BookTable({
  books = [],
  loading = false,
  onEdit,
  onDelete
}) {
  const headers = [
    { label: 'Book Details', style: { width: '30%' } },
    { label: 'ISBN', style: { width: '15%' } },
    { label: 'Category', style: { width: '18%' } },
    { label: 'Copies', style: { width: '12%', textAlign: 'center' } },
    { label: 'Status', style: { width: '12%', textAlign: 'center' } },
    { label: 'Actions', style: { width: '13%', textAlign: 'right' } }
  ];

  return (
    <Table
      headers={headers}
      loading={loading}
      isEmpty={books.length === 0}
      emptyMessage="No books found matching your criteria. Try adjusting filters or add a new book."
    >
      {books.map((book) => {
        const isAvailable = book.available_copies > 0;
        return (
          <tr key={book.id}>
            <td>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-primary-light)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <BookOpen size={16} />
                </div>
                <div>
                  <div style={{ fontWeight: '600', color: 'var(--text-main)', lineHeight: '1.3' }}>
                    {book.title}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    by {book.author} {book.publication_year ? `(${book.publication_year})` : ''}
                  </div>
                </div>
              </div>
            </td>
            <td>
              <code style={{
                fontSize: '0.8125rem',
                backgroundColor: 'var(--bg-subtle)',
                padding: '0.125rem 0.375rem',
                borderRadius: 'var(--radius-sm)'
              }}>
                {book.isbn}
              </code>
            </td>
            <td>
              <span style={{
                fontSize: '0.8125rem',
                padding: '0.2rem 0.5rem',
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-body)'
              }}>
                {book.category}
              </span>
            </td>
            <td style={{ textAlign: 'center' }}>
              <span style={{ fontWeight: '700', color: isAvailable ? 'var(--color-success)' : 'var(--color-danger)' }}>
                {book.available_copies}
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                {' '}/ {book.total_copies}
              </span>
            </td>
            <td style={{ textAlign: 'center' }}>
              {isAvailable ? (
                <Badge variant="success">{BOOK_STATUS.AVAILABLE}</Badge>
              ) : (
                <Badge variant="danger">{BOOK_STATUS.BORROWED}</Badge>
              )}
            </td>
            <td style={{ textAlign: 'right' }}>
              <div style={{ display: 'inline-flex', gap: '0.375rem' }}>
                <button
                  type="button"
                  onClick={() => onEdit(book)}
                  className="btn btn-secondary btn-sm"
                  title="Edit Book"
                  style={{ padding: '0.375rem 0.5rem' }}
                >
                  <Edit2 size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(book)}
                  className="btn btn-secondary btn-sm"
                  title="Delete Book"
                  style={{ padding: '0.375rem 0.5rem', color: 'var(--color-danger)' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </td>
          </tr>
        );
      })}
    </Table>
  );
}
