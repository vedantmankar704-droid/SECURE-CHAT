const { Server } = require('socket.io');

let io;
const userSocketMap = {}; // in-memory Map to store userId -> socketId mapping

const getReceiverSocketId = (userId) => {
  return userSocketMap[userId] || null;
};

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log(`User Connected: ${socket.id}`);

    // Listen for join event from clients
    socket.on('join', (userId) => {
      if (userId) {
        userSocketMap[userId] = socket.id;
        console.log(`User Joined: ${userId}`);
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User Disconnected: ${socket.id}`);

      // Find and remove user from the online map
      for (const [userId, socketId] of Object.entries(userSocketMap)) {
        if (socketId === socket.id) {
          delete userSocketMap[userId];
          console.log(`User Disconnected: ${userId}`);
          break;
        }
      }
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

module.exports = {
  initSocket,
  getIO,
  getReceiverSocketId,
  userSocketMap
};
