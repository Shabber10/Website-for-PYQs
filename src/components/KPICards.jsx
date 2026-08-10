import React from 'react'
import { FileText, Award, Zap, BookMarked } from 'lucide-react'

export default function KPICards({ stats }) {
  const cards = [
    {
      label: 'Total PDF Archive',
      value: stats.total,
      icon: <FileText size={24} />,
      color: 'var(--apple-blue)',
      glow: 'var(--apple-blue-glow)',
      gradient: 'linear-gradient(135deg, var(--apple-blue), var(--apple-teal))'
    },
    {
      label: 'UPSC Civil Services',
      value: stats.upsc,
      icon: <Award size={24} />,
      color: 'var(--apple-pink)',
      glow: 'var(--apple-pink-glow)',
      gradient: 'linear-gradient(135deg, var(--apple-pink), var(--apple-purple))'
    },
    {
      label: 'JEE & NEET Competitive',
      value: stats.competitive,
      icon: <Zap size={24} />,
      color: 'var(--apple-indigo)',
      glow: 'var(--apple-indigo-glow)',
      gradient: 'linear-gradient(135deg, var(--apple-indigo), var(--apple-blue))'
    },
    {
      label: 'State & Central Boards',
      value: stats.boards,
      icon: <BookMarked size={24} />,
      color: 'var(--apple-orange)',
      glow: 'var(--apple-orange-glow)',
      gradient: 'linear-gradient(135deg, var(--apple-orange), #e67e00)'
    }
  ]

  return (
    <div className="kpi-grid">
      {cards.map((card, index) => (
        <div
          key={index}
          className="kpi-card"
          style={{
            '--card-accent-gradient': card.gradient,
            '--card-glow': card.glow,
            '--card-icon-color': card.color
          }}
        >
          <div className="kpi-icon-wrapper">
            {card.icon}
          </div>
          <div className="kpi-info">
            <span className="kpi-label">{card.label}</span>
            <span className="kpi-value">{card.value.toLocaleString()}</span>
          </div>
        </div>
      ))}
    </div>
  )
}


