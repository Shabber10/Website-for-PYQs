import mongoose from 'mongoose'

const SubmittedPdfSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      enum: ['UPSC', 'JEE', 'NEET', 'Boards', 'Engineering', 'Other'],
      default: 'UPSC'
    },
    subcategory: {
      type: String,
      default: 'General',
      trim: true
    },
    year: {
      type: String,
      required: true,
      trim: true
    },
    uploaderEmail: {
      type: String,
      trim: true,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    filename: {
      type: String,
      required: true
    },
    contentType: {
      type: String,
      default: 'application/pdf'
    },
    size_mb: {
      type: Number,
      required: true,
      default: 0
    },
    status: {
      type: String,
      enum: ['Approved', 'Pending', 'Rejected'],
      default: 'Approved'
    }
  },
  {
    timestamps: true
  }
)

export default mongoose.model('SubmittedPdf', SubmittedPdfSchema)
