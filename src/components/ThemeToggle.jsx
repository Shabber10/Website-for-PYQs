import React, { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') || 
             localStorage.getItem('theme') === 'dark' ||
             (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
    }
    return true
  })

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [isDark])

  return (
    <button 
      className="theme-toggle-btn"
      onClick={() => setIsDark(!isDark)}
      aria-label="Toggle dark mode"
      title={isDark ? "Switch to macOS Luminous Clay Light Mode" : "Switch to visionOS Deep Space Dark Mode"}
    >
      {isDark ? (
        <Sun size={20} style={{ color: 'var(--apple-orange)', filter: 'drop-shadow(0 0 8px var(--apple-orange-glow))' }} />
      ) : (
        <Moon size={20} style={{ color: 'var(--apple-indigo)', filter: 'drop-shadow(0 0 8px var(--apple-indigo-glow))' }} />
      )}
    </button>
  )
}

