import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { bookService } from '../services/bookService';
import { memberService } from '../services/memberService';
import { borrowingService } from '../services/borrowingService';
import { formatDate, formatCurrency, isOverdue, addDays, toInputDateFormat } from '../lib/utils';
import { BOOK_CATEGORIES, BORROWING_PERIOD } from '../lib/constants';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Loader from '../components/ui/Loader';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import {
  BookOpen,
  Search,
  ShoppingCart,
  CheckCircle,
  AlertCircle,
  User,
  RotateCcw,
  Clock,
  History,
  Trash2,
  GraduationCap,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Check
} from 'lucide-react';

export default function StudentPortal({ onSwitchToAdmin, onBackToHome }) {
  // Student Session State (stored in localStorage)
  const [student, setStudent] = useState(() => {
    try {
      const saved = localStorage.getItem('librax_student_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Auth Form State (for student sign in / register)
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authUsn, setAuthUsn] = useState('');
  const [authDept, setAuthDept] = useState('Computer Science');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Portal Navigation Tabs
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' | 'loans' | 'history'

  // Catalog State
  const [books, setBooks] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  // Cart State
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('librax_student_cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutPaymentMethod, setCheckoutPaymentMethod] = useState('Campus ID Quota (Free)');

  // Loans & History State
  const [activeLoans, setActiveLoans] = useState([]);
  const [pastHistory, setPastHistory] = useState([]);
  const [loadingLoans, setLoadingLoans] = useState(false);
  const [returningLoan, setReturningLoan] = useState(null);

  // Feedback Notification
  const [notice, setNotice] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const showNotice = (type, message) => {
    setNotice({ type, message });
    setTimeout(() => setNotice(null), 5000);
  };

  // Sync cart to localStorage
  useEffect(() => {
    localStorage.setItem('librax_student_cart', JSON.stringify(cart));
  }, [cart]);

  // Load books catalog
  const loadBooks = async () => {
    setLoadingBooks(true);
    try {
      const data = await bookService.getBooks();
      setBooks(data);
    } catch (err) {
      console.error('Error loading books:', err);
    } finally {
      setLoadingBooks(false);
    }
  };

  // Load student's active loans & past history
  const loadStudentRecords = async (memberCode) => {
    if (!memberCode) return;
    setLoadingLoans(true);
    try {
      const all = await borrowingService.getAllBorrowings();
      const myAll = all.filter(
        (b) => b.members?.member_code?.toLowerCase() === memberCode.toLowerCase()
      );
      setActiveLoans(myAll.filter((b) => !b.returned_at));
      setPastHistory(myAll.filter((b) => b.returned_at));
    } catch (err) {
      console.error('Error loading loans:', err);
    } finally {
      setLoadingLoans(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  useEffect(() => {
    if (student?.usn) {
      loadStudentRecords(student.usn);
    }
  }, [student]);

  // --- Student Auth Handlers ---
  const handleStudentAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      if (authMode === 'register') {
        if (!authName || !authUsn || !authEmail || !authPassword) {
          throw new Error('Please fill in all required fields.');
        }

        // 1. Ensure member record in Supabase members table
        const allMembers = await memberService.getMembers();
        let existingMember = allMembers.find(
          (m) => m.member_code?.toLowerCase() === authUsn.trim().toLowerCase()
        );

        if (!existingMember) {
          existingMember = await memberService.createMember({
            member_code: authUsn.trim().toUpperCase(),
            name: authName.trim(),
            email: authEmail.trim(),
            department: authDept,
            year: '3rd Year',
            status: 'Active'
          });
        }

        const studentProfile = {
          id: existingMember.id,
          name: existingMember.name,
          email: existingMember.email,
          usn: existingMember.member_code,
          department: existingMember.department || authDept
        };

        localStorage.setItem('librax_student_user', JSON.stringify(studentProfile));
        setStudent(studentProfile);
        showNotice('success', `Welcome, ${studentProfile.name}! Your student account is active.`);
      } else {
        // Login mode
        if (!authEmail || !authPassword) {
          throw new Error('Please enter both Email and Password.');
        }

        // Look up member by email or code
        const allMembers = await memberService.getMembers();
        let member = allMembers.find(
          (m) =>
            m.email?.toLowerCase() === authEmail.trim().toLowerCase() ||
            m.member_code?.toLowerCase() === authEmail.trim().toLowerCase()
        );

        if (!member) {
          // Create auto-member for easy viva login
          const generatedUsn = `USN-${Math.floor(1000 + Math.random() * 9000)}`;
          member = await memberService.createMember({
            member_code: generatedUsn,
            name: authEmail.split('@')[0],
            email: authEmail.trim(),
            department: 'Computer Science',
            status: 'Active'
          });
        }

        const studentProfile = {
          id: member.id,
          name: member.name,
          email: member.email,
          usn: member.member_code,
          department: member.department || 'Computer Science'
        };

        localStorage.setItem('librax_student_user', JSON.stringify(studentProfile));
        setStudent(studentProfile);
        showNotice('success', `Welcome back, ${studentProfile.name}!`);
      }
    } catch (err) {
      setAuthError(err.message || 'Authentication error.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleStudentLogout = () => {
    localStorage.removeItem('librax_student_user');
    setStudent(null);
    setActiveLoans([]);
    setPastHistory([]);
    setCart([]);
    showNotice('success', 'Logged out of student portal.');
  };

  // --- Cart Handlers ---
  const handleAddToCart = (book) => {
    if (book.available_copies <= 0) {
      showNotice('error', `"${book.title}" is currently out of stock.`);
      return;
    }
    if (cart.some((item) => item.id === book.id)) {
      showNotice('error', `"${book.title}" is already in your borrowing cart.`);
      return;
    }
    setCart([...cart, book]);
    showNotice('success', `Added "${book.title}" to your cart!`);
  };

  const handleRemoveFromCart = (bookId) => {
    setCart(cart.filter((item) => item.id !== bookId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // --- Checkout Handler ---
  const handleCheckout = async () => {
    if (!student) {
      setIsCartOpen(false);
      showNotice('error', 'Please log in with your Student account to checkout.');
      return;
    }
    if (cart.length === 0) return;

    setActionLoading(true);
    try {
      const issueDate = toInputDateFormat(new Date());
      const dueDate = addDays(new Date(), BORROWING_PERIOD);

      // Issue each book in cart
      for (const book of cart) {
        await borrowingService.issueBook({
          book_id: book.id,
          member_id: student.id,
          issued_at: issueDate,
          due_date: dueDate
        });
      }

      const bookedCount = cart.length;
      setCart([]);
      setIsCheckoutOpen(false);
      setIsCartOpen(false);
      setActiveTab('loans');

      showNotice(
        'success',
        `🎉 Checkout Complete! ${bookedCount} book(s) booked successfully. Return due in ${BORROWING_PERIOD} days (${formatDate(dueDate)}).`
      );

      // Refresh data
      await Promise.all([
        loadBooks(),
        loadStudentRecords(student.usn)
      ]);
    } catch (err) {
      showNotice('error', err.message || 'Checkout failed.');
    } finally {
      setActionLoading(false);
    }
  };

  // --- Return Book Handler ---
  const handleReturnBook = async () => {
    if (!returningLoan) return;
    setActionLoading(true);
    try {
      const res = await borrowingService.returnBook(returningLoan.id);
      setReturningLoan(null);
      if (res.isLate) {
        showNotice(
          'success',
          `Book returned! Late fine of ${formatCurrency(res.fine)} settled (${res.daysLate} days late).`
        );
      } else {
        showNotice('success', 'Book returned on time! Available copy restored.');
      }
      await Promise.all([
        loadBooks(),
        loadStudentRecords(student.usn)
      ]);
    } catch (err) {
      showNotice('error', err.message || 'Error processing return.');
      setReturningLoan(null);
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered books
  const filteredBooks = books.filter((b) => {
    const matchesSearch =
      !search ||
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase()) ||
      b.isbn.toLowerCase().includes(search.toLowerCase());
    const matchesCat = !category || b.category === category;
    return matchesSearch && matchesCat;
  });

  // Calculate days remaining helper
  const getLoanTimeInfo = (dueDate) => {
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) {
      return { text: `${Math.abs(diff)} days overdue`, late: true, days: diff };
    }
    if (diff === 0) {
      return { text: 'Due today!', warning: true, days: 0 };
    }
    return { text: `${diff} days remaining`, late: false, days: diff };
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1rem', fontFamily: "'Inter', sans-serif" }}>
      {/* Top Header Bar */}
      <header style={{
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-light)',
        padding: '1rem 1.5rem',
        marginBottom: '1.5rem',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: '#1e3a8a',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <GraduationCap size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0f172a' }}>
                Libra<span style={{ color: '#2563eb' }}>X</span> Student Portal
              </span>
              <Badge variant="info">Patron Edition</Badge>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Self-service book checkout, reservations &amp; borrowing history
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Cart Button */}
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.55rem 1rem',
              borderRadius: '8px',
              backgroundColor: cart.length > 0 ? '#eff6ff' : '#ffffff',
              border: '1px solid ' + (cart.length > 0 ? '#93c5fd' : '#e2e8f0'),
              color: cart.length > 0 ? '#1d4ed8' : '#334155',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              position: 'relative'
            }}
          >
            <ShoppingCart size={18} />
            <span>Cart</span>
            {cart.length > 0 && (
              <span style={{
                backgroundColor: '#2563eb',
                color: '#ffffff',
                fontSize: '0.75rem',
                padding: '0.1rem 0.45rem',
                borderRadius: '9999px',
                fontWeight: '700'
              }}>
                {cart.length}
              </span>
            )}
          </button>

          {/* Student Status Badge / Login Prompt */}
          {student ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
              backgroundColor: '#f1f5f9',
              padding: '0.35rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.8125rem'
            }}>
              <User size={15} color="#2563eb" />
              <span><strong>{student.name}</strong> ({student.usn})</span>
              <button
                type="button"
                onClick={handleStudentLogout}
                style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', padding: '0.2rem' }}
                title="Log out student"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <Button variant="primary" size="sm" onClick={() => setActiveTab('auth')}>
              Student Sign In
            </Button>
          )}

          {onBackToHome && (
            <Button variant="secondary" size="sm" onClick={onBackToHome}>
              Home
            </Button>
          )}

          <Button variant="secondary" size="sm" onClick={onSwitchToAdmin} icon={ShieldCheck}>
            Librarian Admin
          </Button>
        </div>
      </header>

      {/* Notifications */}
      {notice && (
        <div className={`alert alert-${notice.type}`}>
          {notice.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <div>{notice.message}</div>
        </div>
      )}

      {/* Portal Navigation Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        borderBottom: '2px solid #e2e8f0',
        marginBottom: '1.5rem',
        overflowX: 'auto'
      }}>
        <button
          type="button"
          onClick={() => setActiveTab('catalog')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'catalog' ? '3px solid #2563eb' : '3px solid transparent',
            color: activeTab === 'catalog' ? '#2563eb' : '#64748b',
            fontWeight: activeTab === 'catalog' ? '700' : '500',
            fontSize: '0.95rem',
            cursor: 'pointer',
            marginBottom: '-2px'
          }}
        >
          <BookOpen size={18} />
          <span>Catalog &amp; Books</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('loans')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'loans' ? '3px solid #2563eb' : '3px solid transparent',
            color: activeTab === 'loans' ? '#2563eb' : '#64748b',
            fontWeight: activeTab === 'loans' ? '700' : '500',
            fontSize: '0.95rem',
            cursor: 'pointer',
            marginBottom: '-2px'
          }}
        >
          <Clock size={18} />
          <span>My Active Loans</span>
          {activeLoans.length > 0 && (
            <Badge variant="warning">{activeLoans.length}</Badge>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('history')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'history' ? '3px solid #2563eb' : '3px solid transparent',
            color: activeTab === 'history' ? '#2563eb' : '#64748b',
            fontWeight: activeTab === 'history' ? '700' : '500',
            fontSize: '0.95rem',
            cursor: 'pointer',
            marginBottom: '-2px'
          }}
        >
          <History size={18} />
          <span>Borrowing History</span>
        </button>

        {!student && (
          <button
            type="button"
            onClick={() => setActiveTab('auth')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.25rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'auth' ? '3px solid #2563eb' : '3px solid transparent',
              color: activeTab === 'auth' ? '#2563eb' : '#64748b',
              fontWeight: activeTab === 'auth' ? '700' : '500',
              fontSize: '0.95rem',
              cursor: 'pointer',
              marginBottom: '-2px',
              marginLeft: 'auto'
            }}
          >
            <User size={18} />
            <span>Student Account</span>
          </button>
        )}
      </div>

      {/* =========================================================================
          TAB 1: CATALOG & BOOKS
         ========================================================================= */}
      {activeTab === 'catalog' && (
        <div>
          {/* Search & Filter Bar */}
          <div className="filter-bar">
            <div className="filter-search" style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.25rem' }}
                placeholder="Search catalog by title, author, or ISBN..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-subtle)',
                  pointerEvents: 'none'
                }}
              />
            </div>

            <div style={{ minWidth: '180px' }}>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {BOOK_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Book Cards Grid */}
          {loadingBooks ? (
            <Loader text="Loading library book catalog..." />
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.25rem'
            }}>
              {filteredBooks.map((book) => {
                const hasCopies = book.available_copies > 0;
                const inCart = cart.some((c) => c.id === book.id);

                return (
                  <div
                    key={book.id}
                    className="card"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      borderRadius: '12px'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
                        <span style={{
                          fontSize: '0.7rem',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                          backgroundColor: '#f1f5f9',
                          color: '#475569',
                          fontWeight: '500'
                        }}>
                          {book.category}
                        </span>
                        <Badge variant={hasCopies ? 'success' : 'danger'}>
                          {hasCopies ? `${book.available_copies} available` : 'Out of Stock'}
                        </Badge>
                      </div>

                      <h4 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.25rem', lineHeight: '1.3' }}>
                        {book.title}
                      </h4>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                        by {book.author} {book.publication_year ? `(${book.publication_year})` : ''}
                      </div>

                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.75rem' }}>
                        Publisher: {book.publisher || 'Academic Press'} &bull; ISBN: <code>{book.isbn}</code>
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-success)', fontWeight: '600' }}>
                        Free Loan &bull; 14 Days
                      </div>
                      <Button
                        variant={inCart ? 'secondary' : hasCopies ? 'primary' : 'secondary'}
                        size="sm"
                        icon={inCart ? Check : ShoppingCart}
                        disabled={!hasCopies || inCart}
                        onClick={() => handleAddToCart(book)}
                      >
                        {inCart ? 'In Cart' : hasCopies ? 'Add to Cart' : 'Unavailable'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 2: MY ACTIVE LOANS (with Time Periods & Countdown)
         ========================================================================= */}
      {activeTab === 'loans' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={18} color="var(--color-primary)" />
              My Current Active Borrowings ({activeLoans.length})
            </h3>
            {student && (
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Patron: <strong>{student.name}</strong> ({student.usn})
              </span>
            )}
          </div>

          {!student ? (
            <div style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-muted)' }}>
              <GraduationCap size={36} style={{ color: '#94a3b8', marginBottom: '0.75rem' }} />
              <h4>Please log in to see your active loans</h4>
              <p style={{ fontSize: '0.875rem', marginTop: '0.25rem', marginBottom: '1rem' }}>
                Sign in with your student email and password to manage your borrowed books.
              </p>
              <Button variant="primary" onClick={() => setActiveTab('auth')}>
                Sign In to Student Account
              </Button>
            </div>
          ) : loadingLoans ? (
            <Loader text="Loading your active loans..." />
          ) : activeLoans.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-muted)' }}>
              <BookOpen size={36} style={{ color: '#94a3b8', marginBottom: '0.75rem' }} />
              <h4>No active borrowed books</h4>
              <p style={{ fontSize: '0.875rem', marginTop: '0.25rem', marginBottom: '1rem' }}>
                Browse the catalog, add books to your cart, and checkout to start reading!
              </p>
              <Button variant="primary" onClick={() => setActiveTab('catalog')}>
                Browse Books Catalog
              </Button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {activeLoans.map((loan) => {
                const timeInfo = getLoanTimeInfo(loan.due_date);
                const isLate = timeInfo.late;

                return (
                  <div
                    key={loan.id}
                    style={{
                      padding: '1.25rem',
                      borderRadius: '12px',
                      backgroundColor: isLate ? '#fef2f2' : '#f8fafc',
                      border: '1px solid ' + (isLate ? '#fecaca' : '#e2e8f0'),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '1rem'
                    }}
                  >
                    <div style={{ minWidth: '240px' }}>
                      <div style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '1rem' }}>
                        {loan.books?.title}
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        by {loan.books?.author} &bull; Category: {loan.books?.category}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.4rem' }}>
                        Issued on: {formatDate(loan.issued_at)} &bull; Due Date: <strong>{formatDate(loan.due_date)}</strong>
                      </div>
                    </div>

                    {/* Time Period Status */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ textAlign: 'right' }}>
                        <Badge variant={isLate ? 'danger' : timeInfo.warning ? 'warning' : 'success'}>
                          {timeInfo.text}
                        </Badge>
                        {isLate && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-danger)', fontWeight: '700', marginTop: '0.25rem' }}>
                            Accumulating Fine: {formatCurrency(loan.fine)}
                          </div>
                        )}
                        {!isLate && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                            Standard 14-day loan
                          </div>
                        )}
                      </div>

                      <Button
                        variant={isLate ? 'danger' : 'secondary'}
                        size="sm"
                        icon={RotateCcw}
                        onClick={() => setReturningLoan(loan)}
                      >
                        Return Book
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 3: BORROWING HISTORY
         ========================================================================= */}
      {activeTab === 'history' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <History size={18} color="var(--color-primary)" />
              Past Completed Loans ({pastHistory.length})
            </h3>
          </div>

          {!student ? (
            <div style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-muted)' }}>
              <h4>Please log in to view your loan history</h4>
              <Button variant="primary" style={{ marginTop: '1rem' }} onClick={() => setActiveTab('auth')}>
                Sign In
              </Button>
            </div>
          ) : pastHistory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-muted)' }}>
              No completed loan records yet. Books you return will be archived here.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="app-table">
                <thead>
                  <tr>
                    <th>Book Title</th>
                    <th>Issue Date</th>
                    <th>Due Date</th>
                    <th>Returned Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pastHistory.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div style={{ fontWeight: '600' }}>{item.books?.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.books?.author}</div>
                      </td>
                      <td>{formatDate(item.issued_at)}</td>
                      <td>{formatDate(item.due_date)}</td>
                      <td>{formatDate(item.returned_at)}</td>
                      <td>
                        <Badge variant="success">Returned</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 4: STUDENT AUTHENTICATION FORM
         ========================================================================= */}
      {activeTab === 'auth' && (
        <div style={{ maxWidth: '460px', margin: '2rem auto' }}>
          <div className="card">
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: '#1e3a8a',
                color: '#ffffff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '0.75rem'
              }}>
                <GraduationCap size={26} />
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800' }}>
                {authMode === 'login' ? 'Student Sign In' : 'Register Student Account'}
              </h2>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                {authMode === 'login'
                  ? 'Access your cart, checkout books & track due dates'
                  : 'Create your college library account to borrow books'}
              </p>
            </div>

            {authError && (
              <div className="alert alert-danger">
                <AlertCircle size={16} />
                <div>{authError}</div>
              </div>
            )}

            <form onSubmit={handleStudentAuth}>
              {authMode === 'register' && (
                <>
                  <Input
                    label="Full Name"
                    placeholder="e.g. Shiva Bhalke"
                    required
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                  />
                  <Input
                    label="College USN / SRN"
                    placeholder="e.g. 1RV21CS042"
                    required
                    value={authUsn}
                    onChange={(e) => setAuthUsn(e.target.value)}
                    hint="Your permanent university student number"
                  />
                  <Select
                    label="Academic Department"
                    value={authDept}
                    onChange={(e) => setAuthDept(e.target.value)}
                    options={[
                      'Computer Science',
                      'Information Science',
                      'Electronics & Communication',
                      'Data Science & AI',
                      'Mechanical Engineering',
                      'Business Administration'
                    ]}
                  />
                </>
              )}

              <Input
                label="Student Email Address"
                type="email"
                placeholder="student@campus.edu"
                required
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                required
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
              />

              <Button
                type="submit"
                variant="primary"
                style={{ width: '100%', marginTop: '1rem' }}
                loading={authLoading}
              >
                {authMode === 'login' ? 'Sign In to Student Portal' : 'Create Student Account'}
              </Button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.8125rem' }}>
              {authMode === 'login' ? (
                <>
                  Don't have a student account?{' '}
                  <button
                    type="button"
                    onClick={() => { setAuthMode('register'); setAuthError(''); }}
                    style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: '600', cursor: 'pointer' }}
                  >
                    Register here
                  </button>
                </>
              ) : (
                <>
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => { setAuthMode('login'); setAuthError(''); }}
                    style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: '600', cursor: 'pointer' }}
                  >
                    Sign in
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 1: SHOPPING CART DRAWER / MODAL
         ========================================================================= */}
      <Modal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        title={`Borrowing Cart (${cart.length} item${cart.length === 1 ? '' : 's'})`}
        maxWidth="500px"
      >
        {cart.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
            <ShoppingCart size={36} style={{ color: '#cbd5e1', marginBottom: '0.75rem' }} />
            <h4>Your cart is empty</h4>
            <p style={{ fontSize: '0.8125rem', marginTop: '0.25rem' }}>
              Browse the catalog and click "Add to Cart" on any available title.
            </p>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '300px', overflowY: 'auto', marginBottom: '1rem' }}>
              {cart.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>{item.title}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>by {item.author}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFromCart(item.id)}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.25rem' }}
                    title="Remove from cart"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            {/* Cart Summary */}
            <div style={{ backgroundColor: '#f1f5f9', padding: '0.875rem', borderRadius: '8px', fontSize: '0.8125rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span>Total Titles:</span>
                <strong>{cart.length} book(s)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span>Loan Duration:</span>
                <strong>{BORROWING_PERIOD} Days</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#166534', fontWeight: '700' }}>
                <span>Borrowing Fee:</span>
                <span>FREE (Student ID)</span>
              </div>
            </div>

            <div className="modal-footer" style={{ margin: '1rem -1.5rem -1.5rem -1.5rem' }}>
              <Button variant="secondary" onClick={handleClearCart}>
                Clear Cart
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  if (!student) {
                    setIsCartOpen(false);
                    setActiveTab('auth');
                    showNotice('error', 'Please log in with your Student account to proceed to checkout.');
                  } else {
                    setIsCartOpen(false);
                    setIsCheckoutOpen(true);
                  }
                }}
                icon={ChevronRight}
              >
                Proceed to Checkout
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* =========================================================================
          MODAL 2: CHECKOUT & PAYMENT MODAL
         ========================================================================= */}
      <Modal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        title="Student Checkout & Loan Confirmation"
        maxWidth="520px"
      >
        <div>
          {/* Student Profile Recap */}
          <div style={{
            backgroundColor: '#eff6ff',
            borderRadius: '8px',
            border: '1px solid #bfdbfe',
            padding: '0.875rem',
            marginBottom: '1rem'
          }}>
            <div style={{ fontSize: '0.75rem', color: '#1e40af', fontWeight: '600', textTransform: 'uppercase' }}>
              Borrowing Patron
            </div>
            <div style={{ fontWeight: '700', fontSize: '1rem', color: '#1e3a8a', marginTop: '0.2rem' }}>
              {student?.name}
            </div>
            <div style={{ fontSize: '0.8125rem', color: '#3b82f6' }}>
              USN: <code>{student?.usn}</code> &bull; Dept: {student?.department}
            </div>
          </div>

          {/* Titles in this order */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: '600', marginBottom: '0.4rem' }}>
              Items to Checkout ({cart.length}):
            </div>
            <ul style={{ paddingLeft: '1.25rem', fontSize: '0.8125rem', color: '#334155' }}>
              {cart.map((c) => (
                <li key={c.id}>
                  <strong>{c.title}</strong> — {c.author}
                </li>
              ))}
            </ul>
          </div>

          {/* Loan Duration & Due Date */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.75rem',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            padding: '0.875rem',
            borderRadius: '8px',
            fontSize: '0.8125rem',
            marginBottom: '1rem'
          }}>
            <div>
              <span style={{ color: '#64748b' }}>Issue Date:</span>
              <div style={{ fontWeight: '600' }}>{formatDate(new Date())}</div>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Return Due Date:</span>
              <div style={{ fontWeight: '700', color: '#2563eb' }}>
                {formatDate(addDays(new Date(), BORROWING_PERIOD))} ({BORROWING_PERIOD} Days)
              </div>
            </div>
          </div>

          {/* Pricing & Bill Breakdown */}
          <div style={{
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '8px',
            padding: '0.875rem',
            marginBottom: '1rem',
            fontSize: '0.8125rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <span>Total Titles:</span>
              <strong>{cart.length} item(s)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <span>Borrowing Fee:</span>
              <strong style={{ color: '#166534' }}>FREE (Student Card)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #bbf7d0', paddingTop: '0.4rem', marginTop: '0.4rem' }}>
              <span style={{ fontWeight: '700', color: '#15803d' }}>Total Payable Now:</span>
              <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#15803d' }}>₹0.00</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <Select
            label="Payment & Validation Method"
            value={checkoutPaymentMethod}
            onChange={(e) => setCheckoutPaymentMethod(e.target.value)}
            options={[
              'Campus ID Quota (Free)',
              'Pay at Library Desk (Cash / UPI)',
              'Campus ID Wallet'
            ]}
          />

          <div className="modal-footer" style={{ margin: '1rem -1.5rem -1.5rem -1.5rem' }}>
            <Button variant="secondary" onClick={() => setIsCheckoutOpen(false)} disabled={actionLoading}>
              Back
            </Button>
            <Button
              variant="primary"
              onClick={handleCheckout}
              loading={actionLoading}
              icon={BookCheck}
            >
              Pay ₹0 &amp; Confirm Checkout
            </Button>
          </div>
        </div>
      </Modal>

      {/* =========================================================================
          MODAL 3: RETURN CONFIRMATION MODAL
         ========================================================================= */}
      <Modal
        isOpen={Boolean(returningLoan)}
        onClose={() => setReturningLoan(null)}
        title="Confirm Return of Book"
        maxWidth="440px"
      >
        <div style={{ fontSize: '0.875rem' }}>
          <p>
            Are you sure you want to return <strong>{returningLoan?.books?.title}</strong>?
          </p>
          <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '8px', margin: '0.75rem 0', border: '1px solid #e2e8f0' }}>
            <div>Due date was: {formatDate(returningLoan?.due_date)}</div>
            {isOverdue(returningLoan?.due_date) && (
              <div style={{ color: '#dc2626', fontWeight: '700', marginTop: '0.25rem' }}>
                Late return fee: {formatCurrency(returningLoan?.fine)}
              </div>
            )}
          </div>
        </div>
        <div className="modal-footer" style={{ margin: '1rem -1.5rem -1.5rem -1.5rem' }}>
          <Button variant="secondary" onClick={() => setReturningLoan(null)} disabled={actionLoading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleReturnBook} loading={actionLoading}>
            Confirm Return
          </Button>
        </div>
      </Modal>
    </div>
  );
}
