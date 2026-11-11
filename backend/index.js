require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors({ origin: ['http://localhost:3000', 'https://your-vercel-app.vercel.app'] })); // Update with your real Vercel URL later
app.use(express.json({ limit: '10mb' })); // For base64 image payloads

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, '0.0.0.0', () => console.log(`Backend running on port ${PORT}`));