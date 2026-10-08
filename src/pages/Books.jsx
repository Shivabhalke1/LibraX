import { useState } from 'react';
import { useBooks } from '../hooks/useBooks';
import BookTable from '../components/books/BookTable';
import BookFilters from '../components/books/BookFilters';
import BookForm from '../components/books/BookForm';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import { Plus, CheckCircle, AlertCircle } from 'lucide-react';

export default function Books() {
  const {
    books,
    loading,
    error,
    search,
    setSearch,
    category,
    setCategory,
    availability,
    setAvailability,
    addBook,
    editBook,
    removeBook
  } = useBooks();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [deletingBook, setDeletingBook] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [notice, setNotice] = useState(null); // { type: 'success' | 'error', message: '' }

  const showNotice = (type, message) => {
    setNotice({ type, message });
    setTimeout(() => setNotice(null), 4000);
  };

  const handleCreateBook = async (formData) => {
    setActionLoading(true);
    try {
      await addBook(formData);
      setIsAddModalOpen(false);
      showNotice('success', 'Book added successfully.');
    } catch (err) {
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateBook = async (formData) => {
    if (!editingBook) return;
    setActionLoading(true);
    try {
      await editBook(editingBook.id, formData);
      setEditingBook(null);
      showNotice('success', 'Book updated successfully.');
    } catch (err) {
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteBook = async () => {
    if (!deletingBook) return;
    setActionLoading(true);
    try {
      await removeBook(deletingBook.id);
      setDeletingBook(null);
      showNotice('success', 'Book deleted successfully.');
    } catch (err) {
      showNotice('error', err.message || 'Unable to delete book.');
      setDeletingBook(null);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('');
    setAvailability('all');
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-header-title">Book Management</h1>
          <p className="page-header-subtitle">
            Catalog inventory, stock levels, and copy availability
          </p>
        </div>
        <div className="page-header-actions">
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setIsAddModalOpen(true)}
          >
            Add New Book
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {notice && (
        <div className={`alert alert-${notice.type}`}>
          {notice.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <div>{notice.message}</div>
        </div>
      )}

      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={18} />
          <div>{error}</div>
        </div>
      )}

      {/* Filters */}
      <BookFilters
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={setCategory}
        availability={availability}
        onAvailabilityChange={setAvailability}
        onReset={handleResetFilters}
      />

      {/* Books Table */}
      <BookTable
        books={books}
        loading={loading}
        onEdit={(book) => setEditingBook(book)}
        onDelete={(book) => setDeletingBook(book)}
      />

      {/* Modal: Add Book */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Book"
      >
        <BookForm
          onSubmit={handleCreateBook}
          onCancel={() => setIsAddModalOpen(false)}
          loading={actionLoading}
        />
      </Modal>

      {/* Modal: Edit Book */}
      <Modal
        isOpen={Boolean(editingBook)}
        onClose={() => setEditingBook(null)}
        title="Edit Book Details"
      >
        <BookForm
          initialData={editingBook}
          onSubmit={handleUpdateBook}
          onCancel={() => setEditingBook(null)}
          loading={actionLoading}
        />
      </Modal>

      {/* Modal: Delete Confirmation */}
      <Modal
        isOpen={Boolean(deletingBook)}
        onClose={() => setDeletingBook(null)}
        title="Confirm Book Deletion"
        maxWidth="440px"
      >
        <div style={{ marginBottom: '1.25rem' }}>
          <p style={{ color: 'var(--text-body)' }}>
            Are you sure you want to delete <strong>{deletingBook?.title}</strong>?
          </p>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            This action cannot be undone. Books with active loans cannot be removed.
          </p>
        </div>
        <div className="modal-footer" style={{ margin: '1.25rem -1.5rem -1.5rem -1.5rem' }}>
          <Button variant="secondary" onClick={() => setDeletingBook(null)} disabled={actionLoading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteBook} loading={actionLoading}>
            Delete Book
          </Button>
        </div>
      </Modal>
    </div>
  );
}
