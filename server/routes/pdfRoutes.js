import express from 'express'
import multer from 'multer'
import mongoose from 'mongoose'
import SubmittedPdf from '../models/SubmittedPdf.js'
import { Readable } from 'stream'

const router = express.Router()

// Multer memory storage (files stored in memory buffer before writing to MongoDB GridFS)
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: {
    fileSize: 32 * 1024 * 1024 // 32 MB max limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
      cb(null, true)
    } else {
      cb(new Error('Only PDF files (.pdf) are allowed!'))
    }
  }
})

// Helper to get GridFS Bucket
const getGridFSBucket = () => {
  const db = mongoose.connection.db
  if (!db) {
    throw new Error('Database connection is not ready yet.')
  }
  return new mongoose.mongo.GridFSBucket(db, { bucketName: 'pdfs' })
}

// @route   POST /api/pdfs/upload
// @desc    Upload a PDF file and metadata to MongoDB GridFS
router.post('/upload', upload.single('pdfFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No PDF file uploaded.' })
    }

    const { subject, category, subcategory, year, uploaderEmail, description } = req.body

    if (!subject || !category || !year) {
      return res.status(400).json({ success: false, message: 'Subject, category, and year are required.' })
    }

    const bucket = getGridFSBucket()
    const cleanFilename = req.file.originalname.replace(/[^a-zA-Z0-9_.-]/g, '_')
    
    // Create upload stream to GridFS
    const uploadStream = bucket.openUploadStream(cleanFilename, {
      contentType: req.file.mimetype || 'application/pdf'
    })

    // Convert buffer to readable stream
    const readableStream = new Readable()
    readableStream.push(req.file.buffer)
    readableStream.push(null)

    readableStream.pipe(uploadStream)

    uploadStream.on('error', (err) => {
      console.error('GridFS Upload Error:', err)
      return res.status(500).json({ success: false, message: 'Failed to save PDF to database.' })
    })

    uploadStream.on('finish', async () => {
      const sizeInMB = parseFloat((req.file.size / (1024 * 1024)).toFixed(2))

      const newPdf = new SubmittedPdf({
        subject,
        category: category || 'UPSC',
        subcategory: subcategory || 'General',
        year,
        uploaderEmail: uploaderEmail || '',
        description: description || '',
        fileId: uploadStream.id,
        filename: cleanFilename,
        contentType: req.file.mimetype || 'application/pdf',
        size_mb: sizeInMB,
        status: 'Approved'
      })

      await newPdf.save()

      res.status(201).json({
        success: true,
        message: 'PDF uploaded successfully to MongoDB!',
        paper: {
          id: newPdf._id.toString(),
          subject: newPdf.subject,
          category: newPdf.category,
          subcategory: newPdf.subcategory,
          year: newPdf.year,
          filename: newPdf.filename,
          size_mb: newPdf.size_mb,
          download_url: `/api/pdfs/${newPdf._id}/file`,
          createdAt: newPdf.createdAt
        }
      })
    })
  } catch (error) {
    console.error('Upload Error:', error)
    res.status(500).json({ success: false, message: error.message || 'Server error uploading PDF' })
  }
})

// @route   GET /api/pdfs
// @desc    Get all submitted PDFs metadata
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query
    let query = {}

    if (category) {
      query.category = category
    }

    if (search) {
      query.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { subcategory: { $regex: search, $options: 'i' } },
        { year: { $regex: search, $options: 'i' } }
      ]
    }

    const pdfs = await SubmittedPdf.find(query).sort({ createdAt: -1 })

    const formattedPdfs = pdfs.map((pdf) => ({
      id: pdf._id.toString(),
      subject: pdf.subject,
      category: pdf.category,
      subcategory: pdf.subcategory,
      year: pdf.year,
      filename: pdf.filename,
      size_mb: pdf.size_mb,
      uploaderEmail: pdf.uploaderEmail,
      download_url: `/api/pdfs/${pdf._id}/file`,
      status: pdf.status,
      createdAt: pdf.createdAt
    }))

    res.json({ success: true, count: formattedPdfs.length, papers: formattedPdfs })
  } catch (error) {
    console.error('Fetch Error:', error)
    res.status(500).json({ success: false, message: 'Server error fetching PDFs' })
  }
})

// @route   GET /api/pdfs/:id/file
// @desc    Stream raw PDF binary file from GridFS
router.get('/:id/file', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid PDF ID format' })
    }

    const pdfDoc = await SubmittedPdf.findById(req.params.id)
    if (!pdfDoc) {
      return res.status(404).json({ success: false, message: 'PDF document metadata not found' })
    }

    const bucket = getGridFSBucket()
    
    // Set headers for viewing in browser & iframe
    res.setHeader('Content-Type', pdfDoc.contentType || 'application/pdf')
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(pdfDoc.filename)}"`)

    const downloadStream = bucket.openDownloadStream(pdfDoc.fileId)

    downloadStream.on('error', (err) => {
      console.error('GridFS Download Stream Error:', err)
      if (!res.headersSent) {
        res.status(404).json({ success: false, message: 'PDF binary file not found in database GridFS.' })
      }
    })

    downloadStream.pipe(res)
  } catch (error) {
    console.error('Stream Error:', error)
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Server error streaming PDF file' })
    }
  }
})

// @route   DELETE /api/pdfs/:id
// @desc    Delete a PDF document and its binary file from GridFS
router.delete('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid PDF ID format' })
    }

    const pdfDoc = await SubmittedPdf.findById(req.params.id)
    if (!pdfDoc) {
      return res.status(404).json({ success: false, message: 'PDF not found' })
    }

    const bucket = getGridFSBucket()
    try {
      await bucket.delete(pdfDoc.fileId)
    } catch (err) {
      console.warn('Warning: GridFS file delete error or file already missing:', err.message)
    }

    await SubmittedPdf.findByIdAndDelete(req.params.id)

    res.json({ success: true, message: 'PDF deleted successfully' })
  } catch (error) {
    console.error('Delete Error:', error)
    res.status(500).json({ success: false, message: 'Server error deleting PDF' })
  }
})

export default router
