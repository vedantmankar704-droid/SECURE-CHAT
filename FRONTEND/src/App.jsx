import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import { useAppStore } from './store/appStore';
import socket from './socket/socket';

function App() {
  const { currentPage, navigateTo, darkMode, toggleDarkMode, currentUser } = useAppStore();

  useEffect(() => {
    const handleConnect = () => {
      console.log('Connected to Socket.IO Server');
      console.log('Socket ID:', socket.id);
    };

    const handleDisconnect = () => {
      console.log('Disconnected from Socket.IO Server');
    };

    // Add listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    // If socket is already connected when component mounts
    if (socket.connected) {
      handleConnect();
    }

    // Cleanup listeners on unmount
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, []);

  // Emit 'join' event when currentUser is loaded and socket connects
  useEffect(() => {
    if (currentUser?.id) {
      const emitJoin = () => {
        socket.emit('join', currentUser.id);
      };

      if (socket.connected) {
        emitJoin();
      }

      socket.on('connect', emitJoin);

      return () => {
        socket.off('connect', emitJoin);
      };
    }
  }, [currentUser]);

  const renderPage = () => {
    switch (currentPage) {
      case 'welcome':
        return <Welcome onNavigate={navigateTo} />;
      case 'login':
        return <Login onNavigate={navigateTo} />;
      case 'register':
        return <Register onNavigate={navigateTo} />;
      case 'dashboard':
        return (
          <Dashboard
            onNavigate={navigateTo}
            darkMode={darkMode}
            onToggleDarkMode={toggleDarkMode}
          />
        );
      case 'profile':
        return <Profile onNavigate={navigateTo} currentUser={currentUser} />;
      case 'settings':
        return <Settings onNavigate={navigateTo} />;
      default:
        return <Welcome onNavigate={navigateTo} />;
    }
  };

  return (
    <div className={darkMode ? 'dark' : ''}>
      <AnimatePresence mode="wait">
        {renderPage()}
      </AnimatePresence>
    </div>
  );
}

export default App;