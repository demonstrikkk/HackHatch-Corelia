import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useThemeStore } from '../../store'
import { userAPI } from '../../services/api'
import { StarIcon, CheckBadgeIcon } from '@heroicons/react/24/solid'
import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline'

export default function CommunityReviews() {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadReviews()
  }, [])

  const loadReviews = async () => {
    try {
      const response = await userAPI.getReviews()
      setReviews(response.data.reviews || mockReviews)
    } catch (error) {
      setReviews(mockReviews)
    } finally {
      setLoading(false)
    }
  }

  const mockReviews = [
    {
      id: 1,
      user: 'John Doe',
      shop: 'Fresh Mart',
      rating: 5,
      verified: true,
      comment: 'Excellent service and fresh products! Highly recommend.',
      date: '2 days ago',
      helpful: 24,
    },
    {
      id: 2,
      user: 'Jane Smith',
      shop: 'Green Valley',
      rating: 4,
      verified: true,
      comment: 'Great organic selection. Prices are a bit high but worth it for quality.',
      date: '1 week ago',
      helpful: 18,
    },
    {
      id: 3,
      user: 'Mike Johnson',
      shop: 'Quick Stop',
      rating: 3,
      verified: false,
      comment: 'Convenient location but limited stock sometimes.',
      date: '2 weeks ago',
      helpful: 7,
    },
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
          Community Reviews ⭐
        </h1>
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
          See what others are saying about local shops
        </p>
      </motion.div>

      {/* Reviews */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-6 rounded-xl ${
                isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'
              } shadow-lg`}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                  {review.user.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {review.user}
                    </h3>
                    {review.verified && (
                      <CheckBadgeIcon className="w-5 h-5 text-blue-500" title="Verified Purchase" />
                    )}
                    <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      • {review.date}
                    </span>
                  </div>
                  
                  <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {review.shop}
                  </p>
                  
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`w-5 h-5 ${
                          i < review.rating ? 'text-yellow-500' : isDark ? 'text-gray-700' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  
                  <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                    {review.comment}
                  </p>
                  
                  <div className="flex items-center gap-4 mt-4">
                    <button className={`flex items-center gap-1 text-sm ${
                      isDark ? 'text-gray-400 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'
                    }`}>
                      👍 Helpful ({review.helpful})
                    </button>
                    <button className={`flex items-center gap-1 text-sm ${
                      isDark ? 'text-gray-400 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'
                    }`}>
                      <ChatBubbleLeftIcon className="w-4 h-4" />
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
