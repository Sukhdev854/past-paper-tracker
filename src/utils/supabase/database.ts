import { supabase } from './client';
import { StudentProfile, ProgressEntry } from '../../App';

// Check if database tables exist and are accessible
export async function checkDatabaseAvailability() {
  try {
    // Try to query the student_profiles table
    const { error } = await supabase
      .from('student_profiles')
      .select('id')
      .limit(1);

    // If no error or error is just "no rows", tables exist
    return !error || error.code === 'PGRST116';
  } catch (err) {
    console.log('Database tables not available, using localStorage fallback');
    return false;
  }
}

// Profile operations
export async function saveProfile(userId: string, profile: StudentProfile) {
  try {
    const { data, error } = await supabase
      .from('student_profiles')
      .upsert({
        user_id: userId,
        profile_data: profile,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving profile:', error);
      // Save to localStorage as fallback
      localStorage.setItem('studentProfile', JSON.stringify(profile));
      return { success: false, error: error.message };
    }

    // Also save to localStorage for offline access
    localStorage.setItem('studentProfile', JSON.stringify(profile));
    return { success: true, data };
  } catch (err: any) {
    console.error('Save profile exception:', err);
    // Save to localStorage as fallback
    localStorage.setItem('studentProfile', JSON.stringify(profile));
    return { success: false, error: err.message };
  }
}

export async function getProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('student_profiles')
      .select('profile_data')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No profile found
        return { success: true, data: null };
      }
      console.error('Error getting profile:', error);
      // Try localStorage as fallback
      const savedProfile = localStorage.getItem('studentProfile');
      if (savedProfile) {
        return { success: true, data: JSON.parse(savedProfile) as StudentProfile };
      }
      return { success: false, error: error.message };
    }

    return { success: true, data: data.profile_data as StudentProfile };
  } catch (err: any) {
    console.error('Get profile exception:', err);
    // Try localStorage as fallback
    const savedProfile = localStorage.getItem('studentProfile');
    if (savedProfile) {
      return { success: true, data: JSON.parse(savedProfile) as StudentProfile };
    }
    return { success: false, error: err.message };
  }
}

// Progress operations
export async function saveProgressEntries(userId: string, entries: ProgressEntry[]) {
  try {
    // Delete existing entries
    await supabase
      .from('progress_entries')
      .delete()
      .eq('user_id', userId);

    // Insert new entries
    const entriesWithUserId = entries.map(entry => ({
      user_id: userId,
      entry_id: entry.id,
      entry_data: entry,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from('progress_entries')
      .insert(entriesWithUserId);

    if (error) {
      console.error('Error saving progress entries:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Save progress entries exception:', err);
    return { success: false, error: err.message };
  }
}

export async function getProgressEntries(userId: string) {
  try {
    const { data, error } = await supabase
      .from('progress_entries')
      .select('entry_data')
      .eq('user_id', userId);

    if (error) {
      console.error('Error getting progress entries:', error);
      return { success: false, error: error.message };
    }

    const entries = data?.map(item => item.entry_data as ProgressEntry) || [];
    return { success: true, data: entries };
  } catch (err: any) {
    console.error('Get progress entries exception:', err);
    return { success: false, error: err.message };
  }
}

// Add a single progress entry
export async function addProgressEntry(userId: string, entry: ProgressEntry) {
  try {
    const { error } = await supabase
      .from('progress_entries')
      .insert({
        user_id: userId,
        entry_id: entry.id,
        entry_data: entry,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error adding progress entry:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Add progress entry exception:', err);
    return { success: false, error: err.message };
  }
}