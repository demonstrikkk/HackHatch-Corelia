import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useThemeStore, useAuthStore } from '../../store'
import { userAPI } from '../../services/api'
import { 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon,
  ShoppingBagIcon,
  TrophyIcon,
  CalendarIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  BuildingStorefrontIcon
} from '@heroicons/react/24/outline'
import { notifications } from '@mantine/notifications'

export default function Profile() {
  const { theme } = useThemeStore()
  const { user, updateUser } = useAuthStore()
  const isDark = theme === 'dark'
  
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editingBusiness, setEditingBusiness] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
  })
  const [businessData, setBusinessData] = useState({
    shop_name: '',
    business_category: '',
    business_address: '',
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    setLoading(true)
    try {
      const response = await userAPI.getProfile()
      setProfile(response.data.user)
      setFormData({
        name: response.data.user.name || '',
        phone: response.data.user.phone || '',
        address: response.data.user.address || '',
      })
      setBusinessData({
        shop_name: response.data.user.shop_name || '',
        business_category: response.data.user.business_category || '',
        business_address: response.data.user.business_address || '',
      })
    } catch (error) {
      console.error('Failed to load profile:', error)
      notifications.show({
        title: 'Error',
        message: 'Failed to load profile',
        color: 'red',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      await userAPI.updateProfile(formData)
      updateUser({ ...user, ...formData })
      setProfile({ ...profile, ...formData })
      setEditing(false)
      
      notifications.show({
        title: 'Success!',
        message: 'Profile updated successfully',
        color: 'green',
      })
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to update profile',
        color: 'red',
      })
    }
  }

  const handleCancel = () => {
    setFormData({
      name: profile?.name || '',
      phone: profile?.phone || '',
      address: profile?.address || '',
    })
    setEditing(false)
  }

  const handleBusinessSave = async () => {
    try {
      await userAPI.updateProfile(businessData)
      updateUser({ ...user, ...businessData })
      setProfile({ ...profile, ...businessData })
      setEditingBusiness(false)
      
      notifications.show({
        title: 'Success!',
        message: 'Business information updated successfully',
        color: 'green',
      })
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to update business information',
        color: 'red',
      })
    }
  }

  const handleBusinessCancel = () => {
    setBusinessData({
      shop_name: profile?.shop_name || '',
      business_category: profile?.business_category || '',
      business_address: profile?.business_address || '',
    })
    setEditingBusiness(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-light"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className={`text-3xl md:text-4xl font-bold mb-2 ${
          isDark ? 'text-white' : 'text-primary-light'
        }`}>
          My Profile
        </h1>
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
          Manage your account information
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`lg:col-span-1 p-6 rounded-xl ${
            isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'
          } shadow-lg`}
        >
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-light to-secondary-dark flex items-center justify-center text-white text-4xl font-bold shadow-xl mb-4">
              {profile?.name?.charAt(0).toUpperCase()}
            </div>
            
            <h2 className={`text-2xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {profile?.name}
            </h2>
            
            <div className={`px-3 py-1 rounded-full ${
              profile?.role === 'seller' 
                ? 'bg-blue-500/20 text-blue-500' 
                : 'bg-green-500/20 text-green-500'
            } text-sm font-semibold mb-4`}>
              {profile?.role === 'seller' ? '🏪 Seller' : '🛒 Customer'}
            </div>

            {profile?.shop_name && (
              <div className={`w-full p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} text-center mb-4`}>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                  Shop Name
                </p>
                <p className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {profile.shop_name}
                </p>
              </div>
            )}

            {profile?.shop_id && (
              <div className={`w-full p-3 rounded-lg bg-gradient-to-r from-primary-light/20 to-secondary-light/20 border-2 ${
                isDark ? 'border-primary-light/30' : 'border-primary-light/50'
              } text-center mb-4`}>
                <p className={`text-xs uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                  Your Unique Shop ID
                </p>
                <p className={`font-bold text-xl ${isDark ? 'text-primary-light' : 'text-primary-dark'} font-mono tracking-wider`}>
                  {profile.shop_id}
                </p>
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                  Share this ID with customers
                </p>
              </div>
            )}

            <div className={`w-full space-y-3 mt-4 pt-4 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
              <div className="flex items-center gap-2">
                <EnvelopeIcon className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {profile?.email}
                </span>
              </div>
              
              {profile?.phone && (
                <div className="flex items-center gap-2">
                  <PhoneIcon className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {profile.phone}
                  </span>
                </div>
              )}
              
              {profile?.created_at && (
                <div className="flex items-center gap-2">
                  <CalendarIcon className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Joined {new Date(profile.created_at).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Profile Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`lg:col-span-2 p-6 rounded-xl ${
            isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'
          } shadow-lg`}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Profile Information
            </h3>
            {!editing ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-light text-white font-semibold"
              >
                <PencilIcon className="w-4 h-4" />
                Edit Profile
              </motion.button>
            ) : (
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 text-white font-semibold"
                >
                  <CheckIcon className="w-4 h-4" />
                  Save
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCancel}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                    isDark ? 'bg-gray-800' : 'bg-gray-200'
                  } font-semibold`}
                >
                  <XMarkIcon className="w-4 h-4" />
                  Cancel
                </motion.button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Full Name
              </label>
              {editing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg ${
                    isDark ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'
                  } border ${isDark ? 'border-gray-700' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary-light`}
                />
              ) : (
                <p className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-800 text-white' : 'bg-gray-50 text-gray-900'}`}>
                  {profile?.name}
                </p>
              )}
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Email Address
              </label>
              <p className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-50 text-gray-600'}`}>
                {profile?.email} <span className="text-xs">(Cannot be changed)</span>
              </p>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Phone Number
              </label>
              {editing ? (
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter phone number"
                  className={`w-full px-4 py-2 rounded-lg ${
                    isDark ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'
                  } border ${isDark ? 'border-gray-700' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary-light`}
                />
              ) : (
                <p className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-800 text-white' : 'bg-gray-50 text-gray-900'}`}>
                  {profile?.phone || 'Not provided'}
                </p>
              )}
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Address
              </label>
              {editing ? (
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Enter your address"
                  rows={3}
                  className={`w-full px-4 py-2 rounded-lg ${
                    isDark ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'
                  } border ${isDark ? 'border-gray-700' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary-light`}
                />
              ) : (
                <p className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-800 text-white' : 'bg-gray-50 text-gray-900'}`}>
                  {profile?.address || 'Not provided'}
                </p>
              )}
            </div>
          </div>

          {/* Stats Section for Customers */}
          {profile?.role === 'customer' && (
            <div className={`mt-6 pt-6 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
              <h4 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Account Stats
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} text-center`}>
                  <TrophyIcon className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {profile?.loyalty_points || 0}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Loyalty Points
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} text-center`}>
                  <ShoppingBagIcon className="w-8 h-8 mx-auto mb-2 text-primary-light" />
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    0
                  </p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Total Orders
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Business Setup Section */}
          {profile?.role === 'seller' && (
            <div className={`mt-6 pt-6 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between mb-4">
                <h4 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  🏪 Business Information
                </h4>
                {!editingBusiness ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setEditingBusiness(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-light text-white font-semibold text-sm"
                  >
                    <PencilIcon className="w-4 h-4" />
                    Edit Business
                  </motion.button>
                ) : (
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleBusinessSave}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500 text-white font-semibold text-sm"
                    >
                      <CheckIcon className="w-4 h-4" />
                      Save
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleBusinessCancel}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-200'} font-semibold text-sm`}
                    >
                      <XMarkIcon className="w-4 h-4" />
                      Cancel
                    </motion.button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Shop Name *
                  </label>
                  {editingBusiness ? (
                    <input
                      type="text"
                      value={businessData.shop_name}
                      onChange={(e) => setBusinessData({ ...businessData, shop_name: e.target.value })}
                      placeholder="Enter your shop name"
                      className={`w-full px-4 py-2 rounded-lg ${isDark ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'} border ${isDark ? 'border-gray-700' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary-light`}
                    />
                  ) : (
                    <p className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-800 text-white' : 'bg-gray-50 text-gray-900'}`}>
                      {profile?.shop_name || 'Not set'}
                    </p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Business Category
                  </label>
                  {editingBusiness ? (
                    <select
                      value={businessData.business_category}
                      onChange={(e) => setBusinessData({ ...businessData, business_category: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg ${isDark ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'} border ${isDark ? 'border-gray-700' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary-light`}
                    >
                      <option value="">Select a category</option>
                      <option value="Grocery Store">Grocery Store</option>
                      <option value="Supermarket">Supermarket</option>
                      <option value="Convenience Store">Convenience Store</option>
                      <option value="Organic Store">Organic Store</option>
                      <option value="Specialty Store">Specialty Store</option>
                      <option value="Pharmacy">Pharmacy</option>
                      <option value="Bakery">Bakery</option>
                      <option value="Butcher Shop">Butcher Shop</option>
                      <option value="Fish Market">Fish Market</option>
                      <option value="Farmers Market">Farmers Market</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <p className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-800 text-white' : 'bg-gray-50 text-gray-900'}`}>
                      {profile?.business_category || 'Not set'}
                    </p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Business Address
                  </label>
                  {editingBusiness ? (
                    <textarea
                      value={businessData.business_address}
                      onChange={(e) => setBusinessData({ ...businessData, business_address: e.target.value })}
                      placeholder="Enter your business address"
                      rows={3}
                      className={`w-full px-4 py-2 rounded-lg ${isDark ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'} border ${isDark ? 'border-gray-700' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary-light`}
                    />
                  ) : (
                    <p className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-800 text-white' : 'bg-gray-50 text-gray-900'}`}>
                      {profile?.business_address || 'Not set'}
                    </p>
                  )}
                </div>

                {!editingBusiness && (!profile?.shop_name || !profile?.business_category || !profile?.business_address) && (
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-yellow-900/20 border border-yellow-700' : 'bg-yellow-50 border border-yellow-200'}`}>
                    <p className={`text-sm ${isDark ? 'text-yellow-400' : 'text-yellow-800'}`}>
                      ⚠️ Complete your business information to start selling on Corelia
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
