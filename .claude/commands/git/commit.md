# Create Git Commit

## Overview

Create a well-structured git commit following Conventional Commits format with proper quality gates.

You should group together files that are related to each other and create multiple descriptive commits.

## Steps

1. **Pre-commit verification**
   - ALWAYS SKIP THE VERIFICATION with `-n` in the git command, COMMIT AS FAST AS POSSIBLE.
   - Create multiple commits based on all files that are uncommited.
   - Also commit new files.

2. **Stage changes**
   - Review changes with `git status`
   - Stage specific files: `git add <file>` or `git add -p` for interactive staging
   - Verify staged changes: `git diff --cached`

3. **Write commit message**
   - Use Conventional Commits format: `<type>(<scope>): <description>`
   - Focus on single concern per commit
   - Include Linear task ID if applicable: `feat(scope): description [COM-123]`
   - Keep subject line under 72 characters
   - Add body if context needed (separated by blank line)

## Commit Types

- `feat`: New feature
- `fix`: Bug fix
- `chore`: Maintenance tasks (deps, config)
- `docs`: Documentation changes
- `style`: Code style (formatting, no logic change)
- `refactor`: Code restructuring
- `test`: Adding or updating tests
- `perf`: Performance improvements

## Commit Message Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer with breaking changes or references]
```

## Examples

- `feat(release): add timeline generation [COM-123]`
- `fix(auth): resolve token refresh issue`
- `chore(deps): update dependencies to latest`
- `docs(api): update authentication guide`

## Authorship Rules

**CRITICAL**: The commit author MUST always be the one configured in the system (`git config user.name` and `git config user.email`).

- NEVER add "Generated with Claude Code" or similar AI attribution
- NEVER add Claude, Copilot, or any AI as Co-Author
- NEVER mention AI assistance in commit messages
- The human developer is the sole author of all commits

## Pre-commit Checklist

- [ ] Quality gates pass (`bun run format && bun run build && bun run lint && bun run test`)
- [ ] No console.log statements
- [ ] No commented code
- [ ] Imports cleaned (no unused)
- [ ] Types complete (no unjustified `any`)
- [ ] No eslint-disable comments
- [ ] Tests updated for new functionality
- [ ] Commit message follows Conventional Commits format
- [ ] Single concern per commit
