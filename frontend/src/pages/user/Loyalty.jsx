import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useThemeStore, useLoyaltyStore } from '../../store'
import { userAPI } from '../../services/api'
import { 
  TrophyIcon, 
  SparklesIcon, 
  GiftIcon, 
  ClockIcon,
  CheckCircleIcon,
  ShoppingBagIcon,
  StarIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'
import { notifications } from '@mantine/notifications'

export default function Loyalty() {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'
  const { points, tier, history, updateFromAPI, redeemPoints, addHistory } = useLoyaltyStore()
  const [rewards, setRewards] = useState([])
  const [loading, setLoading] = useState(true)
  const [redeeming, setRedeeming] = useState(null)
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    loadLoyaltyData()
  }, [])

  const loadLoyaltyData = async () => {
    setLoading(true)
    try {
      const response = await userAPI.getLoyalty()
      updateFromAPI(response.data)
      setRewards(response.data.rewards || [])
    } catch (error) {
      console.error('Failed to load loyalty data:', error)
      notifications.show({
        title: 'Error',
        message: 'Failed to load loyalty data',
        color: 'red',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRedeemReward = async (reward) => {
    if (points < reward.points) {
      notifications.show({
        title: 'Insufficient Points',
        message: `You need ${reward.points - points} more points to redeem this reward`,
        color: 'orange',
      })
      return
    }

    setRedeeming(reward.id)
    try {
      // Simulate API call - replace with real endpoint when available
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      redeemPoints(reward.points)
      addHistory({
        id: Date.now(),
        type: 'redeemed',
        reward: reward.name,
        points: -reward.points,
        date: new Date().toISOString(),
      })
      
      notifications.show({
        title: 'Reward Redeemed! 🎉',
        message: `${reward.name} has been added to your account`,
        color: 'green',
      })
      
      // Refresh loyalty data
      await loadLoyaltyData()
    } catch (error) {
      notifications.show({
        title: 'Redemption Failed',
        message: 'Failed to redeem reward. Please try again.',
        color: 'red',
      })
    } finally {
      setRedeeming(null)
    }
  }

  const getTierColor = (tierName) => {
    const colors = {
      bronze: 'from-amber-600 to-amber-800',
      silver: 'from-gray-400 to-gray-600',
      gold: 'from-yellow-400 to-yellow-600',
    }
    return colors[tierName] || colors.bronze
  }

  const getNextTierPoints = () => {
    if (tier === 'bronze') return Math.max(0, 500 - points)
    if (tier === 'silver') return Math.max(0, 1000 - points)
    return 0
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className={`text-3xl md:text-4xl font-bold mb-2 ${
          isDark ? 'text-white' : 'text-primary-light'
        }`}>
          Loyalty Rewards 🎁
        </h1>
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
          Earn points with every purchase and redeem amazing rewards
        </p>
      </motion.div>

      {/* Points Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-8 rounded-xl bg-gradient-to-br ${getTierColor(tier)} text-white shadow-2xl relative overflow-hidden`}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm opacity-90 mb-2">Your Balance</p>
              <p className="text-6xl font-bold">{loading ? '...' : points.toLocaleString()}</p>
              <p className="text-sm opacity-90 mt-2">Loyalty Points</p>
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm">
                <TrophyIcon className="w-5 h-5" />
                <span className="text-sm font-semibold capitalize">{tier} Tier</span>
              </div>
            </div>
            <TrophyIcon className="w-32 h-32 opacity-10" />
          </div>

          {/* Progress to Next Tier */}
          {tier !== 'gold' && (
            <div className="mt-6 p-4 rounded-lg bg-white/10 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Next Tier</span>
                <span className="text-sm font-bold capitalize">{tier === 'bronze' ? 'Silver' : 'Gold'}</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div 
                  className="bg-white rounded-full h-2 transition-all duration-500"
                  style={{ 
                    width: `${Math.min(100, (points / (tier === 'bronze' ? 500 : 1000)) * 100)}%` 
                  }}
                />
              </div>
              <p className="text-xs mt-2 opacity-75">
                {getNextTierPoints() > 0 
                  ? `${getNextTierPoints()} points to next tier` 
                  : 'Tier unlocked!'}
              </p>
            </div>
          )}

          <div className="mt-6 flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowHistory(!showHistory)}
              className="flex-1 py-3 rounded-lg bg-white/20 backdrop-blur-sm font-semibold hover:bg-white/30 flex items-center justify-center gap-2"
            >
              <ClockIcon className="w-5 h-5" />
              {showHistory ? 'Hide' : 'View'} History
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={loadLoyaltyData}
              disabled={loading}
              className="flex-1 py-3 rounded-lg bg-white text-primary-dark font-semibold hover:bg-gray-100 disabled:opacity-50"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Transaction History */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`p-6 rounded-xl ${
              isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'
            } shadow-lg overflow-hidden`}
          >
            <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-primary-light'}`}>
              Recent Activity
            </h3>
            {history.length === 0 ? (
              <p className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                No activity yet. Start shopping to earn points!
              </p>
            ) : (
              <div className="space-y-3">
                {history.slice(0, 5).map((entry) => (
                  <div 
                    key={entry.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      isDark ? 'bg-gray-800' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {entry.type === 'earned' ? (
                        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                          <CheckCircleIcon className="w-5 h-5 text-green-500" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                          <GiftIcon className="w-5 h-5 text-blue-500" />
                        </div>
                      )}
                      <div>
                        <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {entry.reward || 'Points Earned'}
                        </p>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {new Date(entry.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className={`font-bold ${entry.points > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {entry.points > 0 ? '+' : ''}{entry.points}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Available Rewards */}
      <div>
        <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-primary-light'}`}>
          Available Rewards
        </h2>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-light"></div>
            <p className={`mt-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Loading rewards...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rewards.map((reward, index) => {
              const canRedeem = points >= reward.points
              const isRedeeming = redeeming === reward.id
              
              return (
                <motion.div
                  key={reward.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: canRedeem ? -5 : 0 }}
                  className={`p-6 rounded-xl ${
                    isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'
                  } shadow-lg ${!canRedeem && 'opacity-60'}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-5xl">{reward.icon}</div>
                    <div className="flex-1">
                      <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-white' : 'text-primary-light'}`}>
                        {reward.name}
                      </h3>
                      <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {reward.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <SparklesIcon className="w-5 h-5 text-yellow-500" />
                          <span className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-primary-light'}`}>
                            {reward.points.toLocaleString()}
                          </span>
                          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            points
                          </span>
                        </div>
                        <motion.button
                          whileHover={{ scale: canRedeem ? 1.05 : 1 }}
                          whileTap={{ scale: canRedeem ? 0.95 : 1 }}
                          disabled={!canRedeem || isRedeeming}
                          onClick={() => handleRedeemReward(reward)}
                          className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                            canRedeem
                              ? 'bg-primary-light text-white hover:shadow-lg'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {isRedeeming ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Redeeming...
                            </div>
                          ) : canRedeem ? (
                            'Redeem Now'
                          ) : (
                            `Need ${(reward.points - points).toLocaleString()} more`
                          )}
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* How to Earn Points */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className={`p-8 rounded-xl ${
          isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'
        } shadow-lg`}
      >
        <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-primary-light'}`}>
          Ways to Earn Points
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} text-center`}>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-light/20 flex items-center justify-center">
              <ShoppingBagIcon className="w-8 h-8 text-primary-light" />
            </div>
            <h4 className={`font-bold text-lg mb-2 ${isDark ? 'text-white' : 'text-primary-light'}`}>
              Shop & Earn
            </h4>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Earn 1 point for every ₹10 spent on purchases
            </p>
            <div className="mt-3 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/20">
              <SparklesIcon className="w-4 h-4 text-green-500" />
              <span className="text-sm font-semibold text-green-500">Auto Earned</span>
            </div>
          </div>
          
          <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} text-center`}>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <StarIcon className="w-8 h-8 text-yellow-500" />
            </div>
            <h4 className={`font-bold text-lg mb-2 ${isDark ? 'text-white' : 'text-primary-light'}`}>
              Leave Reviews
            </h4>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Earn 50 points for each verified review you write
            </p>
            <div className="mt-3 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/20">
              <SparklesIcon className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-semibold text-yellow-500">+50 Points</span>
            </div>
          </div>
          
          <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} text-center`}>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-500/20 flex items-center justify-center">
              <UserGroupIcon className="w-8 h-8 text-blue-500" />
            </div>
            <h4 className={`font-bold text-lg mb-2 ${isDark ? 'text-white' : 'text-primary-light'}`}>
              Refer Friends
            </h4>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Earn 200 points when a friend signs up and makes their first purchase
            </p>
            <div className="mt-3 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-500/20">
              <SparklesIcon className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-semibold text-blue-500">+200 Points</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
