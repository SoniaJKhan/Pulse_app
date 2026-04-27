import React from 'react'
import { CARD, R, SH, BD, TX, MI } from './socialUtils.jsx'

export default function SocialWelcome() {
  return (
    <div style={{ background: CARD, borderRadius: R, padding: '64px 32px', textAlign: 'center', boxShadow: SH, border: `1px solid ${BD}` }}>
      <div style={{ fontSize: 52, marginBottom: 16 }}>📱</div>
      <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 800, color: TX, fontFamily: "'Outfit',sans-serif" }}>Select a client to get started</h2>
      <p style={{ margin: 0, fontSize: 14, color: MI, fontFamily: "'Outfit',sans-serif" }}>Choose a client from the selector above to view their social media workspace.</p>
    </div>
  )
}
