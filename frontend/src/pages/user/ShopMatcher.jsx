import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useThemeStore } from '../../store'
import { shopAPI } from '../../services/api'
import { notifications } from '@mantine/notifications'
import {
  PlusIcon,
  XMarkIcon,
  SparklesIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'

export default function ShopMatcher() {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'
  const navigate = useNavigate()
  
  const [groceryList, setGroceryList] = useState([])
  const [currentItem, setCurrentItem] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)

  const addItem = () => {
    if (currentItem.trim()) {
      setGroceryList([...groceryList, { name: currentItem.trim(), id: Date.now() }])
      setCurrentItem('')
    }
  }

  const removeItem = (id) => {
    setGroceryList(groceryList.filter(item => item.id !== id))
  }

  const findBestMatch = async () => {
    if (groceryList.length === 0) {
      notifications.show({
        title: 'Empty List',
        message: 'Please add items to your grocery list',
        color: 'orange',
      })
      return
    }

    setLoading(true)
    try {
      const response = await shopAPI.matchGroceryList(groceryList.map(i => i.name))
      setResults(response.data)
      notifications.show({
        title: 'Match Complete!',
        message: `Found ${response.data.matches.length} matching shops`,
        color: 'green',
      })
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to find matches',
        color: 'red',
      })
    } finally {
      setLoading(false)
    }
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
          Smart Shop Matcher 🎯
        </h1>
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
          Enter your grocery list and find the best shop match
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`p-6 rounded-xl ${
            isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'
          } shadow-lg`}
        >
          <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Your Grocery List
          </h2>

          {/* Input */}
          <div className="flex gap-2 mb-6">
            <input
              type="text"
              value={currentItem}
              onChange={(e) => setCurrentItem(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addItem()}
              placeholder="Add item (e.g., Milk, Bread...)"
              className={`flex-1 px-4 py-3 rounded-lg ${
                isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
              } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={addItem}
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold"
            >
              <PlusIcon className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Item List */}
          <div className="space-y-2 mb-6 max-h-96 overflow-y-auto">
            <AnimatePresence>
              {groceryList.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    isDark ? 'bg-gray-800' : 'bg-gray-50'
                  }`}
                >
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>
                    {item.name}
                  </span>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {groceryList.length > 0 && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={findBestMatch}
              disabled={loading}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:shadow-lg transition-shadow disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Finding Best Match...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <SparklesIcon className="w-5 h-5" />
                  Find Best Match
                </span>
              )}
            </motion.button>
          )}
        </motion.div>

        {/* Results Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`p-6 rounded-xl ${
            isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'
          } shadow-lg`}
        >
          <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Match Results
          </h2>

          {!results ? (
            <div className="flex flex-col items-center justify-center py-20">
              <SparklesIcon className={`w-20 h-20 mb-4 ${isDark ? 'text-gray-700' : 'text-gray-300'}`} />
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                Add items and click "Find Best Match"
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {results.matches?.map((shop, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg border-2 ${
                    index === 0
                      ? 'border-green-500 bg-green-500/10'
                      : isDark
                      ? 'border-gray-800 bg-gray-800'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  {index === 0 && (
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircleIcon className="w-5 h-5 text-green-500" />
                      <span className="text-sm font-semibold text-green-500">BEST MATCH</span>
                    </div>
                  )}
                  
                  <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {shop.name}
                  </h3>
                  
                  {shop.location && (
                    <p className={`text-sm mb-3 flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      <MapPinIcon className="w-4 h-4" />
                      {shop.location}
                    </p>
                  )}
                  
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <CurrencyDollarIcon className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                      <div>
                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Total Cost</p>
                        <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          ₹{shop.totalPrice}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <CheckCircleIcon className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                      <div>
                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Matched</p>
                        <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {shop.matchedItems}/{groceryList.length}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        shop.availability >= 90
                          ? 'bg-green-500/20 text-green-500'
                          : shop.availability >= 70
                          ? 'bg-yellow-500/20 text-yellow-500'
                          : 'bg-red-500/20 text-red-500'
                      }`}>
                        {shop.availability}% Available
                      </div>
                      <div className="text-sm">
                        <span className="text-yellow-500">★</span>
                        <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                          {' '}{shop.rating}
                        </span>
                      </div>
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate(`/shops/${shop.id}`)}
                      className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors"
                    >
                      View Shop
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
