import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useThemeStore, useCartStore } from '../../store'
import { shopAPI } from '../../services/api'
import { notifications } from '@mantine/notifications'
import {
  MapPinIcon,
  ClockIcon,
  PhoneIcon,
  StarIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  PlusIcon,
  MinusIcon,
} from '@heroicons/react/24/outline'

export default function ShopDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { theme } = useThemeStore()
  const { addItem, items: cartItems, getTotalItems } = useCartStore()
  const isDark = theme === 'dark'
  const [shop, setShop] = useState(null)
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [quantities, setQuantities] = useState({})

  useEffect(() => {
    loadShopData()
  }, [id])

  const loadShopData = async () => {
    try {
      // Check if this is a shop_id (starts with SHP) - real seller
      if (id.startsWith('SHP')) {
        const response = await shopAPI.searchById(id)
        const shopData = response.data.shop
        setShop({
          id: shopData.shop_id,
          shop_id: shopData.shop_id, // Real seller shop ID
          name: shopData.shop_name,
          category: shopData.business_category,
          rating: shopData.rating,
          location: shopData.business_address,
          address: shopData.business_address,
          phone: shopData.phone,
          owner: shopData.owner_name,
          isOpen: shopData.isOpen,
          hours: "Mon-Sun: 8:00 AM - 10:00 PM",
          reviews: shopData.total_sales || 0,
        })
        setInventory(shopData.inventory || [])
        
        // Initialize quantities
        const initialQuantities = {}
        shopData.inventory?.forEach(item => {
          initialQuantities[item.id] = 1
        })
        setQuantities(initialQuantities)
      } else {
        // CSV shop (no shop_id tracking)
        const response = await shopAPI.getById(id)
        setShop({
          ...response.data.shop,
          id: id,
          shop_id: null // No shop_id for CSV shops
        })
        setInventory(response.data.inventory || [])
        
        // Initialize quantities
        const initialQuantities = {}
        response.data.inventory?.forEach(item => {
          initialQuantities[item.id] = 1
        })
        setQuantities(initialQuantities)
      }
    } catch (error) {
      console.error('Error loading shop data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = (item) => {
    const quantity = quantities[item.id] || 1
    addItem({
      ...item,
      shopId: shop.shop_id, // Use shop_id for tracking (null for CSV shops)
      shopName: shop.name,
      quantity: quantity
    })
    
    notifications.show({
      title: 'Added to Cart',
      message: `${item.name} (x${quantity}) added to cart`,
      color: 'green',
    })
  }

  const updateQuantity = (itemId, delta) => {
    setQuantities(prev => ({
      ...prev,
      [itemId]: Math.max(1, (prev[itemId] || 1) + delta)
    }))
  }

  const getItemInCart = (itemId) => {
    return cartItems.find(i => i.id === itemId && i.shopId === shop?.shop_id)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-dark border-t-transparent"></div>
      </div>
    )
  }

  if (!shop) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-primary-light'}`}>
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
        <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-primary-light'}`}>
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
          <div className="w-full md:w-48 h-48 bg-primary-light rounded-lg flex items-center justify-center text-gray-900 text-4xl font-bold">
            {shop.name.charAt(0)}
          </div>

          {/* Shop Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-primary-light'}`}>
                  {shop.name}
                </h1>
                <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {shop.category}
                </p>
              </div>
              <div className={`px-3 py-1 rounded-full ${
                shop.isOpen ? 'bg-primary-light/20 text-primary-light' : 'bg-secondary-light/20 text-secondary-light'
              }`}>
                <span className="font-medium">{shop.isOpen ? 'Open Now' : 'Closed'}</span>
              </div>
            </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  <StarIcon className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-primary-light'}`}>
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

      {/* Cart Floating Button */}
      <AnimatePresence>
        {getTotalItems() > 0 && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/cart')}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-6 py-3 rounded-full bg-primary-light text-white shadow-2xl"
          >
            <ShoppingCartIcon className="w-6 h-6" />
            <span className="font-bold">{getTotalItems()}</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Inventory */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className={`p-6 rounded-xl ${
          isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'
        } shadow-lg`}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <ShoppingBagIcon className="w-6 h-6 text-primary-dark" />
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-primary-light'}`}>
              Available Items
            </h2>
          </div>
          {getTotalItems() > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/cart')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-light text-white font-medium"
            >
              <ShoppingCartIcon className="w-5 h-5" />
              View Cart ({getTotalItems()})
            </motion.button>
          )}
        </div>

        {inventory.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBagIcon className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-700' : 'text-gray-300'}`} />
            <p className={`text-lg ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
              No items available at this shop
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inventory.map((item, index) => {
              const inCart = getItemInCart(item.id)
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 rounded-lg ${
                    isDark ? 'bg-gray-800' : 'bg-gray-50'
                  } relative overflow-hidden`}
                >
                  {inCart && (
                    <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-primary-light text-white text-xs font-bold">
                      {inCart.quantity} in cart
                    </div>
                  )}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-primary-light'}`}>
                        {item.name}
                      </h4>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {item.category}
                      </p>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                      item.stock > 20
                        ? 'bg-primary-light/20 text-primary-light'
                        : item.stock > 10
                        ? 'bg-yellow-500/20 text-yellow-500'
                        : 'bg-secondary-light/20 text-secondary-light'
                    }`}>
                      {item.stock} left
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-primary-light'}`}>
                      ₹{item.price}
                    </p>
                    
                    {/* Quantity Controls */}
                    <div className={`flex items-center gap-2 px-2 py-1 rounded-lg ${
                      isDark ? 'bg-gray-700' : 'bg-white'
                    }`}>
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className={`w-6 h-6 rounded flex items-center justify-center ${
                          isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                        }`}
                      >
                        <MinusIcon className="w-4 h-4" />
                      </button>
                      <span className={`w-8 text-center font-bold ${isDark ? 'text-white' : 'text-primary-light'}`}>
                        {quantities[item.id] || 1}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        disabled={quantities[item.id] >= item.stock}
                        className={`w-6 h-6 rounded flex items-center justify-center ${
                          quantities[item.id] >= item.stock
                            ? 'opacity-50 cursor-not-allowed'
                            : isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                        }`}
                      >
                        <PlusIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAddToCart(item)}
                    disabled={item.stock === 0}
                    className={`w-full py-2 rounded-lg font-medium transition-colors ${
                      item.stock === 0
                        ? 'bg-gray-400 cursor-not-allowed text-gray-600'
                        : 'bg-primary-light text-white hover:bg-primary-light/90'
                    }`}
                  >
                    {item.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </motion.button>
                </motion.div>
              )
            })}
          </div>
        )}
      </motion.div>
    </div>
  )
}
