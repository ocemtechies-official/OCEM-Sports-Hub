# Contributing to OCEM Sports Hub

Thank you for your interest in contributing to OCEM Sports Hub! This document provides guidelines and best practices for contributing to the project.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [How to Contribute](#how-to-contribute)
4. [Development Workflow](#development-workflow)
5. [Coding Standards](#coding-standards)
6. [Documentation Guidelines](#documentation-guidelines)
7. [Pull Request Process](#pull-request-process)
8. [Reporting Issues](#reporting-issues)

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please treat all contributors and users with respect and professionalism.

## Getting Started

1. Fork the repository
2. Clone your fork locally
3. Install dependencies with `npm install`
4. Create a new branch for your feature or bug fix
5. Make your changes
6. Test your changes thoroughly
7. Commit and push your changes
8. Create a pull request

## How to Contribute

### Reporting Bugs

- Check if the bug has already been reported
- Provide detailed steps to reproduce the issue
- Include environment information (OS, browser, etc.)
- Include screenshots or code examples if relevant

### Suggesting Enhancements

- Clearly describe the enhancement
- Explain the problem it solves
- Provide use cases
- Consider potential implementation approaches

### Code Contributions

- Follow the coding standards outlined below
- Write tests for new functionality
- Update documentation as needed
- Ensure all tests pass before submitting

## Development Workflow

1. Create a feature branch from `main`
2. Implement your changes
3. Write or update tests
4. Update documentation
5. Run all tests
6. Commit changes using conventional commit messages
7. Push to your fork
8. Create a pull request

## Coding Standards

### General Principles

- Write clean, readable, and maintainable code
- Follow the existing code style in the project
- Use meaningful variable and function names
- Comment complex logic
- Keep functions small and focused

### TypeScript/JavaScript

- Use TypeScript for all new code
- Enable strict type checking
- Use ESLint and Prettier for code formatting
- Follow functional programming principles where appropriate
- Use async/await instead of callbacks

### React/Next.js

- Use functional components with hooks
- Follow the Next.js App Router patterns
- Separate presentational and container components
- Use proper error boundaries
- Implement loading states appropriately

### Database

- Follow existing schema conventions
- Write efficient queries
- Use proper indexing
- Implement appropriate constraints

## Documentation Guidelines

### File Organization

Documentation follows a hybrid type+feature folder organization:

```
docs/
├── guides/
│   ├── setup/
│   ├── migration/
│   ├── testing/
│   └── debugging/
├── implementations/
│   ├── phases/
│   └── features/
├── bug-fixes/
│   ├── auth/
│   ├── ui/
│   └── database/
├── technical/
│   ├── auth/
│   ├── architecture/
│   └── api/
├── proposals/
├── scripts/
├── templates/
└── archive/
```

### Naming Convention

- Use Title-Kebab-Case for all documentation files
- Capitalize first letter of each word
- Use hyphens to separate words
- Examples: Admin-Setup-Guide.md, Phase-1-Implementation.md

### Content Structure

1. Title
2. Brief description
3. Table of contents for longer documents
4. Main content organized in sections
5. Conclusion or next steps

## Pull Request Process

1. Ensure your branch is up to date with `main`
2. Write a clear, descriptive title
3. Provide a detailed description of changes
4. Reference any related issues
5. Ensure all tests pass
6. Request review from maintainers

### Pull Request Checklist

- [ ] Code follows project standards
- [ ] Tests have been added/updated
- [ ] Documentation has been updated
- [ ] Commit messages follow conventional commits
- [ ] Branch is up to date with `main`

## Reporting Issues

When reporting issues, please include:

1. A clear and descriptive title
2. Steps to reproduce the issue
3. Expected behavior
4. Actual behavior
5. Environment information
6. Screenshots or code examples if relevant

Thank you for contributing to OCEM Sports Hub!