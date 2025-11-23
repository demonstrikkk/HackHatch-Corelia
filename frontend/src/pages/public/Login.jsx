import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useThemeStore, useAuthStore } from '../../store'
import { authAPI } from '../../services/api'
import { notifications } from '@mantine/notifications'

export default function Login() {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useThemeStore()
  const { login } = useAuthStore()
  const isDark = theme === 'dark'

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Auto-scroll images every 4 seconds
  const images = [
    '/images-corelia/delivery-login.jpeg',
    '/images-corelia/online-delivery-login.jpeg',
    '/images-corelia/join-us-login.jpeg',
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [images.length])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await authAPI.login(formData)
      const { user, token } = response.data
      login(user, token)
      
      notifications.show({
        title: 'Success!',
        message: 'Logged in successfully',
        color: 'green',
      })

      // Redirect based on role
      if (user.role === 'seller') {
        navigate('/seller/dashboard')
      } else {
        navigate('/home')
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.message || 'Login failed',
        color: 'red',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen w-screen flex items-center justify-center relative"
      style={{ backgroundColor: isDark ? '#0D0B14' : '#f0fdf4' }}
    >
      {/* Background Pattern */}
      <div
        className="absolute inset-0 bg-repeat opacity-5"
        style={{ 
          backgroundImage: isDark 
            ? "url('/images-corelia/logo.png')" 
            : "url('/images-corelia/logo.png')" 
        }}
      />

      {/* Overlay */}
      <div className={`absolute inset-0 ${isDark ? 'bg-black/20' : 'bg-black/5'} backdrop-blur-sm`} />

      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-[95%] max-w-[1100px] flex shadow-2xl rounded-2xl overflow-hidden md:flex-row flex-col"
      >
        {/* Left Side - Login Form */}
        <div className={`flex-1 p-10 backdrop-blur-sm border-0 rounded-l-2xl md:rounded-r-none rounded-r-2xl ${
          isDark ? 'bg-gray-900/95' : 'bg-white/95'
        }`}>
          <div className="text-center mb-8">
            <h2 className={`text-lg mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Welcome back,
            </h2>
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-primary-light'}`}>
              Login to CORELIA
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className={`text-sm font-medium mb-2 block ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className={`w-full h-12 px-4 rounded-lg border transition-colors ${
                  isDark 
                    ? 'bg-gray-800 border-gray-700 text-white focus:border-primary-dark focus:ring-primary-dark' 
                    : 'bg-white border-gray-200 text-primary-light focus:border-primary-dark focus:ring-primary-dark'
                } focus:outline-none focus:ring-2`}
              />
            </div>

            <div>
              <label className={`text-sm font-medium mb-2 block ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className={`w-full h-12 px-4 rounded-lg border transition-colors ${
                  isDark 
                    ? 'bg-gray-800 border-gray-700 text-white focus:border-primary-dark focus:ring-primary-dark' 
                    : 'bg-white border-gray-200 text-primary-light focus:border-primary-dark focus:ring-primary-dark'
                } focus:outline-none focus:ring-2`}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-gray-300 text-primary-dark focus:ring-primary-dark" 
                />
                <span className={`ml-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Remember me
                </span>
              </label>
              <a 
                href="#" 
                className={`text-sm font-semibold transition-colors ${
                  isDark ? 'text-primary-dark hover:text-primary-light' : 'text-primary-dark hover:text-secondary-dark'
                }`}
              >
                Forgot password?
              </a>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full h-12 bg-primary-light hover:bg-secondary-light text-gray-900 font-semibold rounded-lg shadow-lg transition-all duration-200 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Logging in...' : 'LOGIN'}
            </motion.button>
          </form>

          <div className="mt-8 text-center">
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/signup')}
                className={`font-semibold transition-colors ${
                  isDark 
                    ? 'text-primary-dark hover:text-primary-light hover:underline' 
                    : 'text-primary-dark hover:text-secondary-dark hover:underline'
                }`}
              >
                Register here
              </button>
            </p>
          </div>

          {/* Demo Credentials */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={`mt-6 p-4 rounded-lg ${
              isDark ? 'bg-surface-dark/20 border border-secondary-dark' : 'bg-surface-light border border-primary-light'
            }`}
          >
            <p className={`text-sm font-semibold mb-2 ${
              isDark ? 'text-primary-dark' : 'text-primary-dark'
            }`}>
              Demo Credentials:
            </p>
            <div className={`space-y-1 text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <p>👤 User: user@demo.com / password123</p>
              <p>🏪 Seller: seller@demo.com / password123</p>
            </div>
          </motion.div>
        </div>

        {/* Right Side - Auto-scrolling Images */}
        <div className="hidden md:block flex-1 relative bg-primary-light min-h-[500px] rounded-r-2xl overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentImageIndex}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url('${images[currentImageIndex]}')` }}
            />
          </AnimatePresence>

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Image Indicators */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentImageIndex 
                    ? 'w-8 bg-white' 
                    : 'bg-white/50 hover:bg-white/75'
                }`}
              />
            ))}
          </div>

          {/* Optional Text Overlay */}
          <div className="absolute bottom-20 left-8 right-8 z-10 text-white">
            <motion.h3
              key={`title-${currentImageIndex}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold mb-2"
            >
              {currentImageIndex === 0 && 'Smart Shopping Experience'}
              {currentImageIndex === 1 && 'AI-Powered Recommendations'}
              {currentImageIndex === 2 && 'Analytics & Insights'}
            </motion.h3>
            <motion.p
              key={`desc-${currentImageIndex}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-sm text-white/90"
            >
              {currentImageIndex === 0 && 'Discover the future of retail intelligence'}
              {currentImageIndex === 1 && 'Personalized for every shopper'}
              {currentImageIndex === 2 && 'Data-driven decisions for sellers'}
            </motion.p>
          </div>
        </div>
      </motion.div>

      {/* Logo in Top Left */}
      <div className="absolute top-6 left-10 flex items-center gap-3 z-20">
        <img src="/images-corelia/logo.png" alt="CORELIA" className="w-10 h-10 object-contain" />
        <span className={`font-bold text-2xl bg-gradient-to-r ${
          isDark ? 'from-secondary-dark via-accent-dark to-primary-dark' : 'from-secondary-dark via-accent-dark to-orange-dark'
        } bg-clip-text text-transparent`}>
          CORELIA
        </span>
      </div>

      {/* Theme Toggle in Top Right */}
      <button
        onClick={toggleTheme}
        className={`absolute top-6 right-10 z-20 p-3 rounded-full transition-all ${
          isDark 
            ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400' 
            : 'bg-white hover:bg-gray-100 text-gray-900 shadow-lg'
        }`}
      >
        {isDark ? '☀️' : '🌙'}
      </button>
    </div>
  )
}
