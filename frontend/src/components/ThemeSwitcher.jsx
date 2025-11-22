import { useThemeStore } from '../store'
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'

export default function ThemeSwitcher() {
  const { theme, toggleTheme } = useThemeStore()
  const isDark = theme === 'dark'

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      className={`relative p-2 rounded-lg ${
        isDark ? 'bg-gray-800' : 'bg-gray-100'
      }`}
    >
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? 180 : 0 }}
        transition={{ duration: 0.3 }}
      >
        {isDark ? (
          <MoonIcon className="w-6 h-6 text-purple-400" />
        ) : (
          <SunIcon className="w-6 h-6 text-yellow-500" />
        )}
      </motion.div>
    </motion.button>
  )
}
