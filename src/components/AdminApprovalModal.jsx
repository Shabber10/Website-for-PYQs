import React, { useState, useEffect } from 'react'
import { X, ShieldAlert, CheckCircle2, XCircle, Eye, RefreshCw, Clock, Inbox, Mail, Calendar, FileText, Loader2 } from 'lucide-react'
import { fetchPdfs, updatePdfStatus, deletePdf } from '../services/api'

export default function AdminApprovalModal({ isOpen, onClose, onOpenPdfModal, onStatusChange }) {
  const [pendingList, setPendingList] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [processingId, setProcessingId] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')

  const loadPendingSubmissions = async () => {
    setIsLoading(true)
    setErrorMessage('')
    try {
      const response = await fetchPdfs({ status: 'Pending' })
      if (response && response.papers) {
        setPendingList(response.papers)
      } else {
        setPendingList([])
      }
    } catch (err) {
      setErrorMessage('Failed to load pending submissions from MongoDB.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      loadPendingSubmissions()
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleApprove = async (paper) => {
    setProcessingId(paper.id)
    try {
      await updatePdfStatus(paper.id, 'Approved')
      setPendingList((prev) => prev.filter((p) => p.id !== paper.id))
      if (onStatusChange) onStatusChange()
    } catch (err) {
      alert(err.message || 'Failed to approve paper.')
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (paper) => {
    if (!window.confirm(`Are you sure you want to reject & delete "${paper.subject}"?`)) {
      return
    }

    setProcessingId(paper.id)
    try {
      await deletePdf(paper.id)
      setPendingList((prev) => prev.filter((p) => p.id !== paper.id))
      if (onStatusChange) onStatusChange()
    } catch (err) {
      alert(err.message || 'Failed to delete paper.')
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="pdf-modal-overlay" onClick={onClose}>
      <div className="request-modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '780px' }}>
        <div className="pdf-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div className="logo-badge" style={{ width: '36px', height: '36px', background: 'rgba(175, 82, 222, 0.15)' }}>
              <ShieldAlert size={18} style={{ color: 'var(--apple-purple)' }} />
            </div>
            <div>
              <h3 className="panel-title" style={{ fontSize: '1.1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                Admin PDF Approval Queue
                <span
                  style={{
                    background: 'var(--apple-purple)',
                    color: '#fff',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    borderRadius: '12px',
                    padding: '0.1rem 0.5rem',
                    marginLeft: '0.25rem'
                  }}
                >
                  {pendingList.length} Pending
                </span>
              </h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Review, preview & approve user-submitted PDFs before publishing to portal
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button className="btn btn-secondary" style={{ padding: '0.35rem 0.65rem' }} onClick={loadPendingSubmissions} title="Refresh Submissions">
              <RefreshCw size={14} className={isLoading ? 'spinner' : ''} />
            </button>
            <button className="close-btn" onClick={onClose} title="Close Modal">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="request-modal-body" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
          {errorMessage && (
            <div style={{ padding: '0.75rem', background: 'rgba(255, 59, 48, 0.1)', color: 'var(--apple-pink)', borderRadius: '8px', fontSize: '0.825rem', marginBottom: '1rem' }}>
              {errorMessage}
            </div>
          )}

          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <Loader2 size={28} className="spinner" style={{ animation: 'spin 1s linear infinite', color: 'var(--apple-blue)', margin: '0 auto 0.5rem auto' }} />
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Fetching pending PDF submissions from MongoDB...</p>
            </div>
          ) : pendingList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
              <Inbox size={42} style={{ color: 'var(--apple-green)', margin: '0 auto 0.75rem auto' }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 0.25rem 0', color: 'var(--text-primary)' }}>
                All Clear! No Pending Uploads
              </h3>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', maxWidth: '360px', margin: '0 auto' }}>
                All user-submitted PDFs have been reviewed and processed. New submissions will appear here automatically.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {pendingList.map((paper) => (
                <div
                  key={paper.id}
                  style={{
                    background: 'var(--bg-glass-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '1rem 1.15rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.65rem'
                  }}
                >
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
                        <span className="badge-mono" style={{ fontSize: '0.675rem', background: 'rgba(255, 149, 0, 0.15)', color: 'var(--apple-yellow)' }}>
                          Pending Review
                        </span>
                      </div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '0.25rem 0 0.15rem 0', color: 'var(--text-primary)' }}>
                        {paper.subject}
                      </h4>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.2rem' }}>
                        <span>
                          <FileText size={12} style={{ display: 'inline', marginRight: '3px' }} />
                          {paper.filename} ({paper.size_mb} MB)
                        </span>
                        {paper.uploaderEmail && (
                          <span>
                            <Mail size={12} style={{ display: 'inline', marginRight: '3px' }} />
                            {paper.uploaderEmail}
                          </span>
                        )}
                        <span>
                          <Clock size={12} style={{ display: 'inline', marginRight: '3px' }} />
                          {new Date(paper.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Action Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '0.4rem 0.65rem', fontSize: '0.75rem' }}
                        onClick={() => onOpenPdfModal(paper)}
                        title="Preview PDF Document"
                      >
                        <Eye size={14} /> Preview
                      </button>

                      <button
                        className="btn btn-primary"
                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', background: 'var(--apple-green)' }}
                        onClick={() => handleApprove(paper)}
                        disabled={processingId === paper.id}
                        title="Approve & Publish to Public Site"
                      >
                        {processingId === paper.id ? (
                          <Loader2 size={14} className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
                        ) : (
                          <>
                            <CheckCircle2 size={14} /> Approve
                          </>
                        )}
                      </button>

                      <button
                        className="btn btn-secondary"
                        style={{ padding: '0.4rem 0.65rem', fontSize: '0.75rem', color: 'var(--apple-pink)', border: '1px solid rgba(255,59,48,0.3)' }}
                        onClick={() => handleReject(paper)}
                        disabled={processingId === paper.id}
                        title="Reject & Delete Submission"
                      >
                        <XCircle size={14} /> Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
