import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useThemeStore } from '../../store'
import { inventoryAPI } from '../../services/api'
import {
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
  CalendarIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline'

export default function ExpiringItems() {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'
  const [allItems, setAllItems] = useState([])
  const [filteredItems, setFilteredItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all') // all, expired, critical, warning, normal
  const [stats, setStats] = useState({
    total: 0,
    expired: 0,
    critical: 0,
    warning: 0,
    normal: 0,
  })

  useEffect(() => {
    loadItems()
  }, [])

  useEffect(() => {
    filterItems()
  }, [filterStatus, allItems])

  const loadItems = async () => {
    try {
      const response = await inventoryAPI.getAll()
      const items = response.data.items || []
      
      // Calculate stats
      const stats = {
        total: items.length,
        expired: items.filter(i => i.expiry_status === 'expired').length,
        critical: items.filter(i => i.expiry_status === 'critical').length,
        warning: items.filter(i => i.expiry_status === 'warning').length,
        normal: items.filter(i => i.expiry_status === 'normal' || !i.expiry_date).length,
      }
      
      setStats(stats)
      setAllItems(items)
      setFilteredItems(items)
    } catch (error) {
      console.error('Failed to fetch items:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterItems = () => {
    if (filterStatus === 'all') {
      setFilteredItems(allItems)
    } else if (filterStatus === 'normal') {
      setFilteredItems(allItems.filter(item => item.expiry_status === 'normal' || !item.expiry_date))
    } else {
      setFilteredItems(allItems.filter(item => item.expiry_status === filterStatus))
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'expired':
        return 'bg-secondary-light/20 text-secondary-light border-secondary-light'
      case 'critical':
        return 'bg-primary-light/20 text-primary-light border-primary-light'
      case 'warning':
        return 'bg-yellow-500/20 text-yellow-500 border-yellow-500'
      default:
        return 'bg-gray-500/20 text-gray-500 border-gray-500'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'expired':
        return <ExclamationTriangleIcon className="w-5 h-5" />
      case 'critical':
      case 'warning':
        return <ClockIcon className="w-5 h-5" />
      default:
        return <CheckCircleIcon className="w-5 h-5" />
    }
  }

  const getStatusText = (item) => {
    if (!item.expiry_date) return 'No expiry date set'
    if (!item.days_until_expiry) return 'Unknown'
    
    if (item.days_until_expiry < 0) {
      return `Expired ${Math.abs(item.days_until_expiry)} days ago`
    } else if (item.days_until_expiry === 0) {
      return 'Expires today'
    } else if (item.days_until_expiry === 1) {
      return 'Expires tomorrow'
    } else {
      return `${item.days_until_expiry} days remaining`
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-light"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4"
      >
        <div>
          <h1 className={`text-3xl md:text-4xl font-bold mb-2 ${
            isDark ? 'text-white' : 'text-primary-light'
          }`}>
            Expiring Items Overview 📅
          </h1>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            Track and manage items approaching their expiration dates
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-4 rounded-xl ${
              isDark ? 'bg-gray-800' : 'bg-white'
            } border ${
              filterStatus === 'all' 
                ? 'border-primary-light shadow-lg' 
                : isDark ? 'border-gray-700' : 'border-gray-200'
            } cursor-pointer transition-all`}
            onClick={() => setFilterStatus('all')}
          >
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Total Items
            </p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-primary-light'}`}>
              {stats.total}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className={`p-4 rounded-xl ${
              isDark ? 'bg-gray-800' : 'bg-white'
            } border ${
              filterStatus === 'expired' 
                ? 'border-secondary-light shadow-lg' 
                : isDark ? 'border-gray-700' : 'border-gray-200'
            } cursor-pointer transition-all`}
            onClick={() => setFilterStatus('expired')}
          >
            <p className={`text-sm text-secondary-light`}>
              Expired
            </p>
            <p className="text-2xl font-bold text-secondary-light">
              {stats.expired}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className={`p-4 rounded-xl ${
              isDark ? 'bg-gray-800' : 'bg-white'
            } border ${
              filterStatus === 'critical' 
                ? 'border-primary-light shadow-lg' 
                : isDark ? 'border-gray-700' : 'border-gray-200'
            } cursor-pointer transition-all`}
            onClick={() => setFilterStatus('critical')}
          >
            <p className={`text-sm text-primary-light`}>
              Critical (≤3d)
            </p>
            <p className="text-2xl font-bold text-primary-light">
              {stats.critical}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className={`p-4 rounded-xl ${
              isDark ? 'bg-gray-800' : 'bg-white'
            } border ${
              filterStatus === 'warning' 
                ? 'border-yellow-500 shadow-lg' 
                : isDark ? 'border-gray-700' : 'border-gray-200'
            } cursor-pointer transition-all`}
            onClick={() => setFilterStatus('warning')}
          >
            <p className={`text-sm text-yellow-500`}>
              Warning (≤7d)
            </p>
            <p className="text-2xl font-bold text-yellow-500">
              {stats.warning}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className={`p-4 rounded-xl ${
              isDark ? 'bg-gray-800' : 'bg-white'
            } border ${
              filterStatus === 'normal' 
                ? 'border-gray-500 shadow-lg' 
                : isDark ? 'border-gray-700' : 'border-gray-200'
            } cursor-pointer transition-all`}
            onClick={() => setFilterStatus('normal')}
          >
            <p className={`text-sm text-gray-500`}>
              Normal (&gt;7d)
            </p>
            <p className="text-2xl font-bold text-gray-500">
              {stats.normal}
            </p>
          </motion.div>
        </div>

        {/* Filter Info */}
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
          isDark ? 'bg-gray-800' : 'bg-surface-light'
        }`}>
          <FunnelIcon className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
          <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            Showing: <span className="font-semibold">{filterStatus === 'all' ? 'All Items' : filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}</span>
          </span>
          <span className={`ml-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}
          </span>
        </div>
      </motion.div>

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`text-center py-12 rounded-xl ${
            isDark ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            No items found in this category
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`p-5 rounded-xl ${
                isDark ? 'bg-gray-800' : 'bg-white'
              } border-2 ${
                item.expiry_status === 'expired'
                  ? 'border-secondary-light'
                  : item.expiry_status === 'critical'
                  ? 'border-primary-light'
                  : item.expiry_status === 'warning'
                  ? 'border-yellow-500'
                  : isDark ? 'border-gray-700' : 'border-gray-200'
              } hover:shadow-lg transition-all`}
            >
              {/* Item Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className={`font-bold text-lg mb-1 ${
                    isDark ? 'text-white' : 'text-primary-light'
                  }`}>
                    {item.name}
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {item.category}
                  </p>
                </div>
                <div className={`p-2 rounded-lg ${getStatusColor(item.expiry_status)}`}>
                  {getStatusIcon(item.expiry_status)}
                </div>
              </div>

              {/* Item Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                    Stock:
                  </span>
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-primary-light'}`}>
                    {item.stock} {item.unit}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                    Price:
                  </span>
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-primary-light'}`}>
                    ${item.price}
                  </span>
                </div>
              </div>

              {/* Expiry Info */}
              <div className={`p-3 rounded-lg ${
                isDark ? 'bg-gray-700/50' : 'bg-gray-50'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <CalendarIcon className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Expiry Date:
                  </span>
                </div>
                <p className={`font-semibold ${
                  item.expiry_status === 'expired'
                    ? 'text-secondary-light'
                    : item.expiry_status === 'critical'
                    ? 'text-primary-light'
                    : item.expiry_status === 'warning'
                    ? 'text-yellow-500'
                    : isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {formatDate(item.expiry_date)}
                </p>
                <p className={`text-sm mt-1 ${
                  item.expiry_status === 'expired'
                    ? 'text-secondary-light'
                    : item.expiry_status === 'critical'
                    ? 'text-primary-light'
                    : item.expiry_status === 'warning'
                    ? 'text-yellow-500'
                    : isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {getStatusText(item)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
