const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const HOST = '0.0.0.0';
const PORT = process.env.PORT || 3000;
// Frontend is in the sibling 'singup-page' directory
const FRONTEND_ROOT = path.resolve(__dirname, '..', 'singup-page');
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

function ensureDataFile(){
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, JSON.stringify([]));
}

function loadUsers(){
  ensureDataFile();
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8') || '[]');
  } catch(e){
    return [];
  }
}

function saveUsers(users){
  ensureDataFile();
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
}

function hashPassword(password, salt){
  const key = crypto.scryptSync(password, salt, 64);
  return key.toString('hex');
}

function sendJSON(res, code, obj){
  const payload = JSON.stringify(obj);
  res.writeHead(code, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) });
  res.end(payload);
}

function serveStatic(req, res, filePath){
  const ext = path.extname(filePath).toLowerCase();
  const mime = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
  }[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (req.method === 'POST' && url.pathname === '/api/signup'){
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      let data;
      try { data = JSON.parse(body); } catch(e){ return sendJSON(res, 400, { ok: false, message: 'invalid json' }); }
      const { username, password } = data || {};
      if (!username || !password) return sendJSON(res, 400, { ok: false, message: 'username and password required' });
      const users = loadUsers();
      if (users.find(u => u.username === username)) return sendJSON(res, 409, { ok: false, message: 'Usuário já existe' });
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = hashPassword(password, salt);
      users.push({ username, salt, hash, createdAt: new Date().toISOString() });
      saveUsers(users);
      return sendJSON(res, 200, { ok: true, message: 'Conta criada com sucesso' });
    });
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/users'){
    const users = loadUsers().map(u => ({ username: u.username, createdAt: u.createdAt }));
    return sendJSON(res, 200, { ok: true, users });
  }

  // Serve static files from FRONTEND_ROOT for any other GET
  if (req.method === 'GET'){
    let p = url.pathname === '/' ? '/index.html' : url.pathname;
    // Prevent directory traversal
    const safePath = path.normalize(path.join(FRONTEND_ROOT, p)).replace(/\\/g, '/');
    if (!safePath.startsWith(FRONTEND_ROOT.replace(/\\/g, '/'))){
      res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Forbidden');
      return;
    }
    const filePath = path.join(FRONTEND_ROOT, p);
    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()){
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Not found');
        return;
      }
      serveStatic(req, res, filePath);
    });
    return;
  }

  res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Method not allowed');
});

server.listen(PORT, HOST, () => {
  console.log(`Server (no npm) listening on http://localhost:${PORT} serving frontend from ${FRONTEND_ROOT}`);
});
