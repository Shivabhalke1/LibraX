export default function Badge({
  children,
  variant = 'neutral', // 'success', 'warning', 'danger', 'info', 'neutral'
  className = '',
  style = {}
}) {
  return (
    <span className={`badge badge-${variant} ${className}`.trim()} style={style}>
      {children}
    </span>
  );
}
