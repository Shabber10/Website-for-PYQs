import React, { useState, useEffect } from 'react'
import { X, Inbox, CheckCircle2, Clock, Trash2, Download, ExternalLink, RefreshCw, Mail, Calendar, FileText } from 'lucide-react'

export default function AdminRequestsModal({ isOpen, onClose, onRequestCountChange }) {
  const [requests, setRequests] = useState([])
  const [filterStatus, setFilterStatus] = useState('ALL')

  const loadRequests = () => {
    try {
      const saved = localStorage.getItem('pyq_paper_requests')
      if (saved) {
        const parsed = JSON.parse(saved)
        setRequests(parsed)
        if (onRequestCountChange) onRequestCountChange(parsed.length)
      } else {
        setRequests([])
        if (onRequestCountChange) onRequestCountChange(0)
      }
    } catch {
      setRequests([])
    }
  }

  useEffect(() => {
    if (isOpen) {
      loadRequests()
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleUpdateStatus = (id, newStatus) => {
    const updated = requests.map((item) =>
      item.id === id ? { ...item, status: newStatus } : item
    )
    setRequests(updated)
    localStorage.setItem('pyq_paper_requests', JSON.stringify(updated))
  }

  const handleDeleteRequest = (id) => {
    const updated = requests.filter((item) => item.id !== id)
    setRequests(updated)
    localStorage.setItem('pyq_paper_requests', JSON.stringify(updated))
    if (onRequestCountChange) onRequestCountChange(updated.length)
  }

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear all submitted requests?")) {
      setRequests([])
      localStorage.removeItem('pyq_paper_requests')
      if (onRequestCountChange) onRequestCountChange(0)
    }
  }

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(requests, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute("href", dataStr)
    downloadAnchor.setAttribute("download", `paper_requests_${Date.now()}.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }

  const filteredRequests = requests.filter((r) => {
    if (filterStatus === 'ALL') return true
    return r.status === filterStatus
  })

  return (
    <div className="pdf-modal-overlay" onClick={onClose}>
      <div className="request-modal-container" style={{ maxWidth: '780px', width: '92%' }} onClick={(e) => e.stopPropagation()}>
        <div className="pdf-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div className="logo-badge" style={{ width: '38px', height: '38px', background: 'linear-gradient(135deg, var(--apple-purple), var(--apple-pink))' }}>
              <Inbox size={20} />
            </div>
            <div>
              <h3 className="panel-title" style={{ fontSize: '1.15rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Manage Requested Papers
                <span className="badge-mono" style={{ fontSize: '0.75rem', background: 'var(--accent-light)', color: 'var(--apple-blue)' }}>
                  {requests.length} Total
                </span>
              </h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                View, process, and track paper requests submitted by visitors.
              </p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose} title="Close Panel">
            <X size={18} />
          </button>
        </div>

        <div className="request-modal-body">
          {/* Action Toolbar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              <button
                className={`view-btn ${filterStatus === 'ALL' ? 'active' : ''}`}
                onClick={() => setFilterStatus('ALL')}
                style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}
              >
                All ({requests.length})
              </button>
              <button
                className={`view-btn ${filterStatus === 'Pending Indexing' ? 'active' : ''}`}
                onClick={() => setFilterStatus('Pending Indexing')}
                style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}
              >
                Pending ({requests.filter(r => r.status === 'Pending Indexing').length})
              </button>
              <button
                className={`view-btn ${filterStatus === 'Uploaded & Live' ? 'active' : ''}`}
                onClick={() => setFilterStatus('Uploaded & Live')}
                style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}
              >
                Live ({requests.filter(r => r.status === 'Uploaded & Live').length})
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {requests.length > 0 && (
                <>
                  <button className="btn btn-secondary" onClick={handleExportJson} style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }} title="Export Requests JSON">
                    <Download size={13} /> Export JSON
                  </button>
                  <button className="btn btn-secondary" onClick={handleClearAll} style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem', color: '#ff453a' }} title="Clear All Requests">
                    <Trash2 size={13} /> Clear All
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Requests List */}
          {filteredRequests.length > 0 ? (
            <div className="admin-requests-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '0.5rem' }}>
              {filteredRequests.map((item) => (
                <div key={item.id} className="admin-request-card" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)', padding: '0.85rem 1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <span className="badge-mono" style={{ fontSize: '0.7rem' }}>{item.category}</span>
                        <span className="badge-mono" style={{ fontSize: '0.7rem' }}>{item.year}</span>
                        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {item.subject}
                        </h4>
                      </div>

                      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Calendar size={12} /> {item.timestamp}
                        </span>
                        {item.email && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Mail size={12} /> {item.email}
                          </span>
                        )}
                        {item.driveLink && (
                          <a
                            href={item.driveLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--apple-blue)', textDecoration: 'underline' }}
                          >
                            <ExternalLink size={12} /> View Attached Link
                          </a>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <select
                        className="filter-select"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.725rem', minHeight: '30px' }}
                        value={item.status}
                        onChange={(e) => handleUpdateStatus(item.id, e.target.value)}
                      >
                        <option value="Pending Indexing">🟡 Pending</option>
                        <option value="In Review">🔵 In Review</option>
                        <option value="Uploaded & Live">🟢 Uploaded & Live</option>
                      </select>

                      <button
                        className="btn btn-secondary"
                        style={{ padding: '0.25rem 0.45rem', minHeight: '30px' }}
                        onClick={() => handleDeleteRequest(item.id)}
                        title="Delete Request"
                      >
                        <Trash2 size={13} style={{ color: '#ff453a' }} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              <Inbox size={38} style={{ margin: '0 auto 0.5rem auto', opacity: 0.6 }} />
              <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>No paper requests found.</p>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem' }}>
                Submitted visitor requests will appear here in real time.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
