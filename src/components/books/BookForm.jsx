import { useState, useEffect } from 'react';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { BOOK_CATEGORIES } from '../../lib/constants';
import { AlertCircle } from 'lucide-react';

export default function BookForm({
  initialData = null,
  onSubmit,
  onCancel,
  loading = false
}) {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    category: BOOK_CATEGORIES[0],
    publisher: '',
    publication_year: new Date().getFullYear(),
    total_copies: 1
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        author: initialData.author || '',
        isbn: initialData.isbn || '',
        category: initialData.category || BOOK_CATEGORIES[0],
        publisher: initialData.publisher || '',
        publication_year: initialData.publication_year || new Date().getFullYear(),
        total_copies: initialData.total_copies ?? 1
      });
    }
  }, [initialData]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Book title is required.');
      return;
    }
    if (!formData.author.trim()) {
      setError('Author is required.');
      return;
    }
    if (!formData.isbn.trim()) {
      setError('ISBN is required.');
      return;
    }
    if (!formData.category) {
      setError('Category is required.');
      return;
    }
    if (Number(formData.total_copies) < 1) {
      setError('Total copies must be at least 1.');
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err.message || 'Error saving book.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="alert alert-danger" style={{ fontSize: '0.8125rem' }}>
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <div>{error}</div>
        </div>
      )}

      <Input
        label="Book Title"
        placeholder="e.g. Clean Architecture"
        required
        value={formData.title}
        onChange={(e) => handleChange('title', e.target.value)}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <Input
          label="Author"
          placeholder="e.g. Robert C. Martin"
          required
          value={formData.author}
          onChange={(e) => handleChange('author', e.target.value)}
        />
        <Input
          label="ISBN"
          placeholder="e.g. 978-0134494166"
          required
          value={formData.isbn}
          onChange={(e) => handleChange('isbn', e.target.value)}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <Select
          label="Category"
          required
          value={formData.category}
          onChange={(e) => handleChange('category', e.target.value)}
          options={BOOK_CATEGORIES}
        />
        <Input
          label="Publisher"
          placeholder="e.g. Prentice Hall"
          value={formData.publisher}
          onChange={(e) => handleChange('publisher', e.target.value)}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <Input
          label="Publication Year"
          type="number"
          min="1000"
          max={new Date().getFullYear() + 1}
          value={formData.publication_year}
          onChange={(e) => handleChange('publication_year', e.target.value)}
        />
        <Input
          label="Total Copies"
          type="number"
          min="1"
          required
          value={formData.total_copies}
          onChange={(e) => handleChange('total_copies', e.target.value)}
          hint={initialData ? `Currently available: ${initialData.available_copies}` : 'Initial available copies will match total copies'}
        />
      </div>

      <div className="modal-footer" style={{ margin: '1.25rem -1.5rem -1.5rem -1.5rem' }}>
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" loading={loading}>
          {initialData ? 'Update Book' : 'Add Book'}
        </Button>
      </div>
    </form>
  );
}
