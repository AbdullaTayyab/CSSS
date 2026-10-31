import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('https://') &&
  supabaseAnonKey.length > 20
);

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

export const supabaseService = {
  isConfigured: () => isSupabaseConfigured,

  fetchNotices: async () => {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('notices')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('Supabase fetch error, using local fallback:', err.message);
      return null;
    }
  },

  insertNotice: async (notice) => {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('notices')
        .insert([notice])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('Supabase insert error:', err.message);
      return null;
    }
  },

  updateNotice: async (id, updates) => {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('notices')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('Supabase update error:', err.message);
      return null;
    }
  },

  deleteNotice: async (id) => {
    if (!supabase) return null;
    try {
      const { error } = await supabase
        .from('notices')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (err) {
      console.warn('Supabase delete error:', err.message);
      return false;
    }
  }
};
