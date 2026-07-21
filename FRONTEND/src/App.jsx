import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Requests from './pages/Requests';
import { useAppStore } from './store/appStore';
import socket from './socket/socket';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const { currentPage, navigateTo, darkMode, toggleDarkMode, currentUser, updateCurrentUser, fetchCurrentUser } = useAppStore();
  const [authLoading, setAuthLoading] = useState(true);

  // Check auth session on application startup
  useEffect(() => {
    const checkAuthSession = async () => {
      const token = localStorage.getItem('token');

      if (token) {
        try {
          const user = await fetchCurrentUser();
          if (user) {
            // Only redirect to dashboard if they are on welcome/login/register
            if (['welcome', 'login', 'register'].includes(currentPage)) {
              navigateTo('dashboard');
            }
          } else {
            navigateTo('welcome');
          }
        } catch (err) {
          console.error('Startup auth check failed:', err);
          navigateTo('welcome');
        }
      } else {
        // If not logged in and they attempt to access protected pages, redirect to welcome
        if (!['welcome', 'login', 'register'].includes(currentPage)) {
          navigateTo('welcome');
        }
      }
      setAuthLoading(false);
    };

    checkAuthSession();
  }, [navigateTo, updateCurrentUser]);

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

  if (authLoading) {
    return (
      <div className={`h-screen w-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-darkBg ${darkMode ? 'dark' : ''}`}>
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400">Verifying session...</p>
      </div>
    );
  }

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
          <ProtectedRoute>
            <Dashboard
              onNavigate={navigateTo}
              darkMode={darkMode}
              onToggleDarkMode={toggleDarkMode}
            />
          </ProtectedRoute>
        );
      case 'requests':
      case 'new-chat':
        return (
          <ProtectedRoute>
            <Requests onNavigate={navigateTo} />
          </ProtectedRoute>
        );
      case 'profile':
      case 'settings':
        return (
          <ProtectedRoute>
            <Settings onNavigate={navigateTo} />
          </ProtectedRoute>
        );
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