import Table from '../ui/Table';
import Badge from '../ui/Badge';
import { Edit2, Trash2, User } from 'lucide-react';
import { MEMBER_STATUS } from '../../lib/constants';

export default function MemberTable({
  members = [],
  loading = false,
  onEdit,
  onDelete
}) {
  const headers = [
    { label: 'Member Name', style: { width: '28%' } },
    { label: 'Member ID', style: { width: '16%' } },
    { label: 'Department / Year', style: { width: '22%' } },
    { label: 'Contact', style: { width: '14%' } },
    { label: 'Status', style: { width: '10%', textAlign: 'center' } },
    { label: 'Actions', style: { width: '10%', textAlign: 'right' } }
  ];

  return (
    <Table
      headers={headers}
      loading={loading}
      isEmpty={members.length === 0}
      emptyMessage="No members found. Try modifying your search or register a new member."
    >
      {members.map((member) => {
        const isActive = member.status === MEMBER_STATUS.ACTIVE;
        return (
          <tr key={member.id}>
            <td>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: isActive ? 'var(--color-success-bg)' : 'var(--color-danger-bg)',
                  color: isActive ? 'var(--color-success)' : 'var(--color-danger)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <User size={16} />
                </div>
                <div>
                  <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>
                    {member.name}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    {member.email}
                  </div>
                </div>
              </div>
            </td>
            <td>
              <code style={{
                fontSize: '0.8125rem',
                backgroundColor: 'var(--bg-subtle)',
                padding: '0.125rem 0.375rem',
                borderRadius: 'var(--radius-sm)',
                fontWeight: '600'
              }}>
                {member.member_code}
              </code>
            </td>
            <td>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-main)' }}>
                {member.department || 'General'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {member.year || 'N/A'}
              </div>
            </td>
            <td>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-body)' }}>
                {member.phone || '—'}
              </span>
            </td>
            <td style={{ textAlign: 'center' }}>
              <Badge variant={isActive ? 'success' : 'danger'}>
                {member.status}
              </Badge>
            </td>
            <td style={{ textAlign: 'right' }}>
              <div style={{ display: 'inline-flex', gap: '0.375rem' }}>
                <button
                  type="button"
                  onClick={() => onEdit(member)}
                  className="btn btn-secondary btn-sm"
                  title="Edit Member"
                  style={{ padding: '0.375rem 0.5rem' }}
                >
                  <Edit2 size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(member)}
                  className="btn btn-secondary btn-sm"
                  title="Delete Member"
                  style={{ padding: '0.375rem 0.5rem', color: 'var(--color-danger)' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </td>
          </tr>
        );
      })}
    </Table>
  );
}
