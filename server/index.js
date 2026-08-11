import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import pdfRoutes from './routes/pdfRoutes.js'

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

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pyq_portal'

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB successfully!')
    app.listen(PORT, () => {
      console.log(`🚀 Server listening on port ${PORT}`)
    })
  })
  .catch((err) => {
    console.error('❌ Failed to connect to MongoDB:', err.message)
    // Start Express server even if DB fails initially so health checks or errors display cleanly
    app.listen(PORT, () => {
      console.log(`⚠️ Express running on port ${PORT} without MongoDB connection.`)
    })
  })
