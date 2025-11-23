import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('corelia-auth')
    if (token) {
      try {
        const authData = JSON.parse(token)
        if (authData.state?.token) {
          config.headers.Authorization = `Bearer ${authData.state.token}`
        }
      } catch (error) {
        console.error('Error parsing auth token:', error)
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('corelia-auth')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  signup: (userData) => api.post('/auth/signup', userData),
  refresh: (refreshToken) => api.post('/auth/refresh', { refresh_token: refreshToken }),
}

// User APIs
export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/profile', data),
  getExpiringItems: () => api.get('/user/expiring-items'),
  getLoyalty: () => api.get('/user/loyalty'),
  getReviews: () => api.get('/user/reviews'),
  addReview: (review) => api.post('/user/reviews', review),
  getBills: () => api.get('/user/bills'),
  createBill: (billData) => api.post('/user/bills', billData),
}

// Shop APIs
export const shopAPI = {
  getAll: (params) => api.get('/shops', { params }),
  getById: (id) => api.get(`/shops/${id}`),
  search: (query) => api.get('/shops/search', { params: { q: query } }),
  searchById: (shopId) => api.get(`/shops/search/by-id/${shopId}`),
  matchGroceryList: (items, location) => api.post('/shops/match', { items, location }),
}

// Inventory APIs
export const inventoryAPI = {
  upload: (formData) => api.post('/inventory/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  ocrScan: (formData) => api.post('/inventory/ocr-scan', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getAll: () => api.get('/inventory'),
  getExpiring: () => api.get('/inventory/expiring'),
  create: (item) => api.post('/inventory', item),
  update: (id, item) => api.put(`/inventory/${id}`, item),
  delete: (id) => api.delete(`/inventory/${id}`),
  getExpiryInfo: (category) => api.get(`/inventory/expiry-info/${category}`),
  getAllExpiryCategories: () => api.get('/inventory/expiry-categories'),
  deductStock: (items) => api.post('/inventory/deduct-stock', items),
}

// Analytics APIs
export const analyticsAPI = {
  getSellerStats: () => api.get('/analytics/seller-stats'),
  getTopSelling: () => api.get('/analytics/top-selling'),
  getLowStock: () => api.get('/analytics/low-stock'),
  getSearchTrends: () => api.get('/analytics/search-trends'),
  getPredictions: () => api.get('/analytics/predictions'),
  getRevenue: (period) => api.get('/analytics/revenue', { params: { period } }),
}

// Chatbot APIs
export const chatAPI = {
  sendMessage: (data) => api.post('/chatbot/chat', data),
  getHistory: (sessionId) => api.get('/chatbot/history', { params: { session_id: sessionId } }),
  clearHistory: (sessionId) => api.delete(`/chatbot/history/${sessionId}`),
  getStatus: () => api.get('/chatbot/status'),
}

// Review APIs
export const reviewAPI = {
  getAll: (limit = 20) => api.get('/reviews/all', { params: { limit } }),
  getShopReviews: (shopId, limit = 50) => api.get(`/reviews/shop/${shopId}`, { params: { limit } }),
  create: (review) => api.post('/reviews', review),
  likeReview: (reviewId) => api.put(`/reviews/${reviewId}/like`),
  deleteReview: (reviewId) => api.delete(`/reviews/${reviewId}`),
  getStats: () => api.get('/reviews/stats'),
}

export default api
