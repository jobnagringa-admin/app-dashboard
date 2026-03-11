# issue-triage

Intelligent issue classification and triage.

## Usage

```bash
bunx claude-flow github issue-triage [options]
```

## Options

- `--repository <owner/repo>` - Target repository
- `--auto-label` - Automatically apply labels
- `--assign` - Auto-assign to team members

## Examples

```bash
# Triage issues
bunx claude-flow github issue-triage --repository myorg/myrepo

# With auto-labeling
bunx claude-flow github issue-triage --repository myorg/myrepo --auto-label

# Full automation
bunx claude-flow github issue-triage --repository myorg/myrepo --auto-label --assign
```
