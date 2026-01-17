#!/usr/bin/env node
/**
 * Compare legacy and Astro pages side-by-side
 * Opens both versions in browser for visual comparison
 */

const { spawn } = require('child_process');
const http = require('http');

const LEGACY_PORT = 4322;
const ASTRO_PORT = 4321;

// Start legacy server
const legacyServer = require('./serve-legacy.js');

// Wait a bit for servers to start, then open comparison page
setTimeout(() => {
  const pages = [
    '/jng/index',
    '/jng/course',
    '/jng/jobs',
  ];
  
  console.log('\n=== Page Comparison URLs ===');
  console.log('\nLegacy (port 4322):');
  pages.forEach(page => {
    console.log(`  http://localhost:${LEGACY_PORT}${page}.html`);
  });
  
  console.log('\nAstro (port 4321):');
  pages.forEach(page => {
    console.log(`  http://localhost:${ASTRO_PORT}${page}`);
  });
  
  console.log('\nOpen these URLs side-by-side in your browser to compare.');
}, 2000);
