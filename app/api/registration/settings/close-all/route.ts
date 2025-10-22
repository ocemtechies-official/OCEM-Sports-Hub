import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth';

// POST /api/registration/settings/close-all - Close registration for all sports
export async function POST() {
  try {
    // Check if user is admin
    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 401 }
      );
    }

    const supabase = await getSupabaseServerClient();

    // Update all registration settings to close registration
    const { data, error } = await supabase
      .from('registration_settings')
      .update({
        registration_open: false,
        updated_at: new Date().toISOString()
      })
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all records

    if (error) {
      console.error('Database error closing all registrations:', error);
      return NextResponse.json(
        { error: 'Database error: Failed to close all registrations' },
        { status: 500 }
      );
    }

    // Count the number of affected rows
    const { count, error: countError } = await supabase
      .from('registration_settings')
      .select('*', { count: 'exact', head: true })
      .eq('registration_open', false);

    return NextResponse.json({ 
      message: 'All registrations closed successfully',
      updated_count: count || 0
    });
  } catch (error) {
    console.error('Unexpected error in POST /api/registration/settings/close-all:', error);
    return NextResponse.json(
      { error: 'Internal server error: Unexpected error occurred' },
      { status: 500 }
    );
  }
}