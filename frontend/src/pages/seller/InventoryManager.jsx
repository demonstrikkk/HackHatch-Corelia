import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useThemeStore } from '../../store'
import { inventoryAPI } from '../../services/api'
import { notifications } from '@mantine/notifications'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline'

export default function InventoryManager() {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'
  const [inventory, setInventory] = useState([])
  const [filteredInventory, setFilteredInventory] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    unit: '',
  })

  useEffect(() => {
    loadInventory()
  }, [])

  useEffect(() => {
    filterInventory()
  }, [searchQuery, inventory])

  const loadInventory = async () => {
    try {
      const response = await inventoryAPI.getAll()
      setInventory(response.data.items || mockInventory)
      setFilteredInventory(response.data.items || mockInventory)
    } catch (error) {
      setInventory(mockInventory)
      setFilteredInventory(mockInventory)
    } finally {
      setLoading(false)
    }
  }

  const filterInventory = () => {
    if (!searchQuery) {
      setFilteredInventory(inventory)
      return
    }
    const filtered = inventory.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredInventory(filtered)
  }

  const mockInventory = [
    { id: 1, name: 'Milk (1L)', category: 'Dairy', price: 3.99, stock: 45, unit: 'L' },
    { id: 2, name: 'Bread (White)', category: 'Bakery', price: 2.49, stock: 12, unit: 'loaf' },
    { id: 3, name: 'Eggs (12)', category: 'Dairy', price: 4.99, stock: 8, unit: 'dozen' },
    { id: 4, name: 'Tomatoes', category: 'Produce', price: 5.99, stock: 23, unit: 'kg' },
    { id: 5, name: 'Chicken Breast', category: 'Meat', price: 12.99, stock: 15, unit: 'kg' },
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingItem) {
        await inventoryAPI.update(editingItem.id, formData)
        notifications.show({
          title: 'Success',
          message: 'Item updated successfully',
          color: 'green',
        })
      } else {
        await inventoryAPI.create(formData)
        notifications.show({
          title: 'Success',
          message: 'Item added successfully',
          color: 'green',
        })
      }
      setShowModal(false)
      setEditingItem(null)
      setFormData({ name: '', category: '', price: '', stock: '', unit: '' })
      loadInventory()
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Operation failed',
        color: 'red',
      })
    }
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setFormData(item)
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        await inventoryAPI.delete(id)
        notifications.show({
          title: 'Success',
          message: 'Item deleted successfully',
          color: 'green',
        })
        loadInventory()
      } catch (error) {
        notifications.show({
          title: 'Error',
          message: 'Delete failed',
          color: 'red',
        })
      }
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className={`text-3xl md:text-4xl font-bold mb-2 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Inventory Manager 📦
          </h1>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            Manage your product inventory
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setEditingItem(null)
            setFormData({ name: '', category: '', price: '', stock: '', unit: '' })
            setShowModal(true)
          }}
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold"
        >
          <PlusIcon className="w-5 h-5" />
          Add Item
        </motion.button>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative"
      >
        <MagnifyingGlassIcon className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
          isDark ? 'text-gray-400' : 'text-gray-500'
        }`} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search inventory..."
          className={`w-full pl-12 pr-4 py-3 rounded-lg ${
            isDark ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-300 text-gray-900'
          } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
        />
      </motion.div>

      {/* Inventory Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`rounded-xl overflow-hidden ${
          isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'
        } shadow-lg`}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={isDark ? 'bg-gray-800' : 'bg-gray-50'}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Product
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Category
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Price
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Stock
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-gray-800' : 'divide-gray-200'}`}>
              {filteredInventory.map((item, index) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className={isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}
                >
                  <td className={`px-6 py-4 whitespace-nowrap ${isDark ? 'text-white' : 'text-gray-900'} font-medium`}>
                    {item.name}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {item.category}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap ${isDark ? 'text-white' : 'text-gray-900'} font-semibold`}>
                    ${item.price}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium inline-block ${
                      item.stock > 20
                        ? 'bg-green-500/20 text-green-500'
                        : item.stock > 10
                        ? 'bg-yellow-500/20 text-yellow-500'
                        : 'bg-red-500/20 text-red-500'
                    }`}>
                      {item.stock} {item.unit}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 rounded-lg bg-blue-500/20 text-blue-500 hover:bg-blue-500/30"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 rounded-lg bg-red-500/20 text-red-500 hover:bg-red-500/30"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 bg-black/50 z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md p-6 rounded-xl ${
                isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'
              } shadow-2xl z-50`}
            >
              <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {editingItem ? 'Edit Item' : 'Add New Item'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  required
                  placeholder="Product Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-3 rounded-lg ${
                    isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
                  } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                <input
                  type="text"
                  required
                  placeholder="Category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className={`w-full px-4 py-3 rounded-lg ${
                    isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
                  } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="Price"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg ${
                      isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
                    } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  <input
                    type="number"
                    required
                    placeholder="Stock"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg ${
                      isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
                    } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Unit (e.g., kg, L, pcs)"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className={`w-full px-4 py-3 rounded-lg ${
                    isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
                  } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className={`flex-1 py-3 rounded-lg font-semibold ${
                      isDark ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold"
                  >
                    {editingItem ? 'Update' : 'Add'}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
