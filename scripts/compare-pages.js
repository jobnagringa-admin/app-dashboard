#!/usr/bin/env node
/**
 * Compare legacy and Astro pages side-by-side
 * Opens both versions in browser for visual comparison
 */

const { spawn } = require('child_process');
const http = require('http');

const LEGACY_BASE_URL = process.env.LEGACY_BASE_URL || 'http://jng-legacy-fixtures.localhost:1355';
const ASTRO_BASE_URL = process.env.APP_BASE_URL || 'http://jng-legacy.localhost:1355';

// Start legacy server
const legacyServer = require('./serve-legacy.js');

// Wait a bit for servers to start, then open comparison page
setTimeout(() => {
  const pages = ['/jng/index', '/jng/course', '/jng/jobs'];

  console.log('\n=== Page Comparison URLs ===');
  console.log('\nLegacy:');
  pages.forEach((page) => {
    console.log(`  ${LEGACY_BASE_URL}${page}.html`);
  });

  console.log('\nAstro:');
  pages.forEach((page) => {
    console.log(`  ${ASTRO_BASE_URL}${page}`);
  });

  console.log('\nOpen these URLs side-by-side in your browser to compare.');
}, 2000);
