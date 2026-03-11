# swarm-monitor

Real-time swarm monitoring.

## Usage

```bash
bunx claude-flow swarm monitor [options]
```

## Options

- `--interval <ms>` - Update interval
- `--metrics` - Show detailed metrics
- `--export` - Export monitoring data

## Examples

```bash
# Start monitoring
bunx claude-flow swarm monitor

# Custom interval
bunx claude-flow swarm monitor --interval 5000

# With metrics
bunx claude-flow swarm monitor --metrics
```
