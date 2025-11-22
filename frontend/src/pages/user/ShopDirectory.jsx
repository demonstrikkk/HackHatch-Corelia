import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useThemeStore } from '../../store'
import { shopAPI } from '../../services/api'
import { MagnifyingGlassIcon, MapPinIcon, StarIcon, ClockIcon } from '@heroicons/react/24/outline'

export default function ShopDirectory() {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'
  const [shops, setShops] = useState([])
  const [filteredShops, setFilteredShops] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    loadShops()
  }, [])

  useEffect(() => {
    filterShops()
  }, [searchQuery, filter, shops])

  const loadShops = async () => {
    try {
      const response = await shopAPI.getAll()
      setShops(response.data.shops || mockShops)
      setFilteredShops(response.data.shops || mockShops)
    } catch (error) {
      setShops(mockShops)
      setFilteredShops(mockShops)
    } finally {
      setLoading(false)
    }
  }

  const filterShops = () => {
    let filtered = shops

    if (searchQuery) {
      filtered = filtered.filter(shop =>
        shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shop.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (filter !== 'all') {
      filtered = filtered.filter(shop => shop.category === filter)
    }

    setFilteredShops(filtered)
  }

  const mockShops = [
    { id: 1, name: 'Fresh Mart', category: 'Grocery', distance: 0.8, rating: 4.5, isOpen: true, image: 'shop1' },
    { id: 2, name: 'Green Valley', category: 'Organic', distance: 1.2, rating: 4.7, isOpen: true, image: 'shop2' },
    { id: 3, name: 'Quick Stop', category: 'Convenience', distance: 0.5, rating: 4.2, isOpen: false, image: 'shop3' },
    { id: 4, name: 'Super Saver', category: 'Grocery', distance: 2.1, rating: 4.6, isOpen: true, image: 'shop4' },
    { id: 5, name: 'Local Bazar', category: 'Market', distance: 1.5, rating: 4.4, isOpen: true, image: 'shop5' },
    { id: 6, name: 'Healthy Choice', category: 'Organic', distance: 1.8, rating: 4.8, isOpen: true, image: 'shop6' },
  ]

  const categories = ['all', 'Grocery', 'Organic', 'Convenience', 'Market']

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
          Shop Directory 🏪
        </h1>
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
          Discover local shops and stores near you
        </p>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`p-6 rounded-xl ${
          isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'
        } shadow-lg`}
      >
        {/* Search Bar */}
        <div className="relative mb-4">
          <MagnifyingGlassIcon className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search shops..."
            className={`w-full pl-12 pr-4 py-3 rounded-lg ${
              isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
            } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 flex-wrap">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === category
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                  : isDark
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Shop Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredShops.map((shop, index) => (
            <motion.div
              key={shop.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <Link
                to={`/shops/${shop.id}`}
                className={`block p-6 rounded-xl ${
                  isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'
                } shadow-lg hover:shadow-2xl transition-all`}
              >
                {/* Shop Image */}
                <div className="w-full h-40 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg mb-4 flex items-center justify-center text-white text-2xl font-bold">
                  {shop.name.charAt(0)}
                </div>

                {/* Shop Info */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {shop.name}
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {shop.category}
                    </p>
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                    shop.isOpen ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                  }`}>
                    <ClockIcon className="w-4 h-4" />
                    <span className="text-xs font-medium">{shop.isOpen ? 'Open' : 'Closed'}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <StarIcon className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {shop.rating}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPinIcon className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {shop.distance} km
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {filteredShops.length === 0 && !loading && (
        <div className="text-center py-20">
          <p className={`text-xl ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            No shops found
          </p>
        </div>
      )}
    </div>
  )
}
