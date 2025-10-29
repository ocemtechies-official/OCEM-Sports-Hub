# Database Scripts Index

Complete catalog of all database scripts in the OCEM Sports Hub project.

## Overview

This document provides an index of all database scripts in the [scripts/database](../../scripts/database/) directory. These scripts are used for setting up, migrating, and maintaining the database schema and data.

**Note**: Some scripts have duplicate numbering (41, 42, 43 appear multiple times). See the [Renumbering Plan](#renumbering-plan) for future improvements.

## Script Index

| Number | Script Name | Description | Date Added |
|--------|-------------|-------------|------------|
| 01 | [01-create-tables.sql](../../scripts/database/01-create-tables.sql) | Initial table creation | - |
| 02 | [02-enable-rls.sql](../../scripts/database/02-enable-rls.sql) | Enable Row Level Security | - |
| 03 | [03-seed-data.sql](../../scripts/database/03-seed-data.sql) | Seed initial data | - |
| 04 | [04-create-functions.sql](../../scripts/database/04-create-functions.sql) | Create database functions | - |
| 05 | [05-sample-data.sql](../../scripts/database/05-sample-data.sql) | Sample data for testing | - |
| 06 | [06-complete-sample-data.sql](../../scripts/database/06-complete-sample-data.sql) | Complete sample dataset | - |
| 07 | [07-add-profile-fields.sql](../../scripts/database/07-add-profile-fields.sql) | Add user profile fields | - |
| 07 | [07-tournament-tables.sql](../../scripts/database/07-tournament-tables.sql) | Tournament system tables | - |
| 08 | [08-registration-system-migration.sql](../../scripts/database/08-registration-system-migration.sql) | Registration system migration | - |
| 09 | [09-registration-rls-policies.sql](../../scripts/database/09-registration-rls-policies.sql) | Registration RLS policies | - |
| 10 | [10-moderator-system.sql](../../scripts/database/10-moderator-system.sql) | Moderator system implementation | - |
| 11 | [11-moderator-rls-policies.sql](../../scripts/database/11-moderator-rls-policies.sql) | Moderator RLS policies | - |
| 12 | [12-sports-week-config.sql](../../scripts/database/12-sports-week-config.sql) | Sports week configuration | - |
| 13 | [13-soft-delete-migration.sql](../../scripts/database/13-soft-delete-migration.sql) | Soft delete migration | - |
| 14 | [14-complete-auth-fix-supabase.sql](../../scripts/database/14-complete-auth-fix-supabase.sql) | Complete auth fix for Supabase | - |
| 18 | [18-simple-auth-fix.sql](../../scripts/database/18-simple-auth-fix.sql) | Simple authentication fix | - |
| 19 | [19-fix-auth-functions.sql](../../scripts/database/19-fix-auth-functions.sql) | Fix authentication functions | - |
| 21 | [21-test-auth-system.sql](../../scripts/database/21-test-auth-system.sql) | Test authentication system | - |
| 22 | [22-simple-auth-test.sql](../../scripts/database/22-simple-auth-test.sql) | Simple auth test | - |
| 23 | [23-debug-auth-issues.sql](../../scripts/database/23-debug-auth-issues.sql) | Debug authentication issues | - |
| 24 | [24-create-user-profile.sql](../../scripts/database/24-create-user-profile.sql) | Create user profile | - |
| 25 | [25-diagnose-auth.sql](../../scripts/database/25-diagnose-auth.sql) | Diagnose auth problems | - |
| 26 | [26-cleanup-conflicting-policies.sql](../../scripts/database/26-cleanup-conflicting-policies.sql) | Cleanup conflicting policies | - |
| 27 | [27-fix-auth-complete.sql](../../scripts/database/27-fix-auth-complete.sql) | Complete auth fix | - |
| 28 | [28-unified-team-system-migration.sql](../../scripts/database/28-unified-team-system-migration.sql) | Unified team system migration | - |
| 29 | [29-rollback-unified-team-migration.sql](../../scripts/database/29-rollback-unified-team-migration.sql) | Rollback unified team migration | - |
| 30 | [30-sports-enhancement.sql](../../scripts/database/30-sports-enhancement.sql) | Sports system enhancement | - |
| 32 | [32-moderator-incidents.sql](../../scripts/database/32-moderator-incidents.sql) | Moderator incidents tracking | - |
| 33 | [33-moderator-undo.sql](../../scripts/database/33-moderator-undo.sql) | Moderator undo functionality | - |
| 36 | [36-moderator-rls-tightening.sql](../../scripts/database/36-moderator-rls-tightening.sql) | Tighten moderator RLS | - |
| 37 | [37-sports-scoring-rules.sql](../../scripts/database/37-sports-scoring-rules.sql) | Sports scoring rules | - |
| 38 | [38-fixtures-extensions.sql](../../scripts/database/38-fixtures-extensions.sql) | Fixtures system extensions | - |
| 39 | [39-leaderboard-views-rpcs.sql](../../scripts/database/39-leaderboard-views-rpcs.sql) | Leaderboard views and RPCs | - |
| 40 | [40-leaderboard-snapshots.sql](../../scripts/database/40-leaderboard-snapshots.sql) | Leaderboard snapshots | - |
| 41 | [41-auth-rls-leaderboards.sql](../../scripts/database/41-auth-rls-leaderboards.sql) | Auth RLS for leaderboards | - |
| 41 | [41-restore-moderator-fixture-policy.sql](../../scripts/database/41-restore-moderator-fixture-policy.sql) | Restore moderator fixture policy | - |
| 42 | [42-cricket-scoring-optimizations.sql](../../scripts/database/42-cricket-scoring-optimizations.sql) | Cricket scoring optimizations | - |
| 42 | [42-sports-scoring-tiebreakers.sql](../../scripts/database/42-sports-scoring-tiebreakers.sql) | Sports scoring tiebreakers | - |
| 43 | [43-initialize-cricket-data.sql](../../scripts/database/43-initialize-cricket-data.sql) | Initialize cricket data | - |
| 43 | [43-team-change-requests.sql](../../scripts/database/43-team-change-requests.sql) | Team change requests system | - |
| 44 | [44-team-members-email.sql](../../scripts/database/44-team-members-email.sql) | Team members email field | - |
| 45 | [45-team-members-phone-roll.sql](../../scripts/database/45-team-members-phone-roll.sql) | Team members phone field | - |
| 45 | [45-tournament-bracket-generation.sql](../../scripts/database/45-tournament-bracket-generation.sql) | Tournament bracket generation | - |
| 46 | [46-ensure-registration-settings.sql](../../scripts/database/46-ensure-registration-settings.sql) | Ensure registration settings | - |
| 47 | [47-tournament-bracket-fix.sql](../../scripts/database/47-tournament-bracket-fix.sql) | Tournament bracket fix | - |
| 48 | [48-tournament-bracket-ambiguous-fix-v2.sql](../../scripts/database/48-tournament-bracket-ambiguous-fix-v2.sql) | Tournament bracket ambiguous fix v2 | - |
| 48 | [48-tournament-bracket-ambiguous-fix-v3.sql](../../scripts/database/48-tournament-bracket-ambiguous-fix-v3.sql) | Tournament bracket ambiguous fix v3 | - |
| 49 | [49-tournament-bracket-workflow.sql](../../scripts/database/49-tournament-bracket-workflow.sql) | Tournament bracket workflow | - |
| 50 | [50-tournament-bracket-progression.sql](../../scripts/database/50-tournament-bracket-progression.sql) | Tournament bracket progression | - |
| 51 | [51-fix-winner-id-completed-fixtures.sql](../../scripts/database/51-fix-winner-id-completed-fixtures.sql) | Fix winner ID for completed fixtures | - |
| 51 | [51-fix-winner-id-update.sql](../../scripts/database/51-fix-winner-id-update.sql) | Fix winner ID update | - |

## Renumbering Plan

The current database scripts have duplicate numbers which makes them difficult to manage. A future renumbering plan is proposed to create a sequential numbering system from 01-49 while preserving chronological order.

### Issues with Current Numbering

1. Duplicate script numbers (41, 42, 43 appear multiple times)
2. Gaps in numbering (15-17, 20, 31, 34-35, 44, 46, 49-50 missing)
3. Inconsistent ordering

### Proposed Solution

Renumber all scripts to create a sequential 01-49 system while preserving the chronological order of script creation and execution.

### Benefits

- Easier to understand script order
- Simplified maintenance
- Better version control
- Clearer execution sequence

## Usage Guidelines

1. Scripts should be executed in numerical order
2. Always backup the database before running scripts
3. Test scripts in development environment first
4. Document any changes or issues encountered
5. Update this index when adding new scripts