import React from 'react'
import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, ExternalLink, Download, Eye, Bookmark, ListFilter, FileQuestion } from 'lucide-react'

export default function Table({
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
    <div className="table-card">
      <div className="table-header-toolbar">
        <h2 className="table-title">
          <ListFilter size={20} className="header-title-glow" />
          Exam Papers List
        </h2>
        <span className="table-count-badge">{papers.length} papers found</span>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th className="hide-mobile" style={{ width: '36px', textAlign: 'center' }}>Fav</th>
              <th>Paper Subject / Title</th>
              <th className="hide-mobile">Category</th>
              <th className="hide-mobile">Subcategory</th>
              <th className="hide-mobile">Year</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedPapers.length > 0 ? (
              paginatedPapers.map((paper) => {
                const isBookmarked = bookmarkedIds.includes(paper.id)

                return (
                  <tr
                    key={paper.id}
                    className={selectedPaper?.id === paper.id ? 'selected' : ''}
                    onClick={() => onSelectPaper(paper)}
                  >
                    <td className="hide-mobile" style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                      <button
                        className={`bookmark-btn ${isBookmarked ? 'active' : ''}`}
                        onClick={() => onToggleBookmark(paper.id)}
                        title={isBookmarked ? "Remove Bookmark" : "Bookmark Paper"}
                      >
                        <Bookmark size={15} fill={isBookmarked ? "currentColor" : "none"} />
                      </button>
                    </td>
                    <td className="paper-name-cell">
                      <div className="paper-title-text" title={paper.subject}>
                        {paper.subject}
                      </div>
                    </td>
                    <td className="hide-mobile">
                      <span className={getCategoryBadgeClass(paper.category)}>
                        {paper.category}
                      </span>
                    </td>
                    <td className="hide-mobile">{paper.subcategory}</td>
                    <td className="hide-mobile">
                      <span className="badge-mono">{paper.year}</span>
                    </td>
                    <td>
                      <div className="table-actions-cell">
                        <button
                          className="btn btn-primary btn-action-mobile"
                          onClick={(e) => {
                            e.stopPropagation()
                            onOpenPdfModal(paper)
                          }}
                          title="Preview PDF"
                        >
                          <Eye size={12} /> <span className="btn-text-label">Preview</span>
                        </button>
                        <a
                          className="btn btn-secondary btn-action-icon"
                          href={paper.download_url}
                          download={paper.filename}
                          onClick={(e) => e.stopPropagation()}
                          title="Download PDF"
                        >
                          <Download size={12} />
                        </a>
                        <button
                          className={`btn btn-secondary btn-action-icon ${isBookmarked ? 'active' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation()
                            onToggleBookmark(paper.id)
                          }}
                          title={isBookmarked ? "Remove Bookmark" : "Bookmark Paper"}
                          style={isBookmarked ? { background: 'var(--apple-orange)', color: '#ffffff', borderColor: 'transparent' } : {}}
                        >
                          <Bookmark size={12} fill={isBookmarked ? "currentColor" : "none"} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
                  <div className="empty-state-card">
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
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination-container">
          <span className="pagination-info">
            Showing <strong>{startIndex + 1}</strong> to <strong>{Math.min(startIndex + itemsPerPage, papers.length)}</strong> of <strong>{papers.length}</strong> papers
          </span>

          <div className="pagination-buttons">
            <button
              className="pagination-btn"
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
              title="First Page"
            >
              <ChevronsLeft size={16} />
            </button>

            <button
              className="pagination-btn"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              title="Previous Page"
            >
              <ChevronLeft size={16} />
            </button>

            <button
              className="pagination-btn"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              title="Next Page"
            >
              <ChevronRight size={16} />
            </button>

            <button
              className="pagination-btn"
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
              title="Last Page"
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

