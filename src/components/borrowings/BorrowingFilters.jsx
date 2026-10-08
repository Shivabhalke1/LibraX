import { Search, RotateCcw } from 'lucide-react';
import { BORROWING_STATUS } from '../../lib/constants';

export default function BorrowingFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  onReset
}) {
  return (
    <div className="filter-bar">
      {/* Search Bar */}
      <div className="filter-search" style={{ position: 'relative' }}>
        <input
          type="text"
          className="form-input"
          style={{ paddingLeft: '2.25rem' }}
          placeholder="Search by book title, member name, or record ID..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
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

      {/* Status Filter */}
      <div style={{ minWidth: '160px' }}>
        <select
          className="form-select"
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          <option value="all">All Records</option>
          <option value={BORROWING_STATUS.ACTIVE}>Active Loans</option>
          <option value={BORROWING_STATUS.OVERDUE}>Overdue Loans</option>
          <option value={BORROWING_STATUS.RETURNED}>Returned Books</option>
        </select>
      </div>

      {/* Reset */}
      {(search || status !== 'all') && (
        <button
          type="button"
          onClick={onReset}
          className="btn btn-secondary btn-sm"
          title="Reset Filters"
        >
          <RotateCcw size={14} />
          Reset
        </button>
      )}
    </div>
  );
}
