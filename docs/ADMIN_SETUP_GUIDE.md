# Admin Access Guide for OCEM Sports Hub

## Overview

Your application has a complete admin system with role-based access control. Here's everything you need to know about admin functionality.

## Admin Pages Available

### Main Admin Dashboard

- **URL**: `/admin`
- **Features**:
  - Overview statistics (users, fixtures, quizzes, live matches)
  - Quick access to all admin functions
  - Real-time data from database

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

## How to Access Admin Features

### For Regular Users

- Admin features are **not visible** in the navigation
- Attempting to access `/admin` redirects to login page

### For Admin Users

- **Admin Panel** option appears in the user dropdown menu (top-right)
- Direct access to `/admin` URL
- All admin sections are accessible

## How to Become Admin

### Method 1: Database Update (First Admin Setup)

1. **Sign up** as a regular user through the app
2. **Open Supabase SQL Editor** in your project
3. **Run this SQL query** (replace with your email):

   ```sql
   UPDATE public.profiles 
   SET role = 'admin' 
   WHERE email = 'your-email@example.com';
   ```

4. **Refresh the app** and you'll see admin options

### Method 2: Admin Promotion (Once you have an admin)

1. **Login as an admin user**
2. **Go to Admin Panel** → User Management
3. **Find the user** you want to promote
4. **Click "Make Admin"** button
5. **User gets admin access immediately**

## Admin Role System

### Database Schema

- **Table**: `public.profiles`
- **Role Field**: `role` (TEXT)
- **Values**:
  - `'admin'` - Full access to all admin features
  - `'viewer'` - Default role, no admin access

### Security Features

- **Protected Routes**: All admin pages check for admin role
- **Server-Side Validation**: Role verification happens on the server
- **Automatic Redirects**: Non-admin users are redirected away from admin pages
- **UI Hiding**: Admin options don't show for non-admin users

## Visual Indicators

### For Admin User

- **"Admin" badge** in user dropdown
- **"Admin Panel"** menu option
- **Shield icon** in admin sections

### Admin Status Visibility

- Admin role is displayed in the user dropdown
- Admin badge appears next to admin users in user management
- Admin-only navigation items become visible

## Quick Setup Steps

1. **Deploy your app** and ensure database is set up
2. **Sign up** with your email through the app
3. **Run the SQL command** to make yourself admin
4. **Refresh and access** `/admin` to verify admin access
5. **Use User Management** to promote other users as needed

## Troubleshooting

### "Access Denied" Issues

- Verify your user role in the database
- Check if you're logged in with the correct account
- Ensure the SQL update command ran successfully

### Admin Panel Not Showing

- Clear browser cache and refresh
- Log out and log back in
- Verify the role was updated in the database

### Database Query to Check Admin Status

```sql
SELECT id, email, full_name, role 
FROM public.profiles 
WHERE email = 'your-email@example.com';
```

## Next Steps

1. Set up your first admin account using Method 1
2. Test admin access by visiting `/admin`
3. Create additional admin users through User Management
4. Explore the admin features and customize as needed

---

**Note**: Always keep at least one admin user active to maintain access to admin features!
