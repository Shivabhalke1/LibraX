import { useState } from 'react';
import { useMembers } from '../hooks/useMembers';
import MemberTable from '../components/members/MemberTable';
import MemberFilters from '../components/members/MemberFilters';
import MemberForm from '../components/members/MemberForm';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import { UserPlus, CheckCircle, AlertCircle } from 'lucide-react';

export default function Members() {
  const {
    members,
    loading,
    error,
    search,
    setSearch,
    status,
    setStatus,
    addMember,
    editMember,
    removeMember
  } = useMembers();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [deletingMember, setDeletingMember] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [notice, setNotice] = useState(null);

  const showNotice = (type, message) => {
    setNotice({ type, message });
    setTimeout(() => setNotice(null), 4000);
  };

  const handleCreateMember = async (formData) => {
    setActionLoading(true);
    try {
      await addMember(formData);
      setIsAddModalOpen(false);
      showNotice('success', 'Member registered successfully.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateMember = async (formData) => {
    if (!editingMember) return;
    setActionLoading(true);
    try {
      await editMember(editingMember.id, formData);
      setEditingMember(null);
      showNotice('success', 'Member updated successfully.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteMember = async () => {
    if (!deletingMember) return;
    setActionLoading(true);
    try {
      await removeMember(deletingMember.id);
      setDeletingMember(null);
      showNotice('success', 'Member record removed successfully.');
    } catch (err) {
      showNotice('error', err.message || 'Unable to remove member.');
      setDeletingMember(null);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatus('all');
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-header-title">Member Directory</h1>
          <p className="page-header-subtitle">
            Manage student & staff patrons, loan eligibility, and contact details
          </p>
        </div>
        <div className="page-header-actions">
          <Button
            variant="primary"
            icon={UserPlus}
            onClick={() => setIsAddModalOpen(true)}
          >
            Register Member
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
      <MemberFilters
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        onReset={handleResetFilters}
      />

      {/* Members Table */}
      <MemberTable
        members={members}
        loading={loading}
        onEdit={(member) => setEditingMember(member)}
        onDelete={(member) => setDeletingMember(member)}
      />

      {/* Modal: Register Member */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Library Member"
      >
        <MemberForm
          onSubmit={handleCreateMember}
          onCancel={() => setIsAddModalOpen(false)}
          loading={actionLoading}
        />
      </Modal>

      {/* Modal: Edit Member */}
      <Modal
        isOpen={Boolean(editingMember)}
        onClose={() => setEditingMember(null)}
        title="Edit Member Information"
      >
        <MemberForm
          initialData={editingMember}
          onSubmit={handleUpdateMember}
          onCancel={() => setEditingMember(null)}
          loading={actionLoading}
        />
      </Modal>

      {/* Modal: Delete Confirmation */}
      <Modal
        isOpen={Boolean(deletingMember)}
        onClose={() => setDeletingMember(null)}
        title="Confirm Member Deletion"
        maxWidth="440px"
      >
        <div style={{ marginBottom: '1.25rem' }}>
          <p style={{ color: 'var(--text-body)' }}>
            Are you sure you want to remove <strong>{deletingMember?.name}</strong> (<code>{deletingMember?.member_code}</code>)?
          </p>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Members with active loaned books cannot be removed.
          </p>
        </div>
        <div className="modal-footer" style={{ margin: '1.25rem -1.5rem -1.5rem -1.5rem' }}>
          <Button variant="secondary" onClick={() => setDeletingMember(null)} disabled={actionLoading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteMember} loading={actionLoading}>
            Delete Member
          </Button>
        </div>
      </Modal>
    </div>
  );
}
