import { useNavigate } from 'react-router-dom'
import { useThemeStore, useAuthStore, useLocationStore, useCartStore } from '../store'
import { BellIcon, MagnifyingGlassIcon, MapPinIcon, ChevronDownIcon, ShoppingCartIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import ThemeSwitcher from './ThemeSwitcher'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { inventoryAPI } from '../services/api'

export default function Navbar() {
  const navigate = useNavigate()
  const { theme } = useThemeStore()
  const { user, logout } = useAuthStore()
  const { city, setCity } = useLocationStore()
  const { getTotalItems } = useCartStore()
  const [showProfile, setShowProfile] = useState(false)
  const [showLocationMenu, setShowLocationMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [notificationCount, setNotificationCount] = useState(0)
  const isDark = theme === 'dark'
  const cartItemsCount = getTotalItems()

  useEffect(() => {
    if (user) {
      loadNotifications()
      // Refresh notifications every 5 minutes
      const interval = setInterval(loadNotifications, 5 * 60 * 1000)
      return () => clearInterval(interval)
    }
  }, [user])

  const loadNotifications = async () => {
    try {
      const response = await inventoryAPI.getAll()
      const items = response.data.items || []
      
      // Filter for expiring and expired items
      const expiringItems = items.filter(item => 
        item.expiry_status === 'expired' || 
        item.expiry_status === 'critical' || 
        item.expiry_status === 'warning'
      )
      
      setNotifications(expiringItems.slice(0, 5)) // Show max 5
      setNotificationCount(expiringItems.length)
    } catch (error) {
      console.error('Failed to load notifications:', error)
    }
  }

  const availableCities = ['Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai']

  return (
    <nav className={`sticky top-0 z-30 ${
      isDark ? 'bg-gray-900/95 border-gray-800' : 'bg-white/95 border-gray-200'
    } border-b backdrop-blur-sm`}>
      <div className="px-4 py-3 md:px-6 flex items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="flex-1 max-w-xl">
          <div className={`relative ${
            isDark ? 'bg-gray-800' : 'bg-gray-100'
          } rounded-lg`}>
            <MagnifyingGlassIcon className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <input
              type="text"
              placeholder="Search shops, products..."
              className={`w-full pl-10 pr-4 py-2 ${
                isDark ? 'bg-gray-800 text-white placeholder-gray-400' : 'bg-gray-100 text-primary-light placeholder-primary-light/60'
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-dark`}
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Location Selector */}
          {(user?.role === 'customer' || !user?.role) && (
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowLocationMenu(!showLocationMenu)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                  isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
                } transition-colors`}
              >
                <MapPinIcon className={`w-5 h-5 ${city ? 'text-primary-dark' : isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <span className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {city || 'Set Location'}
                </span>
                <ChevronDownIcon className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              </motion.button>

              <AnimatePresence>
                {showLocationMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowLocationMenu(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`absolute right-0 mt-2 w-48 rounded-lg shadow-xl border z-50 ${
                        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="p-2">
                        {availableCities.map((cityName) => (
                          <button
                            key={cityName}
                            onClick={() => {
                              setCity(cityName)
                              setShowLocationMenu(false)
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                              city === cityName
                                ? isDark ? 'bg-primary-dark/20 text-primary-dark' : 'bg-surface-light text-primary-dark'
                                : isDark ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-100 text-gray-700'
                            }`}
                          >
                            {cityName}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Cart Icon (for customers only) */}
          {(user?.role === 'customer' || !user?.role) && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/cart')}
              className={`relative p-2 rounded-lg ${
                isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
              }`}
            >
              <ShoppingCartIcon className={`w-6 h-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-light text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </motion.button>
          )}

          {/* Theme Switcher */}
          <ThemeSwitcher />

          {/* Notifications */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNotifications(!showNotifications)}
              className={`relative p-2 rounded-lg ${
                isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
              }`}
            >
              <BellIcon className={`w-6 h-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
              {notificationCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-secondary-light text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </motion.button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`absolute right-0 mt-2 w-80 ${
                      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    } border rounded-lg shadow-xl overflow-hidden z-50`}
                  >
                    <div className={`px-4 py-3 border-b ${
                      isDark ? 'border-gray-700' : 'border-gray-200'
                    }`}>
                      <h3 className={`font-semibold ${
                        isDark ? 'text-white' : 'text-primary-light'
                      }`}>
                        Expiring Items {notificationCount > 0 && `(${notificationCount})`}
                      </h3>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className={`px-4 py-8 text-center ${
                          isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          <BellIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>No expiring items</p>
                        </div>
                      ) : (
                        notifications.map((item, index) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`px-4 py-3 border-b ${
                              isDark ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'
                            } cursor-pointer transition-colors`}
                            onClick={() => {
                              navigate('/expiring-items')
                              setShowNotifications(false)
                            }}
                          >
                            <div className="flex items-start gap-3">
                              {item.expiry_status === 'expired' ? (
                                <ExclamationTriangleIcon className="w-5 h-5 text-secondary-light flex-shrink-0 mt-0.5" />
                              ) : (
                                <ClockIcon className="w-5 h-5 text-primary-light flex-shrink-0 mt-0.5" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className={`font-medium truncate ${
                                  isDark ? 'text-white' : 'text-primary-light'
                                }`}>
                                  {item.name}
                                </p>
                                <p className={`text-sm ${
                                  isDark ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                  {item.expiry_status === 'expired' 
                                    ? 'Expired' 
                                    : item.expiry_status === 'critical'
                                    ? `Expires in ${item.days_until_expiry} ${item.days_until_expiry === 1 ? 'day' : 'days'}`
                                    : `Expires soon (${item.days_until_expiry} days)`}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                                    item.expiry_status === 'expired'
                                      ? 'bg-secondary-light/20 text-secondary-light'
                                      : item.expiry_status === 'critical'
                                      ? 'bg-primary-light/20 text-primary-light'
                                      : 'bg-yellow-500/20 text-yellow-500'
                                  }`}>
                                    {item.category}
                                  </span>
                                  <span className={`text-xs ${
                                    isDark ? 'text-gray-500' : 'text-gray-400'
                                  }`}>
                                    {item.stock} left
                                  </span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>

                    {notifications.length > 0 && (
                      <div className={`px-4 py-3 border-t ${
                        isDark ? 'border-gray-700' : 'border-gray-200'
                      }`}>
                        <button
                          onClick={() => {
                            navigate('/expiring-items')
                            setShowNotifications(false)
                          }}
                          className={`w-full text-center text-sm font-medium ${
                            isDark ? 'text-primary-light hover:text-primary-dark' : 'text-primary-dark hover:text-primary-light'
                          } transition-colors`}
                        >
                          View All Expiring Items
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
          </div>

          {/* Profile */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowProfile(!showProfile)}
              className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-white font-bold shadow-lg"
            >
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </motion.button>

            <AnimatePresence>
              {showProfile && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowProfile(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`absolute right-0 mt-2 w-64 ${
                      isDark ? 'bg-gray-800' : 'bg-white'
                    } rounded-lg shadow-xl border ${
                      isDark ? 'border-gray-700' : 'border-gray-200'
                    } overflow-hidden z-50`}
                  >
                    <div className={`px-4 py-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                      <p className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {user?.name}
                      </p>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {user?.email}
                      </p>
                      {user?.shop_name && (
                        <div className={`mt-2 px-2 py-1 rounded-md inline-flex items-center gap-1 ${
                          isDark ? 'bg-primary-dark/20' : 'bg-primary-light/10'
                        }`}>
                          <span className="text-xs font-semibold text-primary-light">🏪</span>
                          <span className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {user.shop_name}
                          </span>
                        </div>
                      )}
                      <div className={`mt-2 px-2 py-1 rounded-md inline-block ${
                        user?.role === 'seller' 
                          ? 'bg-blue-500/20 text-blue-500' 
                          : 'bg-green-500/20 text-green-500'
                      }`}>
                        <span className="text-xs font-semibold capitalize">
                          {user?.role || 'Customer'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="py-2">
                      <button
                        onClick={() => {
                          setShowProfile(false)
                          navigate('/profile')
                        }}
                        className={`w-full px-4 py-2 text-left flex items-center gap-2 ${
                          isDark ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-100 text-gray-700'
                        } transition-colors`}
                      >
                        <span className="text-lg">👤</span>
                        <span>My Profile</span>
                      </button>
                      
                      {user?.role === 'customer' && (
                        <>
                          <button
                            onClick={() => {
                              setShowProfile(false)
                              navigate('/loyalty')
                            }}
                            className={`w-full px-4 py-2 text-left flex items-center gap-2 ${
                              isDark ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-100 text-gray-700'
                            } transition-colors`}
                          >
                            <span className="text-lg">🎁</span>
                            <span>Loyalty Rewards</span>
                          </button>
                          
                          <button
                            onClick={() => {
                              setShowProfile(false)
                              navigate('/my-bills')
                            }}
                            className={`w-full px-4 py-2 text-left flex items-center gap-2 ${
                              isDark ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-100 text-gray-700'
                            } transition-colors`}
                          >
                            <span className="text-lg">📄</span>
                            <span>My Bills</span>
                          </button>
                        </>
                      )}
                      
                      {user?.role === 'seller' && (
                        <button
                          onClick={() => {
                            setShowProfile(false)
                            navigate('/seller/dashboard')
                          }}
                          className={`w-full px-4 py-2 text-left flex items-center gap-2 ${
                            isDark ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-100 text-gray-700'
                          } transition-colors`}
                        >
                          <span className="text-lg">📊</span>
                          <span>Dashboard</span>
                        </button>
                      )}
                    </div>
                    
                    <div className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                      <button
                        onClick={() => {
                          setShowProfile(false)
                          logout()
                          window.location.href = '/login'
                        }}
                        className={`w-full px-4 py-2 text-left flex items-center gap-2 ${
                          isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                        } text-red-500 font-medium transition-colors`}
                      >
                        <span className="text-lg">🚪</span>
                        <span>Logout</span>
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </nav>
  )
}
