import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useThemeStore } from '../../store'
import { CheckCircleIcon, ClockIcon, TruckIcon, XCircleIcon } from '@heroicons/react/24/outline'

export default function Orders() {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'
  const [filter, setFilter] = useState('all')
  const [orders, setOrders] = useState([])

  useEffect(() => {
    setOrders(mockOrders)
  }, [])

  const mockOrders = [
    { id: 1001, customer: 'John Doe', items: 5, total: 45.99, status: 'delivered', date: '2024-01-15' },
    { id: 1002, customer: 'Jane Smith', items: 3, total: 32.50, status: 'pending', date: '2024-01-16' },
    { id: 1003, customer: 'Mike Johnson', items: 8, total: 78.25, status: 'processing', date: '2024-01-16' },
    { id: 1004, customer: 'Sarah Williams', items: 2, total: 18.99, status: 'delivered', date: '2024-01-14' },
    { id: 1005, customer: 'David Brown', items: 6, total: 56.75, status: 'cancelled', date: '2024-01-13' },
  ]

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter(order => order.status === filter)

  const statusConfig = {
    delivered: { color: 'green', icon: CheckCircleIcon, label: 'Delivered' },
    pending: { color: 'yellow', icon: ClockIcon, label: 'Pending' },
    processing: { color: 'blue', icon: TruckIcon, label: 'Processing' },
    cancelled: { color: 'red', icon: XCircleIcon, label: 'Cancelled' },
  }

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
          Orders Management 📦
        </h1>
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
          Track and manage all customer orders
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex gap-3 flex-wrap"
      >
        {['all', 'pending', 'processing', 'delivered', 'cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === status
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                : isDark
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </motion.div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order, index) => {
          const StatusIcon = statusConfig[order.status].icon
          const statusColor = statusConfig[order.status].color
          
          return (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-6 rounded-xl ${
                isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'
              } shadow-lg hover:shadow-xl transition-all`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Order #{order.id}
                    </h3>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 bg-${statusColor}-500/20 text-${statusColor}-500`}>
                      <StatusIcon className="w-4 h-4" />
                      {statusConfig[order.status].label}
                    </div>
                  </div>
                  <p className={`text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Customer: {order.customer}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    Date: {order.date} • {order.items} items
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      Total
                    </p>
                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      ${order.total}
                    </p>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 rounded-lg bg-blue-500 text-white font-medium"
                  >
                    View Details
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-20">
          <p className={`text-xl ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            No orders found
          </p>
        </div>
      )}
    </div>
  )
}
