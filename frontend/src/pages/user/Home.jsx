import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useThemeStore, useAuthStore } from '../../store'
import { userAPI } from '../../services/api'
import { Link } from 'react-router-dom'
import {
  ShoppingCartIcon,
  ClockIcon,
  SparklesIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline'

export default function Home() {
  const { theme } = useThemeStore()
  const { user } = useAuthStore()
  const isDark = theme === 'dark'
  const [expiringItems, setExpiringItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const response = await userAPI.getExpiringItems()
      setExpiringItems(response.data.items || [])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const quickActions = [
    {
      icon: ShoppingCartIcon,
      title: 'Find Best Shop',
      description: 'Match your grocery list',
      link: '/shop-matcher',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: ClockIcon,
      title: 'Expiring Soon',
      description: `${expiringItems.length} items need attention`,
      link: '#expiring',
      color: 'from-orange-500 to-red-600',
    },
    {
      icon: SparklesIcon,
      title: 'Browse Shops',
      description: 'Explore local stores',
      link: '/shops',
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: TrophyIcon,
      title: 'Loyalty Points',
      description: 'Check your rewards',
      link: '/loyalty',
      color: 'from-green-500 to-emerald-600',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className={`text-3xl md:text-4xl font-bold mb-2 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          Welcome back, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
          Here's what's happening with your shopping today
        </p>
      </motion.div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickActions.map((action, index) => {
          const Icon = action.icon
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <Link
                to={action.link}
                className={`block p-6 rounded-xl ${
                  isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'
                } shadow-lg hover:shadow-2xl transition-all`}
              >
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {action.title}
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {action.description}
                </p>
              </Link>
            </motion.div>
          )
        })}
      </div>

      {/* Expiring Items Section */}
      <motion.div
        id="expiring"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className={`p-6 rounded-xl ${
          isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'
        } shadow-lg`}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Items Expiring Soon
            </h2>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
              Act fast to avoid waste!
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : expiringItems.length > 0 ? (
          <div className="space-y-3">
            {expiringItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg ${
                  isDark ? 'bg-gray-800' : 'bg-gray-50'
                } flex items-center justify-between`}
              >
                <div className="flex-1">
                  <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {item.name}
                  </h4>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {item.shop} • Expires {item.expiryDate}
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  item.daysLeft <= 2
                    ? 'bg-red-500/20 text-red-500'
                    : item.daysLeft <= 5
                    ? 'bg-orange-500/20 text-orange-500'
                    : 'bg-yellow-500/20 text-yellow-500'
                }`}>
                  {item.daysLeft} days left
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <SparklesIcon className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-700' : 'text-gray-300'}`} />
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              No items expiring soon. You're all set!
            </p>
          </div>
        )}
      </motion.div>

      {/* Recommended Shops */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className={`p-6 rounded-xl ${
          isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'
        } shadow-lg`}
      >
        <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Recommended Shops Nearby
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((shop, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.03 }}
              className={`p-4 rounded-lg ${
                isDark ? 'bg-gray-800' : 'bg-gray-50'
              } cursor-pointer`}
            >
              <div className="w-full h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg mb-4"></div>
              <h4 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Shop Name {shop}
              </h4>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                0.{shop} km away • ⭐ 4.{5 + shop}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
