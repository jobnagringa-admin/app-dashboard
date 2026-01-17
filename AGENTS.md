## Critical Rules

**Language**: ALWAYS work, think and answer in ENGLISH. NO MATTER WHAT WAS THE INPUT LANGUAGE, translate non-English inputs before acting, NEVER ANSWER IN PORTUGUESE.

**File & Code Naming**: ALL names MUST be in ENGLISH. This applies to:

- File names and folder names
- Component, class, and interface names
- Variables, constants, and function names
- Props, parameters, and type definitions
- CSS classes, IDs, and selectors
- Database fields and API endpoints

Examples:

- `UserProfile.tsx`, `const userName` (correct)
- `PerfilUsuario.tsx`, `const nomeUsuario` (WRONG - Portuguese)
- `handleSubmit()`, `isLoading` (correct)
- `enviarFormulario()`, `estaCarregando` (WRONG - Portuguese)

### GIT STATE PROTECTION - ABSOLUTELY FORBIDDEN

**NEVER, UNDER ANY CIRCUMSTANCES:**

- Delete, remove, or rollback modified files present in the repository
- Run `git checkout -- <file>`, `git restore <file>`, or `git reset --hard` on modified files
- Discard uncommitted changes in any way
- Overwrite or revert local modifications

**WHEN GIT STATE IS DIRTY:**

1. **IGNORE** other modifications - do NOT touch them
2. **PROCEED** with your task without affecting existing work
3. Changes belong to someone - destroying them is UNACCEPTABLE

**This rule is NON-NEGOTIABLE. Violation results in lost work.**

**File Management**:

- NEVER create `*_SUMMARY.md`, `*_REPORT.md`, `*_RESULTS.md` files
- NEVER save working files to root folder
- ALL documentation goes in `apps/docs` only

**Commit Workflow**: Run `/fix:fix` then `/git:commit` after every task completion.

**AI Attribution**: NEVER add AI-generated mentions to commits. This includes:

- NO "Generated with Claude Code" or similar tool mentions
- NO "Co-Authored-By: Claude" or any AI co-author attribution
- NO mentions of AI assistance in commit messages or code comments
- Commits must appear as regular human-authored work
