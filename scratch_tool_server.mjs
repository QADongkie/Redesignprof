import http from 'http';
import fs from 'fs';
import path from 'path';

const PORT = 3088;
const artifactsDir = 'C:\\Users\\System Developer\\.gemini\\antigravity-ide\\brain\\e7519309-4c3a-45b1-8a02-6d2ca2a7d9c0';

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url?.startsWith('/save-view/')) {
    const viewName = req.url.split('/')[2];
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => {
      const base64Data = Buffer.concat(chunks).toString('utf-8').replace(/^data:image\/png;base64,/, '');
      const filePath = path.join(artifactsDir, `${viewName}.png`);
      fs.writeFileSync(filePath, base64Data, 'base64');
      console.log(`[Server] Saved preview image: ${filePath}`);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', file: filePath }));
    });
    return;
  }

  let reqPath = req.url === '/' ? '/tool_verify_hood.html' : req.url;
  reqPath = reqPath.split('?')[0];

  let localPath = path.join(process.cwd(), 'public', reqPath);
  if (!fs.existsSync(localPath)) {
    localPath = path.join(process.cwd(), reqPath);
  }

  if (fs.existsSync(localPath) && fs.statSync(localPath).isFile()) {
    const ext = path.extname(localPath).toLowerCase();
    const mimeTypes = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.mjs': 'application/javascript',
      '.css': 'text/css',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.glb': 'model/gltf-binary',
      '.svg': 'image/svg+xml'
    };
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    fs.createReadStream(localPath).pipe(res);
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`Verification render server running at http://localhost:${PORT}`);
});
