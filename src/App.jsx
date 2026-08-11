import React, { useState, useMemo, useEffect, useCallback } from 'react'
import Header from './components/Header'
import KPICards from './components/KPICards'
import FilterBar from './components/FilterBar'
import Table from './components/Table'
import GridCards from './components/GridCards'
import DetailsPanel from './components/DetailsPanel'
import PdfModal from './components/PdfModal'
import UploadPdfModal from './components/UploadPdfModal'
import AdminLoginModal from './components/AdminLoginModal'
import AdminApprovalModal from './components/AdminApprovalModal'
import papersData from './data/papers.json'
import { fetchPdfs } from './services/api'

export default function App() {
  // State variables
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    subcategory: '',
    year: ''
  })
  const [selectedPaper, setSelectedPaper] = useState(null)
  const [pdfModalPaper, setPdfModalPaper] = useState(null)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false)
  const [isAdminApprovalModalOpen, setIsAdminApprovalModalOpen] = useState(false)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    return Boolean(sessionStorage.getItem('admin_token'))
  })
  const [serverPapers, setServerPapers] = useState([])
  const [pendingCount, setPendingCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('pyq_view_mode') || 'grid'
  })
  const [sortBy, setSortBy] = useState('year-desc')
  const [showOnlyBookmarked, setShowOnlyBookmarked] = useState(false)
  const [bookmarkedIds, setBookmarkedIds] = useState(() => {
    try {
      const saved = localStorage.getItem('pyq_bookmarks')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // Load uploaded & approved PDFs from MongoDB backend
  const loadMongoPdfs = useCallback(async () => {
    try {
      const response = await fetchPdfs({ status: 'Approved' })
      if (response && response.papers) {
        setServerPapers(response.papers)
      }
    } catch {
      // Backend may not be connected locally yet, fallback silently
    }
  }, [])

  // Load pending submissions count for admin badge
  const loadPendingCount = useCallback(async () => {
    try {
      const response = await fetchPdfs({ status: 'Pending' })
      if (response && response.papers) {
        setPendingCount(response.papers.length)
      }
    } catch {
      // fallback silently
    }
  }, [])

  useEffect(() => {
    loadMongoPdfs()
    loadPendingCount()
  }, [loadMongoPdfs, loadPendingCount])

  const itemsPerPage = viewMode === 'grid' ? 12 : 20

  // Combine static JSON catalog with MongoDB approved papers
  const combinedPapers = useMemo(() => {
    const serverMap = new Map()
    serverPapers.forEach((p) => serverMap.set(p.id, p))
    
    // Server papers take priority at top
    return [...serverPapers, ...papersData.filter((p) => !serverMap.has(p.id))]
  }, [serverPapers])

  // Persist viewMode
  useEffect(() => {
    localStorage.setItem('pyq_view_mode', viewMode)
  }, [viewMode])

  // Persist bookmarks
  useEffect(() => {
    localStorage.setItem('pyq_bookmarks', JSON.stringify(bookmarkedIds))
  }, [bookmarkedIds])

  const handleToggleBookmark = (id) => {
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  // Reset pagination when any filter or view mode changes
  useEffect(() => {
    setCurrentPage(1)
  }, [filters, viewMode, showOnlyBookmarked, sortBy])

  // Extract available subcategories based on chosen category
  const availableSubcategories = useMemo(() => {
    if (!filters.category) return []
    const subs = new Set()
    combinedPapers.forEach(p => {
      if (p.category === filters.category && p.subcategory) {
        subs.add(p.subcategory)
      }
    })
    return Array.from(subs).sort()
  }, [filters.category, combinedPapers])

  // Extract available years based on chosen category/subcategory
  const availableYears = useMemo(() => {
    const yrs = new Set()
    combinedPapers.forEach(p => {
      if (filters.category && p.category !== filters.category) return
      if (filters.subcategory && p.subcategory !== filters.subcategory) return
      if (p.year && p.year !== 'Unknown') {
        yrs.add(p.year)
      }
    })
    return Array.from(yrs).sort((a, b) => b.localeCompare(a))
  }, [filters.category, filters.subcategory, combinedPapers])

  // Handle single filter modification
  const handleFilterChange = (key, value) => {
    setFilters(prev => {
      const next = { ...prev, [key]: value }
      if (key === 'category') {
        next.subcategory = ''
      }
      return next
    })
  }

  // Clear all filters
  const handleReset = () => {
    setFilters({
      search: '',
      category: '',
      subcategory: '',
      year: ''
    })
    setShowOnlyBookmarked(false)
    setSelectedPaper(null)
    setCurrentPage(1)
    setSortBy('year-desc')
  }

  // Filter and sort combined papers
  const filteredPapers = useMemo(() => {
    const query = filters.search.trim().toLowerCase()
    
    let result = combinedPapers.filter(paper => {
      // Bookmarked filter
      if (showOnlyBookmarked && !bookmarkedIds.includes(paper.id)) return false

      // Category filter
      if (filters.category && paper.category !== filters.category) return false
      
      // Subcategory filter
      if (filters.subcategory && paper.subcategory !== filters.subcategory) return false
      
      // Year filter
      if (filters.year && paper.year !== filters.year) return false
      
      // Text search filter
      if (query) {
        const matchesSubject = (paper.subject || '').toLowerCase().includes(query)
        const matchesCategory = (paper.category || '').toLowerCase().includes(query)
        const matchesSubcategory = (paper.subcategory || '').toLowerCase().includes(query)
        const matchesYear = (paper.year || '').toLowerCase().includes(query)
        const matchesFilename = (paper.filename || '').toLowerCase().includes(query)
        
        return matchesSubject || matchesCategory || matchesSubcategory || matchesYear || matchesFilename
      }
      
      return true
    })

    // Sort result
    return result.sort((a, b) => {
      if (sortBy === 'year-desc') return (b.year || '').localeCompare(a.year || '')
      if (sortBy === 'year-asc') return (a.year || '').localeCompare(b.year || '')
      if (sortBy === 'subject-asc') return (a.subject || '').localeCompare(b.subject || '')
      if (sortBy === 'size-desc') return (parseFloat(b.size_mb) || 0) - (parseFloat(a.size_mb) || 0)
      return 0
    })
  }, [combinedPapers, filters, showOnlyBookmarked, bookmarkedIds, sortBy])

  // Overall Repository scale stats for KPI cards
  const overallStats = useMemo(() => {
    let total = combinedPapers.length
    let upsc = 0
    let competitive = 0
    let boards = 0

    combinedPapers.forEach(p => {
      if (p.category === 'UPSC') upsc++
      else if (p.category === 'Boards') boards++
      else if (p.category === 'JEE' || p.category === 'NEET') competitive++
    })

    return { total, upsc, competitive, boards }
  }, [combinedPapers])

  const handleUploadSuccess = () => {
    loadPendingCount()
  }

  const handleAdminStatusChange = () => {
    loadMongoPdfs()
    loadPendingCount()
  }

  // Secret admin link click handler in footer
  const handleSecretAdminClick = () => {
    if (isAdminAuthenticated) {
      setIsAdminApprovalModalOpen(true)
    } else {
      setIsAdminLoginModalOpen(true)
    }
  }

  const handleAdminLoginSuccess = () => {
    setIsAdminAuthenticated(true)
    setIsAdminLoginModalOpen(false)
    setIsAdminApprovalModalOpen(true)
  }

  const handleAdminLogout = () => {
    sessionStorage.removeItem('admin_token')
    setIsAdminAuthenticated(false)
    setIsAdminApprovalModalOpen(false)
  }

  return (
    <div className="app-container">
      {/* Header with Title, Search Bar & Upload PDF Action */}
      <Header 
        search={filters.search}
        onSearchChange={(val) => handleFilterChange('search', val)}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
      />
      
      {/* Search, Dropdowns, Chips & View Switcher */}
      <FilterBar 
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
        availableSubcategories={availableSubcategories}
        availableYears={availableYears}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        bookmarkedCount={bookmarkedIds.length}
        showOnlyBookmarked={showOnlyBookmarked}
        onToggleShowOnlyBookmarked={setShowOnlyBookmarked}
        sortBy={sortBy}
        onSortByChange={setSortBy}
      />
      
      {/* Main Layout Area: Grid or Table with Side Drawer details panel */}
      <main className="main-layout">
        <div className={`table-container-wrapper ${selectedPaper ? 'collapsed' : ''}`}>
          {viewMode === 'grid' ? (
            <GridCards 
              papers={filteredPapers}
              selectedPaper={selectedPaper}
              onSelectPaper={setSelectedPaper}
              bookmarkedIds={bookmarkedIds}
              onToggleBookmark={handleToggleBookmark}
              onOpenPdfModal={setPdfModalPaper}
              onOpenRequestModal={() => setIsUploadModalOpen(true)}
              searchQuery={filters.search}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
            />
          ) : (
            <Table 
              papers={filteredPapers}
              selectedPaper={selectedPaper}
              onSelectPaper={setSelectedPaper}
              bookmarkedIds={bookmarkedIds}
              onToggleBookmark={handleToggleBookmark}
              onOpenPdfModal={setPdfModalPaper}
              onOpenRequestModal={() => setIsUploadModalOpen(true)}
              searchQuery={filters.search}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
            />
          )}
        </div>
        
        {/* Right drawer details panel */}
        {selectedPaper && (
          <DetailsPanel 
            paper={selectedPaper}
            onClose={() => setSelectedPaper(null)}
            onOpenPdfModal={setPdfModalPaper}
            isBookmarked={bookmarkedIds.includes(selectedPaper.id)}
            onToggleBookmark={handleToggleBookmark}
          />
        )}
      </main>

      {/* Footer Section with Archive Stats Overview */}
      <footer className="app-footer">
        <div className="footer-title-row">
          <h3 className="footer-title">Repository Archive Breakdown</h3>
          <span className="footer-subtitle">Live Overview of Indexing Statistics</span>
        </div>
        <KPICards stats={overallStats} />
        <div className="footer-bottom-row">
          <p>
            © {new Date().getFullYear()} PYQ Portal • Built by{' '}
            <span
              onClick={handleSecretAdminClick}
              title="Secret Admin Access"
              style={{
                cursor: 'pointer',
                fontWeight: 600,
                color: 'var(--text-primary)',
                transition: 'color 0.2s ease',
                borderBottom: '1px dotted var(--text-muted)'
              }}
              onMouseEnter={(e) => (e.target.style.color = 'var(--apple-purple)')}
              onMouseLeave={(e) => (e.target.style.color = 'var(--text-primary)')}
            >
              Shabber
            </span>
          </p>
        </div>
      </footer>

      {/* In-App PDF Preview Modal */}
      {pdfModalPaper && (
        <PdfModal 
          paper={pdfModalPaper}
          onClose={() => setPdfModalPaper(null)}
        />
      )}

      {/* Upload PDF Modal (MongoDB GridFS upload) */}
      <UploadPdfModal 
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />

      {/* Secret Admin Authentication Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginModalOpen}
        onClose={() => setIsAdminLoginModalOpen(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />

      {/* Admin Approval Queue Modal */}
      <AdminApprovalModal
        isOpen={isAdminApprovalModalOpen}
        onClose={() => setIsAdminApprovalModalOpen(false)}
        onOpenPdfModal={setPdfModalPaper}
        onStatusChange={handleAdminStatusChange}
        onLogout={handleAdminLogout}
      />
    </div>
  )
}
