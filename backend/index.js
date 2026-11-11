require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors({ origin: ['http://localhost:3000', 'https://your-vercel-app.vercel.app'] })); // Update with your real Vercel URL later
app.use(express.json({ limit: '10mb' })); // For base64 image payloads

const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // NEVER expose this on the frontend
);

// Middleware to protect routes
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token provided' });

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Invalid token' });

  req.user = user; // Now you have the user in your route
  next();
};

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
});

app.post('/api/check', authenticate, async (req, res) => {
  const { content, type } = req.body;
  const { id: socketId } = req.body; // Client sends its socket ID

  res.json({ status: 'processing', checkId: 'temp-id' }); // Immediate response

  // Simulate a pipeline (replace with real logic)
  io.to(socketId).emit('verification_progress', { step: 'Starting analysis...' });
  await new Promise(r => setTimeout(r, 1000));

  // If type === 'image', call a Vision API here (see Phase 5)
  io.to(socketId).emit('verification_progress', { step: 'Extracting text...' });
  await new Promise(r => setTimeout(r, 1000));

  const result = { verdict: 'Likely True', confidence: 0.92, reasoning: 'Sample reasoning.' };
  io.to(socketId).emit('verification_complete', result);
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, '0.0.0.0', () => console.log(`Backend running on port ${PORT}`));