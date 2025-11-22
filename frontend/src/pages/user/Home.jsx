/* eslint-disable react-hooks/exhaustive-deps */
// import { useEffect, useState, useRef } from 'react'
// import { motion } from 'framer-motion'
// import { useThemeStore, useAuthStore } from '../../store'
// import { userAPI } from '../../services/api'
// import { Link } from 'react-router-dom'
// import {
//   ShoppingCartIcon,
//   ClockIcon,
//   SparklesIcon,
//   TrophyIcon,
//   ArrowRightIcon,
//   StarIcon,
//   MapPinIcon,
//   BoltIcon,
//   HeartIcon,
// } from '@heroicons/react/24/outline'
// import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'

/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useThemeStore, useAuthStore } from '../../store'
import { userAPI } from '../../services/api'
import { Link } from 'react-router-dom'
import {
  ShoppingCartIcon,
  ClockIcon,
  SparklesIcon,
  TrophyIcon,
  ArrowRightIcon,
  StarIcon,
  MapPinIcon,
  BoltIcon,
  HeartIcon,
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'

// Animated Background Canvas Component
const AnimatedBackground = ({ isDark }) => {
  const canvasRef = useRef(null)
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    let animationFrameId
    let particles = []
    
    const initCanvas = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      
      // Create particles
      particles = []
      const numParticles = 50
      for (let i = 0; i < numParticles; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 2 + 1,
        })
      }
    }
    
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      particles.forEach(p => {
        p.x += p.vx
        p.y += p.vy
        
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1
        
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = isDark ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.2)'
        ctx.fill()
        
        // Connect nearby particles
        particles.forEach(p2 => {
          const dx = p.x - p2.x
          const dy = p.y - p2.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          
          if (dist < 100) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = isDark 
              ? `rgba(139, 92, 246, ${0.15 * (1 - dist / 100)})`
              : `rgba(99, 102, 241, ${0.1 * (1 - dist / 100)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        })
      })
      
      animationFrameId = requestAnimationFrame(draw)
    }
    
    initCanvas()
    draw()
    
    const handleResize = () => initCanvas()
    window.addEventListener('resize', handleResize)
    
    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
    }
  }, [isDark])
  
  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full opacity-40 pointer-events-none"
    />
  )
}

export default function Home() {
  const { theme } = useThemeStore()
  const { user } = useAuthStore()
  const isDark = theme === 'dark'
  const [expiringItems, setExpiringItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    loadData()
    
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const loadData = async () => {
    try {
      const response = await userAPI.getExpiringItems()
      setExpiringItems(response.data.items || [])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const quickActions = [
    {
      icon: ShoppingCartIcon,
      title: 'Smart Matcher',
      description: 'Find perfect shops for your list',
      link: '/shop-matcher',
      gradient: 'from-blue-500 via-blue-600 to-indigo-600',
      shadow: 'shadow-blue-500/50',
    },
    {
      icon: ClockIcon,
      title: 'Expiring Items',
      description: `${expiringItems.length} items need attention`,
      link: '#expiring',
      gradient: 'from-orange-500 via-red-500 to-pink-600',
      shadow: 'shadow-orange-500/50',
    },
    {
      icon: SparklesIcon,
      title: 'Shop Directory',
      description: 'Discover local stores',
      link: '/shops',
      gradient: 'from-purple-500 via-violet-600 to-purple-700',
      shadow: 'shadow-purple-500/50',
    },
    {
      icon: TrophyIcon,
      title: 'Rewards Hub',
      description: 'Your loyalty points',
      link: '/loyalty',
      gradient: 'from-green-500 via-emerald-600 to-teal-600',
      shadow: 'shadow-green-500/50',
    },
  ]

  const stats = [
    { label: 'Shops Nearby', value: '24+', icon: MapPinIcon },
    { label: 'Points Earned', value: '1,250', icon: StarIcon },
    { label: 'Orders', value: '18', icon: ShoppingCartIcon },
    { label: 'Saved', value: '₹2,340', icon: HeartIcon },
  ]

  return (
    <div className={`min-h-screen relative ${
      isDark ? 'bg-gradient-to-b from-gray-900 via-gray-900 to-black' : 'bg-gradient-to-b from-gray-50 via-white to-gray-100'
    }`}>
      {/* Animated Background */}
      <AnimatedBackground isDark={isDark} />

      <div className="relative z-10 space-y-12 pb-12">
        {/* Hero Welcome Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0">
            <div className={`absolute top-20 left-10 w-96 h-96 rounded-full blur-3xl opacity-20 ${
              isDark ? 'bg-blue-500' : 'bg-blue-300'
            }`}></div>
            <div className={`absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl opacity-20 ${
              isDark ? 'bg-purple-500' : 'bg-purple-300'
            }`}></div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative pt-12 pb-16 px-6"
          >
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 mb-6"
                >
                  <BoltIcon className="w-5 h-5 text-blue-500" />
                  <span className={`text-sm font-semibold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                    AI-Powered Shopping Assistant
                  </span>
                </motion.div>

                <h1 className={`text-4xl md:text-6xl font-bold mb-4 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Welcome back,{' '}
                  <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                    {user?.name?.split(' ')[0]}
                  </span>
                  ! 👋
                </h1>
                
                <p className={`text-xl md:text-2xl ${isDark ? 'text-gray-300' : 'text-gray-600'} max-w-3xl mx-auto`}>
                  Your intelligent shopping companion is ready to help you discover, save, and shop smarter.
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
                {stats.map((stat, index) => {
                  const Icon = stat.icon
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className={`p-6 rounded-2xl backdrop-blur-sm ${
                        isDark 
                          ? 'bg-white/5 border border-white/10' 
                          : 'bg-white/80 border border-gray-200 shadow-lg'
                      } hover:scale-105 transition-transform duration-300`}
                    >
                      <Icon className={`w-8 h-8 mb-3 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                      <p className={`text-3xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {stat.value}
                      </p>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {stat.label}
                      </p>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        </section>

        {/* Quick Actions */}
        <section className="px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mb-8"
            >
              <h2 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Quick Actions
              </h2>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                Everything you need at your fingertips
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickActions.map((action, index) => {
                const Icon = action.icon
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="group"
                  >
                    <Link
                      to={action.link}
                      className={`block relative overflow-hidden p-8 rounded-2xl backdrop-blur-sm ${
                        isDark 
                          ? 'bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-gray-700' 
                          : 'bg-white border border-gray-200'
                      } shadow-xl hover:shadow-2xl transition-all duration-500`}
                    >
                      {/* Gradient overlay on hover */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                      
                      <div className="relative z-10">
                        <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 ${action.shadow} shadow-lg`}>
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                        
                        <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {action.title}
                        </h3>
                        
                        <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {action.description}
                        </p>
                        
                        <div className={`flex items-center gap-2 text-sm font-semibold ${
                          isDark ? 'text-blue-400' : 'text-blue-600'
                        } group-hover:gap-3 transition-all`}>
                          Explore
                          <ArrowRightIcon className="w-4 h-4" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Expiring Items Section */}
        <section className="px-6" id="expiring">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className={`relative overflow-hidden p-8 md:p-12 rounded-3xl backdrop-blur-sm ${
                isDark 
                  ? 'bg-gradient-to-br from-orange-900/20 via-red-900/20 to-pink-900/20 border border-orange-500/30' 
                  : 'bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 border border-orange-200'
              } shadow-2xl`}
            >
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-500/10 to-pink-500/10 rounded-full blur-3xl"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Items Expiring Soon ⏰
                    </h2>
                    <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      Take action to reduce waste and save money
                    </p>
                  </div>
                  <ClockIcon className={`w-16 h-16 ${isDark ? 'text-orange-400' : 'text-orange-600'} opacity-20`} />
                </div>

                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent"></div>
                      <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-pink-500/30"></div>
                    </div>
                    <p className={`mt-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Loading your items...
                    </p>
                  </div>
                ) : expiringItems.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {expiringItems.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.9 + index * 0.1 }}
                        whileHover={{ scale: 1.02, x: 5 }}
                        className={`group relative p-6 rounded-2xl backdrop-blur-sm ${
                          isDark ? 'bg-gray-800/50 border border-gray-700' : 'bg-white/80 border border-gray-200'
                        } shadow-lg hover:shadow-2xl transition-all duration-300`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {item.name}
                            </h4>
                            <div className="flex items-center gap-2 mb-3">
                              <MapPinIcon className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {item.shop}
                              </p>
                            </div>
                            <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                              Expires: {item.expiryDate}
                            </p>
                          </div>
                          <div className={`px-4 py-2 rounded-xl text-sm font-bold ${
                            item.daysLeft <= 2
                              ? 'bg-red-500/20 text-red-500 shadow-lg shadow-red-500/30'
                              : item.daysLeft <= 5
                              ? 'bg-orange-500/20 text-orange-500 shadow-lg shadow-orange-500/30'
                              : 'bg-yellow-500/20 text-yellow-500 shadow-lg shadow-yellow-500/30'
                          }`}>
                            {item.daysLeft}d
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.9 }}
                    >
                      <SparklesIcon className={`w-20 h-20 mx-auto mb-4 ${isDark ? 'text-gray-700' : 'text-gray-300'}`} />
                      <p className={`text-xl font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        All clear! No items expiring soon 🎉
                      </p>
                    </motion.div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Recommended Shops */}
        <section className="px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mb-8"
            >
              <h2 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Recommended Shops Nearby
              </h2>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                Discover local stores curated just for you
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: 'Fresh Mart', distance: '0.8', rating: '4.5', category: 'Groceries', color: 'from-green-500 to-emerald-600' },
                { name: 'Quick Stop', distance: '1.2', rating: '4.7', category: 'Convenience', color: 'from-blue-500 to-indigo-600' },
                { name: 'Organic Valley', distance: '1.5', rating: '4.8', category: 'Organic', color: 'from-purple-500 to-pink-600' },
              ].map((shop, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 + index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.03 }}
                  className="group cursor-pointer"
                >
                  <Link
                    to="/shops"
                    className={`block relative overflow-hidden rounded-2xl backdrop-blur-sm ${
                      isDark 
                        ? 'bg-gray-800/80 border border-gray-700' 
                        : 'bg-white border border-gray-200'
                    } shadow-xl hover:shadow-2xl transition-all duration-500`}
                  >
                    {/* Shop Image/Gradient */}
                    <div className={`relative h-48 bg-gradient-to-br ${shop.color} overflow-hidden`}>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex items-center justify-between">
                          <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-semibold">
                            {shop.category}
                          </span>
                          <div className="flex items-center gap-1">
                            <StarSolidIcon className="w-5 h-5 text-yellow-400" />
                            <span className="text-white font-bold">{shop.rating}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Shop Info */}
                    <div className="p-6">
                      <h4 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {shop.name}
                      </h4>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MapPinIcon className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {shop.distance} km away
                          </span>
                        </div>
                        
                        <div className={`flex items-center gap-2 text-sm font-semibold ${
                          isDark ? 'text-blue-400' : 'text-blue-600'
                        } group-hover:gap-3 transition-all`}>
                          Visit
                          <ArrowRightIcon className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 pb-12">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3 }}
              className={`relative overflow-hidden p-12 rounded-3xl backdrop-blur-sm ${
                isDark 
                  ? 'bg-gradient-to-br from-blue-900/40 via-purple-900/40 to-pink-900/40 border border-blue-500/30' 
                  : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border border-blue-200'
              } shadow-2xl text-center`}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-40 h-40 bg-blue-500 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-40 h-40 bg-purple-500 rounded-full blur-3xl"></div>
              </div>
              
              <div className="relative z-10">
                <BoltIcon className={`w-16 h-16 mx-auto mb-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                <h3 className={`text-3xl md:text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Ready to Shop Smarter?
                </h3>
                <p className={`text-lg mb-8 ${isDark ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto`}>
                  Use our AI-powered shop matcher to find the best deals and save time on every purchase.
                </p>
                <Link
                  to="/shop-matcher"
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg font-bold hover:shadow-2xl hover:scale-105 transition-all duration-300 shadow-lg shadow-blue-500/50"
                >
                  Start Smart Shopping
                  <ArrowRightIcon className="w-6 h-6" />
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  )
}
