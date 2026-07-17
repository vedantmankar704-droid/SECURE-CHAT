# 🚀 Setup & Deployment Guide

## Installation & Setup

### Step 1: Navigate to Frontend Directory
```bash
cd d:\CHATTING APP\FRONTEND
```

### Step 2: Install Dependencies
All dependencies are already installed via npm, but to reinstall:
```bash
npm install
```

### Step 3: Start Development Server
```bash
npm run dev
```

The application will be available at: **http://localhost:5174**

## Available Scripts

### Development
```bash
npm run dev
```
Starts the Vite development server with hot module replacement (HMR).

### Build
```bash
npm run build
```
Creates an optimized production build in the `dist` folder.

### Preview
```bash
npm run preview
```
Previews the production build locally.

### Lint
```bash
npm run lint
```
Runs ESLint to check code quality.

## Testing the Application

### Default Login Credentials
- **Email**: any@email.com
- **Password**: any password

The login page is for demonstration purposes and accepts any email/password combination.

### Initial Page
The app starts at the Login page. You can:
1. Enter any email and password to login
2. Click "Sign up" to go to Register page
3. After successful login, you'll be redirected to the Dashboard

### Demo Data
The application includes pre-loaded dummy data:
- **9 sample conversations** in the sidebar
- **Sample messages** for conversations with ID 1 and 4
- Realistic user avatars, timestamps, and online statuses

## Features to Test

### 1. Messaging
- Click any conversation from the left sidebar
- Type a message in the input field
- Press Enter or click Send button
- Messages will appear on the right side
- Automatic response will come after 1.5 seconds

### 2. Search
- Use the search bar in the sidebar to find conversations
- Results filter in real-time

### 3. Dark Mode
- Click the menu icon (three horizontal lines) in sidebar
- Click "Dark Mode" toggle
- The entire app switches to dark theme

### 4. User Profile
- Select any conversation
- Click on the user avatar or name in the header
- Profile modal opens with user information

### 5. Settings
- Click menu in sidebar
- Click "Settings"
- Configure notifications, privacy, language, etc.

### 6. Profile Page
- Click menu in sidebar
- Click "Profile"
- View and edit your profile information

### 7. Responsive Design
- Resize your browser window
- On mobile-sized screens, the sidebar becomes a toggle menu
- Chat area takes full width on mobile

## Project Structure

```
d:\CHATTING APP\FRONTEND\
├── src/
│   ├── components/          # React components
│   ├── pages/               # Page components
│   ├── data/                # Dummy data (chats, messages)
│   ├── store/               # Zustand store for state management
│   ├── App.jsx              # Main app component
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
├── index.html               # HTML entry point
├── vite.config.js           # Vite configuration
├── tailwind.config.js       # Tailwind CSS configuration
├── postcss.config.js        # PostCSS configuration
├── package.json             # Dependencies
├── README.md                # Project documentation
└── SETUP_GUIDE.md          # This file
```

## Customization

### 1. Change App Logo
Edit `src/components/Sidebar.jsx` (line with emoji logo):
```jsx
<span className="text-white font-bold text-lg">💬</span>
// Replace 💬 with your logo or image
```

### 2. Modify Primary Color
Edit `tailwind.config.js`:
```javascript
colors: {
  primary: '#your-color-here',
}
```

### 3. Add Custom Conversations
Edit `src/data/chats.js`:
```javascript
export const chatsData = [
  {
    id: 10,
    name: 'Your New Chat',
    avatar: 'https://i.pravatar.cc/150?img=50',
    // ... other properties
  }
];
```

### 4. Add Custom Messages
Edit `src/data/messages.js`:
```javascript
export const messagesData = {
  10: [
    {
      id: 1,
      sender: 'User Name',
      content: 'Your message here',
      // ... other properties
    }
  ]
};
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Optimization

The application is optimized for performance:
- **Lazy loading** of components
- **Optimized animations** with Framer Motion
- **CSS minification** with Tailwind
- **Code splitting** with Vite
- **Smooth scrolling** and transitions

## Troubleshooting

### Port Already in Use
If port 5174 is already in use, Vite will automatically use the next available port (5175, 5176, etc.).

### Module Not Found Errors
Make sure all dependencies are installed:
```bash
npm install
```

### Tailwind Styles Not Applied
Clear browser cache (Ctrl+Shift+Delete) and refresh the page.

### Dev Server Won't Start
1. Check if Node.js is installed: `node --version`
2. Ensure you're in the FRONTEND directory
3. Delete `node_modules` folder and reinstall: `npm install`

## Building for Production

### Step 1: Create Production Build
```bash
npm run build
```
This creates optimized files in the `dist` folder.

### Step 2: Test Production Build
```bash
npm run preview
```
This simulates the production environment locally.

### Step 3: Deploy
Copy the contents of the `dist` folder to your web server or deployment platform:
- **Vercel**: Connect your GitHub repo
- **Netlify**: Drag and drop the `dist` folder
- **AWS S3**: Upload `dist` folder to S3 bucket
- **Traditional Hosting**: Upload via FTP/SFTP

## Environment Variables

Currently, the app doesn't require environment variables. To add them:

1. Create `.env` file in the root directory
2. Add variables: `VITE_API_URL=http://localhost:3000`
3. Access in code: `import.meta.env.VITE_API_URL`

## Git Integration

The project is ready for version control:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Chat Application"

# Add remote (replace with your repository URL)
git remote add origin https://github.com/yourusername/chat-app.git

# Push to remote
git push -u origin main
```

## Future Enhancements

Consider adding these features:

1. **Backend Integration**
   - Create API endpoints for authentication
   - Implement WebSocket for real-time messaging
   - Add database for persistent storage

2. **Authentication**
   - Real JWT token-based authentication
   - OAuth2 integration
   - Email verification

3. **Messaging Features**
   - File upload and sharing
   - Image preview and editing
   - Emoji picker integration
   - Message reactions
   - Message editing and deletion

4. **User Features**
   - User search
   - Add/remove contacts
   - User blocking
   - Profile picture upload
   - Last seen timestamp

5. **Advanced Features**
   - Group chats
   - Message search
   - Message encryption
   - Read status indicators
   - Message forwarding

## Support & Documentation

For more information about the technologies used:
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Framer Motion Documentation](https://www.framer.com/motion)
- [Zustand Documentation](https://github.com/pmndrs/zustand)

## Notes

- All data is currently stored locally in JSON format
- No backend is currently integrated
- The app is fully functional for demonstration purposes
- All features are production-ready for UI/UX
- The application follows modern React best practices
- Code is well-organized and scalable

---

**Last Updated**: July 2024
**Version**: 1.0.0
