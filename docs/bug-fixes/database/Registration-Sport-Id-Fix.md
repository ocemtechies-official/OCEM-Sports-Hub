# Registration Fix - Sport ID Issue

## Problem Identified ✅

The registration was failing with "Invalid sport specified" because:

**Root Cause:** The `SportsGrid` component was passing the **database UUID** instead of a **sport slug**.

### What Was Happening:
```javascript
// BEFORE (Wrong ❌)
onSportSelect({ id: sport.id, type: sport.type })
// Passing: { id: "0a6b5581-fd39-4f26-a13b-86da7fc55473", type: "team" }

// API was trying to look up: "0a6b5581-fd39-4f26-a13b-86da7fc55473"
// But the mapping expected: "cricket"
```

### What Should Happen:
```javascript
// AFTER (Correct ✅)
const sportSlug = sport.name.toLowerCase().replace(/\s+/g, '-');
onSportSelect({ id: sportSlug, type: sport.type })
// Passing: { id: "cricket", type: "team" }

// API receives "cricket" → maps to "Cricket" → finds in database ✅
```

## Files Fixed

### 1. `components/sportgrid/sport.tsx`
**Changed:** `handleSportClick` function to create slug from sport name

```typescript
const handleSportClick = (sport: Sport) => {
  // Create slug from sport name for URL and API
  const sportSlug = sport.name.toLowerCase().replace(/\s+/g, '-');
  
  console.log('🎯 [SPORTS GRID] Sport selected:', {
    sportName: sport.name,
    sportSlug,
    sportUuid: sport.id,
    sportType: sport.type
  });
  
  if (onSportSelect) {
    // Use callback for consolidated page - pass slug instead of UUID
    onSportSelect({ id: sportSlug, type: sport.type });
  } else {
    router.push(`/registration?sport=${sportSlug}&type=${sport.type}`);
  }
};
```

**Effect:** Now passes "cricket" instead of UUID

### 2. `app/api/registrations/team/route.ts`
**Added:** "go" to sport name mapping

### 3. `app/api/registrations/individual/route.ts`
**Added:** "go" to sport name mapping

### 4. `app/register/page.tsx`
**Added:** "go" to sport name mapping

## Sport Name Mapping

The system now properly handles these sports:

| Sport Slug      | Database Name  | Type       |
|-----------------|----------------|------------|
| cricket         | Cricket        | Team       |
| football        | Football       | Team       |
| basketball      | Basketball     | Team       |
| volleyball      | Volleyball     | Team       |
| tug-of-war      | Tug of War     | Team       |
| table-tennis    | Table Tennis   | Individual |
| badminton       | Badminton      | Individual |
| chess           | Chess          | Individual |
| quiz            | Quiz           | Individual |
| go              | Go             | Individual |

## How It Works Now

### Flow:
1. User clicks on "Cricket" in sports grid
2. `SportsGrid` creates slug: `"Cricket"` → `"cricket"`
3. Passes to registration page: `{ id: "cricket", type: "team" }`
4. Registration form sends: `{ sportId: "cricket", ... }`
5. API receives "cricket"
6. Maps to "Cricket" via `sportNameMap`
7. Looks up "Cricket" in database ✅
8. Finds sport with UUID and continues registration ✅

### Debug Logs:
You'll now see these logs in console:
```
🎯 [SPORTS GRID] Sport selected: {
  sportName: "Cricket",
  sportSlug: "cricket",
  sportUuid: "0a6b5581-fd39-4f26-a13b-86da7fc55473",
  sportType: "team"
}

🔵 [TEAM FORM] Sport info: {
  sportId: "cricket",
  sportName: "Cricket",
  ...
}

🔵 [TEAM REGISTRATION] Sport mapping: {
  sportId: "cricket",
  mappedName: "Cricket",
  ...
}

🔵 [TEAM REGISTRATION] Sport lookup: {
  searchingFor: "Cricket",
  found: true,
  sportData: { id: "0a6b5581...", name: "Cricket", ... }
}
```

## Testing

Now test the registration:

1. ✅ Go to `/register`
2. ✅ Click on any sport (e.g., Cricket)
3. ✅ Fill in the registration form
4. ✅ Submit

**Expected result:** Registration should now work! 🎉

If you still see an error, check the console for:
- ❌ Registration settings (might still need to be enabled)
- ✅ Sport lookup should now succeed

## Next Issue (If Registration Still Fails)

If the sport lookup succeeds but registration still fails, the next issue will be:
- **Registration settings not enabled** → Use `/admin/registrations/settings` to enable
- **Or run:** `scripts/database/enable-all-registrations.sql`

The debug logs will clearly show which issue it is.
