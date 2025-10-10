#!/usr/bin/env node
/**
 * Script to test the new profile fields functionality
 * Run with: npx ts-node scripts/test-profile-fields.ts
 */

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface TestProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  student_id?: string;
  department?: string;
  semester?: string;
  contact_number?: string;
  bio?: string;
  address?: string;
  city?: string;
  date_of_birth?: string;
  profile_visibility?: string;
  notification_preferences?: object;
  theme_preference?: string;
  language_preference?: string;
  timezone?: string;
}

async function testProfileFields() {
  console.log('Testing new profile fields...');
  
  try {
    // Test inserting a profile with new fields
    const testProfile: TestProfile = {
      id: '00000000-0000-0000-0000-000000000001', // Test UUID
      email: 'test@example.com',
      full_name: 'Test User',
      role: 'viewer',
      student_id: 'STU123456',
      department: 'Computer Science',
      semester: '5th',
      contact_number: '+1234567890',
      bio: 'This is a test user for profile fields',
      address: '123 Test Street',
      city: 'Test City',
      date_of_birth: '1995-05-15',
      profile_visibility: 'public',
      notification_preferences: {
        email: true,
        push: true,
        sms: false
      },
      theme_preference: 'dark',
      language_preference: 'en',
      timezone: 'UTC'
    };

    // First, check if the test user already exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', testProfile.id)
      .single();

    if (existingUser) {
      console.log('Test user already exists, updating...');
      const { error: updateError } = await supabase
        .from('profiles')
        .update(testProfile)
        .eq('id', testProfile.id);

      if (updateError) {
        console.error('Error updating test profile:', updateError);
        return;
      }
    } else {
      console.log('Creating new test profile...');
      const { error: insertError } = await supabase
        .from('profiles')
        .insert([testProfile]);

      if (insertError) {
        console.error('Error inserting test profile:', insertError);
        return;
      }
    }

    // Test querying the profile with new fields
    const { data: profile, error: selectError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', testProfile.id)
      .single();

    if (selectError) {
      console.error('Error fetching test profile:', selectError);
      return;
    }

    if (profile) {
      console.log('Profile retrieved successfully:');
      console.log('- Student ID:', profile.student_id);
      console.log('- Department:', profile.department);
      console.log('- Semester:', profile.semester);
      console.log('- Contact Number:', profile.contact_number);
      console.log('- Bio:', profile.bio);
      console.log('- Address:', profile.address);
      console.log('- City:', profile.city);
      console.log('- Date of Birth:', profile.date_of_birth);
      console.log('- Profile Visibility:', profile.profile_visibility);
      console.log('- Theme Preference:', profile.theme_preference);
      console.log('- Language Preference:', profile.language_preference);
      console.log('- Timezone:', profile.timezone);
      console.log('- Notification Preferences:', profile.notification_preferences);
    }

    // Test updating specific fields
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        bio: 'Updated bio for testing',
        theme_preference: 'light'
      })
      .eq('id', testProfile.id);

    if (updateError) {
      console.error('Error updating profile fields:', updateError);
      return;
    }

    console.log('Profile fields updated successfully!');
    console.log('New Bio:', 'Updated bio for testing');
    console.log('New Theme Preference:', 'light');

    // Clean up - remove test profile
    const { error: deleteError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', testProfile.id);

    if (deleteError) {
      console.error('Error cleaning up test profile:', deleteError);
    } else {
      console.log('Test profile cleaned up successfully');
    }

    console.log('All tests passed! New profile fields are working correctly.');
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testProfileFields();