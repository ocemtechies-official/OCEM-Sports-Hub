# Moderator System Architecture Documentation

## Overview

The Moderator System in OCEM Sports Hub is a comprehensive solution for real-time sports fixture management with fine-grained access control, audit trails, and robust security features. This document details the technical architecture and implementation of the system.

## System Architecture

### High-Level Architecture

The Moderator System follows a client-server architecture with the following components:

```
┌─────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│   Frontend UI   │────│  API Middleware  │────│  Database Layer  │
│                 │    │                  │    │                  │
│ - React/Next.js │    │ - Next.js API    │    │ - Supabase       │
│ - Components    │    │ - Validation     │    │ - Tables         │
│ - State Mgmt    │    │ - Auth Checks    │    │ - RLS Policies   │
└─────────────────┘    └──────────────────┘    └──────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌──────────────────┐
                    │  Realtime Sync   │
                    │                  │
                    │ - Supabase       │
                    │ - WebSockets     │
                    └──────────────────┘
```

### Core Components

1. **Frontend Components**
   - `QuickUpdateCard` - Main moderator interface for score updates
   - `EnhancedCricketScorecard` - Specialized cricket scoring interface
   - `IncidentFeed` - Timeline of match events and updates
   - `ModeratorDashboard` - Overview of assigned fixtures and stats

2. **API Layer**
   - `/api/moderator/fixtures/[id]/update-score` - Primary update endpoint
   - `/api/moderator/fixtures/[id]/incidents` - Incident management
   - `/api/moderator/fixtures/[id]/undo` - Undo functionality
   - `/api/moderator/stats` - Moderator statistics

3. **Database Layer**
   - `fixtures` table - Main fixture data
   - `match_updates` table - Audit trail and incidents
   - `profiles` table - User roles and assignments
   - RPC functions - Secure database operations

4. **Authentication & Authorization**
   - Role-based access control (RBAC)
   - Row-level security (RLS) policies
   - Session management
   - Permission validation

## Data Model

### Database Schema

#### Profiles Table (Extended for Moderators)

```sql
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT CHECK (role IN ('admin', 'moderator', 'viewer')),
ADD COLUMN IF NOT EXISTS assigned_sports TEXT[],
ADD COLUMN IF NOT EXISTS assigned_venues TEXT[],
ADD COLUMN IF NOT EXISTS moderator_notes TEXT;
```

#### Fixtures Table (Extended for Tracking)

```sql
ALTER TABLE public.fixtures 
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS extra JSONB; -- For sport-specific data like cricket stats
```

#### Match Updates Table (Audit Trail)

```sql
CREATE TABLE IF NOT EXISTS public.match_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fixture_id UUID NOT NULL REFERENCES public.fixtures(id) ON DELETE CASCADE,
  update_type TEXT NOT NULL, -- 'score', 'incident', 'status_change'
  change_type TEXT, -- 'score_update', 'status_change', 'note', 'media', 'manual'
  note TEXT,
  media_url TEXT,
  player_id UUID,
  prev_team_a_score INTEGER,
  prev_team_b_score INTEGER,
  prev_status TEXT,
  new_team_a_score INTEGER,
  new_team_b_score INTEGER,
  new_status TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Data Relationships

```
profiles (1) ──< fixtures (N) >── match_updates (N)
    │              │
    │              └── extra (JSONB) - Sport-specific data
    │
    └── assigned_sports[], assigned_venues[]
```

## Security Implementation

### Role-Based Access Control

The system implements a three-tier role system:

1. **Admin** - Full system access
2. **Moderator** - Limited access to assigned sports/venues
3. **Viewer** - Read-only access

Roles are checked at multiple levels:

- **Client-side**: UI visibility
- **API layer**: Route protection
- **Database layer**: RLS policies

### Row-Level Security Policies

Key RLS policies ensure data security:

```sql
-- Allow moderators to update only assigned fixtures
CREATE POLICY "moderators_can_update_assigned_fixtures" ON public.fixtures
  FOR UPDATE USING (
    public.can_moderate_fixture(id, auth.uid())
  );

-- Allow everyone to read fixtures
CREATE POLICY "everyone_can_read_fixtures" ON public.fixtures
  FOR SELECT USING (true);

-- Allow moderators to insert incidents only for assigned fixtures
CREATE POLICY "moderators_can_insert_incidents" ON public.match_updates
  FOR INSERT WITH CHECK (
    public.can_moderate_fixture(fixture_id, auth.uid())
  );
```

### Permission Validation Functions

Custom database functions validate permissions:

```sql
CREATE OR REPLACE FUNCTION public.can_moderate_fixture(
  p_fixture_id UUID,
  p_user_id UUID DEFAULT auth.uid()
) RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  user_profile public.profiles%rowtype;
  fixture_sport_name TEXT;
  fixture_venue TEXT;
BEGIN
  -- Get user profile
  SELECT * INTO user_profile 
  FROM public.profiles 
  WHERE id = p_user_id;
  
  IF user_profile IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Admins can moderate all fixtures
  IF user_profile.role = 'admin' THEN
    RETURN TRUE;
  END IF;
  
  -- Moderators need to be assigned
  IF user_profile.role = 'moderator' THEN
    -- Get fixture details
    SELECT s.name, f.venue INTO fixture_sport_name, fixture_venue
    FROM public.fixtures f
    LEFT JOIN public.sports s ON f.sport_id = s.id
    WHERE f.id = p_fixture_id;
    
    -- Check sport assignment
    IF user_profile.assigned_sports IS NULL OR fixture_sport_name = ANY(user_profile.assigned_sports) THEN
      -- Check venue assignment if specified
      IF user_profile.assigned_venues IS NULL OR fixture_venue = ANY(user_profile.assigned_venues) THEN
        RETURN TRUE;
      END IF;
    END IF;
  END IF;
  
  RETURN FALSE;
END;
$$;
```

## API Design

### Update Score Endpoint

`POST /api/moderator/fixtures/[id]/update-score`

#### Request Body

```typescript
{
  team_a_score: number,      // Team A's current score
  team_b_score: number,      // Team B's current score
  status: string,            // Fixture status ('scheduled', 'live', 'completed', 'cancelled')
  expected_version: number,  // For optimistic locking
  note: string,              // Optional note about the update
  extra: object              // Sport-specific data (e.g., cricket stats)
}
```

#### Response

```typescript
{
  success: boolean,
  fixture: object,           // Updated fixture data
  message: string
}
```

#### Key Features

1. **Optimistic Locking**: Prevents concurrent update conflicts
2. **Validation**: Server-side validation of all inputs
3. **Audit Trail**: Automatic logging of all changes
4. **Real-time Updates**: Immediate broadcast to connected clients
5. **Error Handling**: Comprehensive error responses

### Incident Management

`POST /api/moderator/fixtures/[id]/incidents`

#### Request Body

```typescript
{
  note: string,              // Description of the incident
  type: string,              // Type of incident
  media_url: string,         // Optional media URL
  player_id: UUID            // Optional player involved
}
```

### Undo Functionality

`POST /api/moderator/fixtures/[id]/undo`

Reverts the last update within a 15-second window.

## Frontend Implementation

### Component Architecture

#### QuickUpdateCard

Main component for general fixture management:

```tsx
interface QuickUpdateCardProps {
  fixture: any;
  compact?: boolean;
}
```

Key features:

- Score adjustment buttons (+/-)
- Status dropdown
- Note input
- Incident posting
- Undo functionality
- Real-time updates

#### EnhancedCricketScorecard

Specialized component for cricket fixtures:

```tsx
interface EnhancedCricketScorecardProps {
  fixtureId: string;
  teamAName: string;
  teamBName: string;
  teamAScore: number;
  teamBScore: number;
  status: string;
  onUpdate?: (data: any) => Promise<void>;
  initialData?: {
    cricket?: {
      team_a?: CricketTeamData;
      team_b?: CricketTeamData;
    }
  };
}
```

Key features:

- Detailed cricket statistics
- Overs progression
- Run rate calculation
- Boundary tracking
- Extras management
- Wicket tracking

### State Management

The frontend uses React state hooks for local state management:

```tsx
const [teamAScore, setTeamAScore] = useState(fixture.team_a_score || 0);
const [teamBScore, setTeamBScore] = useState(fixture.team_b_score || 0);
const [status, setStatus] = useState(fixture.status);
const [note, setNote] = useState("");
```

### Real-time Updates

The system uses Supabase Realtime for immediate updates:

```tsx
useEffect(() => {
  const channel = supabase
    .channel('fixture-updates')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'fixtures',
        filter: `id=eq.${fixtureId}`
      },
      (payload) => {
        // Update local state with new data
        setTeamAScore(payload.new.team_a_score);
        setTeamBScore(payload.new.team_b_score);
        setStatus(payload.new.status);
      }
    )
    .subscribe();
  
  return () => {
    supabase.removeChannel(channel);
  };
}, [fixtureId]);
```

## Error Handling

### Error Types

1. **Authentication Errors** (401, 403)
2. **Validation Errors** (400)
3. **Conflict Errors** (409)
4. **Rate Limiting** (429)
5. **Server Errors** (500)

### Error Response Format

```typescript
{
  error: string,             // User-friendly error message
  errorCode: string,         // Machine-readable error code
  errorType: string,         // Category of error
  details?: object          // Additional technical details
}
```

### Client-side Error Handling

```tsx
try {
  const response = await fetch('/api/moderator/fixtures/update-score', {
    method: 'POST',
    // ... options
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    // Handle specific error types
    switch (data.errorCode) {
      case 'UNAUTHORIZED':
        // Redirect to login
        break;
      case 'VERSION_MISMATCH':
        // Refresh data and retry
        break;
      // ... other cases
    }
  }
} catch (error) {
  // Handle network errors
}
```

## Performance Optimization

### Database Indexes

Critical indexes for performance:

```sql
-- For quick fixture lookups
CREATE INDEX IF NOT EXISTS idx_fixtures_sport ON public.fixtures(sport_id);
CREATE INDEX IF NOT EXISTS idx_fixtures_status ON public.fixtures(status);
CREATE INDEX IF NOT EXISTS idx_fixtures_updated_by ON public.fixtures(updated_by);

-- For audit trail queries
CREATE INDEX IF NOT EXISTS idx_match_updates_fixture_created_at
  ON public.match_updates(fixture_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_match_updates_created_by
  ON public.match_updates(created_by);
```

### API Optimization

1. **Batch Updates**: Combine multiple operations when possible
2. **Selective Queries**: Only fetch required data
3. **Caching**: Cache frequently accessed data
4. **Connection Pooling**: Efficient database connection management

### Frontend Optimization

1. **Debounced Updates**: Prevent excessive API calls
2. **Local State First**: Immediate UI updates with server sync
3. **Virtual Scrolling**: For long incident feeds
4. **Memoization**: Cache expensive calculations

## Testing Strategy

### Unit Tests

Key functions to test:

1. **Permission Validation Functions**
   - `can_moderate_fixture()`
   - Role checking logic
   - Assignment validation

2. **Score Update Logic**
   - Score calculations
   - Winner determination
   - Version checking

3. **Run Rate Calculations**
   - Various overs/balls combinations
   - Edge cases (0 overs, etc.)

### Integration Tests

1. **End-to-End Flows**
   - Moderator login to score update
   - Incident posting and display
   - Undo functionality

2. **Security Tests**
   - Unauthorized access attempts
   - Assignment boundary checks
   - RLS policy enforcement

3. **Performance Tests**
   - Concurrent update handling
   - Large fixture lists
   - Audit trail growth

### API Tests

1. **Endpoint Validation**
   - Request/response format
   - Error handling
   - Rate limiting

2. **Data Integrity**
   - Score consistency
   - Audit trail completeness
   - Version tracking

## Deployment Considerations

### Environment Variables

Required environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=your-site-url
```

### Database Migrations

Migration order:

1. `01-create-tables.sql` - Base schema
2. `10-moderator-system.sql` - Moderator extensions
3. `11-moderator-rls-policies.sql` - Basic RLS
4. `32-moderator-incidents.sql` - Incident tracking
5. `33-moderator-undo.sql` - Undo functionality
6. `36-moderator-rls-tightening.sql` - Enhanced security

### Monitoring

Key metrics to monitor:

1. **API Response Times**
2. **Database Query Performance**
3. **Error Rates**
4. **Concurrent User Count**
5. **Audit Trail Growth**

## Future Enhancements

### Planned Features

1. **Advanced Analytics**
   - Moderator performance metrics
   - Fixture update patterns
   - Incident analysis

2. **Mobile Application**
   - Native mobile app for moderators
   - Offline capability
   - Push notifications

3. **Approval Workflows**
   - Multi-level approval for critical updates
   - Change request system
   - Audit trail enhancements

4. **Enhanced Security**
   - Two-factor authentication for moderators
   - Session management
   - Activity logging

### Technical Improvements

1. **WebSocket Integration**
   - Real-time updates using WebSockets
   - Reduced polling overhead
   - Better scalability

2. **Microservices Architecture**
   - Separate services for different functions
   - Improved scalability
   - Better fault isolation

3. **Machine Learning**
   - Automated incident detection
   - Predictive analytics
   - Anomaly detection

## Troubleshooting Guide

### Common Issues

**Permission Denied Errors**

1. Check user role in `profiles` table
2. Verify sport/venue assignments
3. Confirm RLS policies are enabled
4. Test `can_moderate_fixture()` function directly

**Version Mismatch Errors**

1. Refresh fixture data
2. Check for concurrent updates
3. Verify version tracking is working
4. Clear local state and reload

**Rate Limiting**

1. Check update frequency
2. Implement client-side rate limiting
3. Review server-side limits
4. Monitor moderator activity

### Debugging Tools

1. **Database Queries**

   ```sql
   SELECT * FROM match_updates WHERE fixture_id = 'uuid' ORDER BY created_at DESC;
   SELECT * FROM profiles WHERE id = 'user-uuid';
   ```

2. **API Testing**

   ```bash
   curl -X POST /api/moderator/fixtures/uuid/update-score \
     -H "Content-Type: application/json" \
     -d '{"team_a_score": 10, "team_b_score": 5, "status": "live"}'
   ```

3. **Browser Developer Tools**
   - Network tab for API calls
   - Console for JavaScript errors
   - React DevTools for component state

The Moderator System is designed to be secure, scalable, and maintainable while providing a rich user experience for sports fixture management.
