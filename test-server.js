// 테스트용 간단한 서버
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();

// 모든 도메인 허용
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  credentials: true
}));

// Health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Test Server is running',
    timestamp: new Date().toISOString()
  });
});

const server = http.createServer(app);

// Socket.IO 서버 - 모든 설정 허용
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['polling', 'websocket']
});

io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);
  console.log('🌐 Origin:', socket.handshake.headers.origin);
  
  socket.emit('welcome', { message: 'Connected successfully!' });
  
  socket.on('test', (data) => {
    console.log('📨 Test message received:', data);
    socket.emit('testResponse', { success: true, data });
  });
  
  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Test Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});