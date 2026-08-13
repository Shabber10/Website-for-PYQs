import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import dns from 'dns'
import pdfRoutes from './routes/pdfRoutes.js'
import adminRoutes from './routes/adminRoutes.js'

dotenv.config()

// Fix Node.js DNS querySrv ETIMEOUT issue on local networks/Windows (skip in production to avoid cloud DNS conflicts)
if (process.env.NODE_ENV !== 'production') {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1'])
  } catch (dnsErr) {
    console.warn('DNS setServers warning:', dnsErr.message)
  }
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// API Routes
app.use('/api/pdfs', pdfRoutes)
app.use('/api/admin', adminRoutes)

// Health Check Endpoint for Render
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState
  const states = { 0: 'Disconnected', 1: 'Connected', 2: 'Connecting', 3: 'Disconnecting' }
  const isConnected = dbState === 1
  res.status(isConnected ? 200 : 503).json({
    status: 'UP',
    timestamp: new Date(),
    database: states[dbState] || 'Unknown',
    hasCustomMongoUri: !!process.env.MONGODB_URI
  })
})

// Serve static frontend in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../dist')
  app.use(express.static(distPath))

  app.use((req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
} else {
  app.get('/', (req, res) => {
    res.send('PYQ Portal Backend API is running... Use Vite dev server for frontend UI.')
  })
}

// Start Express Server
app.listen(PORT, () => {
  console.log(`🚀 Express server listening on port ${PORT}`)
})

// MongoDB Connection with Auto-Retry
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pyq_portal'

if (!process.env.MONGODB_URI) {
  console.warn('⚠️ WARNING: MONGODB_URI environment variable is not set!')
}

const connectWithRetry = () => {
  console.log(`Connecting to MongoDB... (${MONGODB_URI.startsWith('mongodb+srv://') ? 'Atlas Cloud' : 'Local'})`)
  
  const connectOptions = {
    serverSelectionTimeoutMS: 10000
  }

  if (process.env.NODE_ENV !== 'production') {
    connectOptions.family = 4
  }

  mongoose
    .connect(MONGODB_URI, connectOptions)
    .then(() => {
      console.log('✅ Connected to MongoDB successfully!')
    })
    .catch((err) => {
      console.error('❌ MongoDB connection error:', err.message)
      console.log('🔄 Retrying MongoDB connection in 5 seconds...')
      setTimeout(connectWithRetry, 5000)
    })
}

connectWithRetry()


