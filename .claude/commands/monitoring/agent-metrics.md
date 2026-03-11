# agent-metrics

View agent performance metrics.

## Usage

```bash
bunx claude-flow agent metrics [options]
```

## Options

- `--agent-id <id>` - Specific agent
- `--period <time>` - Time period
- `--format <type>` - Output format

## Examples

```bash
# All agents metrics
bunx claude-flow agent metrics

# Specific agent
bunx claude-flow agent metrics --agent-id agent-001

# Last hour
bunx claude-flow agent metrics --period 1h
```
