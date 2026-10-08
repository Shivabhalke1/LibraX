import { Search, RotateCcw } from 'lucide-react';
import { MEMBER_STATUS } from '../../lib/constants';

export default function MemberFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  onReset
}) {
  return (
    <div className="filter-bar">
      {/* Search Input */}
      <div className="filter-search" style={{ position: 'relative' }}>
        <input
          type="text"
          className="form-input"
          style={{ paddingLeft: '2.25rem' }}
          placeholder="Search by member name, ID code, or email..."
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
          <option value="all">All Members</option>
          <option value={MEMBER_STATUS.ACTIVE}>Active Only</option>
          <option value={MEMBER_STATUS.INACTIVE}>Inactive Only</option>
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
