import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { MEMBER_STATUS } from '../lib/constants';

export const memberService = {
  /**
   * Fetch members with optional search & status filter
   */
  async getMembers({ search = '', status = 'all' } = {}) {
    if (!isSupabaseConfigured) return [];

    let query = supabase
      .from('members')
      .select('*')
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching members:', error);
      throw error;
    }

    let members = data || [];

    // Client-side text search across name, code, email, department
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      members = members.filter((m) =>
        m.name?.toLowerCase().includes(q) ||
        m.member_code?.toLowerCase().includes(q) ||
        m.email?.toLowerCase().includes(q) ||
        m.department?.toLowerCase().includes(q)
      );
    }

    return members;
  },

  /**
   * Fetch only active members (for issue book dropdown)
   */
  async getActiveMembers() {
    if (!isSupabaseConfigured) return [];

    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('status', MEMBER_STATUS.ACTIVE)
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get single member by ID
   */
  async getMemberById(id) {
    if (!isSupabaseConfigured) return null;
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Create a new member
   */
  async createMember(member) {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured.');
    }

    // Auto-generate member code if empty: MEM-YYYY-XXX
    let code = member.member_code ? member.member_code.trim() : '';
    if (!code) {
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      code = `MEM-${new Date().getFullYear()}-${randomSuffix}`;
    }

    const payload = {
      member_code: code,
      name: member.name.trim(),
      email: member.email.trim(),
      phone: member.phone ? member.phone.trim() : null,
      department: member.department ? member.department.trim() : null,
      year: member.year ? member.year.trim() : null,
      status: member.status || MEMBER_STATUS.ACTIVE
    };

    const { data, error } = await supabase
      .from('members')
      .insert([payload])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error(`Member with Code "${code}" already exists.`);
      }
      throw error;
    }

    return data;
  },

  /**
   * Update an existing member
   */
  async updateMember(id, member) {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured.');
    }

    const payload = {
      member_code: member.member_code.trim(),
      name: member.name.trim(),
      email: member.email.trim(),
      phone: member.phone ? member.phone.trim() : null,
      department: member.department ? member.department.trim() : null,
      year: member.year ? member.year.trim() : null,
      status: member.status || MEMBER_STATUS.ACTIVE
    };

    const { data, error } = await supabase
      .from('members')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error(`Member with Code "${member.member_code}" already exists.`);
      }
      throw error;
    }

    return data;
  },

  /**
   * Delete member safely
   * Prevents deletion if member has active loans
   */
  async deleteMember(id) {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured.');
    }

    // Check for active borrowings
    const { data: activeBorrowings, error: checkError } = await supabase
      .from('borrowings')
      .select('id')
      .eq('member_id', id)
      .is('returned_at', null);

    if (checkError) throw checkError;

    if (activeBorrowings && activeBorrowings.length > 0) {
      throw new Error(
        `Cannot delete this member. They currently hold ${activeBorrowings.length} active borrowed book(s).`
      );
    }

    const { error } = await supabase
      .from('members')
      .delete()
      .eq('id', id);

    if (error) {
      if (error.code === '23503') {
        throw new Error('Cannot delete this member as they have past borrowing records.');
      }
      throw error;
    }

    return true;
  }
};
