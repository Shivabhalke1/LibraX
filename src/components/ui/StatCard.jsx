export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  color = 'primary', // 'primary', 'success', 'warning', 'danger', 'info'
  onClick
}) {
  const colorMap = {
    primary: { bg: '#eff6ff', fg: '#1e40af' },
    success: { bg: '#f0fdf4', fg: '#166534' },
    warning: { bg: '#fffbeb', fg: '#92400e' },
    danger: { bg: '#fef2f2', fg: '#991b1b' },
    info: { bg: '#f0f9ff', fg: '#0369a1' },
  };

  const theme = colorMap[color] || colorMap.primary;

  return (
    <div
      className="card"
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <span style={{ fontSize: '0.8125rem', fontWeight: '500', color: 'var(--text-muted)' }}>
            {title}
          </span>
          <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-main)', marginTop: '0.25rem' }}>
            {value}
          </div>
          {trend && (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              {trend}
            </div>
          )}
        </div>
        {Icon && (
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: theme.bg,
              color: theme.fg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Icon size={22} />
          </div>
        )}
      </div>
    </div>
  );
}
