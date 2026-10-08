import Loader from './Loader';
import { Inbox } from 'lucide-react';

export default function Table({
  headers = [],
  children,
  loading = false,
  emptyMessage = 'No records found.',
  isEmpty = false,
  className = ''
}) {
  return (
    <div className={`table-container ${className}`.trim()}>
      <table className="app-table">
        {headers.length > 0 && (
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th key={i} style={typeof h === 'object' ? h.style : {}}>
                  {typeof h === 'object' ? h.label : h}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={headers.length || 6} style={{ padding: '2.5rem', textAlign: 'center' }}>
                <Loader text="Loading data..." />
              </td>
            </tr>
          ) : isEmpty ? (
            <tr>
              <td colSpan={headers.length || 6}>
                <div className="empty-state">
                  <Inbox size={32} className="empty-state-icon" />
                  <div className="empty-state-title">No records</div>
                  <div className="empty-state-text">{emptyMessage}</div>
                </div>
              </td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  );
}
