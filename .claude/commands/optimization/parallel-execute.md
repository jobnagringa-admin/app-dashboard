# parallel-execute

Execute tasks in parallel for maximum efficiency.

## Usage

```bash
bunx claude-flow optimization parallel-execute [options]
```

## Options

- `--tasks <file>` - Task list file
- `--max-parallel <n>` - Maximum parallel tasks
- `--strategy <type>` - Execution strategy

## Examples

```bash
# Execute task list
bunx claude-flow optimization parallel-execute --tasks tasks.json

# Limit parallelism
bunx claude-flow optimization parallel-execute --tasks tasks.json --max-parallel 5

# Custom strategy
bunx claude-flow optimization parallel-execute --strategy adaptive
```
