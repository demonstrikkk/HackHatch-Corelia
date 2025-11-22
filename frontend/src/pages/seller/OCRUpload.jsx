import { useState } from 'react'
import { motion } from 'framer-motion'
import { useThemeStore } from '../../store'
import { inventoryAPI } from '../../services/api'
import { notifications } from '@mantine/notifications'
import {
  CloudArrowUpIcon,
  DocumentTextIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'

export default function OCRUpload() {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [extractedData, setExtractedData] = useState(null)
  const [editableData, setEditableData] = useState([])

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      notifications.show({
        title: 'No File',
        message: 'Please select a file first',
        color: 'orange',
      })
      return
    }

    setUploading(true)

    try {
      notifications.show({
        title: 'Processing...',
        message: 'Scanning image with OCR and AI...',
        color: 'blue',
      })

      // Send to backend for OCR + LLM processing
      const formData = new FormData()
      formData.append('file', file)

      const response = await inventoryAPI.ocrScan(formData)
      const extractedItems = response.data.items || []
      const rawText = response.data.raw_text || ''
      const confidence = response.data.ocr_confidence || 0

      // Set the extracted data
      setExtractedData({ 
        success: true, 
        total: extractedItems.length,
        confidence: confidence,
        rawText: rawText,
        parsedBy: response.data.parsed_by || 'backend'
      })
      setEditableData(extractedItems)

      notifications.show({
        title: 'Success!',
        message: response.data.message || `Extracted ${extractedItems.length} items from bill`,
        color: 'green',
      })

      console.log('OCR completed successfully:', {
        itemCount: extractedItems.length,
        confidence: confidence,
        rawTextLength: rawText.length
      })

    } catch (error) {
      console.error('OCR Error:', error)
      
      // Fallback: Use mock data for demo
      setExtractedData({ success: true, demo: true })
      setEditableData(mockOCRData)
      
      notifications.show({
        title: 'Processing Error',
        message: 'Could not process image. Using demo data.',
        color: 'red',
      })
    } finally {
      setUploading(false)
    }
  }

  const mockOCRData = [
    { name: 'Milk 1L', quantity: 10, price: 3.99, category: 'Dairy' },
    { name: 'Bread White', quantity: 15, price: 2.49, category: 'Bakery' },
    { name: 'Eggs 12pk', quantity: 8, price: 4.99, category: 'Dairy' },
    { name: 'Tomatoes 1kg', quantity: 20, price: 5.99, category: 'Produce' },
  ]

  const handleSaveToInventory = async () => {
    try {
      const currentDate = new Date().toISOString()
      let savedCount = 0
      
      console.log(`Saving ${editableData.length} items to inventory at ${currentDate}`)
      
      for (const item of editableData) {
        await inventoryAPI.create({
          name: item.name,
          category: item.category,
          price: parseFloat(item.price),
          stock: parseInt(item.quantity),
          unit: 'pcs',
          // Backend will add current created_at and updated_at timestamps
        })
        savedCount++
      }
      
      console.log(`Successfully saved ${savedCount} items`)
      
      notifications.show({
        title: 'Success!',
        message: `${savedCount} items added to inventory on ${new Date().toLocaleDateString()}`,
        color: 'green',
      })
      
      setFile(null)
      setExtractedData(null)
      setEditableData([])
    } catch (error) {
      console.error('Save error:', error)
      notifications.show({
        title: 'Error',
        message: error.response?.data?.detail || 'Failed to save items',
        color: 'red',
      })
    }
  }

  const updateItem = (index, field, value) => {
    const updated = [...editableData]
    updated[index][field] = value
    setEditableData(updated)
  }

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
          OCR Inventory Upload 📸
        </h1>
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
          Upload bills and automatically extract inventory data
        </p>
      </motion.div>

      {/* Upload Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`p-8 rounded-xl ${
          isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'
        } shadow-lg`}
      >
        <div className="text-center">
          <CloudArrowUpIcon className={`w-20 h-20 mx-auto mb-4 ${
            isDark ? 'text-gray-700' : 'text-gray-300'
          }`} />
          
          <h2 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Upload Invoice or Bill
          </h2>
          <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Supported formats: JPG, PNG, PDF
          </p>

          <input
            type="file"
            id="file-upload"
            accept="image/*,.pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          
          {!file ? (
            <label
              htmlFor="file-upload"
              className="inline-block px-8 py-4 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold cursor-pointer hover:shadow-lg transition-shadow"
            >
              Choose File
            </label>
          ) : (
            <div className="space-y-4">
              <div className={`p-4 rounded-lg ${
                isDark ? 'bg-gray-800' : 'bg-gray-50'
              } flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <DocumentTextIcon className="w-8 h-8 text-blue-500" />
                  <div className="text-left">
                    <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {file.name}
                    </p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="text-red-500 hover:text-red-600"
                >
                  Remove
                </button>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleUpload}
                disabled={uploading}
                className="px-8 py-4 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:shadow-lg transition-shadow disabled:opacity-50"
              >
                {uploading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Processing...
                  </span>
                ) : (
                  'Scan & Extract'
                )}
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Extracted Data */}
      {extractedData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-6 rounded-xl ${
            isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'
          } shadow-lg`}
        >
          <div className="flex items-center gap-2 mb-6">
            <CheckCircleIcon className="w-6 h-6 text-green-500" />
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Extracted Items ({editableData.length})
            </h2>
            {extractedData.confidence !== undefined && (
              <span className={`ml-auto text-sm px-3 py-1 rounded-full ${
                extractedData.confidence > 70 ? 'bg-green-100 text-green-800' :
                extractedData.confidence > 40 ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                Confidence: {extractedData.confidence.toFixed(1)}%
              </span>
            )}
            {extractedData.demoMode && (
              <span className="ml-2 text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-800">
                Demo Mode
              </span>
            )}
          </div>

          <div className="overflow-x-auto mb-6">
            <table className="w-full">
              <thead className={isDark ? 'bg-gray-800' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Product Name
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Category
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Quantity
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Price
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-gray-800' : 'divide-gray-200'}`}>
                {editableData.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => updateItem(index, 'name', e.target.value)}
                        className={`w-full px-2 py-1 rounded ${
                          isDark ? 'bg-gray-800 text-white' : 'bg-gray-50 text-gray-900'
                        } border-0 focus:ring-2 focus:ring-blue-500`}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={item.category}
                        onChange={(e) => updateItem(index, 'category', e.target.value)}
                        className={`w-full px-2 py-1 rounded ${
                          isDark ? 'bg-gray-800 text-white' : 'bg-gray-50 text-gray-900'
                        } border-0 focus:ring-2 focus:ring-blue-500`}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                        className={`w-20 px-2 py-1 rounded ${
                          isDark ? 'bg-gray-800 text-white' : 'bg-gray-50 text-gray-900'
                        } border-0 focus:ring-2 focus:ring-blue-500`}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        step="0.01"
                        value={item.price}
                        onChange={(e) => updateItem(index, 'price', e.target.value)}
                        className={`w-24 px-2 py-1 rounded ${
                          isDark ? 'bg-gray-800 text-white' : 'bg-gray-50 text-gray-900'
                        } border-0 focus:ring-2 focus:ring-blue-500`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSaveToInventory}
              className="px-8 py-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold hover:shadow-lg transition-shadow"
            >
              Save to Inventory
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
