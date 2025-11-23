import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useThemeStore, useChatStore, useLocationStore } from '../store'
import { chatAPI } from '../services/api'
import { notifications } from '@mantine/notifications'
import {
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'

export default function Chatbot() {
  const { theme } = useThemeStore()
  const { city } = useLocationStore()
  const { messages, addMessage, clearMessages, isOpen, toggleChat } = useChatStore()
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const messagesEndRef = useRef(null)
  const isDark = theme === 'dark'

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')

    // Add user message to UI
    addMessage({
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    })

    setLoading(true)

    try {
      const response = await chatAPI.sendMessage({
        message: userMessage,
        session_id: sessionId,
        location: city || 'Delhi'
      })

      // Update session ID
      if (!sessionId) {
        setSessionId(response.data.session_id)
      }

      // Add agent response to UI
      addMessage({
        role: 'assistant',
        content: response.data.response,
        timestamp: response.data.timestamp
      })

    } catch (error) {
      console.error('Chat error:', error)
      addMessage({
        role: 'assistant',
        content: "I'm sorry, I encountered an error. Please try again.",
        timestamp: new Date().toISOString()
      })
      notifications.show({
        title: 'Chat Error',
        message: 'Failed to send message',
        color: 'red',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleClearChat = () => {
    clearMessages()
    setSessionId(null)
    notifications.show({
      title: 'Chat Cleared',
      message: 'Your conversation has been reset',
      color: 'blue',
    })
  }

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleChat}
            className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl ${
              isDark 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600' 
                : 'bg-gradient-to-r from-blue-500 to-purple-600'
            } text-white hover:shadow-blue-500/50 transition-shadow`}
          >
            <ChatBubbleLeftRightIcon className="w-7 h-7" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`fixed bottom-6 right-6 z-50 w-[380px] h-[600px] rounded-2xl shadow-2xl overflow-hidden flex flex-col ${
              isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'
            }`}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <SparklesIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Shopping Assistant</h3>
                  <p className="text-xs text-white/80">AI-powered helper</p>
                </div>
              </div>
              <button
                onClick={toggleChat}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Messages */}
            <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${
              isDark ? 'bg-gray-950' : 'bg-gray-50'
            }`}>
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <SparklesIcon className={`w-16 h-16 mb-4 ${
                    isDark ? 'text-gray-700' : 'text-gray-300'
                  }`} />
                  <h4 className={`text-lg font-semibold mb-2 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    Welcome to Shopping Assistant!
                  </h4>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    I can help you:
                  </p>
                  <ul className={`text-sm mt-2 space-y-1 ${
                    isDark ? 'text-gray-500' : 'text-gray-500'
                  }`}>
                    <li>• Create shopping lists</li>
                    <li>• Check stock availability</li>
                    <li>• Find the best stores</li>
                    <li>• Compare prices</li>
                  </ul>
                </div>
              )}

              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                        : isDark
                        ? 'bg-gray-800 text-gray-100'
                        : 'bg-white text-gray-900 shadow-sm'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                    <p className={`text-xs mt-1 ${
                      msg.role === 'user' 
                        ? 'text-white/70' 
                        : isDark ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </motion.div>
              ))}

              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className={`p-3 rounded-2xl ${
                    isDark ? 'bg-gray-800' : 'bg-white shadow-sm'
                  }`}>
                    <div className="flex gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                      <span className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className={`p-4 border-t ${
              isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'
            }`}>
              {messages.length > 0 && (
                <button
                  onClick={handleClearChat}
                  className={`text-xs mb-2 px-3 py-1 rounded-full ${
                    isDark 
                      ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-800' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  } transition-colors`}
                >
                  Clear Chat
                </button>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  disabled={loading}
                  className={`flex-1 px-4 py-3 rounded-xl ${
                    isDark 
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                      : 'bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-400'
                  } border focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50`}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={sendMessage}
                  disabled={!input.trim() || loading}
                  className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PaperAirplaneIcon className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
