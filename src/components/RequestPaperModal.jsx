import React, { useState, useEffect } from 'react'
import { X, Send, FileQuestion, CheckCircle2, AlertCircle, Clock, Sparkles } from 'lucide-react'

export default function RequestPaperModal({ isOpen, onClose, initialQuery = '' }) {
  const [formData, setFormData] = useState({
    category: 'UPSC',
    subject: '',
    year: new Date().getFullYear().toString(),
    driveLink: '',
    email: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [requestList, setRequestList] = useState([])

  // Load existing requests from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('pyq_paper_requests')
      if (saved) setRequestList(JSON.parse(saved))
    } catch {
      // ignore errors
    }
  }, [])

  // Auto-fill query when opened from empty search state
  useEffect(() => {
    if (initialQuery) {
      setFormData((prev) => ({ ...prev, subject: initialQuery }))
    }
  }, [initialQuery])

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.subject.trim()) return

    const newRequest = {
      id: 'req_' + Date.now(),
      ...formData,
      timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Pending Indexing'
    }

    const updatedList = [newRequest, ...requestList]
    setRequestList(updatedList)
    try {
      localStorage.setItem('pyq_paper_requests', JSON.stringify(updatedList))
    } catch {
      // ignore
    }

    setSubmitted(true)
  }

  const handleResetForm = () => {
    setSubmitted(false)
    setFormData({
      category: 'UPSC',
      subject: '',
      year: new Date().getFullYear().toString(),
      driveLink: '',
      email: ''
    })
  }

  return (
    <div className="pdf-modal-overlay" onClick={onClose}>
      <div className="request-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="pdf-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div className="logo-badge" style={{ width: '36px', height: '36px' }}>
              <FileQuestion size={18} />
            </div>
            <div>
              <h3 className="panel-title" style={{ fontSize: '1.1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                Request a Missing Paper
                <Sparkles size={14} style={{ color: 'var(--apple-pink)' }} />
              </h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Can't find a paper? Submit details & our team will index the PDF within 24 hours.
              </p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose} title="Close Modal">
            <X size={18} />
          </button>
        </div>

        <div className="request-modal-body">
          {submitted ? (
            <div className="request-success-card">
              <div className="success-icon-badge">
                <CheckCircle2 size={48} style={{ color: 'var(--apple-green)' }} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0.5rem 0 0.25rem 0', color: 'var(--text-primary)' }}>
                Request Received!
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '360px', margin: '0 auto 1.25rem auto', lineHeight: 1.4 }}>
                We have added <strong>"{formData.subject}"</strong> to our indexing queue. Our team will verify and upload the PDF file shortly.
              </p>

              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                <button className="btn btn-primary" onClick={handleResetForm}>
                  <Send size={15} /> Submit Another Request
                </button>
                <button className="btn btn-secondary" onClick={onClose}>
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="request-form">
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

              <div className="form-group">
                <label className="meta-label">Paper Subject / Title *</label>
                <input
                  type="text"
                  className="search-input"
                  style={{ padding: '0.55rem 0.85rem' }}
                  placeholder="e.g. GATE 2024 Computer Science Paper 1 / Physics Shift 2"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="meta-label">PDF Link or Notes (Optional)</label>
                <input
                  type="url"
                  className="search-input"
                  style={{ padding: '0.55rem 0.85rem' }}
                  placeholder="e.g. https://drive.google.com/file/d/..."
                  value={formData.driveLink}
                  onChange={(e) => setFormData({ ...formData, driveLink: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="meta-label">Your Email (Optional for updates)</label>
                <input
                  type="email"
                  className="search-input"
                  style={{ padding: '0.55rem 0.85rem' }}
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Send size={15} /> Submit Request
                </button>
              </div>
            </form>
          )}

          {/* User Request History */}
          {requestList.length > 0 && (
            <div className="request-history-section">
              <h4 className="meta-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem' }}>
                <Clock size={13} /> Your Recent Requests ({requestList.length})
              </h4>
              <div className="request-history-list">
                {requestList.slice(0, 3).map((item) => (
                  <div key={item.id} className="request-history-item">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-primary)' }}>{item.subject}</span>
                      <span className="badge-mono" style={{ fontSize: '0.65rem', background: 'var(--accent-light)', color: 'var(--apple-blue)' }}>
                        {item.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', marginTop: '0.15rem' }}>
                      {item.category} • {item.year} • Requested on {item.timestamp}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
