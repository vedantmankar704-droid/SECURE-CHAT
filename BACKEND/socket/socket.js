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
        // Clean up any old mapping for this socket to prevent stale routing
        for (const [key, val] of Object.entries(userSocketMap)) {
          if (val === socket.id) {
            delete userSocketMap[key];
          }
        }
        userSocketMap[userId] = socket.id;
        console.log(`User Joined: ${userId}`);
      }
    });

    // Listen for send_message event from clients
    socket.on('send_message', (payload) => {
      const { senderId, receiverId, message, timestamp } = payload || {};

      console.log(`Message received: ${message}`);
      console.log(`Sender ID: ${senderId}`);
      console.log(`Receiver ID: ${receiverId}`);

      // Validate payload
      if (!senderId || !receiverId || !message) {
        console.log('Validation failed: Missing senderId, receiverId, or message');
        return;
      }

      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('receive_message', {
          senderId,
          receiverId,
          message,
          timestamp: timestamp || new Date().toISOString()
        });
        console.log('Message delivered');
      } else {
        console.log('Message delivered (receiver offline)');
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
