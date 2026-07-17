# 📚 Feature Documentation

## Table of Contents
1. [Authentication](#authentication)
2. [Messaging](#messaging)
3. [User Interface](#user-interface)
4. [Responsiveness](#responsiveness)
5. [Animations](#animations)
6. [Dark Mode](#dark-mode)

---

## Authentication

### Login Page
**Location**: `src/pages/Login.jsx`

**Features**:
- Clean, modern form design
- Email and password input fields
- "Show/Hide" password toggle
- "Remember me" checkbox
- Forgot password link
- Social login button (Google)
- Link to sign up page
- Form validation
- Loading state during submission

**Keyboard Shortcuts**:
- Tab: Navigate between fields
- Enter: Submit form

**Styling**:
- Gradient background (Blue to Indigo)
- Centered card layout
- Smooth animations on load
- Hover effects on buttons
- Focus states on inputs

### Register Page
**Location**: `src/pages/Register.jsx`

**Features**:
- Full name input
- Email input with validation
- Password input with strength indicator
- Confirm password verification
- Terms & Conditions checkbox
- Link to privacy policy
- Back to login link
- Social signup button
- Form validation

**Validation**:
- Email format validation
- Password match verification
- Required field checking
- Real-time error feedback

---

## Messaging

### Sending Messages
**Location**: `src/components/MessageInput.jsx`

**Features**:
- Auto-expanding textarea
- Emoji button (placeholder)
- Attachment button (placeholder)
- Send button with visual feedback
- Auto-clear after sending
- Keyboard shortcuts

**Keyboard Shortcuts**:
- **Enter**: Send message
- **Shift + Enter**: New line in message
- **Tab**: Navigate to next element

**Input Behavior**:
- Textarea grows automatically (max 120px)
- Min height: 24px
- Disabled send button when empty
- Visual feedback on button hover/click

### Message Display
**Location**: `src/components/MessageBubble.jsx`

**Features**:
- Incoming messages align left
- Outgoing messages align right
- Rounded bubble shape (border-radius: 2xl/3xl)
- Message timestamp below text
- Read receipts (✓ single check, ✓✓ double check)
- Avatar display for incoming messages
- Smooth fade-in animation

**Message Types Supported**:
- Text messages
- Image messages (preview placeholder)
- File attachments (preview placeholder)

**Styling**:
- Incoming: Light gray bubble (#f3f4f6) with dark text
- Outgoing: Blue bubble (#0084ff) with white text
- Timestamp: Small gray text (12px)
- Read receipts: Small icons next to timestamp

### Typing Indicator
**Location**: `src/components/TypingIndicator.jsx`

**Features**:
- Three animated dots
- Smooth pulsing animation
- Simulates typing behavior
- Appears when waiting for response
- Auto-disappears after response

**Animation**:
- Duration: 1.4 seconds
- Opacity animation (0.5 to 1)
- Sequential dot animation with delays (0s, 0.2s, 0.4s)

---

## User Interface

### Sidebar
**Location**: `src/components/Sidebar.jsx`

**Components**:
1. **Header**
   - App logo and name
   - New chat button (+ icon)
   - Menu button (hamburger icon)

2. **Search Bar**
   - Icon on left
   - Rounded corners
   - Placeholder text
   - Real-time filtering

3. **Tabs**
   - "All" tab showing total conversations
   - "Unread" tab showing unread count

4. **Chat List**
   - Scrollable area
   - Individual chat items

5. **Menu Options**
   - Profile
   - Settings
   - Dark Mode toggle
   - Logout

**Responsive Behavior**:
- Desktop: Always visible (width: 320px)
- Mobile: Toggleable with menu button
- Overlay effect on mobile

### Chat Item
**Location**: `src/components/ChatItem.jsx`

**Elements**:
1. **Avatar**
   - Circular image (48px)
   - Online indicator dot (green circle bottom-right)

2. **User Info**
   - User name (bold, truncated)
   - Last message preview (truncated)
   - Timestamp (right-aligned)

3. **Status Indicators**
   - Online/Offline dot (green or gray)
   - Unread badge (blue circle with count)

4. **Interactions**
   - Hover: Subtle background change
   - Click: Select chat, update header
   - Active state: Light blue background

### Chat Header
**Location**: `src/components/ChatHeader.jsx`

**Elements**:
1. **User Avatar**
   - Circular (40px)
   - Online indicator dot
   - Clickable to open profile

2. **User Info**
   - Name (large, bold)
   - Status (Online/Offline, small text)

3. **Action Buttons**
   - Search button (magnifying glass)
   - More options button (three dots)
   - Close button (mobile only)

4. **Options Menu**
   - View Contact
   - Mute Notifications
   - Delete Chat
   - Close on selection

**Interactions**:
- Click avatar/name: Open profile modal
- Click search: Show search bar in messages (placeholder)
- Click options: Toggle menu

### Profile Modal
**Location**: `src/components/ProfileModal.jsx`

**Sections**:
1. **Header**
   - Close button
   - "Profile" title

2. **User Avatar**
   - Large circular image (96px)
   - Camera icon overlay
   - Shadow effect

3. **User Info**
   - Name (large)
   - Online/Offline status

4. **Contact Details**
   - Email
   - Phone number
   - Status

5. **Action Buttons**
   - Message button (blue)
   - Block button (gray)

**Styling**:
- Modal overlay (semi-transparent black)
- Centered card
- Smooth fade-in animation
- Click outside to close

### Empty Chat
**Location**: `src/components/EmptyChat.jsx`

**Display**:
- Large message icon
- "Select a conversation" text
- Helpful subtitle
- Centered layout
- Smooth fade-in animation

---

## Search

### Sidebar Search
**Location**: `src/components/SearchBar.jsx`

**Features**:
- Real-time filtering
- Case-insensitive search
- Search by user name
- Clears results when query is empty
- Search icon on left
- Rounded pill shape

**Behavior**:
- Types: Filters chat list instantly
- No results message displayed

---

## Pages

### Dashboard
**Location**: `src/pages/Dashboard.jsx`

**Layout**:
- Two-column on desktop (30% sidebar, 70% chat)
- Full-width on mobile with togglable sidebar
- Sticky header on mobile

**Components**:
- Sidebar (left)
- Chat Header (top of right)
- Messages area (middle of right)
- Message Input (bottom of right)

**States**:
- Loading: Messages load smoothly
- Empty: Shows "Select a conversation"
- Active: Displays messages and input

### Profile Page
**Location**: `src/pages/Profile.jsx`

**Sections**:
1. **Header Gradient**
   - Title
   - Back button

2. **Profile Picture Section**
   - Large avatar (96px)
   - Camera upload button

3. **Account Information**
   - Full Name (editable)
   - Email (editable)
   - Phone (editable)
   - Bio (editable)
   - Edit/Save toggle button

4. **Danger Zone**
   - Delete Account button
   - Warning message
   - Red color scheme

**Features**:
- Edit mode toggle
- Form validation
- Smooth transitions
- Responsive layout

### Settings Page
**Location**: `src/pages/Settings.jsx`

**Sections**:

1. **Notifications**
   - Push Notifications toggle
   - Email Notifications toggle
   - Read Receipts toggle
   - Typing Indicator toggle
   - Last Seen toggle

2. **Privacy & Security**
   - Who can message you (radio buttons)
   - Two-Factor Authentication toggle
   - Change Password button

3. **App Preferences**
   - Language selector
   - Theme selector (Light/Dark/Auto)

4. **About**
   - Version number
   - Last Updated date
   - Build number

5. **Logout**
   - Full-width logout button
   - Red color scheme

---

## Responsiveness

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Mobile Behavior (< 768px)
- Sidebar becomes full-screen overlay
- Toggle button in header
- Chat takes full width when sidebar closed
- Larger touch targets (at least 44px)
- Stack layout for forms

### Tablet Behavior (768px - 1024px)
- Sidebar visible but narrower
- Chat area remains accessible
- Flexible grid layouts

### Desktop Behavior (> 1024px)
- Full two-column layout
- Sidebar always visible (320px)
- Chat area (70%)
- Hover effects enabled
- Context menus available

---

## Animations

### Framer Motion Animations

**Component Entrance**:
```javascript
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.5 }}
```

**Message Bubble**:
```javascript
initial={{ opacity: 0, y: 10 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.3 }}
```

**Chat Item Hover**:
```javascript
whileHover={{ x: 5 }}
whileTap={{ scale: 0.98 }}
```

**Button Press**:
```javascript
whileHover={{ scale: 1.1 }}
whileTap={{ scale: 0.95 }}
```

**Notification Badge**:
```javascript
initial={{ scale: 0 }}
animate={{ scale: 1 }}
```

**Modal**:
```javascript
initial={{ scale: 0.9, opacity: 0 }}
animate={{ scale: 1, opacity: 1 }}
exit={{ scale: 0.9, opacity: 0 }}
```

---

## Dark Mode

### Implementation
**Location**: `src/store/appStore.js`

**Activation**:
- Toggle button in sidebar menu
- Saves to Zustand store
- Applied via `className={darkMode ? 'dark' : ''}`
- All components support dark mode

### Color Changes

**Light Mode**:
- Background: White (#ffffff)
- Text: Dark gray (#1f2937)
- Sidebar: White with subtle gray border
- Messages: Light gray inbox, blue outbox

**Dark Mode**:
- Background: Dark blue (#0a0e27)
- Sidebar: Darker blue (#111b2e)
- Text: White
- Messages: Dark gray inbox, blue outbox
- Reduced opacity for borders

### Tailwind Classes
```
dark:bg-darkBg
dark:bg-gray-800
dark:text-white
dark:border-gray-700
```

---

## State Management

### Zustand Store
**Location**: `src/store/appStore.js`

**States**:
- `currentPage`: Current active page
- `darkMode`: Dark mode toggle state
- `currentUser`: User information

**Actions**:
- `navigateTo(page)`: Navigate to page
- `toggleDarkMode()`: Toggle dark mode
- `updateCurrentUser(user)`: Update user info

---

## Accessibility

### Keyboard Navigation
- Tab: Navigate elements
- Enter: Submit forms, send messages
- Shift+Enter: New line in message input
- Escape: Close modals (future feature)

### ARIA Labels
- All buttons have descriptive labels
- Form inputs have associated labels
- Images have alt text
- Semantic HTML structure

### Focus States
- Visible focus rings on all interactive elements
- High contrast focus styles
- Clear visual feedback

---

## Performance

### Optimization Techniques
- Component code splitting
- Lazy component loading
- Optimized re-renders
- CSS minification with Tailwind
- Smooth 60fps animations
- Efficient state management with Zustand

### Bundle Size
- React: ~41KB (gzipped)
- Tailwind: ~15KB (gzipped)
- Framer Motion: ~26KB (gzipped)
- Total: ~82KB (approximate, gzipped)

---

## Known Limitations

1. **No Backend Integration**
   - Data stored locally in JSON format
   - No real-time synchronization
   - Messages don't persist after page refresh

2. **Placeholder Features**
   - Emoji button ready for integration
   - Attachment button ready for integration
   - Search in chat ready for implementation

3. **Demo Features**
   - Login accepts any credentials
   - Automatic responses from contacts
   - No actual user authentication

---

**Last Updated**: July 2024
