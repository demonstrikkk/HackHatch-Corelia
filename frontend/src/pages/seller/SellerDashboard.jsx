import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useThemeStore } from '../../store'
import { analyticsAPI } from '../../services/api'
import { Line, Bar } from 'recharts'
import { LineChart, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import {
  CurrencyDollarIcon,
  ShoppingBagIcon,
  UsersIcon,
//   TrendingUpIcon,
} from '@heroicons/react/24/outline'

export default function SellerDashboard() {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'
  const [stats, setStats] = useState({ 
    shop_id: '', 
    shop_name: 'My Shop',
    total_revenue: 0, 
    total_sales: 0, 
    total_orders: 0, 
    today_revenue: 0,
    today_orders: 0,
    week_revenue: 0,
    average_order_value: 0
  })
  const [loading, setLoading] = useState(true)
  const [topProducts, setTopProducts] = useState([])

  useEffect(() => {
    loadSellerStats()
    loadTopProducts()
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      loadSellerStats()
      loadTopProducts()
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadSellerStats = async () => {
    try {
      const response = await analyticsAPI.getSellerStats()
      setStats(response.data)
    } catch (error) {
      console.error('Failed to load seller stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadTopProducts = async () => {
    try {
      const response = await analyticsAPI.getTopSelling()
      setTopProducts(response.data.products || [])
    } catch (error) {
      console.error('Failed to load top products:', error)
    }
  }

  const revenueData = [
    { name: 'Mon', revenue: 1200 },
    { name: 'Tue', revenue: 1800 },
    { name: 'Wed', revenue: 1500 },
    { name: 'Thu', revenue: 2200 },
    { name: 'Fri', revenue: 2800 },
    { name: 'Sat', revenue: 3200 },
    { name: 'Sun', revenue: 2400 },
  ]

  const statCards = [
    { title: 'Total Revenue', value: `₹${stats.total_revenue.toLocaleString()}`, icon: CurrencyDollarIcon, color: 'from-primary-light to-secondary-light', change: `Today: ₹${stats.today_revenue}` },
    { title: 'Total Orders', value: stats.total_orders, icon: ShoppingBagIcon, color: 'from-secondary-dark to-primary-dark', change: `Today: ${stats.today_orders}` },
    { title: 'Items Sold', value: stats.total_sales, icon: UsersIcon, color: 'from-secondary-dark to-primary-dark', change: `Week: ₹${stats.week_revenue}` },
    { title: 'Avg Order', value: `₹${stats.average_order_value.toLocaleString()}`, icon: CurrencyDollarIcon, color: 'from-primary-light to-secondary-light', change: stats.shop_id },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className={`text-3xl md:text-4xl font-bold mb-2 ${
          isDark ? 'text-white' : 'text-primary-light'
        }`}>
          Seller Dashboard 📊
        </h1>
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
          Welcome back! Here's your business overview
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className={`p-6 rounded-xl ${
                isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'
              } shadow-lg`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="px-2 py-1 rounded-full bg-primary-light/20 text-primary-light text-xs font-medium">
                  {stat.change}
                </div>
              </div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                {stat.title}
              </p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-primary-light'}`}>
                {stat.value}
              </p>
            </motion.div>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className={`p-6 rounded-xl ${
            isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'
          } shadow-lg`}
        >
          <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-primary-light'}`}>
            Weekly Revenue
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
              <XAxis dataKey="name" stroke={isDark ? '#9ca3af' : '#6b7280'} />
              <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#1f2937' : '#ffffff',
                  border: isDark ? '1px solid #374151' : '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Top Products */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className={`p-6 rounded-xl ${
            isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'
          } shadow-lg`}
        >
          <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-primary-light'}`}>
            Top Selling Products
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topProducts}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
              <XAxis dataKey="name" stroke={isDark ? '#9ca3af' : '#6b7280'} />
              <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#1f2937' : '#ffffff',
                  border: isDark ? '1px solid #374151' : '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                }}
              />
              <Bar dataKey="sales" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className={`p-6 rounded-xl ${
          isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'
        } shadow-lg`}
      >
        <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-primary-light'}`}>
          Recent Orders
        </h2>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((order, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-4 rounded-lg ${
                isDark ? 'bg-gray-800' : 'bg-gray-50'
              }`}
            >
              <div>
                <p className={`font-semibold ${isDark ? 'text-white' : 'text-primary-light'}`}>
                  Order #{1000 + order}
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Customer {order} • {order} items
                </p>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${isDark ? 'text-white' : 'text-primary-light'}`}>
                  ₹{(45.99 * order).toFixed(2)}
                </p>
                <div className={`text-xs px-2 py-1 rounded-full inline-block ${
                  order % 3 === 0
                    ? 'bg-primary-light/20 text-primary-light'
                    : order % 3 === 1
                    ? 'bg-yellow-500/20 text-yellow-500'
                    : 'bg-primary-dark/20 text-primary-dark'
                }`}>
                  {order % 3 === 0 ? 'Delivered' : order % 3 === 1 ? 'Pending' : 'Processing'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
