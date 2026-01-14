#!/usr/bin/env node
/**
 * Lighthouse Cleanup Script
 *
 * Removes temporary files and directories created by Lighthouse CI:
 * - Chrome user data directories (lighthouse.* pattern)
 * - Windows AppData directories (when running in WSL)
 * - Temporary Lighthouse CI artifacts
 *
 * This script should be run after Lighthouse execution completes.
 */

import { rmSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

/**
 * Safely remove a directory or file
 */
function safeRemove(path, description) {
  try {
    if (existsSync(path)) {
      const stats = statSync(path);
      if (stats.isDirectory()) {
        rmSync(path, { recursive: true, force: true });
        console.log(`✓ Removed ${description}: ${path}`);
      } else {
        rmSync(path, { force: true });
        console.log(`✓ Removed ${description}: ${path}`);
      }
      return true;
    }
    return false;
  } catch (error) {
    console.warn(`⚠ Could not remove ${description} (${path}): ${error.message}`);
    return false;
  }
}

/**
 * Find and remove Lighthouse temporary directories in project root
 */
function cleanupProjectRoot() {
  console.log('\n🧹 Cleaning up Lighthouse temporary directories in project root...');

  const entries = readdirSync(projectRoot, { withFileTypes: true });
  let cleaned = 0;

  for (const entry of entries) {
    if (entry.isDirectory() && entry.name.match(/^lighthouse\.\d+$/)) {
      const dirPath = join(projectRoot, entry.name);
      if (safeRemove(dirPath, 'Lighthouse temp directory')) {
        cleaned++;
      }
    }
  }

  if (cleaned === 0) {
    console.log('  No Lighthouse temp directories found in project root.');
  } else {
    console.log(`  Cleaned ${cleaned} directory(ies).`);
  }
}

/**
 * Clean up Windows AppData directories (WSL scenario)
 */
function cleanupWindowsAppData() {
  console.log('\n🧹 Cleaning up Windows AppData Lighthouse directories (WSL)...');

  // Convert Windows path to WSL path
  // C:\Users\paulo\AppData\Local\lighthouse.* -> /mnt/c/Users/paulo/AppData/Local/lighthouse.*
  const windowsAppDataPath = '/mnt/c/Users/paulo/AppData/Local';

  if (!existsSync(windowsAppDataPath)) {
    console.log('  Windows AppData path not found (not running in WSL or path differs).');
    return;
  }

  try {
    const entries = readdirSync(windowsAppDataPath, { withFileTypes: true });
    let cleaned = 0;

    for (const entry of entries) {
      if (entry.isDirectory() && entry.name.match(/^lighthouse\.\d+$/)) {
        const dirPath = join(windowsAppDataPath, entry.name);
        if (safeRemove(dirPath, 'Windows AppData Lighthouse directory')) {
          cleaned++;
        }
      }
    }

    if (cleaned === 0) {
      console.log('  No Windows AppData Lighthouse directories found.');
    } else {
      console.log(`  Cleaned ${cleaned} directory(ies) from Windows AppData.`);
    }
  } catch (error) {
    console.warn(`  Could not access Windows AppData directory: ${error.message}`);
  }
}

/**
 * Clean up .lighthouseci temporary artifacts (keep directory structure)
 */
function cleanupLighthouseCIArtifacts() {
  console.log('\n🧹 Cleaning up .lighthouseci temporary artifacts...');

  const lhciDir = join(projectRoot, '.lighthouseci');

  if (!existsSync(lhciDir)) {
    console.log('  .lighthouseci directory not found.');
    return;
  }

  try {
    const entries = readdirSync(lhciDir, { withFileTypes: true });
    let cleaned = 0;

    for (const entry of entries) {
      // Keep links.json and assertion-results.json, remove individual reports
      if (entry.name.match(/^lhr-\d+\.(html|json)$/) || entry.name.match(/^flags-.*\.json$/)) {
        const filePath = join(lhciDir, entry.name);
        if (safeRemove(filePath, 'Lighthouse CI artifact')) {
          cleaned++;
        }
      }
    }

    if (cleaned === 0) {
      console.log('  No temporary Lighthouse CI artifacts found.');
    } else {
      console.log(`  Cleaned ${cleaned} artifact(s).`);
    }
  } catch (error) {
    console.warn(`  Could not clean .lighthouseci directory: ${error.message}`);
  }
}

/**
 * Main cleanup function
 */
function main() {
  console.log('🚀 Starting Lighthouse cleanup...\n');

  cleanupProjectRoot();
  cleanupWindowsAppData();
  cleanupLighthouseCIArtifacts();

  console.log('\n✅ Lighthouse cleanup completed!\n');
}

// Run cleanup
main();
