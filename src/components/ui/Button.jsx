export default function Button({
  children,
  variant = 'primary', // 'primary', 'secondary', 'accent', 'danger'
  size = 'md', // 'sm', 'md', 'lg'
  icon: Icon,
  loading = false,
  disabled = false,
  type = 'button',
  onClick,
  style = {},
  className = '',
  ...props
}) {
  const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '';
  const variantClass = `btn-${variant}`;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`btn ${variantClass} ${sizeClass} ${className}`.trim()}
      style={style}
      {...props}
    >
      {loading ? (
        <span className="loader-spinner" style={{ width: '14px', height: '14px' }} />
      ) : Icon ? (
        <Icon size={size === 'sm' ? 14 : 16} />
      ) : null}
      {children}
    </button>
  );
}
