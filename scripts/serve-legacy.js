#!/usr/bin/env node
/**
 * Serve legacy HTML files for comparison
 * Uses a simple HTTP server to serve src-legacy/ directory
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { fileURLToPath } = require('url');

const PORT = 4322;
const LEGACY_DIR = path.join(process.cwd(), 'src-legacy');

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'font/otf',
};

const server = http.createServer((req, res) => {
  // Remove query string and normalize path
  let filePath = req.url.split('?')[0];

  // Handle root and /jng paths
  if (filePath === '/' || filePath === '/jng' || filePath === '/jng/') {
    filePath = '/jng/index.html';
  } else if (!filePath.startsWith('/jng/')) {
    filePath = '/jng' + filePath;
  }

  // Map /jng paths to src-legacy/jng/
  if (filePath.startsWith('/jng/')) {
    filePath = filePath.replace('/jng/', 'jng/');
  }

  // Map /cdn-assets to src-legacy/cdn-assets
  if (filePath.startsWith('cdn-assets/')) {
    filePath = 'cdn-assets/' + filePath.replace('cdn-assets/', '');
  } else if (filePath.startsWith('/cdn-assets/')) {
    filePath = filePath.replace('/cdn-assets/', 'cdn-assets/');
  }

  const fullPath = path.join(LEGACY_DIR, filePath);

  // Check if file exists
  fs.access(fullPath, fs.constants.F_OK, (err) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('File not found: ' + filePath);
      return;
    }

    // Read and serve file
    fs.readFile(fullPath, (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error reading file');
        return;
      }

      const ext = path.extname(fullPath);
      const contentType = mimeTypes[ext] || 'application/octet-stream';

      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  });
});

server.listen(PORT, () => {
  console.log(`Legacy server running on http://localhost:${PORT}`);
  console.log(`Serving files from: ${LEGACY_DIR}`);
});
