# Login and Navbar Debug Guide

## 🚨 **Common Issues and Solutions**

### **Issue 1: Can't Login**
**Symptoms:**
- Login form submits but doesn't redirect
- User stays on login page
- No error messages shown

**Debug Steps:**
1. **Check browser console** for JavaScript errors
2. **Check Supabase logs** for authentication errors
3. **Run script 23** to debug authentication issues
4. **Run script 24** to create user profile if missing

### **Issue 2: Navbar Not Updating**
**Symptoms:**
- Navbar shows "Sign In" button even after login
- User profile not displayed
- Loading state stuck

**Debug Steps:**
1. **Check if user has a profile** in the database
2. **Check browser console** for profile fetch errors
3. **Verify RPC functions** are working
4. **Check authentication state** in browser dev tools

### **Issue 3: Profile Not Loading**
**Symptoms:**
- User is authenticated but profile is null
- Navbar shows "Loading profile..." indefinitely
- Profile data not accessible

**Debug Steps:**
1. **Run script 23** to check profile existence
2. **Run script 24** to create missing profile
3. **Check RPC functions** are working
4. **Verify RLS policies** are correct

## 🔧 **Step-by-Step Debugging**

### **Step 1: Check Database State**
Run this in your Supabase SQL Editor:
```sql
-- Check if user has a profile
SELECT 
  auth.uid() as user_id,
  CASE 
    WHEN EXISTS(SELECT 1 FROM public.profiles WHERE id = auth.uid()) THEN 'Profile exists'
    ELSE 'Profile does not exist'
  END as profile_status;
```

### **Step 2: Check Authentication Functions**
Run this in your Supabase SQL Editor:
```sql
-- Test authentication functions
SELECT 
  public.get_user_profile_simple(auth.uid()) as profile_data,
  public.validate_auth_state() as auth_state;
```

### **Step 3: Check Browser Console**
1. **Open browser dev tools** (F12)
2. **Go to Console tab**
3. **Try to login**
4. **Look for error messages**

### **Step 4: Check Network Tab**
1. **Open browser dev tools** (F12)
2. **Go to Network tab**
3. **Try to login**
4. **Look for failed API calls**

## 🚀 **Quick Fixes**

### **Fix 1: Create Missing Profile**
If the user doesn't have a profile:
1. **Run script 24** in Supabase SQL Editor
2. **This will create a profile** for the current user
3. **Try logging in again**

### **Fix 2: Reset Authentication State**
If authentication state is stuck:
1. **Clear browser storage** (localStorage, sessionStorage)
2. **Refresh the page**
3. **Try logging in again**

### **Fix 3: Check RPC Functions**
If RPC functions are not working:
1. **Run script 18** again to ensure functions exist
2. **Check Supabase logs** for function errors
3. **Verify function permissions**

## 🧪 **Testing the Fix**

### **Test 1: Login Flow**
1. **Go to login page**
2. **Enter credentials**
3. **Check if redirects to home page**
4. **Check if navbar updates**

### **Test 2: Profile Loading**
1. **After login, check navbar**
2. **Should show user profile**
3. **Should not show "Loading profile..."**

### **Test 3: Authentication State**
1. **Check browser console** for profile data
2. **Should see "Profile found:" message**
3. **Should not see error messages**

## 📋 **Expected Console Output**

### **Successful Login:**
```
Fetching profile for user: [user-id]
Profile fetch result: { profileData: {...}, error: null }
Profile found: { id: "...", email: "...", role: "..." }
```

### **Failed Login:**
```
Fetching profile for user: [user-id]
Profile fetch result: { profileData: null, error: {...} }
Profile not found, might be created by trigger: [error]
```

## 🔍 **Troubleshooting Checklist**

### **Database Issues:**
- [ ] User has a profile in the database
- [ ] RPC functions exist and are accessible
- [ ] RLS policies are working correctly
- [ ] No infinite recursion errors

### **Frontend Issues:**
- [ ] Auth provider is working correctly
- [ ] Profile fetching is successful
- [ ] Authentication state is updating
- [ ] Navbar is receiving profile data

### **Network Issues:**
- [ ] Supabase connection is working
- [ ] RPC calls are successful
- [ ] No CORS errors
- [ ] No authentication errors

## 🎯 **Success Indicators**

You'll know the fix is working when:
- ✅ **Login redirects to home page**
- ✅ **Navbar shows user profile**
- ✅ **No "Loading profile..." message**
- ✅ **Console shows "Profile found:" message**
- ✅ **Authentication state is consistent**

## 📚 **Scripts to Run**

1. **Script 23** - Debug authentication issues
2. **Script 24** - Create user profile if missing
3. **Script 18** - Ensure RLS policies are correct

## 🚨 **Emergency Fix**

If nothing else works:
1. **Run script 24** to create user profile
2. **Clear browser storage** completely
3. **Restart the application**
4. **Try logging in again**

The authentication system should now work properly with proper profile loading and navbar updates!
