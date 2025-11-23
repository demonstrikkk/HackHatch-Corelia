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
  const [saving, setSaving] = useState(false)
  const [extractedData, setExtractedData] = useState(null)
  const [editableData, setEditableData] = useState([])

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  const mockOCRData = [
    { name: 'Milk 1L', quantity: 10, price: 3.99, category: 'Dairy' },
    { name: 'Bread White', quantity: 15, price: 2.49, category: 'Bakery' },
    { name: 'Eggs 12pk', quantity: 8, price: 4.99, category: 'Dairy' },
    { name: 'Tomatoes 1kg', quantity: 20, price: 5.99, category: 'Produce' },
  ]

  const handleSaveToInventory = async (itemsToSave = null) => {
    console.log('🔵 handleSaveToInventory called')
    console.log('🔵 itemsToSave:', itemsToSave)
    console.log('🔵 editableData:', editableData)
    
    const items = itemsToSave || editableData
    
    if (!items || items.length === 0) {
      console.log('⚠️ No items to save')
      notifications.show({
        title: 'No Items',
        message: 'No items to save to inventory',
        color: 'orange',
      })
      return
    }
    
    console.log('✅ Starting save process for', items.length, 'items')
    setSaving(true)
    
    try {
      const currentDate = new Date().toISOString()
      let savedCount = 0
      
      console.log(`Saving ${items.length} items to inventory at ${currentDate}`)
      console.log('Items to save:', items)
      
      notifications.show({
        title: 'Saving...',
        message: `Saving ${items.length} items to inventory...`,
        color: 'blue',
        autoClose: false,
        id: 'save-inventory',
      })
      
      for (const item of items) {
        const itemData = {
          name: item.name,
          category: item.category,
          price: parseFloat(item.price) || 0,
          stock: parseInt(item.quantity) || parseInt(item.stock) || 0,
          unit: item.unit || 'pcs',
        }
        
        console.log('📤 Saving item:', itemData)
        
        const response = await inventoryAPI.create(itemData)
        console.log('✅ Item saved:', response.data)
        savedCount++
        
        notifications.update({
          id: 'save-inventory',
          title: 'Saving...',
          message: `Saved ${savedCount} of ${items.length} items...`,
          color: 'blue',
        })
      }
      
      console.log(`🎉 Successfully saved ${savedCount} items`)
      
      notifications.update({
        id: 'save-inventory',
        title: 'Success! 🎉',
        message: `${savedCount} items added to inventory. Redirecting...`,
        color: 'green',
        autoClose: 2000,
      })
      
      setFile(null)
      setExtractedData(null)
      setEditableData([])
      
      // Redirect to inventory page after 2 seconds
      setTimeout(() => {
        window.location.href = '/seller/inventory'
      }, 2000)
      
    } catch (error) {
      console.error('❌ Save error details:', error)
      console.error('❌ Error response:', error.response)
      console.error('❌ Error data:', error.response?.data)
      console.error('❌ Error stack:', error.stack)
      
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to save items'
      
      notifications.update({
        id: 'save-inventory',
        title: 'Error Saving Items',
        message: errorMessage,
        color: 'red',
        autoClose: 5000,
      })
    } finally {
      console.log('🔵 Setting saving to false')
      setSaving(false)
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
        autoClose: false,
        id: 'ocr-processing',
      })

      // Send to backend for OCR + LLM processing
      const formData = new FormData()
      formData.append('file', file)

      const response = await inventoryAPI.ocrScan(formData)
      const extractedItems = response.data.items || []
      const rawText = response.data.raw_text || ''
      const confidence = response.data.ocr_confidence || 0

      console.log('OCR Response:', { extractedItems, rawText, confidence })

      // Set the extracted data
      setExtractedData({ 
        success: true, 
        total: extractedItems.length,
        confidence: confidence,
        rawText: rawText,
        parsedBy: response.data.parsed_by || 'backend'
      })
      setEditableData(extractedItems)

      if (extractedItems.length > 0) {
        notifications.update({
          id: 'ocr-processing',
          title: 'Extraction Complete! ✅',
          message: `Extracted ${extractedItems.length} items. Review and save to inventory.`,
          color: 'green',
          autoClose: 3000,
        })
      } else {
        notifications.update({
          id: 'ocr-processing',
          title: 'No Items Found',
          message: 'Could not extract items from the image. Try a clearer image.',
          color: 'orange',
          autoClose: 3000,
        })
      }

    } catch (error) {
      console.error('OCR Error:', error)
      
      // Show error details
      const errorMessage = error.response?.data?.detail || error.message || 'Unknown error'
      console.error('Error details:', errorMessage)
      
      notifications.update({
        id: 'ocr-processing',
        title: 'Processing Error',
        message: `Error: ${errorMessage}. Please try again.`,
        color: 'red',
        autoClose: 5000,
      })
      
      // Set mock data for testing
      setExtractedData({ success: true, demo: true })
      setEditableData(mockOCRData)
    } finally {
      setUploading(false)
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
          isDark ? 'text-white' : 'text-primary-light'
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
          
          <h2 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-primary-light'}`}>
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
              className="inline-block px-8 py-4 rounded-lg bg-primary-light text-gray-900 font-semibold cursor-pointer hover:shadow-lg transition-shadow"
            >
              Choose File
            </label>
          ) : (
            <div className="space-y-4">
              <div className={`p-4 rounded-lg ${
                isDark ? 'bg-gray-800' : 'bg-gray-50'
              } flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <DocumentTextIcon className="w-8 h-8 text-primary-dark" />
                  <div className="text-left">
                    <p className={`font-semibold ${isDark ? 'text-white' : 'text-primary-light'}`}>
                      {file.name}
                    </p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="text-secondary-light hover:text-secondary-light"
                >
                  Remove
                </button>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleUpload}
                disabled={uploading}
                className="px-8 py-4 rounded-lg bg-primary-light text-gray-900 font-semibold hover:shadow-lg transition-shadow disabled:opacity-50"
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
            <CheckCircleIcon className="w-6 h-6 text-primary-light" />
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-primary-light'}`}>
              Extracted Items ({editableData.length})
            </h2>
            {extractedData.confidence !== undefined && (
              <span className={`ml-auto text-sm px-3 py-1 rounded-full ${
                extractedData.confidence > 70 ? 'bg-surface-light text-secondary-light' :
                extractedData.confidence > 40 ? 'bg-yellow-100 text-yellow-800' :
                'bg-surface-light text-secondary-light'
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
                          isDark ? 'bg-gray-800 text-white' : 'bg-gray-50 text-primary-light'
                        } border-0 focus:ring-2 focus:ring-primary-dark`}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={item.category}
                        onChange={(e) => updateItem(index, 'category', e.target.value)}
                        className={`w-full px-2 py-1 rounded ${
                          isDark ? 'bg-gray-800 text-white' : 'bg-gray-50 text-primary-light'
                        } border-0 focus:ring-2 focus:ring-primary-dark`}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                        className={`w-20 px-2 py-1 rounded ${
                          isDark ? 'bg-gray-800 text-white' : 'bg-gray-50 text-primary-light'
                        } border-0 focus:ring-2 focus:ring-primary-dark`}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        step="0.01"
                        value={item.price}
                        onChange={(e) => updateItem(index, 'price', e.target.value)}
                        className={`w-24 px-2 py-1 rounded ${
                          isDark ? 'bg-gray-800 text-white' : 'bg-gray-50 text-primary-light'
                        } border-0 focus:ring-2 focus:ring-primary-dark`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <motion.button
              whileHover={{ scale: saving ? 1 : 1.02 }}
              whileTap={{ scale: saving ? 1 : 0.98 }}
              onClick={() => {
                console.log('🔵 Button clicked!')
                console.log('🔵 Saving state:', saving)
                console.log('🔵 editableData:', editableData)
                handleSaveToInventory()
              }}
              disabled={saving}
              className="px-8 py-3 rounded-lg bg-primary-light text-gray-900 font-semibold hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-900 border-t-transparent"></div>
                  Saving...
                </span>
              ) : (
                'Save to Inventory'
              )}
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
