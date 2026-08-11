import React, { useEffect } from 'react'
import { X, ExternalLink, Download, FileText, AlertCircle } from 'lucide-react'

export default function PdfModal({ paper, onClose }) {
  if (!paper) return null

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

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

  return (
    <div className="pdf-modal-overlay" style={{ zIndex: 3000 }} onClick={onClose}>
      <div className="pdf-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="pdf-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FileText size={22} className="header-title-glow" />
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
                {paper.subject}
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {paper.category} • {paper.subcategory} • {paper.year} {paper.size_mb > 0 ? `(${paper.size_mb} MB)` : ''}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <a
              className="btn btn-primary"
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink size={14} /> Fullscreen Tab
            </a>

            <a
              className="btn btn-secondary"
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
              href={paper.download_url}
              download={paper.filename}
            >
              <Download size={14} /> Download
            </a>

            <button className="close-btn" onClick={onClose} aria-label="Close modal">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="pdf-modal-body">
          <iframe
            src={pdfUrl}
            title={paper.subject}
            className="pdf-iframe"
          />
        </div>
      </div>
    </div>
  )
}
