const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;
const ROOT_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

const server = http.createServer((req, res) => {
  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = decodeURIComponent(urlObj.pathname);

  // Normalize route paths
  let filePath;
  if (pathname === '/' || pathname === '') {
    filePath = path.join(ROOT_DIR, 'index.html');
  } else if (pathname === '/try-it-out' || pathname === '/try-it-out/') {
    filePath = path.join(ROOT_DIR, 'try-it-out', 'index.html');
  } else if (pathname === '/projects' || pathname === '/projects/') {
    filePath = path.join(ROOT_DIR, 'projects', 'index.html');
  } else {
    filePath = path.join(ROOT_DIR, pathname);
    // If directory, try index.html inside it
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }
  }

  // Fallback if not found: try index.html for client-side routing
  if (!fs.existsSync(filePath)) {
    if (!path.extname(pathname)) {
      filePath = path.join(ROOT_DIR, 'index.html');
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(`404 Not Found: ${pathname}`);
      return;
    }
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(`500 Server Error: ${err.message}`);
      return;
    }

    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache'
    });
    res.end(data);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  const nets = os.networkInterfaces();
  const ipList = [];

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        ipList.push({ name, address: net.address });
      }
    }
  }

  console.log('='.repeat(60));
  console.log(`  OMKARVIA INTERIORS - LOCAL & WI-FI DEV SERVER`);
  console.log('='.repeat(60));
  console.log(`\n  ➜  Local (this machine):`);
  console.log(`     • Website:       http://localhost:${PORT}/`);
  console.log(`     • Try It Out:    http://localhost:${PORT}/try-it-out`);
  console.log(`     • Projects:      http://localhost:${PORT}/projects`);

  if (ipList.length > 0) {
    console.log(`\n  ➜  On Your Wi-Fi Network (phone / tablet / laptop):`);
    ipList.forEach(net => {
      console.log(`     • [${net.name}]  http://${net.address}:${PORT}/`);
      console.log(`     • Try It Out:    http://${net.address}:${PORT}/try-it-out`);
    });
  } else {
    console.log(`\n  ➜  Network IP:      (no external network detected)`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('  Server is running. Press Ctrl+C in terminal to stop.');
  console.log('='.repeat(60) + '\n');
});

