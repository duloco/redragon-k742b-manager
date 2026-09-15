const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 3420;
const DIST_DIR = path.join(__dirname, 'dist');

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  let reqPath = decodeURIComponent(req.url.split('?')[0]);
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';

  const filePath = path.join(DIST_DIR, reqPath);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
      'Cache-Control': 'no-cache'
    });
    fs.createReadStream(filePath).pipe(res);
  } else {
    // SPA fallback
    const indexPath = path.join(DIST_DIR, 'index.html');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    fs.createReadStream(indexPath).pipe(res);
  }
});

function openBrowser(url) {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chromePathX86 = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';

  let browserCmd = `start "" "${url}"`;

  if (fs.existsSync(edgePath)) {
    browserCmd = `"${edgePath}" --app="${url}" --window-size=1200,860`;
  } else if (fs.existsSync(chromePath)) {
    browserCmd = `"${chromePath}" --app="${url}" --window-size=1200,860`;
  } else if (fs.existsSync(chromePathX86)) {
    browserCmd = `"${chromePathX86}" --app="${url}" --window-size=1200,860`;
  }

  exec(browserCmd, (err) => {
    if (err) {
      exec(`start ${url}`);
    }
  });
}

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    const url = `http://localhost:${PORT}`;
    console.log(`\n======================================================`);
    console.log(`  Redragon K742B Manager - Scartzeut Inc.`);
    console.log(`  O aplicativo já está rodando em segundo plano (${url}).`);
    console.log(`  Abrindo a janela do aplicativo...`);
    console.log(`======================================================\n`);
    openBrowser(url);
  } else {
    console.error('Erro no servidor:', err);
  }
});

server.listen(PORT, '127.0.0.1', () => {
  const url = `http://localhost:${PORT}`;
  console.log(`\n======================================================`);
  console.log(`  Redragon K742B Manager - Scartzeut Inc.`);
  console.log(`  Servidor ativo em: ${url}`);
  console.log(`======================================================\n`);

  openBrowser(url);
});
