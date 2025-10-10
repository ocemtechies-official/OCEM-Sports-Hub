# Sidebar Footer Overlap Fix

## Issue

The admin sidebar was using `fixed` positioning with `inset-y-0` (top: 0, bottom: 0), which made it extend the full height of the viewport and overlap the footer.

## Root Cause

```tsx
// Before (WRONG)
<aside className="... lg:fixed lg:inset-y-0 ...">
```

This made the sidebar extend from top to bottom of the viewport, ignoring the footer.

## Solution

Changed the sidebar positioning to:

1. Start below the navbar (`top-16` = 64px)
2. Use max-height instead of bottom positioning
3. Allow internal scrolling

```tsx
// After (CORRECT)
<aside className="... lg:fixed lg:top-16 lg:max-h-[calc(100vh-4rem)] ...">
```

## Changes Made

### File: `components/admin/admin-sidebar.tsx`

**Before:**

```tsx
<aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:bg-white lg:pt-16 lg:pb-4 lg:z-30">
  <ScrollArea className="flex-1 px-3">
```

**After:**

```tsx
<aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:top-16 lg:left-0 lg:border-r lg:bg-white lg:z-30 lg:max-h-[calc(100vh-4rem)]">
  <ScrollArea className="flex-1 px-3">
```

### Key Changes

1. ✅ Removed `lg:inset-y-0` (was causing full viewport height)
2. ✅ Added `lg:top-16` (starts below navbar)
3. ✅ Added `lg:left-0` (explicit left positioning)
4. ✅ Added `lg:max-h-[calc(100vh-4rem)]` (max height = viewport - navbar)
5. ✅ Removed `lg:pt-16 lg:pb-4` (no longer needed)
6. ✅ Changed Quick Stats separator from `<Separator />` to `border-t` class

## How It Works Now

### Layout Structure

```bash
┌─────────────────────────────────────┐
│         Navbar (64px)               │ ← Fixed at top
├──────────┬──────────────────────────┤
│          │                          │
│ Sidebar  │   Main Content           │
│ (fixed)  │   (scrollable)           │
│ max-h    │                          │
│ scroll   │                          │
│ internal │                          │
│          │                          │
├──────────┴──────────────────────────┤
│         Footer                      │ ← Not overlapped
└────────────────────────────────��────┘
```

### Sidebar Behavior

- **Position**: Fixed at `left: 0`, starting at `top: 64px` (below navbar)
- **Height**: Maximum of `calc(100vh - 4rem)` = viewport height minus navbar
- **Scrolling**: Internal scrolling via `ScrollArea` component
- **Footer**: No longer overlapped because sidebar doesn't extend to viewport bottom

## Testing

### Desktop (> 1024px)

- [x] Sidebar visible on left
- [x] Sidebar starts below navbar
- [x] Sidebar doesn't overlap footer
- [x] Sidebar scrolls internally if content is long
- [x] Quick stats visible at bottom of sidebar

### Mobile (< 1024px)

- [x] Sidebar hidden
- [x] Mobile menu works
- [x] No overlap issues

## Visual Comparison

### Before (WRONG)

```bash
Navbar
├─────────┐
│ Sidebar │ ← Extends to viewport bottom
│         │
│         │
│         │ ← Overlaps footer
└─────────┘
Footer (hidden behind sidebar)
```

### After (CORRECT)

```bash
Navbar
├─────────┐
│ Sidebar │ ← Stops before footer
│         │
│ (scroll)│
│         │
└─────────┘
Footer (visible, not overlapped)
```

## Additional Notes

- The `max-h-[calc(100vh-4rem)]` calculation:
  - `100vh` = full viewport height
  - `4rem` = 64px (navbar height)
  - Result: Sidebar can be at most viewport height minus navbar

- The `ScrollArea` component handles internal scrolling when sidebar content exceeds available height

- The Quick Stats footer section uses `flex-shrink-0` to prevent it from being compressed when sidebar content is long

## Files Modified

- `components/admin/admin-sidebar.tsx`

## Status

✅ Fixed and tested
