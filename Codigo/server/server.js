const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
app.use(express.json());

// Serve the frontend from the sibling 'signup-page' folder
const FRONTEND_DIR = path.join(__dirname, '..', 'signup-page');
app.use(express.static(FRONTEND_DIR));

const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

function ensureDataFile(){
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, JSON.stringify([]));
}

function loadUsers(){
  ensureDataFile();
  const raw = fs.readFileSync(USERS_FILE, 'utf8');
  try { return JSON.parse(raw || '[]'); } catch(e){ return []; }
}

function saveUsers(users){
  ensureDataFile();
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
}

function hashPassword(password, salt){
  const key = crypto.scryptSync(password, salt, 64);
  return key.toString('hex');
}

app.post('/api/signup', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ ok: false, message: 'username and password required' });
  const users = loadUsers();
  if (users.find(u => u.username === username)) return res.status(409).json({ ok: false, message: 'Usuário já existe' });
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = hashPassword(password, salt);
  users.push({ username, salt, hash, createdAt: new Date().toISOString() });
  saveUsers(users);
  return res.json({ ok: true, message: 'Conta criada com sucesso' });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ ok: false, message: 'username and password required' });
  const users = loadUsers();
  const user = users.find(u => u.username === username);
  if (!user) return res.status(401).json({ ok: false, message: 'Usuário ou senha incorretos' });
  const hash = hashPassword(password, user.salt);
  if (hash !== user.hash) return res.status(401).json({ ok: false, message: 'Usuário ou senha incorretos' });
  return res.json({ ok: true, message: 'Login successful' });
});

app.get('/api/users', (req, res) => {
  const users = loadUsers().map(u => ({ username: u.username, createdAt: u.createdAt }));
  res.json({ ok: true, users });
});

app.post('/api/delete-account', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ ok: false, message: 'username and password required' });
  const users = loadUsers();
  const idx = users.findIndex(u => u.username === username);
  if (idx === -1) return res.status(404).json({ ok: false, message: 'Usuário não encontrado' });
  const user = users[idx];
  const hash = hashPassword(password, user.salt);
  if (hash !== user.hash) return res.status(401).json({ ok: false, message: 'Credenciais inválidas' });
  // remove user
  users.splice(idx, 1);
  saveUsers(users);
  return res.json({ ok: true, message: 'Conta removida com sucesso' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT} (serving frontend from ${FRONTEND_DIR})`));
