import React, { useState } from 'react'
import { X, ExternalLink, Download, Info, Eye, Copy, Check, Bookmark } from 'lucide-react'

export default function DetailsPanel({ paper, onClose, onOpenPdfModal, isBookmarked, onToggleBookmark }) {
  const [copied, setCopied] = useState(false)

  if (!paper) return null

  const getCleanPdfUrl = () => {
    if (parseFloat(paper.size_mb) >= 20) {
      return paper.download_url.replace('raw.githubusercontent.com', 'raw.githack.com')
    }
    return paper.download_url.replace(
      'raw.githubusercontent.com/Shabber10/ALL-PYQ-Papers/main',
      'cdn.jsdelivr.net/gh/Shabber10/ALL-PYQ-Papers@main'
    )
  }

  const pdfUrl = getCleanPdfUrl()

  const handleCopyLink = () => {
    navigator.clipboard.writeText(pdfUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="details-panel">
      <div className="panel-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h3 className="panel-title">{paper.subject}</h3>
            <button
              className={`bookmark-btn ${isBookmarked ? 'active' : ''}`}
              onClick={() => onToggleBookmark(paper.id)}
              title={isBookmarked ? "Remove Bookmark" : "Bookmark Paper"}
            >
              <Bookmark size={18} fill={isBookmarked ? "currentColor" : "none"} />
            </button>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Paper Reference ID: #{paper.id}
          </span>
        </div>
        <button className="close-btn" onClick={onClose} aria-label="Close panel">
          <X size={18} />
        </button>
      </div>

      <div className="panel-content">
        <div className="meta-group">
          <span className="meta-label">Category</span>
          <span className="meta-value">{paper.category}</span>
        </div>

        <div className="meta-group">
          <span className="meta-label">Subcategory</span>
          <span className="meta-value">{paper.subcategory}</span>
        </div>

        <div className="meta-group">
          <span className="meta-label">Exam Year</span>
          <span className="meta-value">{paper.year}</span>
        </div>

        <div className="meta-group">
          <span className="meta-label">File Size</span>
          <span className="meta-value">
            {paper.size_mb > 0 ? `${paper.size_mb} MB` : 'Unknown'}
          </span>
        </div>

        <div className="meta-group">
          <span className="meta-label">Repository File Path</span>
          <span className="meta-value path">{paper.path}</span>
        </div>

        <div className="alert-info">
          <Info size={18} />
          <div>
            Fast CDN loading bypasses GitHub's size limits for immediate preview & high speed download.
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button
            className="btn btn-primary"
            onClick={() => onOpenPdfModal(paper)}
            style={{ width: '100%' }}
          >
            <Eye size={16} /> Instant In-App Preview
          </button>

          <a
            className="btn btn-accent-pink"
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ width: '100%', textDecoration: 'none' }}
          >
            <ExternalLink size={16} /> Open PDF in Full Tab
          </a>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <a
              className="btn btn-secondary"
              href={paper.download_url}
              download={paper.filename}
              style={{ flex: 1, textDecoration: 'none' }}
            >
              <Download size={15} /> Download PDF
            </a>

            <button
              className="btn btn-secondary btn-icon-only"
              onClick={handleCopyLink}
              title="Copy CDN Link"
            >
              {copied ? <Check size={16} style={{ color: 'var(--apple-green)' }} /> : <Copy size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

