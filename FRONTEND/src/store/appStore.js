import { create } from 'zustand';
import { API_BASE_URL } from '../config/api';

export const useAppStore = create((set) => ({
  currentPage: 'welcome',
  darkMode: false,
  currentUser: (() => {
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  })(),

  navigateTo: (page) => set({ currentPage: page }),
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
  updateCurrentUser: (user) => set({ currentUser: user }),

  fetchCurrentUser: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ currentUser: null });
      return null;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        const user = await res.json();
        const normalizedUser = {
          ...user,
          id: user._id || user.id
        };
        set({ currentUser: normalizedUser });
        localStorage.setItem('user', JSON.stringify(normalizedUser));
        return normalizedUser;
      } else {
        // Clear invalid token session
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ currentUser: null });
        return null;
      }
    } catch (err) {
      console.error('Fetch current user error:', err);
      return null;
    }
  }
}));

