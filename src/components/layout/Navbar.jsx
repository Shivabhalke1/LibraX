import { Menu, LogOut, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function Navbar({
  pageTitle,
  onToggleSidebar
}) {
  const { user, profile, logout } = useAuth();

  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          type="button"
          onClick={onToggleSidebar}
          className="btn btn-secondary btn-sm"
          style={{ padding: '0.4rem', border: 'none', background: 'transparent' }}
          aria-label="Toggle menu"
        >
          <Menu size={22} color="var(--text-main)" />
        </button>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)' }}>
            {pageTitle}
          </h2>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* User Info Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.625rem',
          padding: '0.375rem 0.75rem',
          backgroundColor: 'var(--bg-subtle)',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.8125rem'
        }}>
          <div style={{
            width: '26px',
            height: '26px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-primary-light)',
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '600'
          }}>
            <User size={15} />
          </div>
          <div>
            <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>
              {profile?.name || user?.email?.split('@')[0] || 'Librarian'}
            </span>
            <span className="topbar-user-role" style={{ marginLeft: '0.375rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
              ({profile?.role || 'Admin'})
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          type="button"
          onClick={logout}
          className="btn btn-secondary btn-sm"
          title="Sign Out"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}
