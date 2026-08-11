import express from 'express'
import dotenv from 'dotenv'

dotenv.config()

const router = express.Router()

// @route   POST /api/admin/login
// @desc    Admin authentication login endpoint
router.post('/login', (req, res) => {
  const { username, password } = req.body

  const validUsername = process.env.ADMIN_USERNAME || 'shabber'
  const validPassword = process.env.ADMIN_PASSWORD || 'admin123'

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required.' })
  }

  if (username.trim() === validUsername && password.trim() === validPassword) {
    return res.json({
      success: true,
      message: 'Admin login successful!',
      token: 'admin_session_' + Date.now(),
      admin: {
        username: validUsername
      }
    })
  } else {
    return res.status(401).json({
      success: false,
      message: 'Invalid admin username or password.'
    })
  }
})

export default router
