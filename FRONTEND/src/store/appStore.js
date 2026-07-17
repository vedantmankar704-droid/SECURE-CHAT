import { create } from 'zustand';

export const useAppStore = create((set) => ({
  currentPage: 'welcome',
  darkMode: false,
  currentUser: {
    id: 1,
    name: 'You',
    avatar: 'https://i.pravatar.cc/150?img=10',
    email: 'user@example.com',
    phone: '+1 (555) 000-0001',
    status: 'Online',
    bio: 'Hello there! 👋'
  },

  navigateTo: (page) => set({ currentPage: page }),
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
  updateCurrentUser: (user) => set({ currentUser: user })
}));
