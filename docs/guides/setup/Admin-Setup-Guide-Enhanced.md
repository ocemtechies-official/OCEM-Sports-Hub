# Enhanced Admin Setup Guide for OCEM Sports Hub

## Overview

The OCEM Sports Hub application features a comprehensive admin system with role-based access control (RBAC) that allows administrators to manage various aspects of the sports platform. This guide provides detailed instructions for setting up and managing admin users.

## Understanding the Admin System

### Role-Based Access Control

The application implements a three-tier role system:

1. **Admin** - Full access to all administrative features
2. **Moderator** - Limited access to specific sports/venues for score updates
3. **Viewer** - Standard user with no administrative privileges

### Database Structure

The user roles are managed through the `profiles` table in the database:

```sql
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'moderator', 'viewer')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Setting Up Your First Admin User

### Prerequisites

1. Deploy your OCEM Sports Hub application
2. Ensure the database schema is properly set up
3. Have access to your Supabase project dashboard

### Method 1: Database Update (First Admin Setup)

This method is recommended for setting up the first admin user:

1. **Sign up** as a regular user through the application's signup page
2. **Open Supabase SQL Editor** in your project dashboard
3. **Run this SQL query** (replace `your-email@example.com` with the email you used to sign up):

   ```sql
   UPDATE public.profiles 
   SET role = 'admin' 
   WHERE email = 'your-email@example.com';
   ```

4. **Refresh the application** and log in with your credentials
5. You should now see admin options in the user dropdown menu

### Method 2: Admin Promotion (Once You Have an Admin)

After you have at least one admin user, you can promote other users through the admin interface:

1. **Log in as an admin user**
2. **Navigate to the Admin Panel** → User Management section
3. **Find the user** you want to promote in the user list
4. **Click the "Make Admin" button** next to their profile
5. **The user will immediately gain admin access**

## Admin Panel Features

### Main Admin Dashboard

- **URL**: `/admin`
- **Features**:
  - Overview statistics (users, fixtures, quizzes, live matches)
  - Quick access to all admin functions
  - Real-time data from the database

### Admin Sections

1. **User Management** (`/admin/users`)
   - View all registered users
   - Promote users to admin or demote to viewer
   - Search and filter users
   - User statistics

2. **Fixtures Management** (`/admin/fixtures`)
   - Create and manage sports fixtures
   - Update match scores and status
   - Schedule future matches

3. **Quiz Management** (`/admin/quizzes`)
   - Create and manage quizzes
   - Add/edit quiz questions
   - View quiz statistics

4. **Team Management** (`/admin/teams`)
   - Manage teams and players
   - Update team information
   - Team statistics

5. **Moderator Management** (`/admin/moderators`)
   - Create and manage moderators
   - Assign sports and venues to moderators
   - View moderator activity

## Security Features

### Protected Routes

All admin pages implement server-side role validation to ensure only authorized users can access them.

### Server-Side Validation

Role verification happens on the server for all administrative actions, preventing unauthorized access even if a user attempts to bypass client-side restrictions.

### Automatic Redirects

Non-admin users attempting to access admin pages are automatically redirected to the login page.

### UI Hiding

Admin options are only visible to users with the appropriate role, reducing the attack surface.

## Troubleshooting Common Issues

### "Access Denied" Issues

If you're unable to access admin features:

1. **Verify your user role** in the database:
   ```sql
   SELECT id, email, full_name, role 
   FROM public.profiles 
   WHERE email = 'your-email@example.com';
   ```

2. **Check if you're logged in** with the correct account
3. **Ensure the SQL update command ran successfully**

### Admin Panel Not Showing

If the admin panel isn't visible after setting up your admin user:

1. **Clear browser cache** and refresh the page
2. **Log out and log back in**
3. **Verify the role was updated** in the database

### Database Connection Issues

If you're having trouble connecting to the database:

1. **Check your Supabase environment variables**
2. **Verify network connectivity**
3. **Ensure your Supabase project is properly configured**

## Best Practices

### Role Management

1. **Maintain at least one admin user** at all times to ensure continued access
2. **Use the principle of least privilege** - only grant admin access to users who need it
3. **Regularly review user roles** and remove unnecessary admin privileges

### Security Recommendations

1. **Use strong passwords** for admin accounts
2. **Enable two-factor authentication** if available
3. **Regularly update the application** to the latest version
4. **Monitor admin activity** through logs and audit trails

## Next Steps

1. **Set up your first admin account** using Method 1
2. **Test admin access** by visiting `/admin`
3. **Create additional admin users** through User Management
4. **Explore the admin features** and customize as needed
5. **Set up moderators** for sports-specific score management

---

**Note**: Always keep at least one admin user active to maintain access to admin features!