# 🔒 Secure Chat Application

A modern, full-stack, real-time end-to-end encrypted messaging web application built with **React**, **Node.js**, **Express**, **MongoDB**, and **Socket.IO**. Designed with modern aesthetics, dark mode support, friend discovery, loading skeletons, and AES message encryption.

---

## 🌟 Key Features

### 🔐 Security & Encryption
- **AES Message Encryption** (`crypto-js`): Messages, image captions, and file captions are encrypted before being saved to MongoDB (`U2FsdGVkX1...`) and decrypted automatically for display.
- **JWT Authentication & Security Headers**: Secure authentication tokens with persistent storage, `bcryptjs` password hashing, `helmet` security headers, and express rate-limiting.

### 👥 Friend Request System & User Discovery
- **User Discovery**: Search registered users by username or display name.
- **Request Lifecycle**: Send friend requests, receive real-time notifications via Socket.IO, and accept or decline incoming requests.
- **Privacy Enforcement**: Chatting is only unlocked after mutual friendship acceptance.

### 💬 Real-Time Messaging & Media Sharing
- **Instant Messaging**: Low-latency bidirectional messaging powered by Socket.IO.
- **Read Receipts & Delivery Status**: Track message states (`sent`, `delivered`, `seen`) in real time.
- **Typing Indicators**: Real-time animated typing indicator showing when a contact is typing.
- **Emoji Reactions**: Add and toggle emoji reactions on individual messages.
- **Media & File Attachments**: Upload and send images, documents, and files with previews.
- **Replying & Forwarding**: Reply to specific messages and forward messages to other friends.

### 🎨 Modern UI & Loading Skeletons
- **Tailwind CSS Shimmer Skeletons**: Reusable loading skeletons for chats list (`ChatListSkeleton`), message bubbles (`MessageSkeleton`), user discovery (`Requests`), and user profiles (`ProfileSkeleton`).
- **Responsive Layout**: Seamless experience across mobile, tablet, and desktop devices.
- **Dark Mode Support**: Vibrant light mode and polished dark mode themes.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS v4 + Framer Motion
- **Icons**: Lucide React + React Icons
- **Real-Time**: Socket.IO Client
- **State Management**: Zustand
- **Encryption**: Crypto-JS (AES)

### Backend
- **Runtime**: Node.js + Express
- **Database**: MongoDB + Mongoose
- **Real-Time**: Socket.IO
- **Security**: Helmet, Rate Limiter, BcryptJS, JSONWebToken
- **File Uploads**: Multer
- **Encryption**: Crypto-JS (AES)

---

## 📁 Project Structure

```text
SECURE-CHAT/
├── BACKEND/
│   ├── config/            # Database connection configuration
│   ├── controllers/       # Auth, User, Friend, and Message controllers
│   ├── models/            # Mongoose schemas (User, Message, Chat, FriendRequest)
│   ├── routes/            # Express API routes
│   ├── socket/            # Socket.IO event handlers
│   ├── uploads/           # Uploaded avatars and chat attachments
│   ├── utils/             # AES encryption utility functions
│   ├── .env               # Environment variables (git-ignored)
│   └── server.js          # Express server entry point
│
└── FRONTEND/
    ├── public/            # Static assets
    ├── src/
    │   ├── components/    # Reusable UI & Skeleton components
    │   ├── pages/         # Dashboard, Requests, Settings, Login, Register, Welcome
    │   ├── routes/        # App routing
    │   ├── socket/        # Socket.IO client instance
    │   ├── store/         # Zustand global app store
    │   └── utils/         # Frontend AES encryption helpers
    ├── .env               # Vite environment variables (git-ignored)
    └── vite.config.js     # Vite configuration
```

---

## 🚀 Installation & Setup Guide

### 1. Prerequisites
- **Node.js**: v18 or higher
- **MongoDB**: Local MongoDB instance (`mongodb://localhost:27017`) or MongoDB Atlas URI.

### 2. Clone Repository
```bash
git clone https://github.com/vedantmankar704-droid/SECURE-CHAT.git
cd SECURE-CHAT
```

### 3. Backend Setup
```bash
cd BACKEND
npm install
```

Create a `.env` file in `BACKEND`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/secure-chat
JWT_SECRET=your_jwt_secret_key_here
ENCRYPTION_SECRET=your_aes_secret_key_here
```

Start the backend dev server:
```bash
npm run dev
```

### 4. Frontend Setup
Open a new terminal window:
```bash
cd FRONTEND
npm install
```

Create a `.env` file in `FRONTEND`:
```env
VITE_ENCRYPTION_SECRET=your_aes_secret_key_here
```

Start the frontend dev server:
```bash
npm run dev
```

The application will run locally at `http://localhost:5173` (or `http://localhost:5174`).

---

## 🔐 Environment Variables

| Variable | Description | Location |
|---|---|---|
| `PORT` | Backend server port (Default: `5000`) | `BACKEND/.env` |
| `MONGODB_URI` | MongoDB connection string | `BACKEND/.env` |
| `JWT_SECRET` | Secret key for signing JWT tokens | `BACKEND/.env` |
| `ENCRYPTION_SECRET` | Secret key for AES message encryption | `BACKEND/.env` |
| `VITE_ENCRYPTION_SECRET` | Secret key for client-side AES decryption fallback | `FRONTEND/.env` |

---

## 🔮 Future Improvements

- [ ] Voice & Video Calling via WebRTC
- [ ] Group Messaging & Channels
- [ ] Audio Voice Notes Recording & Playback
- [ ] Message Search indexing across all conversations

---

## 📄 License

This project is open-source under the MIT License.
