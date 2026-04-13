import React, { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useAppContext } from '../context/AppContext'

const BOT_GREETING = {
  id: 'greeting',
  role: 'bot',
  text: 'Hi! I am your CarRental assistant. Ask me about booking, owner dashboard, cancellations, payments, or login issues.'
}

const FAQ_INTENTS = [
  {
    keywords: ['map', 'location map', 'google map', 'directions', 'where is pickup', 'pickup map'],
    answer:
      'To view the map: open any car, go to Car Details, and scroll to Pickup Location. You can use the embedded map there or click View in Google Maps for directions.'
  },
  {
    keywords: ['book', 'booking', 'reserve', 'reservation', 'rent'],
    answer:
      'To book a car: 1) Open Cars or Car Details. 2) Select pickup and return dates. 3) Click Book Now. Your booking appears in My Bookings after success.'
  },
  {
    keywords: ['cancel', 'cancellation', 'refund'],
    answer:
      'To cancel, open My Bookings and check the booking status rules set by the owner. If cancellation is not available in UI, contact support or the owner for manual handling.'
  },
  {
    keywords: ['owner', 'list car', 'add car', 'dashboard', 'manage cars'],
    answer:
      'Owner flow: login as owner, open Dashboard, then Add Car to list vehicles. Use Manage Cars and Manage Bookings for updates and status changes.'
  },
  {
    keywords: ['payment', 'pay', 'price', 'cost', 'charge'],
    answer:
      'Pricing is shown per day on each car card and details page. Final booking price is calculated from selected rental dates and stored with your booking.'
  },
  {
    keywords: ['login', 'password', 'forgot', 'reset', 'account'],
    answer:
      'For access issues, use Forgot Password on login. Owners and customers can both login, but owner-only pages require owner role.'
  },
  {
    keywords: ['search', 'location', 'city', 'find car'],
    answer:
      'Use the top search bar for brand/model/location terms, or use the availability form on the home page to search by city and date range.'
  },
  {
    keywords: ['booking status', 'confirmed', 'pending'],
    answer:
      'Booking statuses are usually pending, confirmed, or cancelled. You can track status updates in My Bookings.'
  }
]

const quickQuestions = [
  'How do I book a car?',
  'How can owners list cars?',
  'How does cancellation work?',
  'Why is booking blocked?'
]

const buildBotReply = (input) => {
  const normalized = input.toLowerCase().trim()

  if (!normalized) {
    return 'Please type a question so I can help.'
  }

  const intent = FAQ_INTENTS.find((item) =>
    item.keywords.some((keyword) => normalized.includes(keyword))
  )

  if (intent) {
    return intent.answer
  }

  return 'I can help with map, booking, owner listing, payment, cancellation, search, and login issues. Try asking: "How do I open pickup location map?" or "How to book a car?"'
}

const SupportChatbot = () => {
  const { axios } = useAppContext()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([BOT_GREETING])
  const [loading, setLoading] = useState(false)

  const canSend = useMemo(() => input.trim().length > 0, [input])

  const sendMessage = async (text) => {
    const userText = text ?? input
    if (!userText.trim()) return

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: userText.trim()
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')

    setLoading(true)

    try {
      const { data } = await axios.post('/api/chat/help', { message: userText.trim() })

      const botMessage = {
        id: `bot-${Date.now() + 1}`,
        role: 'bot',
        text: data?.success ? data.answer : buildBotReply(userText)
      }

      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      const botMessage = {
        id: `bot-${Date.now() + 1}`,
        role: 'bot',
        text: buildBotReply(userText)
      }

      setMessages((prev) => [...prev, botMessage])
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = (e) => {
    e.preventDefault()
    sendMessage()
  }

  return (
    <div className='fixed bottom-5 right-5 z-[70]'>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className='mb-3 w-[340px] max-w-[92vw] rounded-2xl border border-borderColor bg-white shadow-2xl overflow-hidden'
          >
            <div className='px-4 py-3 bg-primary text-white flex items-center justify-between'>
              <h3 className='font-semibold text-sm'>Help Assistant</h3>
              <button onClick={() => setOpen(false)} className='text-white/90 text-xs cursor-pointer'>Close</button>
            </div>

            <div className='h-80 overflow-y-auto px-3 py-3 bg-light/40'>
              {messages.map((msg) => (
                <div key={msg.id} className={`mb-2 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] px-3 py-2 rounded-xl text-sm leading-5 ${
                      msg.role === 'user'
                        ? 'bg-primary text-white rounded-br-sm'
                        : 'bg-white border border-borderColor text-gray-700 rounded-bl-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {loading && (
                <div className='mb-2 flex justify-start'>
                  <div className='max-w-[85%] px-3 py-2 rounded-xl text-sm leading-5 bg-white border border-borderColor text-gray-500 rounded-bl-sm'>
                    Thinking...
                  </div>
                </div>
              )}
            </div>

            <div className='px-3 pb-2 pt-1 bg-white border-t border-borderColor'>
              <div className='flex gap-2 flex-wrap mb-2'>
                {quickQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    disabled={loading}
                    className='text-xs px-2.5 py-1 rounded-full border border-borderColor text-gray-600 hover:bg-light transition cursor-pointer'
                  >
                    {q}
                  </button>
                ))}
              </div>

              <form onSubmit={onSubmit} className='flex items-center gap-2'>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder='Ask your question...'
                  className='w-full rounded-lg border border-borderColor px-3 py-2 text-sm outline-none'
                />
                <button
                  type='submit'
                  disabled={!canSend || loading}
                  className='px-3 py-2 text-sm rounded-lg bg-primary text-white disabled:opacity-50 cursor-pointer'
                >
                  Send
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen((prev) => !prev)}
        className='ml-auto flex items-center gap-2 rounded-full bg-primary text-white px-4 py-3 shadow-lg cursor-pointer hover:bg-primary-dull transition'
      >
        <span className='text-sm font-medium'>Chat Help</span>
      </button>
    </div>
  )
}

export default SupportChatbot
