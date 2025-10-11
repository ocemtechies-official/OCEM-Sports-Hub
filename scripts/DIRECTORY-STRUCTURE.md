# Scripts Directory Structure

This document describes the organization of the scripts directory to help developers understand where to find specific scripts.

## Directory Layout

```bash
scripts/
├── README.md
├── MIGRATION-GUIDE.md
├── DIRECTORY-STRUCTURE.md (this file)
├── database/
│   ├── 01-create-tables.sql
│   ├── 02-enable-rls.sql
│   ├── 03-seed-data.sql
│   ├── 04-create-functions.sql
│   ├── 05-sample-data.sql
│   ├── 06-complete-sample-data.sql
│   ├── 07-add-profile-fields.sql
│   ├── 07-tournament-tables.sql
│   ├── 08-registration-system-migration.sql
│   ├── 09-registration-rls-policies.sql
│   ├── 10-moderator-system.sql
│   ├── 11-moderator-rls-policies.sql
│   ├── 12-sports-week-config.sql
│   └── 13-soft-delete-migration.sql
├── setup/
│   ├── create-admin-user.sql
│   ├── create-test-moderator.sql
│   ├── quick-setup-moderator.sql
│   ├── setup-test-moderator.sql
│   ├── simple-test-moderator.sql
│   └── test-moderator-setup.sql
├── testing/
│   ├── populate-sample-data.js
│   ├── populate-sample-data.ts
│   ├── test-profile-fields.js
│   └── test-profile-fields.ts
└── utils/
    ├── check-migration-status.sql
    └── check-moderator-assignments.sql
```

## Directory Descriptions

### database/

Contains core database setup and migration scripts that should be run in numerical order to set up the database schema and initial data.

### setup/

Contains scripts for setting up users, administrators, and moderators in the system.

### testing/

Contains scripts for populating sample data and testing functionality.

### utils/

Contains utility scripts for checking the status of migrations and assignments.

## Usage Guidelines

1. **Database Setup**: Run scripts in the `database/` directory in numerical order to set up the database schema.
2. **User Setup**: Use scripts in the `setup/` directory to create administrator and moderator accounts.
3. **Testing**: Use scripts in the `testing/` directory to populate sample data for development and testing.
4. **Utilities**: Use scripts in the `utils/` directory to check the status of various system components.
