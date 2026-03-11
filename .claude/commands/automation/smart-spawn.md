# smart-spawn

Intelligently spawn agents based on workload analysis.

## Usage

```bash
bunx claude-flow automation smart-spawn [options]
```

## Options

- `--analyze` - Analyze before spawning
- `--threshold <n>` - Spawn threshold
- `--topology <type>` - Preferred topology

## Examples

```bash
# Smart spawn with analysis
bunx claude-flow automation smart-spawn --analyze

# Set spawn threshold
bunx claude-flow automation smart-spawn --threshold 5

# Force topology
bunx claude-flow automation smart-spawn --topology hierarchical
```
