import StatCard from '../ui/StatCard';
import { BookOpen, Users, CheckCircle, BookMinus, AlertTriangle, Clock } from 'lucide-react';

export default function StatsCards({ stats = {}, onNavigate }) {
  return (
    <div className="stats-grid">
      <StatCard
        title="Total Books (Catalog)"
        value={stats.totalBooks ?? 0}
        trend={`${stats.totalCopies ?? 0} total copies`}
        icon={BookOpen}
        color="primary"
        onClick={() => onNavigate && onNavigate('books')}
      />
      <StatCard
        title="Total Members"
        value={stats.totalMembers ?? 0}
        trend={`${stats.activeMembers ?? 0} active members`}
        icon={Users}
        color="info"
        onClick={() => onNavigate && onNavigate('members')}
      />
      <StatCard
        title="Available Copies"
        value={stats.availableBooks ?? 0}
        trend="Ready for borrowing"
        icon={CheckCircle}
        color="success"
        onClick={() => onNavigate && onNavigate('books')}
      />
      <StatCard
        title="Currently Borrowed"
        value={stats.borrowedBooks ?? 0}
        trend="In circulation"
        icon={BookMinus}
        color="warning"
        onClick={() => onNavigate && onNavigate('transactions')}
      />
      <StatCard
        title="Overdue Books"
        value={stats.overdueBooks ?? 0}
        trend={stats.overdueBooks > 0 ? 'Fines accumulating' : 'No overdue loans'}
        icon={AlertTriangle}
        color={stats.overdueBooks > 0 ? 'danger' : 'neutral'}
        onClick={() => onNavigate && onNavigate('overdue')}
      />
      <StatCard
        title="Due Today"
        value={stats.dueToday ?? 0}
        trend="Pending return today"
        icon={Clock}
        color="info"
        onClick={() => onNavigate && onNavigate('returns')}
      />
    </div>
  );
}
