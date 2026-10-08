import {
  LayoutDashboard,
  BookMarked,
  Users,
  BookPlus,
  RotateCcw,
  History,
  AlertTriangle,
  BookOpen,
  X
} from 'lucide-react';

export default function Sidebar({
  currentPage,
  onNavigate,
  isOpen,
  onClose
}) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'books', label: 'Books', icon: BookMarked },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'issue-book', label: 'Issue Book', icon: BookPlus },
    { id: 'returns', label: 'Returns', icon: RotateCcw },
    { id: 'transactions', label: 'Transactions', icon: History },
    { id: 'overdue', label: 'Overdue Records', icon: AlertTriangle, badge: 'Alert' },
  ];

  return (
    <>
      <div
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Brand Header */}
        <div style={{
          height: 'var(--topbar-height)',
          padding: '0 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              <BookOpen size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#ffffff', letterSpacing: '-0.01em' }}>
                LibraX
              </div>
              <div style={{ fontSize: '0.6875rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Library Admin
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="mobile-close-btn"
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'none',
              padding: '0.25rem'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav style={{ padding: '1rem 0.75rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onNavigate(item.id);
                  onClose();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.625rem 0.875rem',
                  borderRadius: 'var(--radius-md)',
                  background: isActive ? 'var(--bg-sidebar-active)' : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--text-sidebar)',
                  border: 'none',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? '600' : '500',
                  textAlign: 'left',
                  cursor: 'pointer',
                  width: '100%',
                  transition: 'background var(--transition-fast)'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'var(--bg-sidebar-hover)';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Icon size={18} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.id === 'overdue' && (
                  <span style={{
                    fontSize: '0.6875rem',
                    padding: '0.125rem 0.375rem',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'rgba(239, 68, 68, 0.2)',
                    color: '#fca5a5',
                    fontWeight: '600'
                  }}>
                    !
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* System Info / Viva Helper Badge */}
        <div style={{
          padding: '1rem 1.25rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          fontSize: '0.75rem',
          color: '#64748b'
        }}>
          <div style={{ color: '#94a3b8', fontWeight: '600' }}>LibraX v1.0 MVP</div>
          <div>PostgreSQL &bull; Supabase</div>
        </div>
      </aside>
    </>
  );
}
