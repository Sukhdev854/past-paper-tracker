import { createClient } from 'jsr:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

export async function signUpUser(email: string, password: string, name: string, username: string) {
  try {
    // Check if username already exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username.toLowerCase())
      .single();

    if (existingUser) {
      return { success: false, error: 'Username already taken' };
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, username },
      email_confirm: true, // Auto-confirm since email server hasn't been configured
    });

    if (error) {
      console.error('Sign up error:', error);
      return { success: false, error: error.message };
    }

    // Create profile entry
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: data.user!.id,
        username: username.toLowerCase(),
        name: name,
        email: email,
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Don't fail the signup if profile creation fails
    }

    return { success: true, user: data.user };
  } catch (error) {
    console.error('Sign up exception:', error);
    return { success: false, error: 'Failed to create user' };
  }
}

export async function getUserByUsername(username: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('email')
      .eq('username', username.toLowerCase())
      .single();

    if (error || !data) {
      return { success: false, error: 'User not found' };
    }

    return { success: true, email: data.email };
  } catch (error) {
    console.error('Get user by username exception:', error);
    return { success: false, error: 'Failed to find user' };
  }
}

export async function verifyToken(token: string) {
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.error('Token verification error:', error);
      return { success: false, error: 'Invalid token' };
    }

    return { success: true, user };
  } catch (error) {
    console.error('Token verification exception:', error);
    return { success: false, error: 'Token verification failed' };
  }
}