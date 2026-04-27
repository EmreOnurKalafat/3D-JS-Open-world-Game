// server.js — Node.js + Socket.io game server (Phase 1 stub)

const express = require('express');
const http = require('http');
const path = require('path');

const app = express();
const server = http.createServer(app);

// Serve static files from dist (production) or root (dev fallback)
app.use(express.static(path.join(__dirname, '.')));

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

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`[SERVER] Listening on port ${PORT}`);
});
