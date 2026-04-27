import React from 'react'
import { PU, TX, MI, BD } from './socialUtils.jsx'

export default function SocialTabBar({ tabs, activeTab, onSelect }) {
  return (
    <div style={{ display: 'flex', gap: 4, borderBottom: `2px solid ${BD}` }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onSelect(t.id)} style={{ padding: '10px 28px', borderRadius: '9px 9px 0 0', fontSize: 14, fontWeight: 600, border: 'none', background: 'transparent', color: activeTab === t.id ? TX : MI, cursor: 'pointer', fontFamily: "'Outfit',sans-serif", borderBottom: activeTab === t.id ? `2px solid ${PU}` : '2px solid transparent', marginBottom: -2 }}>
          {t.label}
        </button>
      ))}
    </div>
  )
}
