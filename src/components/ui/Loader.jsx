export default function Loader({ text = 'Loading records...' }) {
  return (
    <div className="page-loading">
      <span className="loader-spinner" style={{ width: '28px', height: '28px', borderWidth: '3px', color: 'var(--color-primary)' }} />
      <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>{text}</span>
    </div>
  );
}
