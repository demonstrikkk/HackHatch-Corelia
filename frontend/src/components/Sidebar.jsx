import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useThemeStore, useAuthStore } from '../store'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HomeIcon,
  ShoppingCartIcon,
  BuildingStorefrontIcon,
  ChatBubbleLeftRightIcon,
  StarIcon,
  ChartBarIcon,
  CubeIcon,
  DocumentTextIcon,
  TruckIcon,
  Bars3Icon,
  XMarkIcon,
  ReceiptPercentIcon,
} from '@heroicons/react/24/outline'

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const { theme } = useThemeStore()
  const { user } = useAuthStore()
  const location = useLocation()

  const userLinks = [
    { name: 'Home', path: '/home', icon: HomeIcon },
    { name: 'Shop Matcher', path: '/shop-matcher', icon: ShoppingCartIcon },
    { name: 'Shop Directory', path: '/shops', icon: BuildingStorefrontIcon },
    { name: 'Reviews', path: '/reviews', icon: ChatBubbleLeftRightIcon },
    { name: 'Loyalty', path: '/loyalty', icon: StarIcon },
    { name: 'My Bills', path: '/my-bills', icon: ReceiptPercentIcon },
  ]

  const sellerLinks = [
    { name: 'Dashboard', path: '/seller/dashboard', icon: ChartBarIcon },
    { name: 'Inventory', path: '/seller/inventory', icon: CubeIcon },
    { name: 'OCR Upload', path: '/seller/ocr', icon: DocumentTextIcon },
    { name: 'Analytics', path: '/seller/analytics', icon: ChartBarIcon },
    { name: 'Orders', path: '/seller/orders', icon: TruckIcon },
  ]

  const links = user?.role === 'seller' ? sellerLinks : userLinks

  const isDark = theme === 'dark'

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg ${
          isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
        } shadow-lg`}
      >
        {isOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
      </button>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: isOpen || window.innerWidth >= 1024 ? 0 : -256 }}
        className={`fixed top-0 left-0 h-screen w-64 z-40 ${
          isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
        } shadow-xl flex flex-col`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-700">
          <h1 className={`text-2xl font-bold bg-gradient-to-r ${
            isDark ? 'from-purple-dark to-orange-dark' : 'from-purple-dark to-orange-dark'
          } bg-clip-text text-transparent`}>
            CORELIA
          </h1>
          <p className="text-xs text-gray-500 mt-1">Retail Intelligence</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {links.map((link) => {
              const Icon = link.icon
              const isActive = location.pathname === link.path
              return (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? isDark
                          ? 'bg-primary-light text-gray-900 shadow-lg'
                          : 'bg-primary-light text-gray-900 shadow-lg'
                        : isDark
                        ? 'hover:bg-gray-800 text-gray-300'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{link.name}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className={`p-4 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
          <Link
            to="/profile"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 p-3 rounded-lg bg-surface-light hover:bg-primary-light/20 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-gray-900 font-bold group-hover:scale-110 transition-transform">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role || 'customer'}</p>
            </div>
          </Link>
        </div>
      </motion.aside>
    </>
  )
}
