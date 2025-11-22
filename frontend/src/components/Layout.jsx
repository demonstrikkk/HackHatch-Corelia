import { useThemeStore } from '../store'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import { motion } from 'framer-motion'

export default function Layout({ children }) {
  const { theme } = useThemeStore()

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
    </div>
  )
}
