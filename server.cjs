// server.cjs — Node.js + Socket.io game server (Phase 1 stub)

const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);

// Serve static files from dist (production) or root (dev fallback)
app.use(express.static(path.join(__dirname, '.')));
app.use(express.json());

// Placeholder: Socket.io setup in Phase 10
// const { Server } = require('socket.io');
// const io = new Server(server);

// REST endpoints — Phase 10 full implementation
app.get('/api/rooms', (_req, res) => {
  res.json([]);
});

app.post('/api/rooms', (_req, res) => {
  res.status(501).json({ error: 'Not implemented — Phase 10' });
});

// AI Edit — FreeCam Live Editor AI assistant relay
const AI_QUEUE_FILE = path.join(__dirname, '.ai_prompt_queue.json');
const AI_RESPONSE_FILE = path.join(__dirname, '.ai_response.json');

app.post('/api/ai-edit', (req, res) => {
  try {
    const { currentState, userPrompt } = req.body;
    if (!currentState || !userPrompt) {
      return res.status(400).json({ error: 'Missing currentState or userPrompt' });
    }
    // Delete previous response if it exists
    if (fs.existsSync(AI_RESPONSE_FILE)) {
      fs.unlinkSync(AI_RESPONSE_FILE);
    }
    fs.writeFileSync(AI_QUEUE_FILE, JSON.stringify({ currentState, userPrompt, timestamp: Date.now() }, null, 2));
    console.log('[SERVER] AI edit request queued');
    res.json({ status: 'queued', file: '.ai_prompt_queue.json' });
  } catch (err) {
    console.error('[ERROR][server] /api/ai-edit:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/ai-response', (_req, res) => {
  try {
    if (fs.existsSync(AI_RESPONSE_FILE)) {
      const data = JSON.parse(fs.readFileSync(AI_RESPONSE_FILE, 'utf-8'));
      return res.json(data);
    }
    res.status(404).json({ error: 'No response yet' });
  } catch (err) {
    console.error('[ERROR][server] /api/ai-response:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Source File — read/write for FreeCam Live Editor raw source code editing
const ALLOWED_EXTS = new Set(['.js', '.json', '.html', '.css', '.cjs']);
const PROJECT_ROOT = __dirname;

function isSafePath(filePath) {
  if (!filePath || typeof filePath !== 'string') return false;
  if (filePath.includes('..')) return false;
  const ext = path.extname(filePath).toLowerCase();
  if (!ALLOWED_EXTS.has(ext)) return false;
  const full = path.resolve(PROJECT_ROOT, filePath);
  if (!full.startsWith(PROJECT_ROOT)) return false;
  return true;
}

app.get('/api/source-file', (req, res) => {
  try {
    const filePath = req.query.file || req.query.path;
    if (!isSafePath(filePath)) {
      return res.status(400).json({ error: 'Invalid file path' });
    }
    const fullPath = path.join(PROJECT_ROOT, filePath);
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'File not found: ' + filePath });
    }
    const content = fs.readFileSync(fullPath, 'utf-8');
    res.json({ file: filePath, content });
  } catch (err) {
    console.error('[ERROR][server] /api/source-file GET:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/source-file', (req, res) => {
  try {
    const { file: filePath, content } = req.body;
    if (!isSafePath(filePath)) {
      return res.status(400).json({ error: 'Invalid file path' });
    }
    if (typeof content !== 'string') {
      return res.status(400).json({ error: 'Content must be a string' });
    }
    const fullPath = path.join(PROJECT_ROOT, filePath);
    fs.writeFileSync(fullPath, content, 'utf-8');
    console.log('[SERVER] Source file written:', filePath);
    res.json({ status: 'saved', file: filePath });
  } catch (err) {
    console.error('[ERROR][server] /api/source-file POST:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Comment-out a line range in a source file (for delete button)
app.post('/api/comment-lines', (req, res) => {
  try {
    const { file: filePath, startLine, endLine } = req.body;
    if (!isSafePath(filePath)) {
      return res.status(400).json({ error: 'Invalid file path' });
    }
    if (!Number.isInteger(startLine) || !Number.isInteger(endLine) || startLine < 1 || endLine < startLine) {
      return res.status(400).json({ error: 'Invalid line range' });
    }
    const fullPath = path.join(PROJECT_ROOT, filePath);
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    const lines = fs.readFileSync(fullPath, 'utf-8').split('\n');
    if (startLine > lines.length || endLine > lines.length) {
      return res.status(400).json({ error: 'Line range exceeds file length' });
    }
    for (let i = startLine - 1; i < endLine; i++) {
      const trimmed = lines[i].trim();
      if (trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('/*')) {
        lines[i] = '// ' + lines[i];
      }
    }
    fs.writeFileSync(fullPath, lines.join('\n'), 'utf-8');
    console.log('[SERVER] Commented lines', startLine, '-', endLine, 'in', filePath);
    res.json({ status: 'commented', file: filePath, startLine, endLine });
  } catch (err) {
    console.error('[ERROR][server] /api/comment-lines:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`[SERVER] Listening on port ${PORT}`);
});
