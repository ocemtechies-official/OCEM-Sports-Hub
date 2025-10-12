# Moderator System Implementation Guide

## Overview

The OCEM Sports Hub now includes a comprehensive moderator system that allows trusted users to update match scores and status in real-time. This system maintains full audit trails and integrates seamlessly with existing functionality.

## Features Implemented

### ✅ Database Schema Updates

- **Profiles table**: Added `moderator` role, `assigned_sports`, `assigned_venues`, and `moderator_notes` columns
- **Fixtures table**: Added `updated_by` and `version` columns for tracking and optimistic locking
- **Match Updates table**: New audit table to track all changes with full history
- **RPC Functions**: Secure `rpc_update_fixture_score` function with validation and permissions
- **RLS Policies**: Row-level security policies for moderator permissions

### ✅ Backend API

- **Moderator API Routes**:
  - `GET /api/moderator/fixtures` - Get assigned fixtures for moderator
  - `POST /api/moderator/fixtures/[id]/update-score` - Update fixture score via RPC
  - `GET /api/moderator/stats` - Get moderator activity statistics
- **Admin API Routes**:
  - `POST /api/admin/moderators` - Create new moderator
  - `PUT /api/admin/moderators` - Update moderator role/assignments

### ✅ Frontend Components

- **Moderator Dashboard**: Overview with stats and quick access to live matches
- **Quick Update Card**: Mobile-first interface for score updates with +/- buttons
- **Fixtures Management**: Filtered view of assigned fixtures with search
- **Update History**: Personal activity log with detailed change tracking
- **Admin Management**: Create, edit, and manage moderators and their assignments

### ✅ Security & Validation

- **Role-based Access Control**: Middleware protection for `/moderator` routes
- **Permission Validation**: Server-side checks for sport/venue assignments
- **Rate Limiting**: 20 updates per fixture per 5 minutes
- **Optimistic Locking**: Version-based conflict resolution
- **Audit Logging**: Complete change history with user attribution

### ✅ Real-time Integration

- **Enhanced Notifications**: Shows moderator name in update notifications
- **Existing Realtime**: Works with current Supabase Realtime subscriptions
- **Update Attribution**: Displays who made each update

## Database Migration

To implement the moderator system, run these SQL scripts in order:

1. **`scripts/10-moderator-system.sql`**
   - Updates profiles table schema
   - Creates match_updates audit table
   - Adds RPC functions for secure updates
   - Creates audit triggers

2. **`scripts/11-moderator-rls-policies.sql`**
   - Sets up Row Level Security policies
   - Creates helper functions for moderator queries
   - Enables secure access patterns

## User Roles

### Admin

- Full access to all features
- Can create and manage moderators
- Can update any fixture directly
- Can view all audit logs

### Moderator

- Can update scores and status for assigned sports/venues
- Can add notes to updates
- Can view their own activity history
- Cannot change teams, scheduled times, or sport assignments

### Viewer

- Read-only access to fixtures and scores
- Receives real-time notifications
- No update permissions

## Moderator Assignment Types

### Global Moderator

- `assigned_sports` is null or empty
- Can moderate all sports
- Can moderate all venues (unless `assigned_venues` is specified)

### Sport-Specific Moderator

- `assigned_sports` contains specific sport names
- Can only moderate fixtures for those sports
- Can moderate all venues for assigned sports

### Venue-Specific Moderator

- `assigned_venues` contains specific venue names
- Can only moderate fixtures at those venues
- Must also have sport assignments

## API Usage Examples

### Get Moderator Fixtures

```typescript
const response = await fetch('/api/moderator/fixtures?status=live&sport=Football')
const { fixtures } = await response.json()
```

### Update Fixture Score

```typescript
const response = await fetch(`/api/moderator/fixtures/${fixtureId}/update-score`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    team_a_score: 2,
    team_b_score: 1,
    status: 'live',
    expected_version: 5,
    note: 'Goal by Player X'
  })
})
```

### Create Moderator (Admin)

```typescript
const response = await fetch('/api/admin/moderators', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user-uuid',
    assignedSports: ['Football', 'Basketball'],
    assignedVenues: ['Main Field', 'Court 1'],
    moderatorNotes: 'Experienced referee'
  })
})
```

## Mobile-First Design

The moderator interface is optimized for mobile devices:

- **Large Touch Targets**: +/- buttons are 44px minimum
- **Quick Actions**: One-tap score increments
- **Debounced Updates**: 500ms delay to prevent spam
- **Undo Functionality**: 10-second window to reverse changes
- **Offline Indicators**: Shows sync status
- **Responsive Layout**: Works on screens 360px+

## Security Considerations

### Rate Limiting

- Maximum 20 updates per fixture per moderator per 5 minutes
- Prevents accidental spam or malicious updates
- Returns 429 status code when exceeded

### Permission Validation

- Server-side validation of sport/venue assignments
- RLS policies prevent unauthorized access
- Version checking prevents race conditions

### Audit Trail

- Every change is logged with:
  - Who made the change
  - When it was made
  - What changed (old vs new values)
  - Change type (score, status, note)
  - IP address and user agent

## Error Handling

### Common Error Scenarios

- **Version Mismatch**: Another user updated the fixture
- **Permission Denied**: Not assigned to this sport/venue
- **Rate Limited**: Too many updates in short time
- **Invalid Data**: Negative scores or invalid status

### Error Responses

```json
{
  "error": "Version mismatch - fixture was updated by another user",
  "status": 409
}
```

## Testing Checklist

### Database Testing

- [ ] Run migration scripts successfully
- [ ] RLS policies block unauthorized access
- [ ] RPC function validates permissions correctly
- [ ] Audit logs are created for all updates
- [ ] Version conflicts are handled properly

### API Testing

- [ ] Moderator can update assigned fixtures
- [ ] Moderator cannot update unassigned fixtures
- [ ] Rate limiting works correctly
- [ ] Error responses are informative
- [ ] Admin can manage moderators

### UI Testing

- [ ] Mobile interface works on small screens
- [ ] Quick update buttons are responsive
- [ ] Undo functionality works correctly
- [ ] Real-time updates appear immediately
- [ ] Error states are handled gracefully

### Integration Testing

- [ ] Multiple moderators can update different fixtures
- [ ] Concurrent updates are handled correctly
- [ ] Notifications show moderator names
- [ ] Admin dashboard shows correct statistics
- [ ] Audit logs are accurate and complete

## Deployment Steps

1. **Database Migration**

   ```bash
   # Run in Supabase SQL editor or via CLI
   psql -f scripts/10-moderator-system.sql
   psql -f scripts/11-moderator-rls-policies.sql
   ```

2. **Code Deployment**

   ```bash
   npm run build
   npm run start
   ```

3. **Create Test Moderators**
   - Create 2-3 test moderator accounts
   - Assign them to different sports
   - Test update functionality

4. **Monitor and Validate**
   - Check audit logs are being created
   - Verify real-time updates work
   - Test rate limiting
   - Validate permission restrictions

## Troubleshooting

### Common Issues

**Build Errors*

- Ensure all UI components exist in `components/ui/`
- Check for missing imports
- Verify TypeScript types are correct

**Database Errors*

- Check RLS policies are enabled
- Verify RPC functions have correct permissions
- Ensure foreign key constraints are satisfied

**Permission Errors*

- Verify user has correct role in profiles table
- Check assigned_sports/venues arrays
- Ensure middleware is protecting routes correctly

**Real-time Issues*

- Check Supabase Realtime is enabled
- Verify subscription channels are correct
- Test with multiple browser tabs

## Future Enhancements

### Potential Improvements

- **Approval Workflow**: Require admin approval for certain changes
- **Bulk Updates**: Update multiple fixtures at once
- **Advanced Analytics**: Detailed moderator performance metrics
- **Mobile App**: Native mobile app for moderators
- **Offline Support**: Queue updates when offline
- **Photo Uploads**: Attach photos to match updates
- **Push Notifications**: Real-time notifications to mobile devices

### Configuration Options

- **Custom Rate Limits**: Per-sport or per-venue limits
- **Time Windows**: Restrict updates to certain hours
- **Approval Thresholds**: Auto-approve changes under certain conditions
- **Notification Preferences**: Customize what notifications moderators receive

## Support

For issues or questions about the moderator system:

1. Check the audit logs in the `match_updates` table
2. Review the RLS policies in Supabase
3. Test with the provided API endpoints
4. Check the browser console for client-side errors
5. Verify database permissions and RPC function access

The system is designed to be robust and maintainable, with comprehensive logging and error handling to help diagnose any issues that may arise.
