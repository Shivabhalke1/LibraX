import { BookOpen, TrendingUp, BarChart3 } from 'lucide-react';

export default function BorrowingChart({ stats = {} }) {
  const total = stats.totalCopies || 1;
  const availablePct = Math.round(((stats.availableBooks || 0) / total) * 100);
  const borrowedPct = Math.round(((stats.borrowedBooks || 0) / total) * 100);

  const popular = stats.popularBooks || [];

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BarChart3 size={18} color="var(--color-primary)" />
          Inventory &amp; Circulation Analytics
        </h3>
      </div>

      {/* Stock Circulation Bar */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.5rem' }}>
          <span style={{ fontWeight: '500' }}>Circulation Ratio</span>
          <span style={{ color: 'var(--text-muted)' }}>
            {stats.availableBooks} Available / {stats.borrowedBooks} Borrowed
          </span>
        </div>

        <div style={{
          height: '12px',
          width: '100%',
          backgroundColor: '#e2e8f0',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
          display: 'flex'
        }}>
          <div
            style={{
              width: `${availablePct}%`,
              backgroundColor: 'var(--color-success)',
              transition: 'width 0.5s ease'
            }}
            title={`Available: ${availablePct}%`}
          />
          <div
            style={{
              width: `${borrowedPct}%`,
              backgroundColor: 'var(--color-warning)',
              transition: 'width 0.5s ease'
            }}
            title={`Borrowed: ${borrowedPct}%`}
          />
        </div>

        <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.5rem', fontSize: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-success)' }} />
            <span>Available ({availablePct}%)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-warning)' }} />
            <span>Borrowed ({borrowedPct}%)</span>
          </div>
        </div>
      </div>

      {/* Most Popular Titles */}
      <div>
        <div style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <TrendingUp size={15} color="var(--color-accent)" />
          Most Borrowed Library Titles
        </div>

        {popular.length === 0 ? (
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            No borrowing activity recorded yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {popular.map((book) => {
              const maxBorrow = Math.max(...popular.map((p) => p.borrowCount || 1), 1);
              const barWidth = Math.max(10, Math.round(((book.borrowCount || 0) / maxBorrow) * 100));

              return (
                <div key={book.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.2rem' }}>
                    <span style={{ fontWeight: '500', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '240px' }}>
                      {book.title}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      {book.borrowCount} loan(s)
                    </span>
                  </div>
                  <div style={{
                    height: '6px',
                    width: '100%',
                    backgroundColor: 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-full)',
                    overflow: 'hidden'
                  }}>
                    <div
                      style={{
                        width: `${barWidth}%`,
                        height: '100%',
                        backgroundColor: 'var(--color-accent)',
                        borderRadius: 'var(--radius-full)'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
