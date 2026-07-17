# ⚡ Quick Start Guide

Get up and running with the Chat Application in 5 minutes!

## Prerequisites

- Node.js v16+ installed
- npm or yarn package manager

## Installation (1 minute)

```bash
cd FRONTEND
npm install
```

## Start Development (1 minute)

```bash
npm run dev
```

Visit: **http://localhost:5174**

## Login (1 minute)

- **Email**: anything@example.com
- **Password**: anything

The demo accepts any credentials.

## Try the Features (2 minutes)

### 1. **Send a Message**
1. Click any conversation in the left sidebar
2. Type a message in the input field
3. Press Enter or click Send
4. Watch the automatic reply appear!

### 2. **Search Conversations**
1. Type in the search bar at the top
2. Results filter instantly

### 3. **Dark Mode**
1. Click menu button (☰) in sidebar
2. Toggle "Dark Mode"
3. Entire app switches theme!

### 4. **View Profile**
1. Select a conversation
2. Click the user's avatar in the header
3. Profile modal pops up

### 5. **Settings**
1. Click menu button (☰)
2. Click "Settings"
3. Configure app preferences

## Project Structure at a Glance

```
src/
├── components/     # UI components (buttons, messages, etc)
├── pages/          # Full pages (login, dashboard, etc)
├── data/           # Dummy chat & message data
├── store/          # App state management
└── App.jsx         # Main app file
```

## Key Files

| File | Purpose |
|------|---------|
| `src/App.jsx` | Main router & app logic |
| `src/pages/Dashboard.jsx` | Chat interface |
| `src/components/MessageInput.jsx` | Message sending |
| `src/data/chats.js` | Sample conversations |
| `tailwind.config.js` | Design configuration |

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Enter | Send message |
| Shift + Enter | New line in message |
| Tab | Navigate elements |

## Customize in 2 Minutes

### Change Primary Color
Edit `tailwind.config.js` line 6:
```javascript
primary: '#your-color-here',
```

### Change App Logo
Edit `src/components/Sidebar.jsx` line 11:
```jsx
<span className="text-white font-bold text-lg">YOUR_EMOJI</span>
```

### Add More Conversations
Edit `src/data/chats.js`:
```javascript
{
  id: 10,
  name: 'New Chat',
  avatar: 'https://i.pravatar.cc/150?img=10',
  lastMessage: 'Hello!',
  // ... other properties
}
```

## Build for Production

```bash
npm run build
```

Output: `dist/` folder (ready to deploy)

## Deploy (Choose One)

### Vercel
```bash
npm install -g vercel
vercel
```

### Netlify
Drag & drop `dist` folder to [netlify.com](https://netlify.com)

### Traditional Server
Upload contents of `dist/` folder via FTP

## Troubleshooting

### Port 5174 Already in Use?
Vite will automatically try 5175, 5176, etc.

### Styles Not Loading?
Clear browser cache: `Ctrl+Shift+Delete`

### Dependencies Error?
Reinstall:
```bash
rm -rf node_modules
npm install
```

## Need More Help?

- **Setup Guide**: See `SETUP_GUIDE.md`
- **Features**: See `FEATURES.md`
- **Backend Integration**: See `API_INTEGRATION.md`
- **Full Documentation**: See `README.md`

## What's Included?

✅ 9 sample conversations  
✅ Sample messages  
✅ All pages (login, register, profile, settings)  
✅ Dark mode  
✅ Responsive design  
✅ Smooth animations  
✅ Message types (text, images, files - ready for integration)  
✅ Typing indicators  
✅ Read receipts  
✅ Online status  
✅ Search functionality  

## Next Steps

1. ✅ Get it running (`npm run dev`)
2. 📱 Test responsive design (resize browser)
3. 🌙 Try dark mode
4. ✏️ Customize colors and logo
5. 💾 Build for production (`npm run build`)
6. 🚀 Deploy to the web
7. 🔌 **(Optional)** Integrate with real backend

## Useful Commands

```bash
# Start development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Install a new package
npm install package-name
```

## Stack Overview

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + Vite |
| **Styling** | Tailwind CSS |
| **Animation** | Framer Motion |
| **Icons** | Lucide React |
| **State** | Zustand |
| **Build Tool** | Vite |

## File Sizes (Production)

- **Total**: ~82KB (gzipped)
- **React**: ~41KB
- **Tailwind**: ~15KB
- **Framer Motion**: ~26KB

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers

---

**Need a real backend?** See `API_INTEGRATION.md` for complete guide!

**Happy coding! 🚀**
