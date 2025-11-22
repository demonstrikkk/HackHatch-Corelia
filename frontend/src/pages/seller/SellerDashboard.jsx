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
  const [stats, setStats] = useState({ revenue: 12450, orders: 234, customers: 156, growth: 12.5 })
  const [loading, setLoading] = useState(false)

  const revenueData = [
    { name: 'Mon', revenue: 1200 },
    { name: 'Tue', revenue: 1800 },
    { name: 'Wed', revenue: 1500 },
    { name: 'Thu', revenue: 2200 },
    { name: 'Fri', revenue: 2800 },
    { name: 'Sat', revenue: 3200 },
    { name: 'Sun', revenue: 2400 },
  ]

  const topProducts = [
    { name: 'Milk', sales: 145 },
    { name: 'Bread', sales: 132 },
    { name: 'Eggs', sales: 98 },
    { name: 'Chicken', sales: 87 },
    { name: 'Rice', sales: 76 },
  ]

  const statCards = [
    { title: 'Total Revenue', value: `$${stats.revenue.toLocaleString()}`, icon: CurrencyDollarIcon, color: 'from-green-500 to-emerald-600', change: '+12.5%' },
    { title: 'Total Orders', value: stats.orders, icon: ShoppingBagIcon, color: 'from-blue-500 to-blue-600', change: '+8.3%' },
    { title: 'Customers', value: stats.customers, icon: UsersIcon, color: 'from-purple-500 to-purple-600', change: '+15.2%' },
    // { title: 'Growth Rate', value: `${stats.growth}%`, icon: TrendingUpIcon, color: 'from-orange-500 to-red-600', change: '+2.1%' },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className={`text-3xl md:text-4xl font-bold mb-2 ${
          isDark ? 'text-white' : 'text-gray-900'
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
                <div className="px-2 py-1 rounded-full bg-green-500/20 text-green-500 text-xs font-medium">
                  {stat.change}
                </div>
              </div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                {stat.title}
              </p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
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
          <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
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
          <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
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
        <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
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
                <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Order #{1000 + order}
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Customer {order} • {order} items
                </p>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  ${(45.99 * order).toFixed(2)}
                </p>
                <div className={`text-xs px-2 py-1 rounded-full inline-block ${
                  order % 3 === 0
                    ? 'bg-green-500/20 text-green-500'
                    : order % 3 === 1
                    ? 'bg-yellow-500/20 text-yellow-500'
                    : 'bg-blue-500/20 text-blue-500'
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
