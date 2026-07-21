const { Server } = require('socket.io');
const Message = require('../models/Message');
const User = require('../models/User');
const FriendRequest = require('../models/FriendRequest');
const { decryptMessage } = require('../utils/encryption');

let io;
const userSocketMap = {}; // userId -> socketId in-memory Map

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
    socket.on('join', async (userId) => {
      if (userId) {
        // Clean up old socket associations
        for (const [key, val] of Object.entries(userSocketMap)) {
          if (val === socket.id) {
            delete userSocketMap[key];
          }
        }
        userSocketMap[userId] = socket.id;
        console.log(`User Joined: ${userId}`);
        
        // Broadcast online users and userOnline event
        io.emit('getOnlineUsers', Object.keys(userSocketMap));
        socket.broadcast.emit('userOnline', { userId });

        // Update any pending 'sent' messages to 'delivered'
        try {
          const undelivered = await Message.find({ receiver: userId, status: 'sent' });
          if (undelivered.length > 0) {
            await Message.updateMany(
              { receiver: userId, status: 'sent' },
              { status: 'delivered' }
            );

            // Notify each sender
            undelivered.forEach(msg => {
              const senderSocketId = getReceiverSocketId(msg.sender.toString());
              if (senderSocketId) {
                io.to(senderSocketId).emit('messageDelivered', {
                  messageId: msg._id,
                  receiverId: userId
                });
                io.to(senderSocketId).emit('messageStatusUpdated', {
                  messageId: msg._id,
                  status: 'delivered'
                });
              }
            });
          }
        } catch (err) {
          console.error("Error updating message status on join:", err);
        }
      }
    });

    // Listen for sendMessage event from clients (camelCase)
    socket.on('sendMessage', async (payload) => {
      const { 
        senderId, 
        receiverId, 
        content, 
        messageType, 
        imageUrl, 
        fileUrl, 
        fileName, 
        fileSize, 
        _id, 
        createdAt, 
        replyTo, 
        isForwarded,
        isEncrypted,
        encryptedMessage,
        encryptedAESKeyForSender,
        encryptedAESKeyForReceiver,
        iv,
        encryptedImageUrl,
        encryptedFileUrl,
        encryptedFileName
      } = payload || {};

      console.log(`[Socket] Message received: ${content || '[Attachment]'}`);
      console.log(`Sender ID: ${senderId}`);
      console.log(`Receiver ID: ${receiverId}`);

      if (!senderId || !receiverId) {
        console.log('Validation failed: Missing senderId or receiverId');
        return;
      }

      // Check friendship and block status before forwarding
      try {
        const friendship = await FriendRequest.findOne({
          status: 'accepted',
          $or: [
            { sender: senderId, receiver: receiverId },
            { sender: receiverId, receiver: senderId }
          ]
        });
        if (!friendship) {
          console.log('[Socket] Message blocked: Not accepted friends');
          return;
        }

        const senderDoc = await User.findById(senderId).select('blockedUsers');
        const receiverDoc = await User.findById(receiverId).select('blockedUsers');
        if (senderDoc?.blockedUsers?.map(id => id.toString()).includes(receiverId.toString()) ||
            receiverDoc?.blockedUsers?.map(id => id.toString()).includes(senderId.toString())) {
          console.log('[Socket] Message blocked: Active block relationship');
          return;
        }
      } catch (err) {
        console.error('Socket block/friendship validation check failed:', err);
      }

      const receiverSocketId = getReceiverSocketId(receiverId);
      const deliveryStatus = receiverSocketId ? 'delivered' : 'sent';

      const outgoingPayload = {
        _id,
        sender: senderId,
        receiver: receiverId,
        content: content ? decryptMessage(content) : "",
        messageType: messageType || "text",
        imageUrl: imageUrl || "",
        fileUrl: fileUrl || "",
        fileName: fileName || "",
        fileSize: fileSize || 0,
        createdAt: createdAt || new Date().toISOString(),
        status: deliveryStatus,
        reactions: [],
        replyTo: replyTo || null,
        isForwarded: isForwarded || false,
        isEncrypted: isEncrypted || false,
        encryptedMessage: encryptedMessage || "",
        encryptedAESKeyForSender: encryptedAESKeyForSender || "",
        encryptedAESKeyForReceiver: encryptedAESKeyForReceiver || "",
        iv: iv || "",
        encryptedImageUrl: encryptedImageUrl || "",
        encryptedFileUrl: encryptedFileUrl || "",
        encryptedFileName: encryptedFileName || ""
      };

      if (receiverSocketId) {
        io.to(receiverSocketId).emit('receiveMessage', outgoingPayload);
        
        // Notify the sender that it was delivered
        io.to(socket.id).emit('messageStatusUpdated', {
          messageId: _id,
          status: 'delivered'
        });
        io.to(socket.id).emit('messageDelivered', {
          messageId: _id,
          receiverId
        });
      }
    });

    // Listen for typing events
    socket.on('typing', async ({ senderId, receiverId }) => {
      console.log(`[Socket Server] typing event from ${senderId} to ${receiverId}`);
      try {
        const receiverDoc = await User.findById(receiverId).select('blockedUsers');
        const senderDoc = await User.findById(senderId).select('blockedUsers');
        if (receiverDoc?.blockedUsers?.map(id => id.toString()).includes(senderId.toString()) ||
            senderDoc?.blockedUsers?.map(id => id.toString()).includes(receiverId.toString())) {
          return;
        }
      } catch (e) {}
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('typing', { senderId });
      }
    });

    // Listen for stopTyping events
    socket.on('stopTyping', async ({ senderId, receiverId }) => {
      console.log(`[Socket Server] stopTyping event from ${senderId} to ${receiverId}`);
      try {
        const receiverDoc = await User.findById(receiverId).select('blockedUsers');
        const senderDoc = await User.findById(senderId).select('blockedUsers');
        if (receiverDoc?.blockedUsers?.map(id => id.toString()).includes(senderId.toString()) ||
            senderDoc?.blockedUsers?.map(id => id.toString()).includes(receiverId.toString())) {
          return;
        }
      } catch (e) {}
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('stopTyping', { senderId });
      }
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      console.log(`User Disconnected: ${socket.id}`);

      // Find and remove user from the online map
      let disconnectedUserId = null;
      for (const [userId, socketId] of Object.entries(userSocketMap)) {
        if (socketId === socket.id) {
          disconnectedUserId = userId;
          delete userSocketMap[userId];
          console.log(`User Disconnected: ${userId}`);
          break;
        }
      }

      if (disconnectedUserId) {
        try {
          const lastSeenDate = new Date();
          // Update MongoDB record
          await User.findByIdAndUpdate(disconnectedUserId, { lastSeen: lastSeenDate });
          
          // Broadcast updated online list and userOffline status
          io.emit('getOnlineUsers', Object.keys(userSocketMap));
          socket.broadcast.emit('userOffline', { userId: disconnectedUserId, lastSeen: lastSeenDate });
        } catch (err) {
          console.error("Error updating lastSeen on disconnect:", err);
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
