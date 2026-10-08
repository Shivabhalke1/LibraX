import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Loader from './components/ui/Loader';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Books from './pages/Books';
import Members from './pages/Members';
import IssueBook from './pages/IssueBook';
import Returns from './pages/Returns';
import Transactions from './pages/Transactions';
import Overdue from './pages/Overdue';

function MainApp() {
  const { isAuthenticated, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    return hash || 'dashboard';
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        setCurrentPage(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = (page) => {
    setCurrentPage(page);
    window.location.hash = page;
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader text="Connecting to LibraX session..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  const pageTitles = {
    dashboard: 'Dashboard Overview',
    books: 'Book Management',
    members: 'Member Directory',
    'issue-book': 'Issue Book',
    returns: 'Book Returns & Fines',
    transactions: 'Transaction History',
    overdue: 'Overdue Tracking'
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'books':
        return <Books />;
      case 'members':
        return <Members />;
      case 'issue-book':
        return <IssueBook onNavigate={handleNavigate} />;
      case 'returns':
        return <Returns />;
      case 'transactions':
        return <Transactions />;
      case 'overdue':
        return <Overdue onNavigate={handleNavigate} />;
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <Layout
      currentPage={currentPage}
      onNavigate={handleNavigate}
      pageTitle={pageTitles[currentPage] || 'Dashboard'}
    >
      {renderPage()}
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
