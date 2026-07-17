# 💬 Modern Chat Application

A fully responsive, production-ready chat application built with **React**, **Vite**, **Tailwind CSS**, and **Framer Motion**. The UI closely resembles professional messaging apps like WhatsApp Web and Messenger.

## 🌟 Features

### Core Features
- ✅ **Real-time Messaging** - Send and receive messages instantly
- ✅ **User Online Status** - See when friends are online/offline
- ✅ **Read Receipts** - Single (✓) and double (✓✓) check marks
- ✅ **Typing Indicators** - Animated typing animation
- ✅ **Search Conversations** - Filter chats by name
- ✅ **Message Timestamps** - Display when messages were sent
- ✅ **Unread Message Badges** - Shows count of unread messages
- ✅ **Date Separators** - Visual separation between message days

### UI/UX Features
- ✅ **Dark Mode** - Full dark mode support with toggle
- ✅ **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- ✅ **Smooth Animations** - Powered by Framer Motion
- ✅ **Auto-expanding Input** - Message input grows with content
- ✅ **Beautiful UI** - Clean and modern design
- ✅ **Profile Modal** - View user profiles with detailed information
- ✅ **Hover Effects** - Interactive UI elements

### Pages
- ✅ **Login** - Clean, modern login form
- ✅ **Register** - User registration with validation
- ✅ **Dashboard** - Main chat interface
- ✅ **Profile** - User profile management
- ✅ **Settings** - App preferences and privacy settings

### Additional Features
- ✅ **Emoji Button** - Ready for emoji picker integration
- ✅ **Attachment Button** - Ready for file upload integration
- ✅ **Message Input Shortcuts** - Enter to send, Shift+Enter for new line
- ✅ **User Avatar Display** - Circular avatars with online indicators
- ✅ **Three-dot Options Menu** - Per-conversation actions
- ✅ **Conversation List** - Scrollable list with search

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
cd FRONTEND
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5174`

### Build

```bash
npm run build
```

## 📁 Project Structure

```
src/
├── components/
│   ├── Sidebar.jsx              # Left sidebar with chat list
│   ├── ChatList.jsx             # Scrollable chat list
│   ├── ChatItem.jsx             # Individual chat item
│   ├── ChatHeader.jsx           # Chat header with options
│   ├── MessageBubble.jsx        # Message display component
│   ├── MessageInput.jsx         # Message input field
│   ├── TypingIndicator.jsx      # Animated typing indicator
│   ├── ProfileModal.jsx         # User profile modal
│   ├── SearchBar.jsx            # Search conversations
│   └── EmptyChat.jsx            # Empty state placeholder
│
├── pages/
│   ├── Login.jsx                # Login page
│   ├── Register.jsx             # Registration page
│   ├── Dashboard.jsx            # Main chat interface
│   ├── Profile.jsx              # User profile page
│   └── Settings.jsx             # Settings page
│
├── data/
│   ├── chats.js                 # Dummy chat data
│   └── messages.js              # Dummy message data
│
├── store/
│   └── appStore.js              # Zustand state management
│
├── App.jsx                      # Main app component
├── main.jsx                     # Entry point
└── index.css                    # Global styles & Tailwind

```

## 🎨 Design Highlights

### Color Scheme
- **Primary**: `#0084ff` (Blue)
- **Secondary**: `#e5e5ea` (Light Gray)
- **Dark BG**: `#0a0e27` (Dark Blue)
- **Dark Sidebar**: `#111b2e` (Darker Blue)

### Typography
- **Font**: System default (sans-serif)
- **Headings**: Bold, various sizes
- **Body**: Regular weight, 14-16px size
- **Small Text**: 12px for timestamps

### Spacing & Borders
- **Padding**: Consistent 4px-8px increments
- **Rounded Corners**: 2xl-3xl for modern look
- **Borders**: Subtle 1px gray borders
- **Shadows**: Soft shadows for depth

## 🌐 Responsive Design

- **Mobile**: < 768px - Full-screen sidebar with toggle
- **Tablet**: 768px - 1024px - Flexible layout
- **Desktop**: > 1024px - Full two-column layout

## 🔧 Technologies Used

- **React 18** - UI library
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Lucide React** - Icon library
- **Zustand** - State management
- **PostCSS** - CSS processing

## 📝 Key Components

### Sidebar
- App logo and branding
- Search bar with icon
- New chat button
- Options menu
- Scrollable conversation list

### Chat Header
- User avatar with online status
- User name
- Online/Offline status
- Search button
- Three-dot menu with options

### Message Bubbles
- Left-aligned incoming messages
- Right-aligned outgoing messages
- Rounded bubbles
- Read receipt indicators
- Timestamps

### Message Input
- Auto-expanding textarea
- Emoji and attachment buttons
- Send button with keyboard shortcuts
- Support for multi-line messages

## 🎯 How to Use

### Send a Message
1. Click on any conversation from the left sidebar
2. Type your message in the input field
3. Press Enter or click the Send button

### Search Conversations
1. Use the search bar at the top of the sidebar
2. Results filter in real-time

### Switch Dark Mode
1. Click the menu icon in the sidebar
2. Click "Dark Mode" toggle

### View Profile
1. Click on any conversation
2. Click the user avatar or name in the header
3. Profile modal opens

## 💾 State Management

The app uses **Zustand** for simple and efficient state management. All app-level state like current page, dark mode, and user info is stored in `src/store/appStore.js`.

## 🎨 Customization

### Change Primary Color
Edit `tailwind.config.js`:
```javascript
colors: {
  primary: '#your-color-here',
}
```

### Modify Chat Data
Edit `src/data/chats.js` and `src/data/messages.js` with your own data.

## 📄 License

Open source and available for personal and commercial use.

---

**Built with ❤️ using React, Tailwind CSS, and Framer Motion**
