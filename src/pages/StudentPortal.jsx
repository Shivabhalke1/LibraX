import { useState, useEffect } from 'react';
import { bookService } from '../services/bookService';
import { memberService } from '../services/memberService';
import { borrowingService } from '../services/borrowingService';
import { formatDate, formatCurrency, isOverdue } from '../lib/utils';
import { BOOK_CATEGORIES } from '../lib/constants';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Loader from '../components/ui/Loader';
import {
  BookOpen,
  Search,
  BookCheck,
  CheckCircle,
  AlertCircle,
  UserCheck,
  RotateCcw
} from 'lucide-react';

export default function StudentPortal({ onSwitchToAdmin }) {
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberLoans, setMemberLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [confirmBook, setConfirmBook] = useState(null);
  const [returningLoan, setReturningLoan] = useState(null);
  const [notice, setNotice] = useState(null);

  const showNotice = (type, message) => {
    setNotice({ type, message });
    setTimeout(() => setNotice(null), 5000);
  };

  const loadPortalData = async () => {
    setLoading(true);
    try {
      const [allBooks, allMembers] = await Promise.all([
        bookService.getBooks(),
        memberService.getMembers()
      ]);
      setBooks(allBooks);
      setMembers(allMembers);

      // Default select the first active member if none selected
      if (!selectedMember && allMembers.length > 0) {
        const firstActive = allMembers.find((m) => m.status === 'Active') || allMembers[0];
        setSelectedMember(firstActive);
      }
    } catch (err) {
      console.error('Portal load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMemberLoans = async (memberId) => {
    if (!memberId) return;
    try {
      const allBorrowings = await borrowingService.getAllBorrowings();
      const myLoans = allBorrowings.filter((b) => b.member_id === memberId && !b.returned_at);
      setMemberLoans(myLoans);
    } catch (err) {
      console.error('Error loading member loans:', err);
    }
  };

  useEffect(() => {
    loadPortalData();
  }, []);

  useEffect(() => {
    if (selectedMember) {
      loadMemberLoans(selectedMember.id);
    }
  }, [selectedMember]);

  const handleBookBorrow = async () => {
    if (!confirmBook || !selectedMember) return;
    setActionLoading(true);
    try {
      await borrowingService.issueBook({
        book_id: confirmBook.id,
        member_id: selectedMember.id
      });
      setConfirmBook(null);
      showNotice('success', `"${confirmBook.title}" successfully booked and borrowed!`);
      await Promise.all([
        loadPortalData(),
        loadMemberLoans(selectedMember.id)
      ]);
    } catch (err) {
      showNotice('error', err.message || 'Unable to book title.');
      setConfirmBook(null);
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
        showNotice('success', `Book returned! Overdue fee of ${formatCurrency(res.fine)} applied.`);
      } else {
        showNotice('success', 'Book returned on time! Thank you.');
      }
      await Promise.all([
        loadPortalData(),
        loadMemberLoans(selectedMember.id)
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
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem 0' }}>
      {/* Top Banner / Student Selector */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-light)',
        padding: '1.25rem 1.5rem',
        marginBottom: '1.5rem',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)' }}>
              🎓 Student &amp; Patron Portal
            </span>
            <Badge variant="info">Self-Service</Badge>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Browse library catalog titles, book reservations, and check your loan due dates
          </p>
        </div>

        {/* Member Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserCheck size={16} color="var(--color-primary)" />
            <span style={{ fontSize: '0.8125rem', fontWeight: '600' }}>Active Patron:</span>
            <select
              className="form-select"
              style={{ width: 'auto', minWidth: '220px', padding: '0.4rem 0.75rem' }}
              value={selectedMember?.id || ''}
              onChange={(e) => {
                const found = members.find((m) => m.id === e.target.value);
                setSelectedMember(found);
              }}
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.member_code}) - {m.status}
                </option>
              ))}
            </select>
          </div>

          <Button variant="secondary" size="sm" onClick={onSwitchToAdmin}>
            Back to Admin Dashboard
          </Button>
        </div>
      </div>

      {notice && (
        <div className={`alert alert-${notice.type}`}>
          {notice.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <div>{notice.message}</div>
        </div>
      )}

      {/* Grid: My Loans (Left) & Book Catalog (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* My Current Borrowings */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              📚 My Borrowed Books ({memberLoans.length})
            </h3>
          </div>

          {memberLoans.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              You currently have no borrowed books. Choose a title from the catalog to book one!
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
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
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

        {/* Member Status Summary */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Patron Profile Status</h3>
          </div>
          {selectedMember ? (
            <div style={{ fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div><strong>Name:</strong> {selectedMember.name}</div>
              <div><strong>Member ID:</strong> <code>{selectedMember.member_code}</code></div>
              <div><strong>Department:</strong> {selectedMember.department || 'General'}</div>
              <div><strong>Academic Year:</strong> {selectedMember.year || 'N/A'}</div>
              <div>
                <strong>Borrowing Privilege: </strong>
                <Badge variant={selectedMember.status === 'Active' ? 'success' : 'danger'}>
                  {selectedMember.status === 'Active' ? 'Eligible to Borrow' : 'Blocked (Inactive)'}
                </Badge>
              </div>
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>No member profile selected.</p>
          )}
        </div>
      </div>

      {/* Catalog Search & Filters */}
      <div className="filter-bar">
        <div className="filter-search" style={{ position: 'relative' }}>
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.25rem' }}
            placeholder="Search book title, author, or ISBN..."
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
        <Loader text="Loading library catalog..." />
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
                  justifyContent: 'space-between',
                  transition: 'transform 0.15s ease'
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
                    disabled={!hasCopies || selectedMember?.status !== 'Active'}
                    onClick={() => setConfirmBook(book)}
                  >
                    {hasCopies ? 'Book / Borrow' : 'Unavailable'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Confirm Borrow */}
      <Modal
        isOpen={Boolean(confirmBook)}
        onClose={() => setConfirmBook(null)}
        title="Confirm Book Reservation"
        maxWidth="460px"
      >
        <div style={{ marginBottom: '1.25rem', fontSize: '0.875rem' }}>
          <p>You are booking:</p>
          <div style={{
            backgroundColor: 'var(--bg-subtle)',
            padding: '0.875rem',
            borderRadius: 'var(--radius-md)',
            margin: '0.75rem 0',
            border: '1px solid var(--border-light)'
          }}>
            <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{confirmBook?.title}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>by {confirmBook?.author}</div>
          </div>
          <p style={{ color: 'var(--text-body)' }}>
            Patron: <strong>{selectedMember?.name}</strong> (<code>{selectedMember?.member_code}</code>)
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Standard loan period: 14 days. Book copies will automatically decrease by 1 upon booking.
          </p>
        </div>
        <div className="modal-footer" style={{ margin: '1.25rem -1.5rem -1.5rem -1.5rem' }}>
          <Button variant="secondary" onClick={() => setConfirmBook(null)} disabled={actionLoading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleBookBorrow} loading={actionLoading} icon={BookCheck}>
            Confirm &amp; Borrow Book
          </Button>
        </div>
      </Modal>

      {/* Modal: Confirm Return */}
      <Modal
        isOpen={Boolean(returningLoan)}
        onClose={() => setReturningLoan(null)}
        title="Confirm Book Return"
        maxWidth="440px"
      >
        <div style={{ marginBottom: '1.25rem', fontSize: '0.875rem' }}>
          <p>Return <strong>{returningLoan?.books?.title}</strong> to library stock?</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            This will mark your loan as returned and restore 1 copy back to the catalog.
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
