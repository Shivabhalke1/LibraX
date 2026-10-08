import { useState, useEffect } from 'react';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { MEMBER_STATUS } from '../../lib/constants';
import { AlertCircle } from 'lucide-react';

export default function MemberForm({
  initialData = null,
  onSubmit,
  onCancel,
  loading = false
}) {
  const [formData, setFormData] = useState({
    member_code: '',
    name: '',
    email: '',
    phone: '',
    department: 'Computer Science',
    year: '3rd Year',
    status: MEMBER_STATUS.ACTIVE
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        member_code: initialData.member_code || '',
        name: initialData.name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        department: initialData.department || 'Computer Science',
        year: initialData.year || '3rd Year',
        status: initialData.status || MEMBER_STATUS.ACTIVE
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

    if (!formData.name.trim()) {
      setError('Member name is required.');
      return;
    }
    if (!formData.email.trim()) {
      setError('Email address is required.');
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err.message || 'Error saving member record.');
    }
  };

  const departmentOptions = [
    'Computer Science',
    'Information Technology',
    'Electronics & Communication',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Data Science & AI',
    'Business Administration',
    'Faculty / Staff'
  ];

  const yearOptions = [
    '1st Year',
    '2nd Year',
    '3rd Year',
    '4th Year',
    'Postgraduate',
    'PhD Scholar',
    'Faculty Member'
  ];

  const statusOptions = [
    { value: MEMBER_STATUS.ACTIVE, label: 'Active (Allowed to borrow)' },
    { value: MEMBER_STATUS.INACTIVE, label: 'Inactive (Borrowing blocked)' }
  ];

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="alert alert-danger" style={{ fontSize: '0.8125rem' }}>
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <div>{error}</div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <Input
          label="Full Name"
          placeholder="e.g. Aarav Sharma"
          required
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
        />
        <Input
          label="Member ID / Code"
          placeholder="e.g. MEM-2024-001 (auto if empty)"
          value={formData.member_code}
          onChange={(e) => handleChange('member_code', e.target.value)}
          hint="Leave blank to auto-generate unique ID"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <Input
          label="Email Address"
          type="email"
          placeholder="e.g. aarav@campus.edu"
          required
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
        />
        <Input
          label="Phone Number"
          type="tel"
          placeholder="e.g. +91 98765 43210"
          value={formData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <Select
          label="Department"
          value={formData.department}
          onChange={(e) => handleChange('department', e.target.value)}
          options={departmentOptions}
        />
        <Select
          label="Academic Year"
          value={formData.year}
          onChange={(e) => handleChange('year', e.target.value)}
          options={yearOptions}
        />
      </div>

      <Select
        label="Membership Status"
        value={formData.status}
        onChange={(e) => handleChange('status', e.target.value)}
        options={statusOptions}
        hint="Only Active members can be issued library books."
      />

      <div className="modal-footer" style={{ margin: '1.25rem -1.5rem -1.5rem -1.5rem' }}>
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" loading={loading}>
          {initialData ? 'Update Member' : 'Register Member'}
        </Button>
      </div>
    </form>
  );
}
