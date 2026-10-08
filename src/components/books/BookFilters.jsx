import { Search, RotateCcw } from 'lucide-react';
import { BOOK_CATEGORIES } from '../../lib/constants';

export default function BookFilters({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  availability,
  onAvailabilityChange,
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
          placeholder="Search by title, author, or ISBN..."
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

      {/* Category Filter */}
      <div style={{ minWidth: '180px' }}>
        <select
          className="form-select"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          <option value="">All Categories</option>
          {BOOK_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Availability Filter */}
      <div style={{ minWidth: '160px' }}>
        <select
          className="form-select"
          value={availability}
          onChange={(e) => onAvailabilityChange(e.target.value)}
        >
          <option value="all">All Copies</option>
          <option value="available">Available (&gt; 0)</option>
          <option value="unavailable">Unavailable (0)</option>
        </select>
      </div>

      {/* Reset Filters */}
      {(search || category || availability !== 'all') && (
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
