import React, { useState } from 'react'
import { X, Lock, KeyRound, User, AlertCircle, Loader2, Sparkles, LogIn } from 'lucide-react'
import { adminLogin } from '../services/api'

export default function AdminLoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      setErrorMessage('Please enter both username and password.')
      return
    }

    setIsLoading(true)
    setErrorMessage('')

    try {
      const data = await adminLogin(username.trim(), password.trim())
      if (data && data.success) {
        sessionStorage.setItem('admin_token', data.token || 'authenticated')
        if (onLoginSuccess) {
          onLoginSuccess(data)
        }
      }
    } catch (err) {
      setErrorMessage(err.message || 'Invalid admin username or password.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="pdf-modal-overlay" onClick={onClose}>
      <div className="request-modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        <div className="pdf-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div className="logo-badge" style={{ width: '36px', height: '36px', background: 'rgba(175, 82, 222, 0.15)' }}>
              <Lock size={18} style={{ color: 'var(--apple-purple)' }} />
            </div>
            <div>
              <h3 className="panel-title" style={{ fontSize: '1.1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                Secret Admin Portal
                <Sparkles size={14} style={{ color: 'var(--apple-purple)' }} />
              </h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Enter credentials to review & approve PDF submissions
              </p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose} title="Close Modal">
            <X size={18} />
          </button>
        </div>

        <div className="request-modal-body">
          <form onSubmit={handleSubmit} className="request-form">
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="meta-label">Admin Username</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <User size={16} style={{ position: 'absolute', left: '0.85rem', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="search-input"
                  style={{ paddingLeft: '2.4rem', paddingRight: '0.85rem' }}
                  placeholder="e.g. shabber"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoFocus
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="meta-label">Admin Password</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <KeyRound size={16} style={{ position: 'absolute', left: '0.85rem', color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  className="search-input"
                  style={{ paddingLeft: '2.4rem', paddingRight: '0.85rem' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {errorMessage && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: 'var(--apple-pink)',
                  background: 'rgba(255, 59, 48, 0.08)',
                  padding: '0.6rem 0.85rem',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  marginBottom: '1rem'
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{errorMessage}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isLoading}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ background: 'var(--apple-purple)' }}
                disabled={isLoading || !username || !password}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={15} className="spinner" style={{ animation: 'spin 1s linear infinite' }} /> Verifying...
                  </>
                ) : (
                  <>
                    <LogIn size={15} /> Authenticate Admin
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
