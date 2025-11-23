import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useThemeStore = create(
  persist(
    (set) => ({
      theme: 'light',
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'corelia-theme',
    }
  )
)

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      updateUser: (user) => set({ user }),
    }),
    {
      name: 'corelia-auth',
    }
  )
)

export const useCartStore = create((set) => ({
  items: [],
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
  clearCart: () => set({ items: [] }),
}))

export const useLoyaltyStore = create((set) => ({
  points: 0,
  rewards: [],
  addPoints: (points) => set((state) => ({ points: state.points + points })),
  redeemPoints: (points) => set((state) => ({ points: state.points - points })),
  setRewards: (rewards) => set({ rewards }),
}))

export const useChatStore = create(
  persist(
    (set) => ({
      messages: [],
      isOpen: false,
      sessionId: null,
      addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
      clearMessages: () => set({ messages: [] }),
      toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),
      openChat: () => set({ isOpen: true }),
      closeChat: () => set({ isOpen: false }),
      setSessionId: (sessionId) => set({ sessionId }),
    }),
    {
      name: 'corelia-chat',
    }
  )
)

export const useLocationStore = create(
  persist(
    (set) => ({
      location: null,
      city: null,
      coordinates: null,
      isDetecting: false,
      setLocation: (location, city, coordinates) => set({ location, city, coordinates }),
      setCity: (city) => set({ city }),
      setDetecting: (isDetecting) => set({ isDetecting }),
      clearLocation: () => set({ location: null, city: null, coordinates: null }),
    }),
    {
      name: 'corelia-location',
    }
  )
)
