import React from 'react'
import { PU, PL, MI, BD, TX, CARD, SH } from './socialUtils.jsx'

export default function SocialClientBar({ activeClients, selectedId, onSelect }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: MI, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 12, fontFamily: "'Outfit',sans-serif" }}>Select Client</div>
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
        {activeClients.map(c => {
          const isSel       = selectedId === c.id
          const displayName = c.businessName || c.name || 'Client'
          const initials    = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
          return (
            <button key={c.id} onClick={() => onSelect(c.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderRadius: 12, border: `2px solid ${isSel ? PU : BD}`, background: isSel ? `${PU}12` : CARD, cursor: 'pointer', fontFamily: "'Outfit',sans-serif", transition: 'all .15s', boxShadow: isSel ? `0 0 0 3px ${PU}20` : SH, flexShrink: 0, whiteSpace: 'nowrap' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: isSel ? PU : `${PU}20`, color: isSel ? '#fff' : PL, fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{initials}</div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: isSel ? PL : TX }}>{displayName}</div>
                <div style={{ fontSize: 11, color: MI, marginTop: 1 }}>{c.businessType}</div>
              </div>
            </button>
          )
        })}
      </div>
      {!selectedId && <p style={{ margin: '10px 0 0', fontSize: 13, color: `${PL}90`, fontFamily: "'Outfit',sans-serif", fontWeight: 500 }}>Select a client to get started</p>}
    </div>
  )
}
