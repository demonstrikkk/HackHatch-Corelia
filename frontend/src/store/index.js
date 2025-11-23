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

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => set((state) => {
        // Check if item already exists in cart
        const existingItem = state.items.find(i => i.id === item.id && i.shopId === item.shopId)
        if (existingItem) {
          // Update quantity
          return {
            items: state.items.map(i =>
              i.id === item.id && i.shopId === item.shopId
                ? { ...i, quantity: i.quantity + (item.quantity || 1) }
                : i
            )
          }
        }
        // Add new item
        return { items: [...state.items, { ...item, quantity: item.quantity || 1 }] }
      }),
      removeItem: (id, shopId) => set((state) => ({ 
        items: state.items.filter((i) => !(i.id === id && i.shopId === shopId)) 
      })),
      updateQuantity: (id, shopId, quantity) => set((state) => ({
        items: state.items.map(i =>
          i.id === id && i.shopId === shopId
            ? { ...i, quantity: Math.max(1, quantity) }
            : i
        )
      })),
      clearCart: () => set({ items: [] }),
      getTotalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
      getTotalPrice: () => get().items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
    }),
    {
      name: 'corelia-cart',
    }
  )
)

export const useLoyaltyStore = create(
  persist(
    (set) => ({
      points: 0,
      tier: 'bronze',
      rewards: [],
      history: [],
      setPoints: (points) => set({ points }),
      addPoints: (points) => set((state) => ({ points: state.points + points })),
      redeemPoints: (points) => set((state) => ({ points: Math.max(0, state.points - points) })),
      setTier: (tier) => set({ tier }),
      setRewards: (rewards) => set({ rewards }),
      addHistory: (entry) => set((state) => ({ history: [entry, ...state.history] })),
      setHistory: (history) => set({ history }),
      updateFromAPI: (data) => set({ 
        points: data.points || 0,
        tier: data.tier || 'bronze',
        rewards: data.rewards || [],
      }),
    }),
    {
      name: 'corelia-loyalty',
    }
  )
)

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
