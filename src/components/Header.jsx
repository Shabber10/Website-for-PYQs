import React from 'react'
import { BookOpen, Sparkles, ShieldCheck, Search, X, FileQuestion, Inbox } from 'lucide-react'
import ThemeToggle from './ThemeToggle'

export default function Header({ search, onSearchChange, onOpenRequestModal, onOpenAdminModal, requestCount = 0 }) {
  return (
    <header className="header">
      <div className="header-left">
        <div className="header-title-container">
          <div className="logo-badge">
            <BookOpen size={18} />
          </div>
          <div>
            <h1 className="header-title">
              PYQ <span className="header-title-glow">Portal</span>
              <Sparkles size={14} style={{ color: 'var(--apple-pink)', filter: 'drop-shadow(0 0 8px var(--apple-pink-glow))' }} />
            </h1>
            <p className="header-subtitle">Official PYQ Archive</p>
          </div>
        </div>
      </div>

      {/* Navbar Search Bar */}
      <div className="header-search-wrapper">
        <Search className="search-icon" size={16} />
        <input
          type="text"
          className="search-input"
          placeholder="Search by subject, year, exam..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {search && (
          <button
            className="search-clear-btn"
            onClick={() => onSearchChange('')}
            title="Clear Search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div className="header-actions">
        <button
          className="btn btn-accent-pink btn-request-header"
          onClick={() => onOpenRequestModal('')}
          title="Request a Missing Exam Paper"
        >
          <FileQuestion size={15} />
          <span className="btn-request-label">Request Paper</span>
        </button>

        <button
          className="btn btn-secondary btn-request-header"
          onClick={onOpenAdminModal}
          title="View & Manage Visitor Requests"
          style={{ position: 'relative' }}
        >
          <Inbox size={15} style={{ color: 'var(--apple-purple)' }} />
          <span className="btn-request-label">Requests</span>
          {requestCount > 0 && (
            <span
              style={{
                background: 'var(--apple-pink)',
                color: '#fff',
                fontSize: '0.65rem',
                fontWeight: 'bold',
                borderRadius: '10px',
                padding: '0.05rem 0.35rem',
                marginLeft: '0.15rem'
              }}
            >
              {requestCount}
            </span>
          )}
        </button>

        <div className="repo-badge-chip">
          <ShieldCheck size={13} style={{ color: 'var(--apple-green)' }} />
          <span>v1.0 Main</span>
        </div>
        <ThemeToggle />
      </div>
    </header>
  )
}
