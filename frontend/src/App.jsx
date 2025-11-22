import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useThemeStore, useAuthStore } from './store'
import { useEffect } from 'react'

// Layouts
import Layout from './components/Layout'

// Public Pages
import Landing from './pages/public/Landing'
import Login from './pages/public/Login'
import Signup from './pages/public/Signup'

// User Pages
import Home from './pages/user/Home'
import ShopMatcher from './pages/user/ShopMatcher'
import ShopDirectory from './pages/user/ShopDirectory'
import ShopDetail from './pages/user/ShopDetail'
import CommunityReviews from './pages/user/CommunityReviews'
import Loyalty from './pages/user/Loyalty'

// Seller Pages
import SellerDashboard from './pages/seller/SellerDashboard'
import InventoryManager from './pages/seller/InventoryManager'
import OCRUpload from './pages/seller/OCRUpload'
import AnalyticsDashboard from './pages/seller/AnalyticsDashboard'
import Orders from './pages/seller/Orders'

function App() {
  const { theme } = useThemeStore()
  const { isAuthenticated, user } = useAuthStore()

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  const PrivateRoute = ({ children, role }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />
    }
    if (role && user?.role !== role) {
      return <Navigate to="/" replace />
    }
    return children
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* User Routes */}
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <Layout>
                <Home />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/shop-matcher"
          element={
            <PrivateRoute>
              <Layout>
                <ShopMatcher />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/shops"
          element={
            <PrivateRoute>
              <Layout>
                <ShopDirectory />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/shops/:id"
          element={
            <PrivateRoute>
              <Layout>
                <ShopDetail />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/reviews"
          element={
            <PrivateRoute>
              <Layout>
                <CommunityReviews />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/loyalty"
          element={
            <PrivateRoute>
              <Layout>
                <Loyalty />
              </Layout>
            </PrivateRoute>
          }
        />

        {/* Seller Routes */}
        <Route
          path="/seller/dashboard"
          element={
            <PrivateRoute role="seller">
              <Layout>
                <SellerDashboard />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/seller/inventory"
          element={
            <PrivateRoute role="seller">
              <Layout>
                <InventoryManager />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/seller/ocr"
          element={
            <PrivateRoute role="seller">
              <Layout>
                <OCRUpload />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/seller/analytics"
          element={
            <PrivateRoute role="seller">
              <Layout>
                <AnalyticsDashboard />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/seller/orders"
          element={
            <PrivateRoute role="seller">
              <Layout>
                <Orders />
              </Layout>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  )
}

export default App
