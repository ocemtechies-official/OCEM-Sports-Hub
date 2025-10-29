# Setup Scripts

This directory contains scripts for setting up users and administrators in the OCEM Sports Hub application.

## Scripts

- `create-admin-user.sql` - Creates an administrator user
- `create-test-moderator.sql` - Creates a test moderator
- `quick-setup-moderator.sql` - Quick moderator setup
- `setup-test-moderator.sql` - Test moderator setup
- `simple-test-moderator.sql` - Simple test moderator setup
- `test-moderator-setup.sql` - Another test moderator setup script

## Usage

These scripts are used to set up initial users and administrators for the application. They should be run after the database schema has been created.

## Guidelines

1. Run database creation scripts before running setup scripts
2. Update scripts when the user schema changes
3. Document any dependencies between scripts
4. Test scripts in a development environment before using in production