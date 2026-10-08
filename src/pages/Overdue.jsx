export default function Overdue({ onNavigate }) {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-header-title">Overdue Records</h1>
          <p className="page-header-subtitle">Automatically tracked books past due date with calculated fines</p>
        </div>
      </div>
      <div className="card">
        <p>Overdue detection module initialized.</p>
      </div>
    </div>
  );
}
