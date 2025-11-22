import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useThemeStore } from '../../store'
import { analyticsAPI } from '../../services/api'
import { Line, Bar, Pie } from 'recharts'
import { LineChart, BarChart, PieChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
// import { TrendingUpIcon, TrendingDownIcon } from '@heroicons/react/24/outline'

export default function AnalyticsDashboard() {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'
  const [period, setPeriod] = useState('week')
  const [loading, setLoading] = useState(false)

  const revenueData = [
    { name: 'Week 1', revenue: 4200, profit: 1200 },
    { name: 'Week 2', revenue: 5100, profit: 1500 },
    { name: 'Week 3', revenue: 4800, profit: 1350 },
    { name: 'Week 4', revenue: 6200, profit: 1800 },
  ]

  const categoryData = [
    { name: 'Dairy', value: 35, sales: 4200 },
    { name: 'Bakery', value: 25, sales: 3000 },
    { name: 'Produce', value: 20, sales: 2400 },
    { name: 'Meat', value: 15, sales: 1800 },
    { name: 'Other', value: 5, sales: 600 },
  ]

  const searchTrendsData = [
    { keyword: 'Milk', searches: 450 },
    { keyword: 'Bread', searches: 380 },
    { keyword: 'Eggs', searches: 320 },
    { keyword: 'Chicken', searches: 280 },
    { keyword: 'Rice', searches: 250 },
  ]

  const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444']

  const predictions = [
    { item: 'Milk (1L)', current: 45, predicted: 65, trend: 'up', change: '+44%' },
    { item: 'Bread', current: 32, predicted: 28, trend: 'down', change: '-12%' },
    { item: 'Eggs', current: 28, predicted: 38, trend: 'up', change: '+35%' },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className={`text-3xl md:text-4xl font-bold mb-2 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Analytics Dashboard 📈
          </h1>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            Deep insights and predictions for your business
          </p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className={`px-4 py-2 rounded-lg ${
            isDark ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-300 text-gray-900'
          } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </motion.div>

      {/* Revenue & Profit Chart */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`p-6 rounded-xl ${
          isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'
        } shadow-lg`}
      >
        <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Revenue & Profit Trends
        </h2>
        <ResponsiveContainer width="100%" height={300}>
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
            <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} name="Revenue ($)" />
            <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={3} name="Profit ($)" />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Category Performance */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`p-6 rounded-xl ${
            isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'
          } shadow-lg`}
        >
          <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Sales by Category
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Search Trends */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`p-6 rounded-xl ${
            isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'
          } shadow-lg`}
        >
          <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Top Search Keywords
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={searchTrendsData}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
              <XAxis dataKey="keyword" stroke={isDark ? '#9ca3af' : '#6b7280'} />
              <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#1f2937' : '#ffffff',
                  border: isDark ? '1px solid #374151' : '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                }}
              />
              <Bar dataKey="searches" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Predictions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className={`p-6 rounded-xl ${
          isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'
        } shadow-lg`}
      >
        <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          AI-Powered Demand Predictions
        </h2>
        <div className="space-y-4">
          {predictions.map((pred, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg ${
                isDark ? 'bg-gray-800' : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {pred.item}
                  </h4>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Current Stock: {pred.current} units
                  </p>
                </div>
                <div className="text-right">
                  <div className={`flex items-center gap-2 mb-1 ${
                    pred.trend === 'up' ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {/* {pred.trend === 'up' ? (
                      <TrendingUpIcon className="w-5 h-5" />
                    ) : (
                      <TrendingDownIcon className="w-5 h-5" />
                    )} */}
                    <span className="font-bold">{pred.change}</span>
                  </div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Predicted: {pred.predicted} units
                  </p>
                </div>
              </div>
              <div className="mt-3">
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      pred.trend === 'up' ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${(pred.predicted / (pred.current + pred.predicted)) * 100}%` }}
                  ></div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
