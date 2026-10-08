import { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboardService';
import StatsCards from '../components/dashboard/StatsCards';
import RecentTransactions from '../components/dashboard/RecentTransactions';
import BorrowingChart from '../components/dashboard/BorrowingChart';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import { BookPlus, UserPlus, BookCheck, AlertTriangle, RefreshCw } from 'lucide-react';

export default function Dashboard({ onNavigate }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await dashboardService.getDashboardStats();
      setStats(data);
    } catch (err) {
      setError(err.message || 'Error loading dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-header-title">Dashboard Overview</h1>
          <p className="page-header-subtitle">
            Real-time library metrics, circulation telemetry, and inventory health
          </p>
        </div>
        <div className="page-header-actions">
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            onClick={loadStats}
            title="Refresh statistics"
          >
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          <div>{error}</div>
        </div>
      )}

      {loading ? (
        <Loader text="Calculating real-time database metrics..." />
      ) : (
        <>
          {/* Quick Actions Row */}
          <div style={{
            display: 'flex',
            gap: '0.75rem',
            flexWrap: 'wrap',
            marginBottom: '1.5rem',
            padding: '1rem',
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-light)'
          }}>
            <span style={{ fontSize: '0.875rem', fontWeight: '600', alignSelf: 'center', marginRight: '0.5rem', color: 'var(--text-main)' }}>
              Quick Actions:
            </span>
            <Button
              variant="primary"
              size="sm"
              icon={BookCheck}
              onClick={() => onNavigate('issue-book')}
            >
              Issue Book
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={BookPlus}
              onClick={() => onNavigate('books')}
            >
              Add Book
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={UserPlus}
              onClick={() => onNavigate('members')}
            >
              Add Member
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={AlertTriangle}
              onClick={() => onNavigate('overdue')}
              style={stats?.overdueBooks > 0 ? { color: 'var(--color-danger)' } : {}}
            >
              View Overdue ({stats?.overdueBooks ?? 0})
            </Button>
          </div>

          {/* 6 Real Database Stats Cards */}
          <StatsCards stats={stats} onNavigate={onNavigate} />

          {/* Grid: Circulation Analytics + Recent Transactions */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
            <BorrowingChart stats={stats} />
            <RecentTransactions transactions={stats?.recentTransactions || []} onNavigate={onNavigate} />
          </div>
        </>
      )}
    </div>
  );
}
