import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const authService = {
  /**
   * Sign in with Email and Password
   */
  async signIn(email, password) {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    return data;
  },

  /**
   * Register a new admin/librarian account
   */
  async signUp(email, password, name, role = 'librarian') {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role }
      }
    });

    if (error) {
      throw error;
    }

    // Insert profile if user was created
    if (data?.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: data.user.id,
          name: name || email.split('@')[0],
          role: role || 'librarian'
        });

      if (profileError) {
        console.warn('Profile creation note:', profileError.message);
      }
    }

    return data;
  },

  /**
   * Sign out current user
   */
  async signOut() {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  },

  /**
   * Fetch current session
   */
  async getSession() {
    if (!isSupabaseConfigured) return null;
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      throw error;
    }
    return session;
  },

  /**
   * Fetch profile for current user
   */
  async getUserProfile(userId) {
    if (!isSupabaseConfigured || !userId) return null;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      // Return basic user info if profile table hasn't populated yet
      return { user_id: userId, role: 'librarian' };
    }
    return data;
  }
};
