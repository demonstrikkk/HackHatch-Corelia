import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useThemeStore } from '../../store'
import {
  ArrowRightIcon,
  CheckCircleIcon,
  StarIcon,
} from '@heroicons/react/24/solid'
import {
  SparklesIcon,
} from '@heroicons/react/24/outline'

export default function Landing() {
  const { theme, toggleTheme } = useThemeStore()
  const isDark = theme === 'dark'

  const features = [
    {
      image: '/images-corelia/price compare.png',
      title: 'Smart Price Comparison',
      description: 'Compare prices across multiple stores instantly and find the best deals for your shopping list.',
    },
    {
      image: '/images-corelia/real time update.png',
      title: 'Real-time Inventory',
      description: 'Live stock updates ensure you never visit a store for out-of-stock items.',
    },
    {
      image: '/images-corelia/automated.png',
      title: 'Automated Insights',
      description: 'AI-powered analytics help sellers predict demand and optimize inventory levels.',
    },
    {
      image: '/images-corelia/delivery integration.png',
      title: 'Delivery Integration',
      description: 'Seamless coordination with delivery services for quick and efficient order fulfillment.',
    },
    {
      image: '/images-corelia/unified platform.png',
      title: 'Unified Platform',
      description: 'One platform connecting shoppers, sellers, and delivery partners in perfect harmony.',
    },
  ]

  const benefits = [
    'Instant shop matching based on your needs',
    'Save time and money with smart recommendations',
    'Support local businesses in your community',
    'Track loyalty points across all stores',
  ]

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white' : 'bg-gradient-to-b from-gray-50 via-white to-gray-100 text-primary-light'}`}>
      {/* Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-lg bg-opacity-80 border-b border-gray-200/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/images-corelia/logo.png" alt="CORELIA Logo" className="w-10 h-10 object-contain" />
              <h1 className={`text-2xl font-bold bg-gradient-to-r ${
                isDark ? 'from-purple-dark to-orange-dark' : 'from-purple-dark to-orange-dark'
              } bg-clip-text text-transparent`}>
                CORELIA
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-full transition-all ${
                  isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100 shadow-md'
                }`}
              >
                {isDark ? '☀️' : '🌙'}
              </button>
              <Link
                to="/login"
                className={`px-5 py-2 rounded-lg font-medium transition-all ${
                  isDark ? 'text-gray-300 hover:text-white hover:bg-gray-800' : 'text-gray-700 hover:text-primary-light hover:bg-gray-100'
                }`}
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-6 py-2.5 rounded-lg bg-primary-light text-gray-900 font-semibold hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2"
              >
                Get Started
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className={`absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl opacity-20 ${isDark ? 'bg-primary-dark' : 'bg-primary-light'}`}></div>
          <div className={`absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl opacity-20 ${isDark ? 'bg-primary-dark' : 'bg-primary-light'}`}></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-light border border-primary-dark/20 mb-6">
                <SparklesIcon className="w-5 h-5 text-primary-dark" />
                <span className={`text-sm font-semibold ${isDark ? 'text-primary-dark' : 'text-primary-dark'}`}>
                  Next-Gen Retail Intelligence
                </span>
              </div>
              
              <h2 className={`text-5xl md:text-6xl font-bold mb-6 leading-tight`}>
                Jo Dikhega,
                <br />
                <span className="bg-black bg-clip-text text-transparent">
                  vo Bikega
                </span>
              </h2>
              
              <p className={`text-lg md:text-xl mb-8 leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Connect with local stores through intelligent matching, real-time inventory tracking, and powerful analytics. Your complete retail ecosystem in one platform.
              </p>
              
              <div className="space-y-3 mb-10">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircleIcon className="w-6 h-6 text-primary-light flex-shrink-0" />
                    <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{benefit}</span>
                  </motion.div>
                ))}
              </div>
              
              <div className="flex gap-4 flex-wrap">
                <Link
                  to="/signup"
                  className="px-8 py-4 rounded-xl bg-primary-light text-gray-900 text-lg font-semibold hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-2"
                >
                  Start Free Trial
                  <ArrowRightIcon className="w-5 h-5" />
                </Link>
                <button className={`px-8 py-4 rounded-xl border-2 transition-all ${
                  isDark 
                    ? 'border-primary-dark/50 text-primary-dark hover:bg-primary-dark/10 hover:border-primary-dark' 
                    : 'border-primary-light text-primary-dark hover:bg-surface-light hover:border-primary-dark'
                } text-lg font-semibold`}>
                  Watch Demo
                </button>
              </div>
              
              <div className="flex items-center gap-6 mt-10">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-primary-light border-2 border-white"></div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <StarIcon key={i} className="w-5 h-5 text-yellow-400" />
                    ))}
                  </div>
                  <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Trusted by 10,000+ users
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Right Content - Hero Images */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative"
            >
              <div className="relative">
                <video
                  className="w-full rounded-2xl shadow-2xl"
                  autoPlay
                  muted
                  loop
                  playsInline
                  aria-label="CORELIA Platform demo"
                >
                  <source src="/images-corelia/corelia-mascot.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-primary-light rounded-2xl opacity-20 blur-2xl"></div>
                <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-br from-primary-dark to-primary-light rounded-2xl opacity-20 blur-2xl"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={`py-20 ${isDark ? 'bg-gray-900/50' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h3 className={`text-4xl md:text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-primary-light'}`}>
              Powerful Features for Everyone
            </h3>
            <p className={`text-xl ${isDark ? 'text-gray-400' : 'text-gray-600'} max-w-2xl mx-auto`}>
              Everything you need to revolutionize your shopping and selling experience
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className={`group relative overflow-hidden rounded-2xl p-8 transition-all duration-300 ${
                  isDark 
                    ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 hover:border-primary-dark/50' 
                    : 'bg-white border border-gray-200 hover:border-primary-light'
                } shadow-lg hover:shadow-2xl`}
              >
                {/* Gradient Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-surface-light/5 to-primary-dark/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="relative z-10">
                  <div className="mb-6 overflow-hidden rounded-xl">
                    <img 
                      src={feature.image} 
                      alt={feature.title}
                      className="w-full h-48 object-cover transform group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  
                  <h4 className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-primary-light'}`}>
                    {feature.title}
                  </h4>
                  
                  <p className={`leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Showcase Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <img 
                src="/images-corelia/Gemini_Generated_Image_tsim0ztsim0ztsim.png" 
                alt="Analytics Dashboard" 
                className="w-full rounded-2xl shadow-2xl"
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h3 className={`text-4xl font-bold mb-6 ${isDark ? 'text-white' : 'text-primary-light'}`}>
                Data-Driven Insights for Sellers
              </h3>
              <p className={`text-lg mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Transform your business with AI-powered analytics, demand predictions, and inventory optimization tools.
              </p>
              <ul className="space-y-4">
                {['Real-time sales tracking', 'AI demand forecasting', 'Automated inventory alerts', 'Customer behavior insights'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center">
                      <CheckCircleIcon className="w-5 h-5 text-white" />
                    </div>
                    <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className={`relative overflow-hidden rounded-3xl p-12 md:p-16 text-center ${
              isDark 
                ? 'bg-gradient-to-br from-secondary-dark/50 via-secondary-dark/50 to-secondary-dark/50 border border-gray-700' 
                : 'bg-surface-light border border-gray-200'
            } shadow-2xl`}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-40 h-40 bg-primary-dark rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-primary-dark rounded-full blur-3xl"></div>
            </div>
            
            <div className="relative z-10">
              <h3 className={`text-4xl md:text-5xl font-bold mb-6 ${isDark ? 'text-white' : 'text-primary-light'}`}>
                Ready to Transform Your Retail Experience?
              </h3>
              <p className={`text-xl mb-10 ${isDark ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto`}>
                Join thousands of shoppers and sellers already thriving on CORELIA
              </p>
              <Link
                to="/signup"
                className="inline-flex items-center gap-3 px-10 py-5 rounded-xl bg-primary-light text-gray-900 text-lg font-bold hover:shadow-2xl hover:scale-105 transition-all"
              >
                Get Started Free
                <ArrowRightIcon className="w-6 h-6" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`border-t ${isDark ? 'border-gray-800 bg-gray-900/50' : 'border-gray-200 bg-gray-50'} py-12`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <img src="/images-corelia/logo.png" alt="CORELIA" className="w-8 h-8 object-contain" />
              <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-primary-light'}`}>CORELIA</span>
            </div>
            <p className={`text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              © 2025 CORELIA. Empowering retail, one connection at a time.
            </p>
            <div className="flex gap-6">
              <a href="#" className={`hover:text-primary-dark transition-colors ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Privacy</a>
              <a href="#" className={`hover:text-primary-dark transition-colors ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Terms</a>
              <a href="#" className={`hover:text-primary-dark transition-colors ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
