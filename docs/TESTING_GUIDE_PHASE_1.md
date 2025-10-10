# Phase 1 Testing Guide

## 🧪 How to Test the New Admin Panel

### Prerequisites

1. Ensure you have an admin account
2. Make sure the development server is running: `npm run dev`
3. Open your browser to `http://localhost:3000`

---

## Test Scenarios

### 1. Authentication & Access Control

#### Test 1.1: Admin Access

1. Navigate to `/admin`
2. **Expected**: If not logged in, redirect to `/auth/login?redirect=/admin`
3. Log in with admin credentials
4. **Expected**: Redirect back to admin dashboard

#### Test 1.2: Non-Admin Access

1. Log in with a non-admin account (viewer role)
2. Try to access `/admin`
3. **Expected**: Redirect to home page or login

---

### 2. Desktop Layout (Screen width > 1024px)

#### Test 2.1: Sidebar Display

1. Navigate to `/admin` on desktop
2. **Expected**:
   - Sidebar visible on the left (264px width)
   - Sidebar contains navigation sections
   - Quick stats visible at bottom of sidebar
   - Main content has left margin

#### Test 2.2: Navigation

1. Click on each menu item in sidebar:
   - Overview → `/admin`
   - Analytics → `/admin/analytics` (may show 404, that's ok)
   - Users → `/admin/users`
   - Fixtures → `/admin/fixtures`
   - Tournaments → `/admin/tournaments`
   - Quizzes → `/admin/quizzes`
   - Teams → `/admin/teams`
   - Live Monitor → `/admin/live` (may show 404)
   - Reports → `/admin/reports` (may show 404)
   - Settings → `/admin/settings` (may show 404)

2. **Expected**:
   - Active route is highlighted in indigo
   - Page content changes
   - Sidebar remains visible
   - No page reload (client-side navigation)

#### Test 2.3: Stat Cards

1. On dashboard, click each stat card
2. **Expected**:
   - Hover effect (shadow increases)
   - Clicking navigates to respective page
   - Icon scales on hover

---

### 3. Mobile Layout (Screen width < 1024px)

#### Test 3.1: Mobile Menu

1. Resize browser to mobile width (< 1024px)
2. **Expected**:
   - Sidebar hidden
   - "Admin Menu" button visible at top
   - Content is full-width

#### Test 3.2: Mobile Navigation

1. Click "Admin Menu" button
2. **Expected**:
   - Sheet slides in from left
   - Navigation menu visible
   - Quick stats visible at bottom

3. Click a menu item
4. **Expected**:
   - Sheet closes automatically
   - Navigate to selected page

5. Click outside the sheet
6. **Expected**:
   - Sheet closes

---

### 4. Dashboard Features

#### Test 4.1: Stats Display

1. Navigate to `/admin`
2. **Expected**:
   - 6 stat cards displayed in grid
   - Each card shows:
     - Title
     - Value (number)
     - Trend indicator (except "Live Now")
     - Icon with colored background
   - "Live Now" card has pulse animation if value > 0

#### Test 4.2: Live Fixture Alert

1. If there are live fixtures:
   - **Expected**: Red alert banner at top
   - Shows count of live fixtures
   - "Monitor now →" link works

#### Test 4.3: Recent Users

1. Check "Recent Users" card
2. **Expected**:
   - Shows last 5 registered users
   - Each user shows name, email, registration date
   - "View All" button links to `/admin/users`

#### Test 4.4: Upcoming Fixtures

1. Check "Upcoming Fixtures" card
2. **Expected**:
   - Shows next 5 scheduled fixtures
   - Each fixture shows teams, sport, date
   - "View All" button links to `/admin/fixtures`

#### Test 4.5: Fixture Status Overview

1. Check bottom card
2. **Expected**:
   - Shows 3 columns: Scheduled, Live, Completed
   - Each shows count with colored background
   - Numbers match actual fixture counts

---

### 5. Management Pages

#### Test 5.1: Users Page

1. Navigate to `/admin/users`
2. **Expected**:
   - Page header: "User Management"
   - Stats cards showing total users, admins, viewers
   - User list with search functionality
   - Role change buttons work
   - No "Back to Admin" button
   - Consistent layout with sidebar

#### Test 5.2: Fixtures Page

1. Navigate to `/admin/fixtures`
2. **Expected**:
   - Page header: "Fixtures Management"
   - "Create Fixture" button visible
   - Fixtures table displays
   - All existing functionality works
   - No "Back to Admin" button

#### Test 5.3: Tournaments Page

1. Navigate to `/admin/tournaments`
2. **Expected**:
   - Page header: "Tournament Management"
   - "Create Tournament" button visible
   - Tournament cards display
   - Progress bars work for active tournaments
   - Champion display for completed tournaments
   - No "Back to Admin" button

#### Test 5.4: Quizzes Page

1. Navigate to `/admin/quizzes`
2. **Expected**:
   - Page header: "Quiz Management"
   - "Create Quiz" button visible
   - Quiz table displays
   - All existing functionality works

#### Test 5.5: Teams Page

1. Navigate to `/admin/teams`
2. **Expected**:
   - Page header: "Teams Management"
   - "Create Team" button visible
   - Teams table displays
   - All existing functionality works

---

### 6. Visual Consistency

#### Test 6.1: Typography

1. Check all pages
2. **Expected**:
   - Page titles: 3xl, bold, slate-900
   - Descriptions: slate-600, mt-1
   - Consistent spacing

#### Test 6.2: Colors

1. Check color usage
2. **Expected**:
   - Primary: Indigo (#4338CA)
   - Success: Green
   - Warning: Yellow
   - Danger: Red
   - Info: Blue
   - Consistent across all pages

#### Test 6.3: Spacing

1. Check page layouts
2. **Expected**:
   - Consistent padding and margins
   - Proper card spacing
   - Aligned elements

---

### 7. Functionality Preservation

#### Test 7.1: User Management

1. Try to change a user's role
2. **Expected**: Works as before

#### Test 7.2: Fixture Management

1. Try to update a fixture score
2. **Expected**: Works as before

#### Test 7.3: Create Operations

1. Try to create a new fixture/tournament/quiz/team
2. **Expected**: All create forms work as before

---

### 8. Performance

#### Test 8.1: Page Load

1. Navigate between admin pages
2. **Expected**:
   - Fast navigation (< 1 second)
   - No flickering
   - Smooth transitions

#### Test 8.2: Data Loading

1. Check dashboard stats
2. **Expected**:
   - Data loads quickly
   - No loading spinners stuck
   - Accurate counts

---

### 9. Browser Compatibility

Test in multiple browsers:

- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

**Expected**: Consistent behavior across all browsers

---

### 10. Responsive Breakpoints

Test at different screen sizes:

- [ ] Mobile (< 640px)
- [ ] Tablet (640px - 1024px)
- [ ] Desktop (> 1024px)
- [ ] Large Desktop (> 1536px)

**Expected**: Layout adapts appropriately

---

## 🐛 Bug Reporting

If you find any issues, please note:

1. What you were doing
2. What you expected to happen
3. What actually happened
4. Browser and screen size
5. Console errors (if any)

---

## ✅ Success Criteria

Phase 1 is successful if:

- [ ] All navigation works
- [ ] Sidebar displays correctly on desktop
- [ ] Mobile menu works on mobile
- [ ] All existing features still work
- [ ] No console errors
- [ ] No broken links
- [ ] Visual consistency across pages
- [ ] Authentication works correctly
- [ ] Performance is acceptable

---

## 🚀 Quick Test Commands

```bash
# Start development server
npm run dev

# Check for TypeScript errors
npx tsc --noEmit

# Check for linting issues
npm run lint
```

---

## 📸 Screenshots to Take

For documentation:

1. Desktop dashboard view
2. Mobile menu open
3. Each management page
4. Sidebar navigation
5. Stat cards with hover effect
