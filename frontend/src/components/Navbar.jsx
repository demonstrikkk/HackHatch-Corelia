import { useThemeStore, useAuthStore, useLocationStore } from '../store'
import { BellIcon, MagnifyingGlassIcon, MapPinIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import ThemeSwitcher from './ThemeSwitcher'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

export default function Navbar() {
  const { theme } = useThemeStore()
  const { user, logout } = useAuthStore()
  const { city, setCity } = useLocationStore()
  const [showProfile, setShowProfile] = useState(false)
  const [showLocationMenu, setShowLocationMenu] = useState(false)
  const isDark = theme === 'dark'

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
                isDark ? 'bg-gray-800 text-white placeholder-gray-400' : 'bg-gray-100 text-gray-800 placeholder-gray-500'
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
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
                <MapPinIcon className={`w-5 h-5 ${city ? 'text-blue-500' : isDark ? 'text-gray-400' : 'text-gray-500'}`} />
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
                                ? isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600'
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

          {/* Theme Switcher */}
          <ThemeSwitcher />

          {/* Notifications */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`relative p-2 rounded-lg ${
              isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
            }`}
          >
            <BellIcon className={`w-6 h-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </motion.button>

          {/* Profile */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowProfile(!showProfile)}
              className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold"
            >
              {user?.name?.charAt(0) || 'U'}
            </motion.button>

            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`absolute right-0 mt-2 w-48 ${
                  isDark ? 'bg-gray-800' : 'bg-white'
                } rounded-lg shadow-xl border ${
                  isDark ? 'border-gray-700' : 'border-gray-200'
                } overflow-hidden`}
              >
                <div className={`px-4 py-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <p className="font-medium">{user?.name}</p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{user?.email}</p>
                </div>
                <button
                  onClick={() => {
                    logout()
                    window.location.href = '/login'
                  }}
                  className={`w-full px-4 py-2 text-left ${
                    isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  } text-red-500`}
                >
                  Logout
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
