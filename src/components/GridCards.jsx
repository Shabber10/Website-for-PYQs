import React from 'react'
import { Bookmark, Eye, ExternalLink, Download, FileText, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, FileQuestion } from 'lucide-react'

export default function GridCards({
  papers,
  selectedPaper,
  onSelectPaper,
  bookmarkedIds,
  onToggleBookmark,
  onOpenPdfModal,
  onOpenRequestModal,
  searchQuery = '',
  currentPage,
  onPageChange,
  itemsPerPage
}) {
  const totalPages = Math.ceil(papers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedPapers = papers.slice(startIndex, startIndex + itemsPerPage)

  const getCategoryBadgeClass = (category) => {
    switch (category.toLowerCase()) {
      case 'boards': return 'badge badge-boards'
      case 'upsc': return 'badge badge-upsc'
      case 'jee': return 'badge badge-jee'
      case 'neet': return 'badge badge-neet'
      default: return 'badge'
    }
  }

  const getCleanPdfUrl = (paper) => {
    if (parseFloat(paper.size_mb) >= 20) {
      return paper.download_url.replace('raw.githubusercontent.com', 'raw.githack.com')
    }
    return paper.download_url.replace('raw.githubusercontent.com/Shabber10/ALL-PYQ-Papers/main', 'cdn.jsdelivr.net/gh/Shabber10/ALL-PYQ-Papers@main')
  }

  return (
    <div className="table-card" style={{ padding: '1.5rem' }}>
      <div className="table-header-toolbar" style={{ border: 'none', padding: '0 0 1.25rem 0' }}>
        <h2 className="table-title">
          <FileText className="header-title-glow" size={22} />
          Visual Paper Cards
        </h2>
        <span className="table-count-badge">{papers.length} papers found</span>
      </div>

      {paginatedPapers.length > 0 ? (
        <div className="grid-cards-container">
          {paginatedPapers.map((paper) => {
            const isSelected = selectedPaper?.id === paper.id
            const isBookmarked = bookmarkedIds.includes(paper.id)

            return (
              <div
                key={paper.id}
                className={`paper-card ${isSelected ? 'selected' : ''}`}
                onClick={() => onSelectPaper(paper)}
              >
                <div>
                  <div className="card-header-row">
                    <span className={getCategoryBadgeClass(paper.category)}>
                      {paper.category}
                    </span>
                    <button
                      className={`bookmark-btn ${isBookmarked ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        onToggleBookmark(paper.id)
                      }}
                      title={isBookmarked ? "Remove Bookmark" : "Bookmark Paper"}
                    >
                      <Bookmark size={18} fill={isBookmarked ? "currentColor" : "none"} />
                    </button>
                  </div>

                  <h3 className="card-title" style={{ marginTop: '0.85rem' }} title={paper.subject}>
                    {paper.subject}
                  </h3>

                  <div className="card-meta-pills" style={{ marginTop: '0.85rem' }}>
                    <span className="badge-mono">{paper.subcategory}</span>
                    {paper.size_mb > 0 && (
                      <span className="badge-mono">{paper.size_mb} MB</span>
                    )}
                  </div>
                </div>

                <div className="card-actions-row">
                  <button
                    className="btn btn-primary btn-preview-card"
                    style={{ flex: 1 }}
                    onClick={(e) => {
                      e.stopPropagation()
                      onOpenPdfModal(paper)
                    }}
                    title="Preview PDF"
                  >
                    <Eye size={14} /> <span className="btn-text-label">Preview</span>
                  </button>

                  <a
                    className="btn btn-secondary"
                    style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}
                    href={paper.download_url}
                    download={paper.filename}
                    onClick={(e) => e.stopPropagation()}
                    title="Download File"
                  >
                    <Download size={14} />
                  </a>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem', width: '100%' }}>
          <div className="empty-state-card" style={{ maxWidth: '440px', margin: '0 auto' }}>
            <FileQuestion size={42} style={{ color: 'var(--apple-blue)', margin: '0 auto 0.75rem auto' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 0.35rem 0', color: 'var(--text-primary)' }}>
              {searchQuery ? `No papers found for "${searchQuery}"` : "No papers found matching filters"}
            </h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', maxWidth: '380px', margin: '0 auto 1.25rem auto', lineHeight: 1.4 }}>
              Can't find the exam paper you're looking for? Submit a quick request and our team will index the PDF for you.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => onOpenRequestModal && onOpenRequestModal(searchQuery)}
              style={{ padding: '0.5rem 1.1rem', fontSize: '0.85rem' }}
            >
              <FileQuestion size={16} /> Request {searchQuery ? `"${searchQuery}"` : "a Paper"}
            </button>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination-container" style={{ marginTop: '1.5rem' }}>
          <span className="pagination-info">
            Showing <strong>{startIndex + 1}</strong> to <strong>{Math.min(startIndex + itemsPerPage, papers.length)}</strong> of <strong>{papers.length}</strong>
          </span>

          <div className="pagination-buttons">
            <button
              className="pagination-btn"
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeft size={16} />
            </button>
            <button
              className="pagination-btn"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              className="pagination-btn"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight size={16} />
            </button>
            <button
              className="pagination-btn"
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
