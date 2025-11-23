import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useThemeStore } from '../store'
import { inventoryAPI } from '../services/api'
import {
  ExclamationTriangleIcon,
  ClockIcon,
  XMarkIcon,
  BellAlertIcon
} from '@heroicons/react/24/outline'

export default function ExpiringItemsAlert() {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'
  const [expiringData, setExpiringData] = useState(null)
  const [showAlert, setShowAlert] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    loadExpiringItems()
    // Check every 5 minutes
    const interval = setInterval(loadExpiringItems, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const loadExpiringItems = async () => {
    try {
      const response = await inventoryAPI.getExpiring()
      const data = response.data
      
      if (data.total_count > 0 && !dismissed) {
        setExpiringData(data)
        setShowAlert(true)
      }
    } catch (error) {
      console.error('Failed to fetch expiring items:', error)
    }
  }

  const handleDismiss = () => {
    setDismissed(true)
    setShowAlert(false)
    // Reset dismissed after 1 hour
    setTimeout(() => setDismissed(false), 60 * 60 * 1000)
  }

  if (!showAlert || !expiringData) return null

  const { expiring_items, expired_count, critical_count, warning_count } = expiringData

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="fixed top-20 right-6 z-50 w-96 max-w-[90vw]"
      >
        <div
          className={`rounded-xl shadow-2xl border-2 ${
            isDark
              ? 'bg-gray-800 border-primary-dark'
              : 'bg-surface-light border-primary-light'
          } overflow-hidden`}
        >
          {/* Header */}
          <div
            className={`p-4 flex items-center justify-between ${
              expired_count > 0
                ? 'bg-secondary-light'
                : critical_count > 0
                ? 'bg-primary-light'
                : 'bg-primary-light'
            }`}
          >
            <div className="flex items-center gap-3">
              <BellAlertIcon className="w-6 h-6 text-gray-900 animate-pulse" />
              <div>
                <h3 className="font-bold text-gray-900">
                  {expired_count > 0
                    ? 'Items Expired!'
                    : 'Items Expiring Soon'}
                </h3>
                <p className="text-sm text-gray-900">
                  {expired_count > 0 && `${expired_count} expired, `}
                  {critical_count > 0 && `${critical_count} critical, `}
                  {warning_count > 0 && `${warning_count} in 7 days`}
                </p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-gray-900" />
            </button>
          </div>

          {/* Items List */}
          <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
            {expiring_items.slice(0, 5).map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-3 rounded-lg flex items-center justify-between ${
                  isDark
                    ? 'bg-gray-700/50'
                    : 'bg-white/50'
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  {item.expiry_status === 'expired' ? (
                    <ExclamationTriangleIcon className="w-5 h-5 text-secondary-light flex-shrink-0" />
                  ) : (
                    <ClockIcon className="w-5 h-5 text-primary-light flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold truncate ${isDark ? 'text-white' : 'text-primary-light'}`}>
                      {item.name}
                    </p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {item.stock} {item.unit} • {item.category}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <p
                    className={`text-sm font-bold ${
                      item.expiry_status === 'expired'
                        ? 'text-secondary-light'
                        : item.expiry_status === 'critical'
                        ? 'text-primary-light'
                        : 'text-primary-light'
                    }`}
                  >
                    {item.days_until_expiry < 0
                      ? `${Math.abs(item.days_until_expiry)}d ago`
                      : item.days_until_expiry === 0
                      ? 'Today'
                      : item.days_until_expiry === 1
                      ? 'Tomorrow'
                      : `${item.days_until_expiry}d left`}
                  </p>
                </div>
              </motion.div>
            ))}
            
            {expiring_items.length > 5 && (
              <p className={`text-sm text-center pt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                +{expiring_items.length - 5} more items
              </p>
            )}
          </div>

          {/* Footer */}
          <div
            className={`p-3 border-t ${
              isDark ? 'border-gray-700' : 'border-gray-200'
            }`}
          >
            <a
              href="/seller/inventory"
              className={`block text-center text-sm font-semibold ${
                isDark ? 'text-primary-light' : 'text-primary-light'
              } hover:underline`}
            >
              View All in Inventory →
            </a>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
