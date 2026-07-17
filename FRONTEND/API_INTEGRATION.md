# 🔌 Backend Integration Guide

This guide explains how to integrate a real backend API with the chat application.

## Overview

Currently, the application uses dummy/mock data stored in JSON files. To connect to a real backend, follow this guide to implement API endpoints and integrate them with the frontend.

## Recommended Backend Setup

### Technology Stack
- **Framework**: Node.js + Express or Django/FastAPI
- **Database**: MongoDB, PostgreSQL, or Firebase
- **Real-time**: WebSocket (Socket.io or ws)
- **Authentication**: JWT tokens
- **Deployment**: Heroku, AWS, DigitalOcean, or Railway

## API Endpoints Required

### Authentication Endpoints

#### POST /api/auth/register
Register a new user.

```javascript
// Request
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}

// Response (201)
{
  "success": true,
  "user": {
    "id": "user123",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": "https://..."
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### POST /api/auth/login
Login user.

```javascript
// Request
{
  "email": "john@example.com",
  "password": "securePassword123"
}

// Response (200)
{
  "success": true,
  "user": {
    "id": "user123",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": "https://...",
    "status": "online"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### POST /api/auth/logout
Logout user.

```javascript
// Request (requires Authorization header)
// Authorization: Bearer <token>

// Response (200)
{
  "success": true,
  "message": "Logged out successfully"
}
```

### User Endpoints

#### GET /api/users/:id
Get user profile.

```javascript
// Response (200)
{
  "id": "user123",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "avatar": "https://...",
  "bio": "Hello there! 👋",
  "status": "online",
  "lastSeen": "2024-07-16T10:30:00Z"
}
```

#### PUT /api/users/:id
Update user profile.

```javascript
// Request
{
  "name": "John Doe Updated",
  "phone": "+1234567890",
  "bio": "Updated bio"
}

// Response (200)
{
  "success": true,
  "user": { /* updated user object */ }
}
```

### Chat/Conversation Endpoints

#### GET /api/chats
Get all conversations for logged-in user.

```javascript
// Response (200)
{
  "success": true,
  "chats": [
    {
      "id": "chat1",
      "name": "Jane Cooper",
      "avatar": "https://...",
      "lastMessage": "See you soon!",
      "timestamp": "2024-07-16T10:30:00Z",
      "unread": 3,
      "isOnline": true,
      "participants": ["user123", "user456"]
    }
    // ... more chats
  ]
}
```

#### GET /api/chats/:id
Get specific conversation with all messages.

```javascript
// Response (200)
{
  "success": true,
  "chat": {
    "id": "chat1",
    "name": "Jane Cooper",
    "avatar": "https://...",
    "isOnline": true,
    "messages": [
      {
        "id": "msg1",
        "sender": "user123",
        "content": "Hi there!",
        "timestamp": "2024-07-16T10:00:00Z",
        "read": true,
        "avatar": "https://..."
      }
      // ... more messages
    ]
  }
}
```

#### POST /api/chats
Create new conversation.

```javascript
// Request
{
  "participantIds": ["user456"]
}

// Response (201)
{
  "success": true,
  "chat": { /* new chat object */ }
}
```

#### DELETE /api/chats/:id
Delete conversation.

```javascript
// Response (200)
{
  "success": true,
  "message": "Chat deleted successfully"
}
```

### Message Endpoints

#### POST /api/messages
Send a message.

```javascript
// Request
{
  "chatId": "chat1",
  "content": "Hello!",
  "type": "text" // text, image, file
}

// Response (201)
{
  "success": true,
  "message": {
    "id": "msg1",
    "sender": "user123",
    "content": "Hello!",
    "timestamp": "2024-07-16T10:00:00Z",
    "read": false,
    "avatar": "https://..."
  }
}
```

#### PUT /api/messages/:id
Mark message as read.

```javascript
// Request
{
  "read": true
}

// Response (200)
{
  "success": true,
  "message": { /* updated message */ }
}
```

#### DELETE /api/messages/:id
Delete message.

```javascript
// Response (200)
{
  "success": true,
  "message": "Message deleted successfully"
}
```

## Frontend Implementation

### Step 1: Create API Service

Create `src/services/api.js`:

```javascript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Step 2: Create API Hooks

Create `src/hooks/useAuth.js`:

```javascript
import { useState } from 'react';
import api from '../services/api';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const register = async (fullName, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/register', {
        fullName,
        email,
        password
      });
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { register, login, loading, error };
};
```

Create `src/hooks/useChats.js`:

```javascript
import { useState, useEffect } from 'react';
import api from '../services/api';

export const useChats = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      const response = await api.get('/chats');
      setChats(response.data.chats);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getChat = async (chatId) => {
    try {
      const response = await api.get(`/chats/${chatId}`);
      return response.data.chat;
    } catch (err) {
      setError(err.message);
    }
  };

  return { chats, loading, error, fetchChats, getChat };
};
```

### Step 3: Update Store

Update `src/store/appStore.js`:

```javascript
import { create } from 'zustand';

export const useAppStore = create((set) => ({
  currentPage: 'login',
  darkMode: false,
  currentUser: null,
  token: localStorage.getItem('token') || null,
  chats: [],
  loading: false,

  setCurrentUser: (user) => set({ currentUser: user }),
  setToken: (token) => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
    set({ token });
  },
  setChats: (chats) => set({ chats }),
  setLoading: (loading) => set({ loading }),
  navigateTo: (page) => set({ currentPage: page }),
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode }))
}));
```

### Step 4: Update Login Component

Update `src/pages/Login.jsx`:

```javascript
import { useAuth } from '../hooks/useAuth';
import { useAppStore } from '../store/appStore';

const Login = ({ onNavigate }) => {
  const { login, loading, error } = useAuth();
  const { setCurrentUser, setToken, navigateTo } = useAppStore();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const result = await login(email, password);
      setCurrentUser(result.user);
      setToken(result.token);
      navigateTo('dashboard');
    } catch (err) {
      // Error is already set in hook
    }
  };

  return (
    // ... rest of component
  );
};
```

### Step 5: Update Dashboard

Update `src/pages/Dashboard.jsx`:

```javascript
import { useChats } from '../hooks/useChats';
import { useEffect } from 'react';

const Dashboard = () => {
  const { chats, loading, getChat } = useChats();
  const [selectedChat, setSelectedChat] = useState(null);

  useEffect(() => {
    // Load chat messages when selected
    if (selectedChat) {
      loadChatMessages();
    }
  }, [selectedChat]);

  const loadChatMessages = async () => {
    const chat = await getChat(selectedChat.id);
    setSelectedChat(chat);
  };

  return (
    // ... rest of component
  );
};
```

## WebSocket Integration (Real-time Messaging)

### Setup Socket.io

```javascript
// src/services/socket.js
import io from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

export const socket = io(SOCKET_URL, {
  auth: {
    token: localStorage.getItem('token')
  }
});

// Listen for messages
socket.on('new_message', (message) => {
  // Update state with new message
});

// Listen for typing
socket.on('user_typing', (data) => {
  // Show typing indicator
});

// Emit send message
export const sendMessage = (chatId, content) => {
  socket.emit('send_message', { chatId, content });
};

export const emitTyping = (chatId) => {
  socket.emit('typing', { chatId });
};
```

### Use Socket in Dashboard

```javascript
import { socket, sendMessage, emitTyping } from '../services/socket';
import { useEffect } from 'react';

const Dashboard = () => {
  useEffect(() => {
    // Listen for new messages
    socket.on('new_message', (message) => {
      setMessages(prev => ({
        ...prev,
        [message.chatId]: [...(prev[message.chatId] || []), message]
      }));
    });

    return () => socket.off('new_message');
  }, []);

  const handleSendMessage = (content) => {
    sendMessage(selectedChat.id, content);
  };

  const handleTyping = () => {
    emitTyping(selectedChat.id);
  };

  return (
    // ... component
  );
};
```

## Environment Variables

Create `.env` file:

```
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

For production:

```
VITE_API_URL=https://api.yourdomain.com/api
VITE_SOCKET_URL=https://yourdomain.com
```

## Error Handling

```javascript
// Global error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message;
    
    // Handle specific errors
    if (error.response?.status === 401) {
      // Unauthorized
    } else if (error.response?.status === 403) {
      // Forbidden
    } else if (error.response?.status === 404) {
      // Not found
    } else if (error.response?.status === 500) {
      // Server error
    }
    
    return Promise.reject(error);
  }
);
```

## Testing the API

### Using Postman

1. Create new requests for each endpoint
2. Set Authorization header: `Bearer <token>`
3. Test request/response flow
4. Export collection for documentation

### Using cURL

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"John","email":"john@example.com","password":"pass123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"pass123"}'

# Get chats
curl -X GET http://localhost:3000/api/chats \
  -H "Authorization: Bearer <token>"
```

## Deployment Checklist

- [ ] Environment variables configured
- [ ] API URL updated for production
- [ ] CORS enabled on backend
- [ ] SSL/HTTPS enabled
- [ ] API rate limiting implemented
- [ ] Error handling tested
- [ ] Token refresh mechanism implemented
- [ ] WebSocket connection tested
- [ ] Database migrations run
- [ ] API documentation created
- [ ] Load testing completed
- [ ] Security audit performed

## Common Issues & Solutions

### CORS Error
```javascript
// Backend (Express)
const cors = require('cors');
app.use(cors({
  origin: 'https://yourdomain.com',
  credentials: true
}));
```

### Token Expired
Implement token refresh:
```javascript
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try to refresh token
      const refreshToken = localStorage.getItem('refreshToken');
      // ... refresh logic
    }
    return Promise.reject(error);
  }
);
```

### WebSocket Connection Issues
```javascript
// Reconnect on disconnect
socket.on('disconnect', () => {
  setTimeout(() => socket.connect(), 3000);
});
```

## Resources

- [Axios Documentation](https://axios-http.com/)
- [Socket.io Documentation](https://socket.io/)
- [JWT Authentication](https://jwt.io/)
- [REST API Best Practices](https://restfulapi.net/)

---

**Note**: Always follow security best practices when handling authentication and sensitive data.
