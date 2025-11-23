import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useThemeStore } from '../../store'
import { reviewAPI } from '../../services/api'
import { StarIcon, CheckBadgeIcon, UsersIcon, SparklesIcon, TrophyIcon, HeartIcon } from '@heroicons/react/24/solid'
import { ChatBubbleLeftIcon, HandThumbUpIcon } from '@heroicons/react/24/outline'

export default function CommunityReviews() {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'
  const [reviews, setReviews] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [likedReviews, setLikedReviews] = useState(new Set())

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [reviewsRes, statsRes] = await Promise.all([
        reviewAPI.getAll().catch(() => ({ data: { success: false } })),
        reviewAPI.getStats().catch(() => ({ data: { success: false } }))
      ])
      
      if (reviewsRes.data.success && reviewsRes.data.reviews) {
        setReviews(reviewsRes.data.reviews)
      } else {
        console.log('Using mock reviews as fallback')
        setReviews(mockReviews)
      }
      
      if (statsRes.data.success && statsRes.data.stats) {
        setStats(statsRes.data.stats)
      } else {
        console.log('Using mock stats as fallback')
        setStats({
          total_reviews: mockReviews.length,
          average_rating: 4.5,
          total_likes: 500,
          top_shops: ['Fresh Mart', 'Green Valley', 'Quick Stop'],
          top_contributors: [
            { _id: 'John Doe', review_count: 10, total_likes: 200, points: 2200 },
            { _id: 'Jane Smith', review_count: 8, total_likes: 180, points: 1960 },
            { _id: 'Mike Johnson', review_count: 6, total_likes: 120, points: 1320 }
          ]
        })
      }
    } catch (error) {
      console.error('Failed to load community data:', error)
      setReviews(mockReviews)
      setStats({
        total_reviews: mockReviews.length,
        average_rating: 4.5,
        total_likes: 500,
        top_shops: ['Fresh Mart', 'Green Valley', 'Quick Stop'],
        top_contributors: []
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async (reviewId) => {
    if (!reviewId) return
    
    try {
      const res = await reviewAPI.likeReview(reviewId)
      
      if (res.data.success) {
        setReviews(prev => prev.map(review => 
          review._id === reviewId 
            ? { ...review, likes: res.data.liked ? (review.likes || 0) + 1 : Math.max((review.likes || 0) - 1, 0) }
            : review
        ))
        
        setLikedReviews(prev => {
          const newSet = new Set(prev)
          if (res.data.liked) {
            newSet.add(reviewId)
          } else {
            newSet.delete(reviewId)
          }
          return newSet
        })
      }
    } catch (error) {
      console.error('Failed to like review:', error)
      // Silently fail for mock data
    }
  }

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <StarIcon
            key={i}
            className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-600'}`}
          />
        ))}
        <span className="ml-1 text-sm">{rating}</span>
      </div>
    )
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-dark"></div>
      </div>
    )
  }

  return (
    <section 
      className={`py-16 px-4 sm:px-6 md:px-10 lg:px-16 rounded-3xl shadow-2xl overflow-hidden ${
        isDark ? 'bg-[hsl(272, 78%, 16%)] text-[rgb(245,245,245)]' : 'bg-gray-50 text-primary-light'
      }`}
    >
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center text-center"
        >
          <h2 className={`text-3xl sm:text-4xl font-extrabold flex items-center gap-3 ${
            isDark ? 'text-[rgb(245,245,245)]' : 'text-primary-light'
          }`}>
            <UsersIcon className="w-8 h-8 text-yellow-400" />
            Corelia Community
          </h2>
          <p className={`mt-3 max-w-2xl ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
            A thriving space where shoppers and retailers connect, share feedback, and shape the next era of intelligent commerce.
          </p>
        </motion.div>

        {/* AI Generated Highlights */}
        {stats && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gradient-to-r from-secondary-dark/40 to-secondary-dark/30 rounded-2xl p-6 sm:p-8 border border-primary-dark/30 shadow-lg"
          >
            <h3 className="text-xl sm:text-2xl font-semibold flex items-center gap-2 mb-4">
              <SparklesIcon className="w-6 h-6 text-yellow-400" />
              AI-Generated Highlights
            </h3>
            <ul className="list-disc ml-5 sm:ml-6 text-gray-300 space-y-2 text-sm sm:text-base">
              <li>{stats.total_reviews}+ users shared their shopping experiences.</li>
              <li>Top trending stores: {stats.top_shops?.join(', ') || 'Loading...'}</li>
              <li>Average community rating: {stats.average_rating}/5.0 - Excellent satisfaction!</li>
              <li>AI predicts 33% increase in repeat shoppers due to smart recommendations.</li>
            </ul>
          </motion.div>
        )}

        {/* What Our Shoppers Say */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <h3 className={`text-xl sm:text-2xl font-semibold flex items-center gap-2 ${
            isDark ? 'text-primary-light' : 'text-secondary-dark'
          }`}>
            <ChatBubbleLeftIcon className="w-6 h-6 text-primary-dark" />
            What Our Shoppers Say
          </h3>

          {/* Horizontal Scroll Container */}
          <div className="flex overflow-x-auto scrollbar-hide space-x-6 pb-4 snap-x snap-mandatory">
            {reviews.length > 0 ? (
              reviews.map((review, index) => (
                <motion.div
                  key={review._id || review.id}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="snap-start flex-shrink-0 w-[85%] sm:w-[320px] bg-gray-800/70 backdrop-blur-md rounded-2xl p-5 sm:p-6 shadow-xl border border-gray-700"
                >
                  {/* Header */}
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-lg">{review.user_name || review.user}</h4>
                    {renderStars(review.rating)}
                  </div>

                  {/* Comment */}
                  <p className="text-gray-300 mb-3 text-sm sm:text-base line-clamp-3">
                    {review.comment}
                  </p>

                  {/* Shop Name */}
                  <div className="text-xs sm:text-sm text-gray-400 mb-4">
                    Shop: {review.shop_name || review.shop}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    {/* Stats */}
                    <div className="flex items-center gap-3 text-gray-400 text-sm">
                      <HandThumbUpIcon className="w-4 h-4" />
                      {review.likes || review.helpful || 0}
                      <ChatBubbleLeftIcon className="w-4 h-4" />
                      {review.comments_count || 0}
                    </div>

                    {/* Like Button */}
                    <button
                      onClick={() => review._id && handleLike(review._id)}
                      className={`px-3 sm:px-4 py-1 rounded-lg flex items-center gap-2 text-sm transition-colors ${
                        review._id && likedReviews.has(review._id)
                          ? 'bg-primary-dark hover:bg-primary-dark text-white'
                          : 'bg-secondary-dark hover:bg-primary-dark text-white'
                      }`}
                    >
                      <HeartIcon className="w-4 h-4" />
                      {review._id && likedReviews.has(review._id) ? 'Liked' : 'Appreciate'}
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="w-full text-center py-12 text-gray-400">
                No reviews yet. Be the first to share your experience!
              </div>
            )}
          </div>
        </motion.div>

        {/* Top Contributors */}
        {stats?.top_contributors && stats.top_contributors.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-12"
          >
            <h3 className={`text-xl sm:text-2xl font-semibold flex items-center gap-2 mb-6 ${
              isDark ? 'text-primary-light' : 'text-secondary-dark'
            }`}>
              <TrophyIcon className="w-6 h-6 text-yellow-400" />
              Top Contributors
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {stats.top_contributors.map((contributor, index) => (
                <motion.div
                  key={contributor._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-800/80 backdrop-blur-md rounded-xl p-6 border border-gray-700 shadow-lg text-center"
                >
                  <h4 className="text-lg sm:text-xl font-semibold mb-2">
                    {contributor._id}
                  </h4>
                  <p className="text-gray-400 mb-2 text-sm">
                    {index === 0 ? 'Trendsetter' : index === 1 ? 'AI Evangelist' : 'Style Critic'}
                  </p>
                  <div className="text-primary-dark font-bold text-lg">
                    {contributor.points} pts
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

      </div>
    </section>
  )
}
