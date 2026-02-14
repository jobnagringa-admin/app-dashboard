# Lighthouse Cleanup Guide

## Overview

Lighthouse CI creates temporary Chrome user data directories and artifacts
during execution. This document explains how cleanup works and provides
instructions for AI agents.

## Automatic Cleanup

The project includes an automatic cleanup script
(`scripts/lighthouse-cleanup.js`) that runs after Lighthouse execution
completes. This script removes:

1. **Chrome User Data Directories** (`lighthouse.*/` in project root)
2. **Windows AppData Directories** (when running in WSL:
   `/mnt/c/Users/paulo/AppData/Local/lighthouse.*`)
3. **Temporary Lighthouse CI Artifacts** (individual HTML/JSON reports in
   `.lighthouseci/`)

## Usage

### For Developers

The cleanup runs automatically when using npm scripts:

```bash
npm run lighthouse          # Runs Lighthouse and cleans up automatically
npm run lighthouse:collect  # Collects data and cleans up automatically
```

To manually run cleanup:

```bash
npm run lighthouse:cleanup
```

### For AI Agents

**IMPORTANT**: When running Lighthouse commands, always ensure cleanup runs
afterward:

1. **Preferred**: Use the npm scripts which include automatic cleanup:

   ```bash
   npm run lighthouse
   ```

2. **If running Lighthouse directly**: Always run cleanup afterward:

   ```bash
   lhci autorun && npm run lighthouse:cleanup
   ```

3. **After any Lighthouse execution**: Check for and remove temporary
   directories:
   - Project root: `lighthouse.*/` directories
   - Windows AppData (WSL): `/mnt/c/Users/paulo/AppData/Local/lighthouse.*`
   - Temporary artifacts: `.lighthouseci/lhr-*.html`,
     `.lighthouseci/lhr-*.json`, `.lighthouseci/flags-*.json`

## Configuration

### User Data Directory

The Lighthouse configuration uses a controlled user data directory via Chrome
flags:

```javascript
--user-data-dir=${process.env.LIGHTHOUSE_USER_DATA_DIR || "/tmp/lighthouse-user-data"}
```

This can be customized via environment variable:

```bash
export LIGHTHOUSE_USER_DATA_DIR="/tmp/my-custom-lighthouse-dir"
npm run lighthouse
```

### Git Ignore

The following patterns are ignored by git (see `.gitignore`):

```
lighthouse.*/
.lighthouseci/lhr-*.html
.lighthouseci/lhr-*.json
.lighthouseci/flags-*.json
```

## Troubleshooting

### Cleanup Script Fails

If the cleanup script fails, you can manually remove directories:

```bash
# Remove project root temp directories
rm -rf lighthouse.*/

# Remove Windows AppData directories (WSL)
rm -rf /mnt/c/Users/paulo/AppData/Local/lighthouse.*

# Remove temporary artifacts
rm -f .lighthouseci/lhr-*.html .lighthouseci/lhr-*.json .lighthouseci/flags-*.json
```

### Windows Paths in WSL

When running in WSL, Chrome may create directories in Windows paths. The cleanup
script handles this automatically by checking
`/mnt/c/Users/paulo/AppData/Local/`. If your Windows username differs, you may
need to adjust the script.

### Permission Errors

If you encounter permission errors, ensure:

- The script has execute permissions: `chmod +x scripts/lighthouse-cleanup.js`
- You have write access to the directories being cleaned
- Chrome processes are fully terminated before cleanup

## Implementation Details

The cleanup script (`scripts/lighthouse-cleanup.js`):

1. **Scans project root** for `lighthouse.*/` directories
2. **Checks Windows AppData** (WSL scenario) for `lighthouse.*/` directories
3. **Removes temporary artifacts** from `.lighthouseci/` while preserving:
   - `links.json`
   - `assertion-results.json`
   - Directory structure

All operations are safe and handle errors gracefully, logging warnings for any
failures.
