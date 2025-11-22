import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useThemeStore, useAuthStore } from '../../store'
import { authAPI } from '../../services/api'
import { notifications } from '@mantine/notifications'

export default function Login() {
  const navigate = useNavigate()
  const { theme } = useThemeStore()
  const { login } = useAuthStore()
  const isDark = theme === 'dark'

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)

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
    <div className={`min-h-screen flex items-center justify-center px-4 ${
      isDark ? 'bg-background-dark' : 'bg-background-light'
    }`}>
      {/* Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 blur-3xl"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/">
            <h1 className={`text-4xl font-bold bg-gradient-to-r ${
              isDark ? 'from-blue-400 to-purple-500' : 'from-blue-600 to-purple-600'
            } bg-clip-text text-transparent`}>
              CORELIA
            </h1>
          </Link>
          <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Welcome back! Please login to your account.
          </p>
        </div>

        {/* Login Form */}
        <div className={`p-8 rounded-2xl ${
          isDark ? 'bg-gray-900/50 border border-gray-800' : 'bg-white border border-gray-200'
        } shadow-xl`}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Email Address
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full px-4 py-3 rounded-lg ${
                  isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
                } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Password
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={`w-full px-4 py-3 rounded-lg ${
                  isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
                } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="rounded text-blue-500" />
                <span className={`ml-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Remember me
                </span>
              </label>
              <a href="#" className="text-sm text-blue-500 hover:text-blue-600">
                Forgot password?
              </a>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:shadow-lg transition-shadow disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Don't have an account?{' '}
              <Link to="/signup" className="text-blue-500 hover:text-blue-600 font-semibold">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Demo Credentials */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className={`mt-4 p-4 rounded-lg ${
            isDark ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'
          }`}
        >
          <p className={`text-sm ${isDark ? 'text-blue-400' : 'text-blue-600'} font-medium mb-2`}>
            Demo Credentials:
          </p>
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            User: user@demo.com / password123
          </p>
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Seller: seller@demo.com / password123
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}
