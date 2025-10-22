import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth';

// PUT /api/registration/settings/[id] - Update a specific registration setting
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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
    const body = await request.json();

    // Validate the setting ID
    if (!params.id) {
      return NextResponse.json(
        { error: 'Bad Request: Setting ID is required' },
        { status: 400 }
      );
    }

    // Prepare update data with validation
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    // Only include fields that are actually being updated
    if (body.registration_open !== undefined) {
      updateData.registration_open = Boolean(body.registration_open);
    }
    
    if (body.registration_start !== undefined) {
      updateData.registration_start = body.registration_start || null;
    }
    
    if (body.registration_end !== undefined) {
      updateData.registration_end = body.registration_end || null;
    }
    
    if (body.min_team_size !== undefined) {
      updateData.min_team_size = body.min_team_size ? Number(body.min_team_size) : null;
    }
    
    if (body.max_team_size !== undefined) {
      updateData.max_team_size = body.max_team_size ? Number(body.max_team_size) : null;
    }
    
    if (body.allow_mixed_gender !== undefined) {
      updateData.allow_mixed_gender = Boolean(body.allow_mixed_gender);
    }
    
    if (body.allow_mixed_department !== undefined) {
      updateData.allow_mixed_department = Boolean(body.allow_mixed_department);
    }
    
    if (body.requires_approval !== undefined) {
      updateData.requires_approval = Boolean(body.requires_approval);
    }
    
    if (body.max_registrations_per_sport !== undefined) {
      updateData.max_registrations_per_sport = body.max_registrations_per_sport ? Number(body.max_registrations_per_sport) : null;
    }

    // Update the registration setting
    const { data, error } = await supabase
      .from('registration_settings')
      .update(updateData)
      .eq('id', params.id)
      .select(`
        *,
        sport:sports(name, icon, is_team_sport)
      `)
      .single();

    if (error) {
      console.error('Database error updating registration setting:', error);
      return NextResponse.json(
        { error: 'Database error: Failed to update registration setting' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Not Found: Registration setting not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Unexpected error in PUT /api/registration/settings/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error: Unexpected error occurred' },
      { status: 500 }
    );
  }
}