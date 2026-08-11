import React, { useState, useRef } from 'react'
import { X, UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2, Sparkles, FolderPlus } from 'lucide-react'
import { uploadPdf } from '../services/api'

export default function UploadPdfModal({ isOpen, onClose, onUploadSuccess }) {
  const [formData, setFormData] = useState({
    subject: '',
    category: 'UPSC',
    subcategory: '',
    year: new Date().getFullYear().toString(),
    uploaderEmail: localStorage.getItem('pyq_uploader_email') || '',
    description: ''
  })
  const [selectedFile, setSelectedFile] = useState(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [uploadSuccess, setUploadSuccess] = useState(false)

  const fileInputRef = useRef(null)

  if (!isOpen) return null

  const handleFileSelect = (file) => {
    setErrorMessage('')
    if (!file) return

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMessage('Please select a valid PDF file (.pdf)')
      return
    }

    if (file.size > 32 * 1024 * 1024) {
      setErrorMessage('File size exceeds the maximum limit of 32 MB.')
      return
    }

    setSelectedFile(file)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedFile) {
      setErrorMessage('Please select a PDF file to upload.')
      return
    }
    if (!formData.subject.trim()) {
      setErrorMessage('Please enter the paper subject / title.')
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')

    try {
      const data = new FormData()
      data.append('pdfFile', selectedFile)
      data.append('subject', formData.subject.trim())
      data.append('category', formData.category)
      data.append('subcategory', formData.subcategory.trim() || 'General')
      data.append('year', formData.year.trim())
      data.append('uploaderEmail', formData.uploaderEmail.trim())
      data.append('description', formData.description.trim())

      const result = await uploadPdf(data)
      if (formData.uploaderEmail.trim()) {
        localStorage.setItem('pyq_uploader_email', formData.uploaderEmail.trim())
      }
      setUploadSuccess(true)
      if (onUploadSuccess) {
        onUploadSuccess(result.paper)
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to upload PDF. Ensure backend server & MongoDB are running.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setSelectedFile(null)
    setFormData({
      subject: '',
      category: 'UPSC',
      subcategory: '',
      year: new Date().getFullYear().toString(),
      uploaderEmail: '',
      description: ''
    })
    setErrorMessage('')
    setUploadSuccess(false)
  }

  return (
    <div className="pdf-modal-overlay" onClick={onClose}>
      <div className="request-modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
        <div className="pdf-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div className="logo-badge" style={{ width: '36px', height: '36px', background: 'var(--apple-blue-glow)' }}>
              <UploadCloud size={18} style={{ color: 'var(--apple-blue)' }} />
            </div>
            <div>
              <h3 className="panel-title" style={{ fontSize: '1.1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                Upload PDF to Database
                <Sparkles size={14} style={{ color: 'var(--apple-blue)' }} />
              </h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Store PDF files & metadata directly into MongoDB backend
              </p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose} title="Close Modal">
            <X size={18} />
          </button>
        </div>

        <div className="request-modal-body">
          {uploadSuccess ? (
            <div className="request-success-card">
              <div className="success-icon-badge">
                <CheckCircle2 size={48} style={{ color: 'var(--apple-green)' }} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0.5rem 0 0.25rem 0', color: 'var(--text-primary)' }}>
                Submitted for Review!
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '380px', margin: '0 auto 1.25rem auto', lineHeight: 1.4 }}>
                Your PDF <strong>"{formData.subject}"</strong> has been saved in MongoDB and is currently placed on hold for admin review. It will be published live once approved.
              </p>

              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                <button className="btn btn-primary" onClick={handleReset}>
                  <FolderPlus size={15} /> Upload Another PDF
                </button>
                <button className="btn btn-secondary" onClick={onClose}>
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="request-form">
              {/* File Dropzone */}
              <div
                style={{
                  border: isDragOver ? '2px dashed var(--apple-blue)' : '2px dashed var(--border-color)',
                  borderRadius: '12px',
                  padding: '1.25rem 1rem',
                  textAlign: 'center',
                  background: isDragOver ? 'var(--accent-light)' : 'var(--bg-glass-card)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  marginBottom: '1rem'
                }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".pdf,application/pdf"
                  style={{ display: 'none' }}
                  onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
                />

                {selectedFile ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                    <FileText size={28} style={{ color: 'var(--apple-blue)' }} />
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                        {selectedFile.name}
                      </div>
                      <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to upload
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedFile(null)
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--apple-pink)',
                        cursor: 'pointer',
                        padding: '0.25rem',
                        marginLeft: 'auto'
                      }}
                      title="Remove file"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div>
                    <UploadCloud size={32} style={{ color: 'var(--apple-blue)', marginBottom: '0.35rem' }} />
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                      Click to select or drop a PDF file here
                    </div>
                    <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      Supports PDF documents up to 32 MB
                    </div>
                  </div>
                )}
              </div>

              {/* Form Metadata Fields */}
              <div className="form-grid">
                <div className="form-group">
                  <label className="meta-label">Exam Category *</label>
                  <select
                    className="filter-select"
                    style={{ width: '100%', minWidth: 0 }}
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="UPSC">UPSC Civil Services</option>
                    <option value="JEE">JEE Competitive</option>
                    <option value="NEET">NEET Competitive</option>
                    <option value="Boards">State & Central Boards</option>
                    <option value="Engineering">Engineering / University</option>
                    <option value="Other">Other Exam</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="meta-label">Exam Year *</label>
                  <input
                    type="text"
                    className="search-input"
                    style={{ padding: '0.55rem 0.85rem' }}
                    placeholder="e.g. 2024"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="meta-label">Paper Subject / Title *</label>
                  <input
                    type="text"
                    className="search-input"
                    style={{ padding: '0.55rem 0.85rem' }}
                    placeholder="e.g. Computer Science Paper 1"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="meta-label">Subcategory / Branch</label>
                  <input
                    type="text"
                    className="search-input"
                    style={{ padding: '0.55rem 0.85rem' }}
                    placeholder="e.g. Mains / Prelims / General"
                    value={formData.subcategory}
                    onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="meta-label">Uploader Email (Optional)</label>
                <input
                  type="email"
                  className="search-input"
                  style={{ padding: '0.55rem 0.85rem' }}
                  placeholder="your.email@example.com"
                  value={formData.uploaderEmail}
                  onChange={(e) => setFormData({ ...formData, uploaderEmail: e.target.value })}
                />
              </div>

              {errorMessage && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: 'var(--apple-pink)',
                    background: 'rgba(255, 59, 48, 0.08)',
                    padding: '0.6rem 0.85rem',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    marginBottom: '0.75rem'
                  }}
                >
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting || !selectedFile}>
                  {isSubmitting ? (
                    <>
                      <Loader2 size={15} className="spinner" style={{ animation: 'spin 1s linear infinite' }} /> Uploading to MongoDB...
                    </>
                  ) : (
                    <>
                      <UploadCloud size={15} /> Upload PDF
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
