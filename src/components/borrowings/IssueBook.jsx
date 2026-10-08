import { useState, useEffect } from 'react';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { bookService } from '../../services/bookService';
import { memberService } from '../../services/memberService';
import { BORROWING_PERIOD, MEMBER_STATUS } from '../../lib/constants';
import { toInputDateFormat, addDays } from '../../lib/utils';
import { AlertCircle, BookCheck, Info } from 'lucide-react';

export default function IssueBookModal({
  onSubmit,
  onCancel,
  loading = false
}) {
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [fetchingOptions, setFetchingOptions] = useState(true);

  const [selectedBookId, setSelectedBookId] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [issuedAt, setIssuedAt] = useState(toInputDateFormat(new Date()));
  const [dueDate, setDueDate] = useState(addDays(new Date(), BORROWING_PERIOD));
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      setFetchingOptions(true);
      try {
        const [booksData, membersData] = await Promise.all([
          bookService.getBooks(),
          memberService.getMembers()
        ]);
        setBooks(booksData);
        setMembers(membersData);
      } catch (err) {
        setError('Error loading books or members.');
      } finally {
        setFetchingOptions(false);
      }
    }
    loadData();
  }, []);

  // Recalculate due date if issue date changes
  const handleIssueDateChange = (newDate) => {
    setIssuedAt(newDate);
    if (newDate) {
      setDueDate(addDays(new Date(newDate), BORROWING_PERIOD));
    }
  };

  const selectedBook = books.find((b) => b.id === selectedBookId);
  const selectedMember = members.find((m) => m.id === selectedMemberId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedMemberId) {
      setError('Please select a member.');
      return;
    }
    if (!selectedBookId) {
      setError('Please select a book.');
      return;
    }

    // Business validation: Member status
    if (selectedMember && selectedMember.status !== MEMBER_STATUS.ACTIVE) {
      setError(`Cannot issue book: Member "${selectedMember.name}" is Inactive.`);
      return;
    }

    // Business validation: Available copies
    if (selectedBook && selectedBook.available_copies <= 0) {
      setError(`No copies available for "${selectedBook.title}".`);
      return;
    }

    try {
      await onSubmit({
        book_id: selectedBookId,
        member_id: selectedMemberId,
        issued_at: issuedAt,
        due_date: dueDate
      });
    } catch (err) {
      setError(err.message || 'Failed to issue book.');
    }
  };

  const bookOptions = books.map((b) => ({
    value: b.id,
    label: `${b.title} (${b.available_copies > 0 ? `${b.available_copies} available` : 'OUT OF STOCK'})`
  }));

  const memberOptions = members.map((m) => ({
    value: m.id,
    label: `${m.name} [${m.member_code}] - ${m.status}`
  }));

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="alert alert-danger" style={{ fontSize: '0.8125rem' }}>
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <div>{error}</div>
        </div>
      )}

      {/* Select Member */}
      <Select
        label="Select Member (Patron)"
        required
        value={selectedMemberId}
        onChange={(e) => {
          setSelectedMemberId(e.target.value);
          setError('');
        }}
        options={memberOptions}
        placeholder={fetchingOptions ? 'Loading members...' : 'Choose a member...'}
        disabled={fetchingOptions}
      />

      {selectedMember && (
        <div style={{
          marginTop: '-0.5rem',
          marginBottom: '1rem',
          fontSize: '0.75rem',
          color: selectedMember.status === MEMBER_STATUS.ACTIVE ? 'var(--color-success)' : 'var(--color-danger)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.375rem'
        }}>
          <Info size={14} />
          <span>Status: <strong>{selectedMember.status}</strong> &bull; Dept: {selectedMember.department || 'General'}</span>
        </div>
      )}

      {/* Select Book */}
      <Select
        label="Select Book to Issue"
        required
        value={selectedBookId}
        onChange={(e) => {
          setSelectedBookId(e.target.value);
          setError('');
        }}
        options={bookOptions}
        placeholder={fetchingOptions ? 'Loading books...' : 'Choose a book...'}
        disabled={fetchingOptions}
      />

      {selectedBook && (
        <div style={{
          marginTop: '-0.5rem',
          marginBottom: '1rem',
          fontSize: '0.75rem',
          color: selectedBook.available_copies > 0 ? 'var(--color-success)' : 'var(--color-danger)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.375rem'
        }}>
          <Info size={14} />
          <span>Available copies: <strong>{selectedBook.available_copies}</strong> of {selectedBook.total_copies}</span>
        </div>
      )}

      {/* Dates */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <Input
          label="Issue Date"
          type="date"
          required
          value={issuedAt}
          onChange={(e) => handleIssueDateChange(e.target.value)}
        />
        <Input
          label="Due Date"
          type="date"
          required
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          hint={`Default period: ${BORROWING_PERIOD} days`}
        />
      </div>

      <div className="modal-footer" style={{ margin: '1.25rem -1.5rem -1.5rem -1.5rem' }}>
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="primary"
          type="submit"
          loading={loading}
          icon={BookCheck}
          disabled={selectedBook && selectedBook.available_copies <= 0}
        >
          Confirm &amp; Issue Book
        </Button>
      </div>
    </form>
  );
}
