const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');
const friendRoutes = require('./routes/friendRoutes');
const { initSocket } = require('./socket/socket');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
  console.log('📁 Created uploads directory');
}

// Create HTTP Server
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Rate limiting setup
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: {
    success: false,
    message: "Too many requests, please try again later"
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Recursively sanitize strings to prevent XSS/HTML injections
const sanitizeInput = (data) => {
  if (typeof data === 'string') {
    return data.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  if (Array.isArray(data)) {
    return data.map(sanitizeInput);
  }
  if (data !== null && typeof data === 'object') {
    const sanitizedObj = {};
    for (const key in data) {
      sanitizedObj[key] = sanitizeInput(data[key]);
    }
    return sanitizedObj;
  }
  return data;
};

const xssSanitizer = (req, res, next) => {
  if (req.body) req.body = sanitizeInput(req.body);
  if (req.query) req.query = sanitizeInput(req.query);
  if (req.params) req.params = sanitizeInput(req.params);
  next();
};

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: false
}));
app.use(cors());
app.use(express.json());
app.use(xssSanitizer);
app.use('/api/', limiter);
app.use('/uploads', express.static(uploadsDir));


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/friends', friendRoutes);

// Test Route
app.get('/', (req, res) => {
  res.json({
    message: "Secure Chat Backend Running"
  });
});

// Start Server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
