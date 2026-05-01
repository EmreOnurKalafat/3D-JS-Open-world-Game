// server/server.cjs — Node.js + Socket.io game server (Phase 1 stub)

const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);

// Serve static files from project root (dist or dev)
app.use(express.static(path.join(__dirname, '..')));
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
const AI_QUEUE_FILE = path.join(__dirname, '..', '.ai_prompt_queue.json');
const AI_RESPONSE_FILE = path.join(__dirname, '..', '.ai_response.json');

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
const PROJECT_ROOT = path.join(__dirname, '..');

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

// Editor Deletion Registry — persistent deletion tracking for FreeCam editor
const DELETIONS_FILE = path.join(__dirname, '..', 'data', 'editor', 'deletions.json');

function readDeletions() {
  try {
    if (fs.existsSync(DELETIONS_FILE)) {
      return JSON.parse(fs.readFileSync(DELETIONS_FILE, 'utf-8'));
    }
  } catch (_) { /* ignore */ }
  return [];
}

function writeDeletions(deletions) {
  fs.writeFileSync(DELETIONS_FILE, JSON.stringify(deletions, null, 2), 'utf-8');
}

app.get('/api/deletions', (_req, res) => {
  res.json(readDeletions());
});

app.post('/api/deletions', (req, res) => {
  try {
    const { label, sourceFile, isInstancedMesh, instanceId, position, meshType } = req.body;
    if (!label) return res.status(400).json({ error: 'Missing label' });
    const deletions = readDeletions();
    deletions.push({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      label,
      sourceFile: sourceFile || null,
      isInstancedMesh: !!isInstancedMesh,
      instanceId: instanceId ?? -1,
      position: position || null,
      meshType: meshType || null,
      timestamp: Date.now(),
    });
    writeDeletions(deletions);
    console.log('[SERVER] Deletion registered:', label);
    res.json({ status: 'registered', count: deletions.length });
  } catch (err) {
    console.error('[ERROR][server] POST /api/deletions:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/deletions', (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'Missing id' });
    let deletions = readDeletions();
    deletions = deletions.filter(d => d.id !== id);
    writeDeletions(deletions);
    res.json({ status: 'removed', count: deletions.length });
  } catch (err) {
    console.error('[ERROR][server] DELETE /api/deletions:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Editor Action Log — detailed history of all editor operations
const ACTIONS_FILE = path.join(__dirname, '..', 'data', 'editor', 'actions.json');

function readActions() {
  try {
    if (fs.existsSync(ACTIONS_FILE)) {
      return JSON.parse(fs.readFileSync(ACTIONS_FILE, 'utf-8'));
    }
  } catch (_) { /* ignore */ }
  return [];
}

function writeActions(actions) {
  fs.writeFileSync(ACTIONS_FILE, JSON.stringify(actions, null, 2), 'utf-8');
}

app.get('/api/editor-actions', (_req, res) => {
  try {
    const actions = readActions();
    const limit = parseInt(_req.query.limit) || 100;
    res.json(actions.slice(-limit));
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/editor-actions', (req, res) => {
  try {
    const { operation, sourceFile, objectLabel, detail, lineStart, lineEnd, codeSnippet } = req.body;
    if (!operation) return res.status(400).json({ error: 'Missing operation' });
    const actions = readActions();
    actions.push({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      timestamp: new Date().toISOString(),
      operation,
      sourceFile: sourceFile || null,
      objectLabel: objectLabel || null,
      lineStart: lineStart || null,
      lineEnd: lineEnd || null,
      codeSnippet: codeSnippet || null,
      detail: detail || null,
    });
    // Keep last 500 entries max
    if (actions.length > 500) {
      actions.splice(0, actions.length - 500);
    }
    writeActions(actions);
    console.log('[SERVER] Action logged:', operation, sourceFile || '', objectLabel || '');
    res.json({ status: 'logged' });
  } catch (err) {
    console.error('[ERROR][server] POST /api/editor-actions:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`[SERVER] Listening on port ${PORT}`);
});
