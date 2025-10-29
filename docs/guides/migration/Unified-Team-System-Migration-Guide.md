# Unified Team System Migration Guide

## Overview

This document outlines the migration from the current 3-table team system to a unified team system that consolidates all team-related functionality.

## Current System Issues

### Problems with Current Architecture
1. **Three Separate Systems**: `teams`, `team_registrations`, `individual_registrations`
2. **Conceptual Confusion**: Two different "teams" concepts
3. **Data Duplication**: Team names stored in multiple places
4. **Workflow Gaps**: No clear path from registration to official team
5. **UI Confusion**: Separate interfaces for different team types

### Current Tables
- **`teams`**: Official teams for fixtures/tournaments
- **`team_registrations`**: Student team registration applications
- **`team_registration_members`**: Members of registered teams
- **`individual_registrations`**: Individual student registrations

## New Unified System

### Unified Architecture
- **Single `teams` table**: Handles both official and student teams
- **`team_members` table**: Unified team member management
- **Clear team types**: `official` vs `student_registered`
- **Unified workflows**: Single approval process
- **Consistent UI**: One interface for all teams

### New Schema

#### Enhanced Teams Table
```sql
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  logo_url TEXT,
  color TEXT,
  
  -- Team type and source
  team_type TEXT NOT NULL DEFAULT 'official' CHECK (team_type IN ('official', 'student_registered')),
  source_type TEXT CHECK (source_type IN ('admin_created', 'student_registration')),
  
  -- Sport association
  sport_id UUID REFERENCES public.sports(id),
  
  -- Student team specific fields
  department TEXT,
  semester TEXT,
  gender TEXT,
  
  -- Captain information
  captain_name TEXT,
  captain_contact TEXT,
  captain_email TEXT,
  
  -- Status and approval
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending_approval', 'rejected', 'inactive')),
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMPTZ,
  
  -- Original registration reference
  original_registration_id UUID REFERENCES public.team_registrations(id),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Team Members Table
```sql
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  member_name TEXT NOT NULL,
  member_contact TEXT,
  member_email TEXT,
  member_position TEXT,
  member_order INTEGER NOT NULL,
  is_captain BOOLEAN DEFAULT FALSE,
  is_substitute BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Migration Process

### Pre-Migration Checklist
- [ ] Database backup completed
- [ ] All applications stopped
- [ ] Environment variables configured
- [ ] Migration scripts tested on development environment

### Migration Steps

#### 1. Execute Migration Script
```bash
# Run the migration script
psql -h your-host -U your-user -d your-database -f scripts/database/28-unified-team-system-migration.sql

# Or use the Node.js executor
node scripts/execute-unified-team-migration.js
```

#### 2. Verify Migration
- Check that all tables exist
- Verify data integrity
- Test new functions
- Confirm RLS policies

#### 3. Update Applications
- Update API endpoints
- Update components
- Test functionality
- Deploy changes

### Migration Script Features

#### Data Safety
- **Backup Creation**: All original tables backed up
- **Transaction Safety**: All changes in single transaction
- **Rollback Support**: Complete rollback script provided
- **Data Verification**: Automatic integrity checks

#### Data Migration
- **Approved Registrations**: Converted to active teams
- **Pending Registrations**: Converted to pending teams
- **Rejected Registrations**: Converted to rejected teams
- **Team Members**: Migrated to unified table

#### Helper Functions
- `get_team_by_registration(reg_id)`: Get team by registration ID
- `approve_team_registration(reg_id, approver_id)`: Approve student team
- `reject_team_registration(reg_id, approver_id, reason)`: Reject student team

## API Changes

### New Unified Team API

#### Get All Teams
```typescript
GET /api/teams/unified?type=all|official|student&sport_id=uuid&status=active|pending
```

#### Create Team
```typescript
POST /api/teams/unified
{
  "name": "Team Name",
  "team_type": "official",
  "sport_id": "uuid",
  "members": [...]
}
```

#### Approve Team
```typescript
POST /api/teams/unified/{id}/approve
{
  "action": "approve|reject",
  "reason": "optional reason"
}
```

### Updated Registration API

The team registration API now creates teams in both the registration table and the unified teams table, ensuring consistency.

## Component Changes

### New Unified Team Management
- **Single Interface**: Manage all team types
- **Approval Workflow**: Built-in approval process
- **Team Details**: Comprehensive team information
- **Member Management**: Unified member handling

### Updated Admin Interface
- **Unified Dashboard**: All teams in one place
- **Filtering**: By type, status, sport
- **Bulk Operations**: Approve/reject multiple teams
- **Real-time Updates**: Live status updates

## Benefits of Unified System

### For Administrators
- **Single Interface**: Manage all teams in one place
- **Clear Workflow**: Obvious approval process
- **Better Analytics**: Unified team statistics
- **Easier Management**: No more system confusion

### For Students
- **Clear Status**: Know exactly where their team stands
- **Unified Experience**: Consistent interface
- **Better Feedback**: Clear approval/rejection reasons
- **Tournament Access**: Approved teams can join tournaments

### For Developers
- **Simplified Architecture**: One system to maintain
- **Consistent APIs**: Unified endpoints
- **Better Data Model**: Clear relationships
- **Easier Testing**: Single system to test

## Rollback Plan

If issues arise, the migration can be rolled back using:

```bash
psql -h your-host -U your-user -d your-database -f scripts/database/29-rollback-unified-team-migration.sql
```

The rollback script will:
- Restore original table structure
- Restore original data from backups
- Remove new tables and functions
- Restore original RLS policies

## Post-Migration Tasks

### Immediate Tasks
1. **Test Core Functionality**: Registration, approval, team management
2. **Verify Data Integrity**: All teams and members migrated correctly
3. **Update Documentation**: Update API docs and user guides
4. **Train Users**: Brief admin users on new interface

### Follow-up Tasks
1. **Performance Monitoring**: Monitor query performance
2. **User Feedback**: Collect feedback on new interface
3. **Optimization**: Optimize queries and indexes
4. **Cleanup**: Remove old backup tables after verification

## Troubleshooting

### Common Issues

#### Migration Fails
- Check database permissions
- Verify environment variables
- Check for existing data conflicts
- Review error logs

#### Data Inconsistencies
- Compare backup and migrated data
- Check foreign key constraints
- Verify team member counts
- Review approval statuses

#### API Errors
- Check new API endpoints
- Verify authentication
- Review request/response formats
- Check database connections

### Support

For issues or questions:
1. Check this documentation
2. Review migration logs
3. Test on development environment
4. Contact development team

## Conclusion

The unified team system migration addresses the current architectural issues and provides a more maintainable, user-friendly solution. The migration is designed to be safe, reversible, and comprehensive.

The new system will provide:
- Better user experience
- Simplified administration
- Clearer data model
- Improved workflows
- Easier maintenance

This migration is a significant improvement that will benefit all users of the OCEM Sports Hub system.
