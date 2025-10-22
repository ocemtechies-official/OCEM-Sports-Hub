import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth';

// GET /api/registration/settings - Fetch all registration settings
export async function GET() {
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

    // Fetch all registration settings with sport information
    const { data: settings, error } = await supabase
      .from('registration_settings')
      .select(`
        *,
        sport:sports(name, icon, is_team_sport, is_active)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error fetching registration settings:', error);
      return NextResponse.json(
        { error: 'Database error: Failed to fetch registration settings' },
        { status: 500 }
      );
    }

    // Filter out settings for inactive sports
    const activeSettings = settings.filter(setting => setting.sport?.is_active !== false);

    return NextResponse.json({ 
      settings: activeSettings,
      count: activeSettings.length
    });
  } catch (error) {
    console.error('Unexpected error in GET /api/registration/settings:', error);
    return NextResponse.json(
      { error: 'Internal server error: Unexpected error occurred' },
      { status: 500 }
    );
  }
}