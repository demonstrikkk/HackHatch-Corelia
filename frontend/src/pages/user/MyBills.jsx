/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useThemeStore, useAuthStore } from '../../store'
import { userAPI } from '../../services/api'
import {
  DocumentTextIcon,
  CloudArrowUpIcon,
  XMarkIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  CameraIcon,
} from '@heroicons/react/24/outline'
import { notifications } from '@mantine/notifications'

export default function MyBills() {
  const { theme } = useThemeStore()
  const { user } = useAuthStore()
  const isDark = theme === 'dark'

  const [bills, setBills] = useState([])
  const [selectedBill, setSelectedBill] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPeriod, setFilterPeriod] = useState('all') // all, month, year
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadFile, setUploadFile] = useState(null)
  const [uploadPreview, setUploadPreview] = useState(null)
  const [ocrLoading, setOcrLoading] = useState(false)
  const [ocrResult, setOcrResult] = useState(null)

  // Mock bills data - Replace with actual API call
  useEffect(() => {
    loadBills()
  }, [])

  const loadBills = async () => {
    setLoading(true)
    try {
      // Fetch real bills from API
      const response = await userAPI.getBills()
      
      // Transform API data to match component structure
      const transformedBills = response.data.bills.map(bill => ({
        id: bill.bill_id,
        store: bill.shop_name,
        date: new Date(bill.purchase_date).toISOString().split('T')[0],
        total: bill.total_amount,
        items: bill.items.map(item => ({
          name: item.name,
          qty: item.quantity,
          price: item.price,
        })),
        paymentMethod: 'Online',
        status: bill.status,
      }))
      
      setBills(transformedBills)
    } catch (error) {
      console.error('Failed to load bills:', error)
      notifications.show({
        title: 'Error',
        message: 'Failed to load bills',
        color: 'red',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setUploadFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setUploadPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleOCRScan = async () => {
    if (!uploadFile) return

    setOcrLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', uploadFile)

      // Simulate OCR API call
      setTimeout(() => {
        const mockOcrResult = {
          store: 'Scanned Store',
          date: new Date().toISOString().split('T')[0],
          items: [
            { name: 'Item 1', qty: 2, price: 100 },
            { name: 'Item 2', qty: 1, price: 150 },
            { name: 'Item 3', qty: 3, price: 75 },
          ],
          total: 475,
        }
        setOcrResult(mockOcrResult)
        setOcrLoading(false)

        notifications.show({
          title: 'Success!',
          message: 'Bill scanned successfully',
          color: 'green',
        })
      }, 2000)
    } catch (error) {
      setOcrLoading(false)
      notifications.show({
        title: 'Error',
        message: 'Failed to scan bill',
        color: 'red',
      })
    }
  }

  const saveBill = () => {
    if (ocrResult) {
      const newBill = {
        id: Date.now().toString(),
        ...ocrResult,
        paymentMethod: 'Scanned',
        status: 'paid',
      }
      setBills([newBill, ...bills])
      setShowUploadModal(false)
      setUploadFile(null)
      setUploadPreview(null)
      setOcrResult(null)

      notifications.show({
        title: 'Success!',
        message: 'Bill saved successfully',
        color: 'green',
      })
    }
  }

  const downloadBills = (period) => {
    let filteredBills = [...bills]
    const now = new Date()

    if (period === 'month') {
      filteredBills = bills.filter((bill) => {
        const billDate = new Date(bill.date)
        return (
          billDate.getMonth() === now.getMonth() &&
          billDate.getFullYear() === now.getFullYear()
        )
      })
    } else if (period === 'year') {
      filteredBills = bills.filter((bill) => {
        const billDate = new Date(bill.date)
        return billDate.getFullYear() === now.getFullYear()
      })
    }

    // Create CSV content
    let csvContent = 'Store,Date,Total,Items,Payment Method,Status\n'
    filteredBills.forEach((bill) => {
      const itemsStr = bill.items.map((i) => `${i.name}(${i.qty})`).join('; ')
      csvContent += `"${bill.store}","${bill.date}","${bill.total}","${itemsStr}","${bill.paymentMethod}","${bill.status}"\n`
    })

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bills_${period}_${Date.now()}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    notifications.show({
      title: 'Success!',
      message: `${filteredBills.length} bills downloaded`,
      color: 'green',
    })
  }

  const filteredBills = bills.filter((bill) => {
    const matchesSearch = bill.store.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (filterPeriod === 'all') return matchesSearch

    const billDate = new Date(bill.date)
    const now = new Date()

    if (filterPeriod === 'month') {
      return (
        matchesSearch &&
        billDate.getMonth() === now.getMonth() &&
        billDate.getFullYear() === now.getFullYear()
      )
    }

    if (filterPeriod === 'year') {
      return matchesSearch && billDate.getFullYear() === now.getFullYear()
    }

    return matchesSearch
  })

  const totalSpent = filteredBills.reduce((sum, bill) => sum + bill.total, 0)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-primary-light'}`}>
            My Bills
          </h1>
          <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage and track all your shopping bills
          </p>
        </div>

        <div 
          onClick={() => setShowUploadModal(true)}
          className="flex flex-col items-center cursor-pointer group"
        >
          <div className="w-14 h-10 mb-2 transition-transform group-hover:scale-110">
            <img 
              className="w-full h-full object-contain" 
              alt="Upload" 
              src="/images-corelia/grocery.png"
            />
          </div>
          <h4 className={`text-center text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'} group-hover:text-primary-dark transition-colors`}>
            Got a Bill? 
            <p className="font-semibold">Scan now</p>
          </h4>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-6 rounded-2xl ${
            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          } shadow-lg`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Bills</p>
              <p className={`text-3xl font-bold mt-1 ${isDark ? 'text-white' : 'text-primary-light'}`}>
                {filteredBills.length}
              </p>
            </div>
            <DocumentTextIcon className="w-12 h-12 text-primary-dark" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`p-6 rounded-2xl ${
            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          } shadow-lg`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Spent</p>
              <p className={`text-3xl font-bold mt-1 ${isDark ? 'text-white' : 'text-primary-light'}`}>
                ₹{totalSpent}
              </p>
            </div>
            <CalendarIcon className="w-12 h-12 text-primary-light" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`p-6 rounded-2xl ${
            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          } shadow-lg`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Avg. Bill</p>
              <p className={`text-3xl font-bold mt-1 ${isDark ? 'text-white' : 'text-primary-light'}`}>
                ₹{filteredBills.length > 0 ? Math.round(totalSpent / filteredBills.length) : 0}
              </p>
            </div>
            <CheckCircleIcon className="w-12 h-12 text-primary-dark" />
          </div>
        </motion.div>
      </div>

      {/* Filters & Download */}
      <div className={`p-6 rounded-2xl ${
        isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
      } shadow-lg`}>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <input
              type="text"
              placeholder="Search by store name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                isDark
                  ? 'bg-gray-900 border-gray-700 text-white'
                  : 'bg-gray-50 border-gray-300 text-primary-light'
              } focus:outline-none focus:ring-2 focus:ring-primary-dark`}
            />
          </div>

          {/* Period Filter */}
          <div className="flex gap-2">
            {['all', 'month', 'year'].map((period) => (
              <button
                key={period}
                onClick={() => setFilterPeriod(period)}
                className={`px-4 py-3 rounded-lg font-medium transition-all ${
                  filterPeriod === period
                    ? 'bg-primary-light text-gray-900 shadow-lg'
                    : isDark
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {period === 'all' ? 'All' : period === 'month' ? 'This Month' : 'This Year'}
              </button>
            ))}
          </div>

          {/* Download Dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary-light text-gray-900 font-semibold hover:shadow-lg transition-all">
              <ArrowDownTrayIcon className="w-5 h-5" />
              Download
            </button>
            <div className={`absolute right-0 top-full mt-2 w-48 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 ${
              isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            }`}>
              <button
                onClick={() => downloadBills('all')}
                className={`w-full px-4 py-3 text-left hover:bg-primary-dark hover:text-white rounded-t-lg transition-colors ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                All Bills
              </button>
              <button
                onClick={() => downloadBills('month')}
                className={`w-full px-4 py-3 text-left hover:bg-primary-dark hover:text-white transition-colors ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                This Month
              </button>
              <button
                onClick={() => downloadBills('year')}
                className={`w-full px-4 py-3 text-left hover:bg-primary-dark hover:text-white rounded-b-lg transition-colors ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                This Year
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bills Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-dark border-t-transparent"></div>
        </div>
      ) : filteredBills.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBills.map((bill, index) => (
            <motion.div
              key={bill.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              onClick={() => setSelectedBill(bill)}
              className={`p-6 rounded-2xl cursor-pointer transition-all ${
                isDark
                  ? 'bg-gray-800/80 border border-gray-700 hover:border-primary-dark'
                  : 'bg-white border border-gray-200 hover:border-blue-400'
              } shadow-lg hover:shadow-2xl`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-primary-light'}`}>
                    {bill.store}
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {new Date(bill.date).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <DocumentTextIcon className="w-8 h-8 text-primary-dark" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Total Amount
                  </span>
                  <span className={`text-2xl font-bold ${isDark ? 'text-primary-light' : 'text-secondary-light'}`}>
                    ₹{bill.total}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Items
                  </span>
                  <span className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {bill.items.length} items
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Payment
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    isDark ? 'bg-secondary-dark/50 text-primary-dark' : 'bg-surface-light text-secondary-dark'
                  }`}>
                    {bill.paymentMethod}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <DocumentTextIcon className={`w-20 h-20 mx-auto mb-4 ${
            isDark ? 'text-gray-700' : 'text-gray-300'
          }`} />
          <p className={`text-xl ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            No bills found
          </p>
        </div>
      )}

      {/* Bill Detail Modal */}
      <AnimatePresence>
        {selectedBill && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`max-w-2xl w-full rounded-2xl shadow-2xl ${
                isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'
              } max-h-[90vh] overflow-y-auto`}
            >
              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-primary-light'}`}>
                      {selectedBill.store}
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {new Date(selectedBill.date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedBill(null)}
                    className={`p-2 rounded-lg ${
                      isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    }`}
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className={`p-4 rounded-lg ${
                    isDark ? 'bg-gray-900' : 'bg-gray-50'
                  }`}>
                    <h4 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-primary-light'}`}>
                      Items Purchased
                    </h4>
                    <ul className="space-y-2">
                      {selectedBill.items.map((item, i) => (
                        <li key={i} className="flex justify-between items-center">
                          <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                            {item.name}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              Qty: {item.qty}
                            </span>
                            <span className={`font-semibold ${isDark ? 'text-white' : 'text-primary-light'}`}>
                              ₹{item.price}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className={`p-4 rounded-lg border-2 ${
                    isDark ? 'border-secondary-light bg-secondary-light/20' : 'border-primary-light bg-surface-light'
                  }`}>
                    <div className="flex justify-between items-center">
                      <span className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-primary-light'}`}>
                        Total Amount
                      </span>
                      <span className={`text-3xl font-bold ${isDark ? 'text-primary-light' : 'text-secondary-light'}`}>
                        ₹{selectedBill.total}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Payment Method
                      </span>
                      <span className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {selectedBill.paymentMethod}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedBill(null)}
                    className="w-full py-3 rounded-lg bg-primary-light text-gray-900 font-semibold hover:shadow-lg transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Upload OCR Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`max-w-3xl w-full rounded-2xl shadow-2xl ${
                isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'
              } max-h-[90vh] overflow-y-auto`}
            >
              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-primary-light'}`}>
                      Upload Bill with OCR
                    </h3>
                    <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Scan and extract bill details automatically
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowUploadModal(false)
                      setUploadFile(null)
                      setUploadPreview(null)
                      setOcrResult(null)
                    }}
                    className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                {!uploadPreview ? (
                  <div className={`border-2 border-dashed rounded-2xl p-12 text-center ${
                    isDark ? 'border-gray-700 hover:border-primary-dark' : 'border-gray-300 hover:border-blue-400'
                  } transition-colors cursor-pointer`}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="bill-upload"
                    />
                    <label htmlFor="bill-upload" className="cursor-pointer">
                      <CameraIcon className={`w-16 h-16 mx-auto mb-4 ${
                        isDark ? 'text-gray-600' : 'text-gray-400'
                      }`} />
                      <p className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-primary-light'}`}>
                        Click to upload bill image
                      </p>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        PNG, JPG up to 10MB
                      </p>
                    </label>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Preview */}
                      <div>
                        <h4 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-primary-light'}`}>
                          Bill Preview
                        </h4>
                        <img
                          src={uploadPreview}
                          alt="Bill preview"
                          className="w-full rounded-lg shadow-lg"
                        />
                      </div>

                      {/* OCR Result */}
                      <div>
                        <h4 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-primary-light'}`}>
                          Extracted Data
                        </h4>
                        {ocrLoading ? (
                          <div className="flex flex-col items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-dark border-t-transparent mb-4"></div>
                            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                              Scanning bill...
                            </p>
                          </div>
                        ) : ocrResult ? (
                          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                            <div className="space-y-3 mb-4">
                              <div>
                                <label className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                  Store
                                </label>
                                <input
                                  type="text"
                                  value={ocrResult.store}
                                  onChange={(e) => setOcrResult({ ...ocrResult, store: e.target.value })}
                                  className={`w-full mt-1 px-3 py-2 rounded-lg border ${
                                    isDark
                                      ? 'bg-gray-800 border-gray-700 text-white'
                                      : 'bg-white border-gray-300 text-primary-light'
                                  }`}
                                />
                              </div>
                              <div>
                                <label className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                  Date
                                </label>
                                <input
                                  type="date"
                                  value={ocrResult.date}
                                  onChange={(e) => setOcrResult({ ...ocrResult, date: e.target.value })}
                                  className={`w-full mt-1 px-3 py-2 rounded-lg border ${
                                    isDark
                                      ? 'bg-gray-800 border-gray-700 text-white'
                                      : 'bg-white border-gray-300 text-primary-light'
                                  }`}
                                />
                              </div>
                            </div>

                            <div className="mb-4">
                              <h5 className={`text-sm font-semibold mb-2 ${isDark ? 'text-white' : 'text-primary-light'}`}>
                                Items
                              </h5>
                              <ul className="space-y-2">
                                {ocrResult.items.map((item, i) => (
                                  <li key={i} className="flex justify-between text-sm">
                                    <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                                      {item.name} x{item.qty}
                                    </span>
                                    <span className={isDark ? 'text-white' : 'text-primary-light'}>
                                      ₹{item.price}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className={`pt-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-300'}`}>
                              <div className="flex justify-between items-center">
                                <span className={`font-semibold ${isDark ? 'text-white' : 'text-primary-light'}`}>
                                  Total
                                </span>
                                <span className={`text-xl font-bold ${isDark ? 'text-primary-light' : 'text-secondary-light'}`}>
                                  ₹{ocrResult.total}
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-12">
                            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                              Click "Scan Bill" to extract data
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-4">
                      {!ocrResult ? (
                        <button
                          onClick={handleOCRScan}
                          disabled={ocrLoading}
                          className="flex-1 py-3 rounded-lg bg-primary-light text-gray-900 font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                        >
                          {ocrLoading ? 'Scanning...' : 'Scan Bill'}
                        </button>
                      ) : (
                        <button
                          onClick={saveBill}
                          className="flex-1 py-3 rounded-lg bg-primary-light text-gray-900 font-semibold hover:shadow-lg transition-all"
                        >
                          Save Bill
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setUploadFile(null)
                          setUploadPreview(null)
                          setOcrResult(null)
                        }}
                        className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                          isDark
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
