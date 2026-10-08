import { useState, useEffect } from 'react';
import { bookService } from '../services/bookService';
import { memberService } from '../services/memberService';
import { borrowingService } from '../services/borrowingService';
import { formatDate, formatCurrency, isOverdue, addDays, toInputDateFormat } from '../lib/utils';
import { BOOK_CATEGORIES, BORROWING_PERIOD, FINE_PER_DAY } from '../lib/constants';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Loader from '../components/ui/Loader';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import {
  BookOpen,
  Search,
  BookCheck,
  CheckCircle,
  AlertCircle,
  User,
  CreditCard,
  RotateCcw,
  Sparkles,
  Calendar,
  Check
} from 'lucide-react';

export default function StudentPortal({ onSwitchToAdmin, onBackToHome }) {
  const [books, setBooks] = useState([]);
  const [memberLoans, setMemberLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Student Profile / Account State (Remembered locally for easy booking)
  const [studentInfo, setStudentInfo] = useState(() => {
    return {
      name: localStorage.getItem('librax_student_name') || 'Shiva Bhalke',
      usn: localStorage.getItem('librax_student_usn') || 'USN-2024-001',
      department: localStorage.getItem('librax_student_dept') || 'Computer Science',
      year: '3rd Year',
      email: 'student@campus.edu'
    };
  });

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [bookingBook, setBookingBook] = useState(null);
  const [returningLoan, setReturningLoan] = useState(null);
  const [notice, setNotice] = useState(null);

  // Checkout modal form state
  const [checkoutData, setCheckoutData] = useState({
    name: studentInfo.name,
    usn: studentInfo.usn,
    department: studentInfo.department,
    paymentMethod: 'Campus ID Quota (Free)',
    depositAmount: 50,
    issueDate: toInputDateFormat(new Date()),
    dueDate: addDays(new Date(), BORROWING_PERIOD)
  });

  const showNotice = (type, message) => {
    setNotice({ type, message });
    setTimeout(() => setNotice(null), 6000);
  };

  const loadPortalData = async () => {
    setLoading(true);
    try {
      const allBooks = await bookService.getBooks();
      setBooks(allBooks);
    } catch (err) {
      console.error('Portal load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStudentLoans = async (usn) => {
    if (!usn) return;
    try {
      const allBorrowings = await borrowingService.getAllBorrowings();
      const myLoans = allBorrowings.filter(
        (b) => b.members?.member_code?.toLowerCase() === usn.toLowerCase() && !b.returned_at
      );
      setMemberLoans(myLoans);
    } catch (err) {
      console.error('Error loading loans:', err);
    }
  };

  useEffect(() => {
    loadPortalData();
    loadStudentLoans(studentInfo.usn);
  }, []);

  // Open booking modal
  const handleOpenBooking = (book) => {
    setBookingBook(book);
    setCheckoutData({
      name: studentInfo.name,
      usn: studentInfo.usn,
      department: studentInfo.department,
      paymentMethod: 'Campus ID Quota (Free)',
      depositAmount: 50,
      issueDate: toInputDateFormat(new Date()),
      dueDate: addDays(new Date(), BORROWING_PERIOD)
    });
  };

  // Submit booking & payment form
  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!bookingBook) return;

    if (!checkoutData.name.trim()) {
      showNotice('error', 'Please enter your Full Name.');
      return;
    }
    if (!checkoutData.usn.trim()) {
      showNotice('error', 'Please enter your College USN / SRN.');
      return;
    }

    setActionLoading(true);
    try {
      // 1. Save student credentials locally for convenient subsequent bookings
      localStorage.setItem('librax_student_name', checkoutData.name);
      localStorage.setItem('librax_student_usn', checkoutData.usn);
      localStorage.setItem('librax_student_dept', checkoutData.department);
      setStudentInfo((prev) => ({
        ...prev,
        name: checkoutData.name,
        usn: checkoutData.usn,
        department: checkoutData.department
      }));

      // 2. Check or create Member record for this USN/SRN
      const allMembers = await memberService.getMembers();
      let targetMember = allMembers.find(
        (m) => m.member_code?.toLowerCase() === checkoutData.usn.trim().toLowerCase()
      );

      if (!targetMember) {
        targetMember = await memberService.createMember({
          member_code: checkoutData.usn.trim().toUpperCase(),
          name: checkoutData.name.trim(),
          email: `${checkoutData.usn.trim().toLowerCase()}@campus.edu`,
          department: checkoutData.department,
          year: '3rd Year',
          status: 'Active'
        });
      }

      // 3. Issue the book
      await borrowingService.issueBook({
        book_id: bookingBook.id,
        member_id: targetMember.id,
        issued_at: checkoutData.issueDate,
        due_date: checkoutData.dueDate
      });

      setBookingBook(null);
      showNotice(
        'success',
        `🎉 Successfully Booked! "${bookingBook.title}" reserved for ${checkoutData.name} (${checkoutData.usn}). Due on ${formatDate(checkoutData.dueDate)}.`
      );

      // 4. Refresh catalog & member loans
      await Promise.all([
        loadPortalData(),
        loadStudentLoans(checkoutData.usn)
      ]);
    } catch (err) {
      showNotice('error', err.message || 'Unable to complete book reservation.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReturnLoan = async () => {
    if (!returningLoan) return;
    setActionLoading(true);
    try {
      const res = await borrowingService.returnBook(returningLoan.id);
      setReturningLoan(null);
      if (res.isLate) {
        showNotice('success', `Book returned! Overdue fine of ${formatCurrency(res.fine)} settled.`);
      } else {
        showNotice('success', 'Book returned on time! 1 copy restored to library catalog.');
      }
      await Promise.all([
        loadPortalData(),
        loadStudentLoans(studentInfo.usn)
      ]);
    } catch (err) {
      showNotice('error', err.message || 'Error returning book.');
      setReturningLoan(null);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredBooks = books.filter((b) => {
    const matchesSearch =
      !search ||
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase()) ||
      b.isbn.toLowerCase().includes(search.toLowerCase());
    const matchesCat = !category || b.category === category;
    return matchesSearch && matchesCat;
  });

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '1rem 0' }}>
      {/* Top Banner / Student Navigation Header */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-light)',
        padding: '1.25rem 1.75rem',
        marginBottom: '1.5rem',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            backgroundColor: 'var(--color-primary)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <BookOpen size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)' }}>
                Student Library &amp; Booking Portal
              </span>
              <Badge variant="info">Self-Service</Badge>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Logged in student: <strong>{studentInfo.name}</strong> (USN: <code>{studentInfo.usn}</code> &bull; {studentInfo.department})
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {onBackToHome && (
            <Button variant="secondary" size="sm" onClick={onBackToHome}>
              Home
            </Button>
          )}
          <Button variant="primary" size="sm" onClick={onSwitchToAdmin}>
            Admin / Librarian
          </Button>
        </div>
      </div>

      {notice && (
        <div className={`alert alert-${notice.type}`}>
          {notice.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <div>{notice.message}</div>
        </div>
      )}

      {/* Grid: Active Student Loans (Left) & Student Account Summary (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.75rem' }}>
        {/* My Current Borrowings */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              📚 My Active Loans ({memberLoans.length})
            </h3>
          </div>

          {memberLoans.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              No books currently checked out. Click <strong>"Book / Reserve"</strong> on any catalog title below!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {memberLoans.map((loan) => {
                const late = isOverdue(loan.due_date, loan.returned_at);
                return (
                  <div
                    key={loan.id}
                    style={{
                      padding: '0.875rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-subtle)',
                      border: '1px solid var(--border-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.5rem'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '0.875rem' }}>
                        {loan.books?.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        Due Date: <strong style={{ color: late ? 'var(--color-danger)' : 'var(--text-main)' }}>{formatDate(loan.due_date)}</strong>
                        {late && <span style={{ color: 'var(--color-danger)', fontWeight: '700', marginLeft: '0.5rem' }}>(OVERDUE)</span>}
                      </div>
                    </div>

                    <Button
                      variant={late ? 'danger' : 'secondary'}
                      size="sm"
                      icon={RotateCcw}
                      onClick={() => setReturningLoan(loan)}
                    >
                      Return
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Student Library Account Summary Card */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">💳 Student Account &amp; Card</h3>
          </div>
          <div style={{
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            border: '1px solid var(--border-light)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)' }}>
                  {studentInfo.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  College USN/SRN: <code>{studentInfo.usn}</code>
                </div>
              </div>
              <Badge variant="success">Active Patron</Badge>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8125rem', borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Department:</span>
                <div style={{ fontWeight: '600' }}>{studentInfo.department}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Standard Loan:</span>
                <div style={{ fontWeight: '600' }}>{BORROWING_PERIOD} Days</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Overdue Rate:</span>
                <div style={{ fontWeight: '600' }}>{formatCurrency(FINE_PER_DAY)}/day</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Borrow Quota:</span>
                <div style={{ fontWeight: '600', color: 'var(--color-success)' }}>Available</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Catalog Search & Filter Bar */}
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

      {/* Catalog Cards Grid */}
      {loading ? (
        <Loader text="Loading library book catalog..." />
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1rem'
        }}>
          {filteredBooks.map((book) => {
            const hasCopies = book.available_copies > 0;
            return (
              <div
                key={book.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{
                      fontSize: '0.6875rem',
                      padding: '0.125rem 0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-subtle)',
                      color: 'var(--text-muted)'
                    }}>
                      {book.category}
                    </span>
                    <Badge variant={hasCopies ? 'success' : 'danger'}>
                      {hasCopies ? `${book.available_copies} available` : 'Out of Stock'}
                    </Badge>
                  </div>

                  <h4 style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.25rem', lineHeight: '1.3' }}>
                    {book.title}
                  </h4>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                    by {book.author} {book.publication_year ? `(${book.publication_year})` : ''}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <code style={{ fontSize: '0.6875rem', color: 'var(--text-subtle)' }}>
                    {book.isbn}
                  </code>
                  <Button
                    variant={hasCopies ? 'primary' : 'secondary'}
                    size="sm"
                    icon={BookCheck}
                    disabled={!hasCopies}
                    onClick={() => handleOpenBooking(book)}
                  >
                    {hasCopies ? 'Book / Reserve' : 'Unavailable'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: Student Booking, USN, Pricing & Payment Checkout Form */}
      <Modal
        isOpen={Boolean(bookingBook)}
        onClose={() => setBookingBook(null)}
        title="Student Book Reservation & Checkout"
        maxWidth="520px"
      >
        <form onSubmit={handleConfirmBooking}>
          {/* Selected Book Overview */}
          <div style={{
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '0.875rem',
            marginBottom: '1rem',
            border: '1px solid var(--border-light)'
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Selected Library Title
            </div>
            <div style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '1rem', marginTop: '0.2rem' }}>
              {bookingBook?.title}
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              by {bookingBook?.author} &bull; Category: {bookingBook?.category}
            </div>
          </div>

          {/* Student Account Details Inputs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <Input
              label="Student Full Name"
              placeholder="e.g. Shiva Bhalke"
              required
              value={checkoutData.name}
              onChange={(e) => setCheckoutData({ ...checkoutData, name: e.target.value })}
            />
            <Input
              label="College USN / SRN"
              placeholder="e.g. 1RV21CS042"
              required
              value={checkoutData.usn}
              onChange={(e) => setCheckoutData({ ...checkoutData, usn: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <Select
              label="Department / Branch"
              value={checkoutData.department}
              onChange={(e) => setCheckoutData({ ...checkoutData, department: e.target.value })}
              options={[
                'Computer Science',
                'Information Science',
                'Electronics & Communication',
                'Data Science & AI',
                'Mechanical Engineering',
                'Business Administration'
              ]}
            />
            <Input
              label="Return Due Date"
              type="date"
              value={checkoutData.dueDate}
              onChange={(e) => setCheckoutData({ ...checkoutData, dueDate: e.target.value })}
              hint={`Loan Period: ${BORROWING_PERIOD} Days`}
            />
          </div>

          {/* Pricing & Account Bill Breakdown */}
          <div style={{
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: 'var(--radius-md)',
            padding: '0.875rem',
            marginTop: '0.5rem',
            marginBottom: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '0.8125rem', color: '#166534', fontWeight: '500' }}>Borrowing Fee:</span>
              <span style={{ fontSize: '0.8125rem', fontWeight: '700', color: '#166534' }}>FREE (Student ID)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '0.8125rem', color: '#166534', fontWeight: '500' }}>Security Deposit:</span>
              <span style={{ fontSize: '0.8125rem', fontWeight: '700', color: '#166534' }}>₹0.00</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #bbf7d0', paddingTop: '0.35rem', marginTop: '0.35rem' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: '700', color: '#15803d' }}>Total Payable Now:</span>
              <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#15803d' }}>₹0.00</span>
            </div>
          </div>

          {/* Payment / Validation Option */}
          <Select
            label="Payment & Validation Method"
            value={checkoutData.paymentMethod}
            onChange={(e) => setCheckoutData({ ...checkoutData, paymentMethod: e.target.value })}
            options={[
              'Campus ID Quota (Free)',
              'Pay at Library Desk (Cash / UPI)',
              'Campus Wallet / ID Card'
            ]}
          />

          <div className="modal-footer" style={{ margin: '1.25rem -1.5rem -1.5rem -1.5rem' }}>
            <Button variant="secondary" onClick={() => setBookingBook(null)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              loading={actionLoading}
              icon={BookCheck}
            >
              Pay ₹0 &amp; Confirm Booking
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Return Confirmation */}
      <Modal
        isOpen={Boolean(returningLoan)}
        onClose={() => setReturningLoan(null)}
        title="Confirm Book Return"
        maxWidth="440px"
      >
        <div style={{ marginBottom: '1.25rem', fontSize: '0.875rem' }}>
          <p>Return <strong>{returningLoan?.books?.title}</strong> back to library inventory?</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Available catalog copies will increment by 1.
          </p>
        </div>
        <div className="modal-footer" style={{ margin: '1.25rem -1.5rem -1.5rem -1.5rem' }}>
          <Button variant="secondary" onClick={() => setReturningLoan(null)} disabled={actionLoading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleReturnLoan} loading={actionLoading}>
            Confirm Return
          </Button>
        </div>
      </Modal>
    </div>
  );
}
