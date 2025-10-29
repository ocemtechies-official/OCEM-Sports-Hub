# Moderator System Architecture Documentation

## Overview

The Moderator System in OCEM Sports Hub is a comprehensive solution for real-time sports fixture management with fine-grained access control, audit trails, and robust security features. This document details the technical architecture and implementation of the system.

## System Architecture

### High-Level Architecture

The Moderator System follows a client-server architecture with the following components:

```text
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

```text
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

### Core Endpoints

#### Update Fixture Score

```http
POST /api/moderator/fixtures/{id}/update-score
```

**Request Body:**

```json
{
  "team_a_score": 10,
  "team_b_score": 5,
  "status": "live",
  "expected_version": 3,
  "note": "Goal by Player X"
}
```

**Response:**

```json
{
  "success": true,
  "fixture": {
    "id": "uuid",
    "team_a_score": 10,
    "team_b_score": 5,
    "status": "live",
    "version": 4
  }
}
```

#### Create Incident

```http
POST /api/moderator/fixtures/{id}/incidents
```

**Request Body:**

```json
{
  "note": "Yellow card for Player Y",
  "type": "incident",
  "change_type": "yellow_card"
}
```

#### Undo Last Update

```http
POST /api/moderator/fixtures/{id}/undo
```

**Response:**

```json
{
  "success": true,
  "reverted_to": {
    "team_a_score": 8,
    "team_b_score": 5,
    "status": "live"
  }
}
```

### Error Handling

The API implements comprehensive error handling:

- **401 Unauthorized** - User not authenticated
- **403 Forbidden** - User lacks permission
- **404 Not Found** - Fixture not found
- **409 Conflict** - Version mismatch
- **422 Unprocessable Entity** - Validation errors
- **429 Too Many Requests** - Rate limiting

## Frontend Implementation

### Component Architecture

#### Quick Update Card

```tsx
interface QuickUpdateCardProps {
  fixture: Fixture;
  onUpdate: (update: ScoreUpdate) => void;
}

interface ScoreUpdate {
  team_a_score: number;
  team_b_score: number;
  status: string;
  note?: string;
}
```

Key features:

- Score adjustment buttons (+/-)
- Status dropdown
- Note input
- Real-time updates
- Undo functionality

#### Enhanced Cricket Scorecard

Specialized component for cricket matches:

```tsx
interface CricketScorecardProps {
  fixture: Fixture;
  teamAData: CricketTeamData;
  teamBData: CricketTeamData;
  onUpdate: (update: CricketUpdate) => void;
}

interface CricketUpdate {
  team: 'a' | 'b';
  runs: number;
  wickets: number;
  overs: number;
  // ... other cricket-specific fields
}
```

Key features:

- Detailed cricket statistics
- Overs progression
- Run rate calculation
- Boundary tracking
- Extras management

### State Management

The frontend uses React Context for state management:

```tsx
interface ModeratorContextType {
  fixtures: Fixture[];
  loading: boolean;
  updateFixture: (id: string, update: any) => Promise<void>;
  createIncident: (fixtureId: string, incident: any) => Promise<void>;
}
```

## Database Design

### Extended Tables

#### Profiles Table Structure

```sql
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'moderator', 'viewer')),
  avatar_url TEXT,
  assigned_sports TEXT[],
  assigned_venues TEXT[],
  moderator_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Fixtures Table Structure

```sql
CREATE TABLE IF NOT EXISTS public.fixtures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sport_id UUID REFERENCES public.sports(id),
  team_a_id UUID REFERENCES public.teams(id),
  team_b_id UUID REFERENCES public.teams(id),
  team_a_score INTEGER DEFAULT 0,
  team_b_score INTEGER DEFAULT 0,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'completed', 'postponed', 'cancelled')),
  scheduled_time TIMESTAMPTZ,
  venue TEXT,
  updated_by UUID REFERENCES public.profiles(id),
  version INTEGER DEFAULT 1,
  extra JSONB, -- Sport-specific data
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Indexes and Performance

Key indexes for performance:

```sql
-- Indexes for moderator queries
CREATE INDEX IF NOT EXISTS idx_fixtures_updated_by ON public.fixtures(updated_by);
CREATE INDEX IF NOT EXISTS idx_fixtures_status ON public.fixtures(status);
CREATE INDEX IF NOT EXISTS idx_match_updates_fixture_id ON public.match_updates(fixture_id);
CREATE INDEX IF NOT EXISTS idx_match_updates_created_at ON public.match_updates(created_at);
```

## Error Handling and Validation

### Client-Side Validation

- Input sanitization
- Type checking
- Required field validation
- Range validation for scores

### Server-Side Validation

```typescript
const validateUpdate = (update: ScoreUpdate, fixture: Fixture) => {
  // Check version
  if (update.expected_version !== fixture.version) {
    throw new Error('Version mismatch');
  }
  
  // Validate scores
  if (update.team_a_score < 0 || update.team_b_score < 0) {
    throw new Error('Scores must be non-negative');
  }
  
  // Validate status
  const validStatuses = ['scheduled', 'live', 'completed', 'postponed', 'cancelled'];
  if (!validStatuses.includes(update.status)) {
    throw new Error('Invalid status');
  }
};
```

### Rate Limiting

Implementation of rate limiting to prevent abuse:

```sql
-- Track moderator activity
CREATE TABLE IF NOT EXISTS public.moderator_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  moderator_id UUID REFERENCES public.profiles(id),
  fixture_id UUID REFERENCES public.fixtures(id),
  action TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Check rate limit function
CREATE OR REPLACE FUNCTION public.check_moderator_rate_limit(
  p_moderator_id UUID,
  p_fixture_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  update_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO update_count
  FROM public.moderator_activity
  WHERE moderator_id = p_moderator_id
    AND fixture_id = p_fixture_id
    AND created_at > NOW() - INTERVAL '5 minutes';
    
  RETURN update_count < 20; -- Max 20 updates per 5 minutes
END;
$$ LANGUAGE plpgsql;
```

## Real-time Features

### Supabase Realtime Integration

The system leverages Supabase Realtime for live updates:

```typescript
// Subscribe to fixture updates
const subscription = supabase
  .channel('fixture-updates')
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'fixtures'
    },
    (payload) => {
      // Update local state
      updateFixtureInState(payload.new);
    }
  )
  .subscribe();
```

### Notification System

Enhanced notifications with moderator attribution:

```typescript
// Example notification payload
{
  type: 'fixture_update',
  fixture_id: 'uuid',
  updated_by: {
    id: 'moderator-uuid',
    name: 'John Moderator'
  },
  changes: {
    team_a_score: { from: 0, to: 1 },
    status: { from: 'scheduled', to: 'live' }
  }
}
```

## Testing Strategy

### Unit Tests

Key areas for unit testing:

- Permission validation functions
- Score calculation logic
- API route handlers
- Component rendering
- Data validation

### Integration Tests

- End-to-end fixture update flow
- Concurrent update handling
- Permission boundary testing
- Real-time update propagation
- Error scenario handling

### Test Data

Sample test data for verification:

```sql
-- Test moderator
INSERT INTO public.profiles (id, email, full_name, role, assigned_sports)
VALUES ('test-moderator-uuid', 'moderator@test.com', 'Test Moderator', 'moderator', ARRAY['Football']);

-- Test fixture
INSERT INTO public.fixtures (id, sport_id, team_a_id, team_b_id, status)
VALUES ('test-fixture-uuid', 'football-sport-uuid', 'team-a-uuid', 'team-b-uuid', 'scheduled');
```

## Deployment and Monitoring

### Deployment Checklist

1. Database schema migrations
2. RLS policy updates
3. API route deployment
4. Frontend component updates
5. Environment variable configuration
6. Rate limiting configuration

### Monitoring

Key metrics to monitor:

- Update frequency by moderator
- Error rates
- Response times
- Concurrent user counts
- Database performance

### Logging

Structured logging for debugging:

```sql
-- Log moderator actions
INSERT INTO public.moderator_activity (moderator_id, fixture_id, action)
VALUES (auth.uid(), 'fixture-uuid', 'score_update');
```

## Future Enhancements

### Planned Features

1. **Advanced Analytics**
   - Moderator performance metrics
   - Fixture update patterns
   - Anomaly detection

## Troubleshooting Guide

### Common Issues

#### Permission Denied Errors

1. Check user role in `profiles` table
2. Verify sport/venue assignments
3. Confirm RLS policies are enabled
4. Test `can_moderate_fixture()` function directly

#### Version Mismatch Errors

1. Refresh fixture data
2. Check for concurrent updates
3. Verify version tracking is working
4. Clear local state and reload

#### Rate Limiting Problems

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
