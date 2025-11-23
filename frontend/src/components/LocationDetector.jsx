import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocationStore, useThemeStore } from '../store'
import { MapPinIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { notifications } from '@mantine/notifications'

export default function LocationDetector() {
  const { theme } = useThemeStore()
  const { location, city, setLocation, setCity, setDetecting, isDetecting } = useLocationStore()
  const [showPrompt, setShowPrompt] = useState(false)
  const [manualCity, setManualCity] = useState('')
  const isDark = theme === 'dark'

  const availableCities = ['Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai']

  useEffect(() => {
    // Show location prompt if location not set
    if (!city && !localStorage.getItem('location-dismissed')) {
      setTimeout(() => setShowPrompt(true), 2000)
    }
  }, [city])

  const detectLocation = () => {
    if (!navigator.geolocation) {
      notifications.show({
        title: 'Not Supported',
        message: 'Geolocation is not supported by your browser',
        color: 'red',
      })
      return
    }

    setDetecting(true)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        
        // Reverse geocoding would happen here in production
        // For demo, we'll detect Delhi if in NCR region
        let detectedCity = 'Delhi'
        
        // Simple region detection (this would use a real geocoding API in production)
        if (latitude > 28 && latitude < 29 && longitude > 76 && longitude < 78) {
          detectedCity = 'Delhi'
        }
        
        setLocation(`${latitude}, ${longitude}`, detectedCity, { latitude, longitude })
        setShowPrompt(false)
        setDetecting(false)
        
        notifications.show({
          title: 'Location Detected',
          message: `We've set your location to ${detectedCity}`,
          color: 'green',
        })
      },
      (error) => {
        console.error('Geolocation error:', error)
        setDetecting(false)
        
        notifications.show({
          title: 'Location Error',
          message: 'Could not detect your location. Please select manually.',
          color: 'orange',
        })
      }
    )
  }

  const setManualLocation = (selectedCity) => {
    setCity(selectedCity)
    setLocation(null, selectedCity, null)
    setShowPrompt(false)
    
    notifications.show({
      title: 'Location Set',
      message: `Your location is now set to ${selectedCity}`,
      color: 'green',
    })
  }

  const dismissPrompt = () => {
    setShowPrompt(false)
    localStorage.setItem('location-dismissed', 'true')
  }

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-24 right-6 z-40 max-w-sm"
        >
          <div className={`rounded-xl shadow-2xl border p-6 ${
            isDark 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  isDark ? 'bg-blue-500/20' : 'bg-blue-50'
                }`}>
                  <MapPinIcon className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h3 className={`font-semibold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    Enable Location
                  </h3>
                  <p className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Get personalized store recommendations
                  </p>
                </div>
              </div>
              <button
                onClick={dismissPrompt}
                className={`p-1 rounded-lg transition-colors ${
                  isDark 
                    ? 'hover:bg-gray-700 text-gray-400' 
                    : 'hover:bg-gray-100 text-gray-500'
                }`}
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <button
                onClick={detectLocation}
                disabled={isDetecting}
                className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                  isDark
                    ? 'bg-blue-500 hover:bg-blue-600 text-white disabled:bg-blue-500/50'
                    : 'bg-blue-500 hover:bg-blue-600 text-white disabled:bg-blue-300'
                }`}
              >
                {isDetecting ? 'Detecting...' : 'Detect My Location'}
              </button>

              <div className={`text-center text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                or choose manually
              </div>

              <div className="grid grid-cols-2 gap-2">
                {availableCities.map((cityName) => (
                  <button
                    key={cityName}
                    onClick={() => setManualLocation(cityName)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isDark
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {cityName}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
