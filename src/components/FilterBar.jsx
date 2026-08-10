import React from 'react'
import { Search, RotateCcw, X, Grid, List, Bookmark, ArrowDownAZ, Calendar } from 'lucide-react'

export default function FilterBar({
  filters,
  onFilterChange,
  onReset,
  availableSubcategories,
  availableYears,
  viewMode,
  onViewModeChange,
  bookmarkedCount,
  showOnlyBookmarked,
  onToggleShowOnlyBookmarked,
  sortBy,
  onSortByChange
}) {
  const categories = [
    { id: '', label: 'All Papers' },
    { id: 'UPSC', label: 'UPSC' },
    { id: 'JEE', label: 'JEE' },
    { id: 'NEET', label: 'NEET' },
    { id: 'Boards', label: 'Boards' }
  ]

  return (
    <div className="filters-card">
      <div className="filters-secondary-row">
        <div className="filter-select-group">
          {/* Category Select */}
          <select
            className="filter-select"
            value={showOnlyBookmarked ? 'BOOKMARKED' : filters.category}
            onChange={(e) => {
              const val = e.target.value
              if (val === 'BOOKMARKED') {
                onToggleShowOnlyBookmarked(true)
                onFilterChange('category', '')
              } else {
                if (showOnlyBookmarked) onToggleShowOnlyBookmarked(false)
                onFilterChange('category', val)
              }
            }}
          >
            <option value="">All Categories</option>
            <option value="UPSC">UPSC Civil Services</option>
            <option value="JEE">JEE Competitive</option>
            <option value="NEET">NEET Competitive</option>
            <option value="Boards">State & Central Boards</option>
            <option value="BOOKMARKED">Bookmarked ({bookmarkedCount})</option>
          </select>

          {/* Subcategory Select */}
          <select
            className="filter-select"
            value={filters.subcategory}
            onChange={(e) => onFilterChange('subcategory', e.target.value)}
            disabled={!filters.category}
          >
            <option value="">All Subcategories</option>
            {availableSubcategories.map((sub, idx) => (
              <option key={idx} value={sub}>{sub}</option>
            ))}
          </select>

          {/* Year Select */}
          <select
            className="filter-select"
            value={filters.year}
            onChange={(e) => onFilterChange('year', e.target.value)}
          >
            <option value="">All Years</option>
            {availableYears.map((yr, idx) => (
              <option key={idx} value={yr}>{yr}</option>
            ))}
          </select>

          {/* Sort Selector */}
          <select
            className="filter-select"
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
          >
            <option value="year-desc">Sort: Year (Newest)</option>
            <option value="year-asc">Sort: Year (Oldest)</option>
            <option value="subject-asc">Sort: Subject (A - Z)</option>
            <option value="size-desc">Sort: File Size (Largest)</option>
          </select>

          {/* Desktop Reset Button */}
          <button className="btn btn-secondary reset-btn desktop-reset-btn" onClick={onReset} title="Reset all filters">
            <RotateCcw size={15} />
            Reset
          </button>
        </div>

        {/* View Controls & Mobile Reset Button */}
        <div className="filters-actions-group">
          <button className="btn btn-secondary reset-btn mobile-reset-btn" onClick={onReset} title="Reset all filters">
            <RotateCcw size={15} />
            Reset
          </button>

          <div className="view-controls">
            <button
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => onViewModeChange('grid')}
              title="Visual Cards View"
            >
              <Grid size={15} /> Grid
            </button>
            <button
              className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => onViewModeChange('table')}
              title="Data Table View"
            >
              <List size={15} /> Table
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

