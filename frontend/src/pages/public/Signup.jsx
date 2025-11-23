import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useThemeStore, useAuthStore } from '../../store'
import { authAPI } from '../../services/api'
import { notifications } from '@mantine/notifications'

export default function Signup() {
  const navigate = useNavigate()
  const { theme } = useThemeStore()
  const { login } = useAuthStore()
  const isDark = theme === 'dark'

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer',
    phone: '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      notifications.show({
        title: 'Error',
        message: 'Passwords do not match',
        color: 'red',
      })
      return
    }

    setLoading(true)

    try {
      const response = await authAPI.signup(formData)
      const { user, token } = response.data
      login(user, token)
      
      // Show different messages for seller and customer
      if (user.role === 'seller' && user.shop_id) {
        notifications.show({
          title: 'Welcome to Corelia! 🎉',
          message: `Your Shop ID: ${user.shop_id} - Share this with customers!`,
          color: 'green',
          autoClose: 8000,
        })
      } else {
        notifications.show({
          title: 'Success!',
          message: 'Account created successfully',
          color: 'green',
        })
      }

      // Redirect based on role
      if (user.role === 'seller') {
        navigate('/seller/dashboard')
      } else {
        navigate('/home')
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.message || 'Signup failed',
        color: 'red',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 py-12 ${
      isDark ? 'bg-background-dark' : 'bg-background-light'
    }`}>
      {/* Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-surface-light/10 via-accent-dark/10 to-secondary-light/10 blur-3xl"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/">
            <h1 className={`text-4xl font-bold bg-gradient-to-r ${
              isDark ? 'from-purple-dark to-orange-dark' : 'from-purple-dark to-orange-dark'
            } bg-clip-text text-transparent`}>
              CORELIA
            </h1>
          </Link>
          <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Create your account and get started
          </p>
        </div>

        {/* Signup Form */}
        <div className={`p-8 rounded-2xl ${
          isDark ? 'bg-gray-900/50 border border-gray-800' : 'bg-white border border-gray-200'
        } shadow-xl`}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Full Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-4 py-3 rounded-lg ${
                  isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-primary-light'
                } border focus:outline-none focus:ring-2 focus:ring-primary-dark`}
                placeholder="John Doe"
              />
            </div>

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
                  isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-primary-light'
                } border focus:outline-none focus:ring-2 focus:ring-primary-dark`}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Phone Number
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={`w-full px-4 py-3 rounded-lg ${
                  isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-primary-light'
                } border focus:outline-none focus:ring-2 focus:ring-primary-dark`}
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                I am a...
              </label>
              <div className="flex gap-4">
                <label className="flex-1">
                  <input
                    type="radio"
                    name="role"
                    value="customer"
                    checked={formData.role === 'customer'}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="sr-only"
                  />
                  <div className={`px-4 py-3 rounded-lg border-2 cursor-pointer transition-all ${
                    formData.role === 'customer'
                      ? 'border-primary-dark bg-primary-dark/10'
                      : isDark
                      ? 'border-gray-700 hover:border-gray-600'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}>
                    <p className={`text-center font-medium ${
                      formData.role === 'customer' ? 'text-primary-dark' : isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Customer
                    </p>
                  </div>
                </label>
                <label className="flex-1">
                  <input
                    type="radio"
                    name="role"
                    value="seller"
                    checked={formData.role === 'seller'}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="sr-only"
                  />
                  <div className={`px-4 py-3 rounded-lg border-2 cursor-pointer transition-all ${
                    formData.role === 'seller'
                      ? 'border-primary-dark bg-primary-dark/10'
                      : isDark
                      ? 'border-gray-700 hover:border-gray-600'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}>
                    <p className={`text-center font-medium ${
                      formData.role === 'seller' ? 'text-primary-dark' : isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Seller
                    </p>
                  </div>
                </label>
              </div>
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
                  isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-primary-light'
                } border focus:outline-none focus:ring-2 focus:ring-primary-dark`}
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Confirm Password
              </label>
              <input
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className={`w-full px-4 py-3 rounded-lg ${
                  isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-primary-light'
                } border focus:outline-none focus:ring-2 focus:ring-primary-dark`}
                placeholder="••••••••"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-primary-light text-gray-900 font-semibold hover:shadow-lg transition-shadow disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Already have an account?{' '}
              <Link to="/login" className="text-primary-dark hover:text-primary-dark font-semibold">
                Login
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
