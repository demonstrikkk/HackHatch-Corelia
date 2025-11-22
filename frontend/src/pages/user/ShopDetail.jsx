import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useThemeStore } from '../../store'
import { shopAPI } from '../../services/api'
import {
  MapPinIcon,
  ClockIcon,
  PhoneIcon,
  StarIcon,
  ShoppingBagIcon,
} from '@heroicons/react/24/outline'

export default function ShopDetail() {
  const { id } = useParams()
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'
  const [shop, setShop] = useState(null)
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadShopData()
  }, [id])

  const loadShopData = async () => {
    try {
      const response = await shopAPI.getById(id)
      setShop(response.data.shop)
      setInventory(response.data.inventory || [])
    } catch (error) {
      console.error('Error loading shop data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    )
  }

  if (!shop) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Shop Not Found
        </h2>
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
          The shop you're looking for doesn't exist.
        </p>
      </div>
    )
  }

  if (!shop) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Shop Not Found
        </h2>
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
          The shop you're looking for doesn't exist.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Shop Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-6 rounded-xl ${
          isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'
        } shadow-lg`}
      >
        <div className="flex flex-col md:flex-row gap-6">
          {/* Shop Image */}
          <div className="w-full md:w-48 h-48 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-4xl font-bold">
            {shop.name.charAt(0)}
          </div>

          {/* Shop Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {shop.name}
                </h1>
                <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {shop.category}
                </p>
              </div>
              <div className={`px-3 py-1 rounded-full ${
                shop.isOpen ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
              }`}>
                <span className="font-medium">{shop.isOpen ? 'Open Now' : 'Closed'}</span>
              </div>
            </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  <StarIcon className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {shop.rating || 4.0}
                  </span>
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    ({shop.reviews || 0} reviews)
                  </span>
                </div>
                {shop.location && (
                  <div className="flex items-center gap-1">
                    <MapPinIcon className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                      {shop.location}
                    </span>
                  </div>
                )}
              </div>              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-start gap-2">
                <MapPinIcon className={`w-5 h-5 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Address</p>
                  <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>{shop.address}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <PhoneIcon className={`w-5 h-5 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Phone</p>
                  <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>{shop.phone || 'N/A'}</p>
                </div>
              </div>
              {shop.owner && (
                <div className="flex items-start gap-2">
                  <div className={`w-5 h-5 mt-0.5 flex items-center justify-center rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`}>
                    <span className="text-xs">👤</span>
                  </div>
                  <div>
                    <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Owner</p>
                    <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>{shop.owner}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-2">
                <ClockIcon className={`w-5 h-5 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Hours</p>
                  <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>{shop.hours || 'Mon-Sun: 8:00 AM - 10:00 PM'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Inventory */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className={`p-6 rounded-xl ${
          isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'
        } shadow-lg`}
      >
        <div className="flex items-center gap-2 mb-6">
          <ShoppingBagIcon className="w-6 h-6 text-blue-500" />
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Available Items
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {inventory.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`p-4 rounded-lg ${
                isDark ? 'bg-gray-800' : 'bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {item.name}
                  </h4>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {item.category}
                  </p>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  item.stock > 20
                    ? 'bg-green-500/20 text-green-500'
                    : item.stock > 10
                    ? 'bg-yellow-500/20 text-yellow-500'
                    : 'bg-red-500/20 text-red-500'
                }`}>
                  {item.stock} in stock
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  ₹{item.price}
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-3 py-1 rounded bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors"
                >
                  Add to Cart
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
