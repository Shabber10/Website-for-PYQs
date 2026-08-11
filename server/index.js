import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import dns from 'dns'
import pdfRoutes from './routes/pdfRoutes.js'

// Fix Node.js DNS querySrv ETIMEOUT issue on Windows local networks
try {
  dns.setServers(['8.8.8.8', '1.1.1.1'])
} catch (dnsErr) {
  console.warn('DNS setServers warning:', dnsErr.message)
}

dotenv.config()

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

// Health Check Endpoint for Render
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState
  const states = { 0: 'Disconnected', 1: 'Connected', 2: 'Connecting', 3: 'Disconnecting' }
  res.json({
    status: 'UP',
    timestamp: new Date(),
    database: states[dbState] || 'Unknown'
  })
})

// Serve static frontend in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../dist')
  app.use(express.static(distPath))

  app.get('*', (req, res) => {
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

const connectWithRetry = () => {
  console.log('Connecting to MongoDB Atlas database...')
  mongoose
    .connect(MONGODB_URI, {
      family: 4,
      serverSelectionTimeoutMS: 8000,
      tls: true,
      tlsAllowInvalidCertificates: true
    })
    .then(() => {
      console.log('✅ Connected to MongoDB Atlas successfully!')
    })
    .catch((err) => {
      console.error('❌ MongoDB Atlas connection error:', err.message)
      console.log('🔄 Retrying MongoDB Atlas connection in 5 seconds...')
      setTimeout(connectWithRetry, 5000)
    })
}

connectWithRetry()

