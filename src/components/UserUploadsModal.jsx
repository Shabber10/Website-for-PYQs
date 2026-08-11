import React, { useState, useEffect } from 'react'
import { X, FolderClock, Search, FileText, Clock, CheckCircle2, AlertCircle, Loader2, Eye, Pencil, Trash2, Save, Sparkles, Inbox } from 'lucide-react'
import { fetchUserPdfs, updatePdfDetails, deletePdf } from '../services/api'

export default function UserUploadsModal({ isOpen, onClose, onOpenPdfModal, onStatusChange }) {
  const [emailInput, setEmailInput] = useState(() => {
    return localStorage.getItem('pyq_uploader_email') || ''
  })
  const [userPapers, setUserPapers] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [editingPaperId, setEditingPaperId] = useState(null)
  const [editFormData, setEditFormData] = useState({
    subject: '',
    category: 'UPSC',
    subcategory: '',
    year: '',
    filename: ''
  })
  const [isSaving, setIsSaving] = useState(false)
  const [processingId, setProcessingId] = useState(null)

  const loadSubmissions = async (emailToFetch) => {
    const targetEmail = emailToFetch !== undefined ? emailToFetch : emailInput
    let savedIds = []
    try {
      savedIds = JSON.parse(localStorage.getItem('pyq_my_uploaded_ids') || '[]')
    } catch {
      savedIds = []
    }

    if (!targetEmail.trim() && savedIds.length === 0) {
      setUserPapers([])
      return
    }

    setIsLoading(true)
    setErrorMessage('')
    try {
      if (targetEmail.trim()) {
        localStorage.setItem('pyq_uploader_email', targetEmail.trim())
      }
      const response = await fetchUserPdfs({ email: targetEmail.trim(), ids: savedIds })
      if (response && response.papers) {
        setUserPapers(response.papers)
      } else {
        setUserPapers([])
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to fetch your uploaded submissions.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      const savedEmail = localStorage.getItem('pyq_uploader_email') || ''
      if (savedEmail) {
        setEmailInput(savedEmail)
      }
      loadSubmissions(savedEmail)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleStartEdit = (paper) => {
    setEditingPaperId(paper.id)
    setEditFormData({
      subject: paper.subject || '',
      category: paper.category || 'UPSC',
      subcategory: paper.subcategory || '',
      year: paper.year || '',
      filename: paper.filename || ''
    })
  }

  const handleSaveEdit = async (paperId) => {
    if (!editFormData.subject.trim() || !editFormData.year.trim()) {
      alert('Subject title and year are required.')
      return
    }

    setIsSaving(true)
    try {
      const response = await updatePdfDetails(paperId, editFormData)
      if (response && response.paper) {
        setUserPapers((prev) =>
          prev.map((p) => (p.id === paperId ? { ...p, ...response.paper } : p))
        )
        setEditingPaperId(null)
        if (onStatusChange) onStatusChange()
      }
    } catch (err) {
      alert(err.message || 'Failed to save changes.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleWithdraw = async (paper) => {
    if (!window.confirm(`Are you sure you want to withdraw/delete "${paper.subject}"?`)) {
      return
    }

    setProcessingId(paper.id)
    try {
      await deletePdf(paper.id)
      setUserPapers((prev) => prev.filter((p) => p.id !== paper.id))
      if (onStatusChange) onStatusChange()
    } catch (err) {
      alert(err.message || 'Failed to withdraw submission.')
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="pdf-modal-overlay" style={{ zIndex: 2000 }} onClick={onClose}>
      <div className="request-modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '780px' }}>
        <div className="pdf-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div className="logo-badge" style={{ width: '36px', height: '36px', background: 'var(--apple-blue-glow)' }}>
              <FolderClock size={18} style={{ color: 'var(--apple-blue)' }} />
            </div>
            <div>
              <h3 className="panel-title" style={{ fontSize: '1.1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                My Uploaded Submissions
                <Sparkles size={14} style={{ color: 'var(--apple-blue)' }} />
              </h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Track live status, preview, edit, or withdraw your submitted PDFs
              </p>
            </div>
          </div>

          <button className="close-btn" onClick={onClose} title="Close Modal">
            <X size={18} />
          </button>
        </div>

        <div className="request-modal-body" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
          {/* Uploader Email Search Header */}
          <div style={{ marginBottom: '1.25rem', background: 'var(--bg-glass-card)', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <label className="meta-label" style={{ marginBottom: '0.35rem' }}>Lookup Submissions by Email</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="email"
                className="search-input"
                placeholder="Enter the email address you used when uploading..."
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadSubmissions()}
                style={{ flex: 1 }}
              />
              <button
                className="btn btn-primary"
                onClick={() => loadSubmissions()}
                disabled={isLoading || !emailInput.trim()}
                style={{ padding: '0.45rem 1rem' }}
              >
                {isLoading ? (
                  <Loader2 size={15} className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
                ) : (
                  <>
                    <Search size={15} /> Fetch Uploads
                  </>
                )}
              </button>
            </div>
          </div>

          {errorMessage && (
            <div style={{ padding: '0.75rem', background: 'rgba(255, 59, 48, 0.1)', color: 'var(--apple-pink)', borderRadius: '8px', fontSize: '0.825rem', marginBottom: '1rem' }}>
              {errorMessage}
            </div>
          )}

          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <Loader2 size={28} className="spinner" style={{ animation: 'spin 1s linear infinite', color: 'var(--apple-blue)', margin: '0 auto 0.5rem auto' }} />
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Searching MongoDB for your uploaded PDFs...</p>
            </div>
          ) : !emailInput.trim() ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <Inbox size={42} style={{ color: 'var(--apple-blue)', margin: '0 auto 0.75rem auto' }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 0.25rem 0', color: 'var(--text-primary)' }}>
                Track Your Submitted Papers
              </h3>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', maxWidth: '380px', margin: '0 auto' }}>
                Enter your email address above to view your upload history, check review status, or edit your paper details.
              </p>
            </div>
          ) : userPapers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <Inbox size={42} style={{ color: 'var(--apple-yellow)', margin: '0 auto 0.75rem auto' }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 0.25rem 0', color: 'var(--text-primary)' }}>
                No Uploads Found for "{emailInput}"
              </h3>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', maxWidth: '380px', margin: '0 auto' }}>
                We couldn't find any PDF submissions under this email address. Make sure to specify your email address when uploading PDFs.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {userPapers.map((paper) => {
                const isEditing = editingPaperId === paper.id

                return (
                  <div
                    key={paper.id}
                    style={{
                      background: 'var(--bg-glass-card)',
                      border: isEditing ? '1px solid var(--apple-blue)' : '1px solid var(--border-color)',
                      borderRadius: '12px',
                      padding: '1rem 1.15rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.65rem'
                    }}
                  >
                    {isEditing ? (
                      /* Inline Edit Form */
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, color: 'var(--apple-blue)' }}>
                            ✏️ Edit Paper Information
                          </h4>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {paper.id}</span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '0.5rem' }}>
                          <div>
                            <label className="meta-label" style={{ fontSize: '0.675rem' }}>Paper Subject / Title</label>
                            <input
                              type="text"
                              className="search-input"
                              style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem' }}
                              value={editFormData.subject}
                              onChange={(e) => setEditFormData({ ...editFormData, subject: e.target.value })}
                            />
                          </div>

                          <div>
                            <label className="meta-label" style={{ fontSize: '0.675rem' }}>Category</label>
                            <select
                              className="filter-select"
                              style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem' }}
                              value={editFormData.category}
                              onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                            >
                              <option value="UPSC">UPSC</option>
                              <option value="JEE">JEE</option>
                              <option value="NEET">NEET</option>
                              <option value="Boards">Boards</option>
                              <option value="Engineering">Engineering</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>

                          <div>
                            <label className="meta-label" style={{ fontSize: '0.675rem' }}>Subcategory</label>
                            <input
                              type="text"
                              className="search-input"
                              style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem' }}
                              value={editFormData.subcategory}
                              onChange={(e) => setEditFormData({ ...editFormData, subcategory: e.target.value })}
                            />
                          </div>

                          <div>
                            <label className="meta-label" style={{ fontSize: '0.675rem' }}>Year</label>
                            <input
                              type="text"
                              className="search-input"
                              style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem' }}
                              value={editFormData.year}
                              onChange={(e) => setEditFormData({ ...editFormData, year: e.target.value })}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="meta-label" style={{ fontSize: '0.675rem' }}>Display Filename</label>
                          <input
                            type="text"
                            className="search-input"
                            style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem' }}
                            value={editFormData.filename}
                            onChange={(e) => setEditFormData({ ...editFormData, filename: e.target.value })}
                          />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.25rem' }}>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                            onClick={() => setEditingPaperId(null)}
                            disabled={isSaving}
                          >
                            <X size={13} /> Cancel
                          </button>
                          <button
                            className="btn btn-primary"
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                            onClick={() => handleSaveEdit(paper.id)}
                            disabled={isSaving}
                          >
                            {isSaving ? (
                              <Loader2 size={13} className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
                            ) : (
                              <>
                                <Save size={13} /> Save Changes
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Read-Only View */
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                            <span className="badge badge-upsc" style={{ fontSize: '0.675rem' }}>
                              {paper.category}
                            </span>
                            <span className="badge-mono" style={{ fontSize: '0.675rem' }}>
                              {paper.subcategory || 'General'}
                            </span>
                            <span className="badge-mono" style={{ fontSize: '0.675rem' }}>
                              {paper.year}
                            </span>
                            
                            {/* Live Status Badge */}
                            {paper.status === 'Approved' ? (
                              <span className="badge-mono" style={{ fontSize: '0.675rem', background: 'rgba(52, 199, 89, 0.15)', color: 'var(--apple-green)' }}>
                                🟢 Published Live
                              </span>
                            ) : paper.status === 'Rejected' ? (
                              <span className="badge-mono" style={{ fontSize: '0.675rem', background: 'rgba(255, 59, 48, 0.15)', color: 'var(--apple-pink)' }}>
                                🔴 Rejected
                              </span>
                            ) : (
                              <span className="badge-mono" style={{ fontSize: '0.675rem', background: 'rgba(255, 149, 0, 0.15)', color: 'var(--apple-yellow)' }}>
                                🟡 Pending Admin Review
                              </span>
                            )}
                          </div>
                          <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '0.25rem 0 0.15rem 0', color: 'var(--text-primary)' }}>
                            {paper.subject}
                          </h4>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.2rem' }}>
                            <span>
                              <FileText size={12} style={{ display: 'inline', marginRight: '3px' }} />
                              {paper.filename} ({paper.size_mb} MB)
                            </span>
                            <span>
                              <Clock size={12} style={{ display: 'inline', marginRight: '3px' }} />
                              Uploaded {new Date(paper.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {/* User Action Controls */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '0.4rem 0.65rem', fontSize: '0.75rem' }}
                            onClick={() => handleStartEdit(paper)}
                            title="Edit Paper Details"
                          >
                            <Pencil size={14} /> Edit
                          </button>

                          <button
                            className="btn btn-secondary"
                            style={{ padding: '0.4rem 0.65rem', fontSize: '0.75rem' }}
                            onClick={() => onOpenPdfModal(paper)}
                            title="Preview PDF Document"
                          >
                            <Eye size={14} /> Preview
                          </button>

                          <button
                            className="btn btn-secondary"
                            style={{ padding: '0.4rem 0.65rem', fontSize: '0.75rem', color: 'var(--apple-pink)', border: '1px solid rgba(255,59,48,0.3)' }}
                            onClick={() => handleWithdraw(paper)}
                            disabled={processingId === paper.id}
                            title="Withdraw & Delete Submission"
                          >
                            {processingId === paper.id ? (
                              <Loader2 size={14} className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
                            ) : (
                              <>
                                <Trash2 size={14} /> Withdraw
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
