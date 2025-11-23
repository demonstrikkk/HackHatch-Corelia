import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useThemeStore, useCartStore } from '../../store'
import { inventoryAPI, userAPI } from '../../services/api'
import { notifications } from '@mantine/notifications'
import {
  ShoppingCartIcon,
  TrashIcon,
  PlusIcon,
  MinusIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'

export default function Cart() {
  const navigate = useNavigate()
  const { theme } = useThemeStore()
  const { items, removeItem, updateQuantity, clearCart, getTotalPrice } = useCartStore()
  const isDark = theme === 'dark'
  const [processing, setProcessing] = useState(false)

  const handleCheckout = async () => {
    if (items.length === 0) {
      notifications.show({
        title: 'Cart Empty',
        message: 'Add items to cart before checkout',
        color: 'orange',
      })
      return
    }

    setProcessing(true)
    
    try {
      // Deduct stock from seller inventories (only for real sellers with shop_id)
      const stockDeductionItems = items
        .filter(item => item.shopId) // Only items from real sellers
        .map(item => ({
          shop_id: item.shopId, // Use shop_id instead of shop_name
          name: item.name,
          quantity: item.quantity,
        }))
      
      if (stockDeductionItems.length > 0) {
        await inventoryAPI.deductStock(stockDeductionItems)
      }
      
      // Process each item in cart (add to customer's purchase history)
      const purchases = items.map(item => ({
        name: item.name,
        category: item.category,
        price: item.price,
        stock: item.quantity,
        unit: item.unit || 'pcs',
        shop_name: item.shopName,
        shop_id: item.shopId,
      }))

      // Send to backend to add to customer inventory
      for (const purchase of purchases) {
        await inventoryAPI.create(purchase)
      }

      // Generate bill for this purchase
      const totalAmount = getTotalPrice()
      const billItems = items.map(item => ({
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,
        shop_name: item.shopName,
        shop_id: item.shopId, // Include shop_id
      }))

      // Determine shop name and ID (single or multiple shops)
      const uniqueShops = [...new Set(items.map(item => item.shopName))]
      const uniqueShopIds = [...new Set(items.map(item => item.shopId).filter(Boolean))]
      const shopName = uniqueShops.length === 1 ? uniqueShops[0] : 'Multiple Shops'
      const shopId = uniqueShopIds.length === 1 ? uniqueShopIds[0] : null

      const billResponse = await userAPI.createBill({
        items: billItems,
        total_amount: totalAmount,
        shop_name: shopName,
        shop_id: shopId, // Include shop_id for sales tracking
      })

      notifications.show({
        title: 'Purchase Successful! 🎉',
        message: `${items.length} items purchased successfully!`,
        color: 'green',
        autoClose: 3000,
      })

      clearCart()
      
      // Redirect to home page after successful purchase
      setTimeout(() => {
        navigate('/home', { replace: true })
      }, 1500)
      
    } catch (error) {
      console.error('Checkout error:', error)
      notifications.show({
        title: 'Checkout Failed',
        message: error.response?.data?.detail || 'Failed to complete purchase',
        color: 'red',
      })
    } finally {
      setProcessing(false)
    }
  }

  // Group items by shop
  const itemsByShop = items.reduce((acc, item) => {
    const shopName = item.shopName || 'Unknown Shop'
    if (!acc[shopName]) {
      acc[shopName] = []
    }
    acc[shopName].push(item)
    return acc
  }, {})

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.5 }}
        >
          <ShoppingCartIcon className={`w-24 h-24 mb-6 ${isDark ? 'text-gray-700' : 'text-gray-300'}`} />
        </motion.div>
        <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-primary-light'}`}>
          Your Cart is Empty
        </h2>
        <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Add items from shops to get started
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/shops')}
          className="px-6 py-3 rounded-lg bg-primary-light text-white font-semibold"
        >
          Browse Shops
        </motion.button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className={`text-3xl md:text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-primary-light'}`}>
            Shopping Cart 🛒
          </h1>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            {items.length} item{items.length !== 1 ? 's' : ''} in your cart
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={clearCart}
          className={`px-4 py-2 rounded-lg ${
            isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
          } font-medium transition-colors`}
        >
          Clear Cart
        </motion.button>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {Object.entries(itemsByShop).map(([shopName, shopItems]) => (
            <motion.div
              key={shopName}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-xl ${
                isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'
              } shadow-lg`}
            >
              <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-primary-light'}`}>
                {shopName}
              </h3>
              
              <div className="space-y-3">
                {shopItems.map((item) => (
                  <motion.div
                    key={`${item.id}-${item.shopId}`}
                    layout
                    className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Item Info */}
                      <div className="flex-1">
                        <h4 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-primary-light'}`}>
                          {item.name}
                        </h4>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {item.category}
                        </p>
                        <p className={`text-lg font-bold mt-2 ${isDark ? 'text-white' : 'text-primary-light'}`}>
                          ₹{item.price} × {item.quantity} = ₹{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex flex-col items-end gap-2">
                        <div className={`flex items-center gap-2 px-2 py-1 rounded-lg ${
                          isDark ? 'bg-gray-700' : 'bg-white'
                        }`}>
                          <button
                            onClick={() => updateQuantity(item.id, item.shopId, item.quantity - 1)}
                            className={`w-8 h-8 rounded flex items-center justify-center ${
                              isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                            }`}
                          >
                            <MinusIcon className="w-4 h-4" />
                          </button>
                          <span className={`w-10 text-center font-bold ${isDark ? 'text-white' : 'text-primary-light'}`}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.shopId, item.quantity + 1)}
                            className={`w-8 h-8 rounded flex items-center justify-center ${
                              isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                            }`}
                          >
                            <PlusIcon className="w-4 h-4" />
                          </button>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => removeItem(item.id, item.shopId)}
                          className="p-2 rounded-lg bg-secondary-light/20 text-secondary-light hover:bg-secondary-light/30"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`p-6 rounded-xl ${
              isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'
            } shadow-lg sticky top-6`}
          >
            <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-primary-light'}`}>
              Order Summary
            </h3>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  Items ({items.reduce((sum, item) => sum + item.quantity, 0)})
                </span>
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-primary-light'}`}>
                  ₹{getTotalPrice().toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Delivery</span>
                <span className={`font-semibold text-primary-light`}>FREE</span>
              </div>
              <div className={`pt-3 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
                <div className="flex justify-between text-lg">
                  <span className={`font-bold ${isDark ? 'text-white' : 'text-primary-light'}`}>Total</span>
                  <span className={`font-bold ${isDark ? 'text-white' : 'text-primary-light'}`}>
                    ₹{getTotalPrice().toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCheckout}
              disabled={processing}
              className={`w-full py-3 rounded-lg font-bold text-white transition-colors ${
                processing
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-primary-light hover:bg-primary-light/90'
              }`}
            >
              {processing ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Processing...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <CheckCircleIcon className="w-6 h-6" />
                  Complete Purchase
                </span>
              )}
            </motion.button>

            <div className={`mt-4 p-3 rounded-lg ${
              isDark ? 'bg-primary-light/10 border border-primary-light/20' : 'bg-primary-light/10 border border-primary-light/20'
            }`}>
              <p className={`text-sm ${isDark ? 'text-primary-light' : 'text-primary-light'}`}>
                💡 Items will be automatically added to your inventory with smart expiry dates!
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
