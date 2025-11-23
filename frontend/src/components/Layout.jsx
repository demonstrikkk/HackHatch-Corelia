import { useThemeStore, useAuthStore } from '../store'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import Chatbot from './Chatbot'
import LocationDetector from './LocationDetector'
import { motion } from 'framer-motion'

export default function Layout({ children }) {
  const { theme } = useThemeStore()
  const { user } = useAuthStore()

  // Show chatbot only for customer users
  const showChatbot = user?.role === 'customer' || !user?.role

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-background-dark' : 'bg-background-light'}`}>
      <Sidebar />
      <div className="ml-0 lg:ml-64 transition-all duration-300">
        <Navbar />
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="p-4 md:p-6 lg:p-8"
        >
          {children}
        </motion.main>
      </div>
      {/* Chatbot - Only for customer users */}
      {showChatbot && <Chatbot />}
      {/* Location Detector - Only for customer users */}
      {showChatbot && <LocationDetector />}
    </div>
  )
}
