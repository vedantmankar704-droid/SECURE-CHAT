import { useEffect } from 'react';
import { useAppStore } from '../store/appStore';

const ProtectedRoute = ({ children }) => {
  const { currentUser, navigateTo } = useAppStore();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token || !currentUser) {
      navigateTo('login');
    }
  }, [currentUser, token, navigateTo]);

  if (!token || !currentUser) {
    return null;
  }

  return children;
};

export default ProtectedRoute;
