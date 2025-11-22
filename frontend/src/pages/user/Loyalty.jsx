import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useThemeStore, useLoyaltyStore } from '../../store'
import { userAPI } from '../../services/api'
import { TrophyIcon, SparklesIcon, GiftIcon } from '@heroicons/react/24/outline'

export default function Loyalty() {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'
  const { points } = useLoyaltyStore()
  const [rewards, setRewards] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLoyaltyData()
  }, [])

  const loadLoyaltyData = async () => {
    try {
      const response = await userAPI.getLoyalty()
      setRewards(response.data.rewards || mockRewards)
    } catch (error) {
      setRewards(mockRewards)
    } finally {
      setLoading(false)
    }
  }

  const mockRewards = [
    { id: 1, name: '$5 Discount', points: 500, description: 'Get $5 off your next purchase', icon: '💵' },
    { id: 2, name: 'Free Delivery', points: 300, description: 'One free delivery on any order', icon: '🚚' },
    { id: 3, name: '$10 Discount', points: 1000, description: 'Get $10 off your next purchase', icon: '💰' },
    { id: 4, name: 'Premium Member (1 Month)', points: 2000, description: 'Access exclusive deals', icon: '⭐' },
  ]

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
          Loyalty Rewards 🎁
        </h1>
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
          Earn points and redeem amazing rewards
        </p>
      </motion.div>

      {/* Points Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-8 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-2xl`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90 mb-2">Your Balance</p>
            <p className="text-5xl font-bold">{points || 1250}</p>
            <p className="text-sm opacity-90 mt-2">Loyalty Points</p>
          </div>
          <TrophyIcon className="w-24 h-24 opacity-20" />
        </div>
        <div className="mt-6 flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-1 py-3 rounded-lg bg-white/20 backdrop-blur-sm font-semibold hover:bg-white/30"
          >
            Earn More Points
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-1 py-3 rounded-lg bg-white text-purple-600 font-semibold hover:bg-gray-100"
          >
            View History
          </motion.button>
        </div>
      </motion.div>

      {/* Available Rewards */}
      <div>
        <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Available Rewards
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rewards.map((reward, index) => (
            <motion.div
              key={reward.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className={`p-6 rounded-xl ${
                isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'
              } shadow-lg`}
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl">{reward.icon}</div>
                <div className="flex-1">
                  <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {reward.name}
                  </h3>
                  <p className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {reward.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <SparklesIcon className="w-5 h-5 text-yellow-500" />
                      <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {reward.points} points
                      </span>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={(points || 1250) < reward.points}
                      className={`px-4 py-2 rounded-lg font-semibold ${
                        (points || 1250) >= reward.points
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {(points || 1250) >= reward.points ? 'Redeem' : 'Not Enough Points'}
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* How to Earn */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className={`p-6 rounded-xl ${
          isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'
        } shadow-lg`}
      >
        <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          How to Earn Points
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="text-3xl mb-2">🛒</div>
            <h4 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Shop & Earn
            </h4>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Earn 10 points for every $1 spent
            </p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="text-3xl mb-2">⭐</div>
            <h4 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Leave Reviews
            </h4>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Earn 50 points for verified reviews
            </p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="text-3xl mb-2">🎉</div>
            <h4 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Referrals
            </h4>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Earn 200 points for each referral
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
