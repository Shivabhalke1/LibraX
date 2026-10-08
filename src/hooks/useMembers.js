import { useState, useEffect, useCallback } from 'react';
import { memberService } from '../services/memberService';

export function useMembers() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await memberService.getMembers({ search, status });
      setMembers(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch members.');
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const addMember = async (memberData) => {
    const created = await memberService.createMember(memberData);
    await fetchMembers();
    return created;
  };

  const editMember = async (id, memberData) => {
    const updated = await memberService.updateMember(id, memberData);
    await fetchMembers();
    return updated;
  };

  const removeMember = async (id) => {
    await memberService.deleteMember(id);
    await fetchMembers();
  };

  return {
    members,
    loading,
    error,
    search,
    setSearch,
    status,
    setStatus,
    addMember,
    editMember,
    removeMember,
    refreshMembers: fetchMembers
  };
}
