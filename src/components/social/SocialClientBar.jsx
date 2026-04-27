import React from 'react'
import { PU, PL, MI, BD, TX, CARD, SH, BG } from './socialUtils.jsx'

export default function SocialClientBar({ clients, selectedId, onSelect, onAddNew, onProfileClick, onDeleteClient }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: MI, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 12, fontFamily: "'Outfit',sans-serif" }}>Select Client</div>
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4, alignItems: 'center' }}>
        {clients.map(c => {
          const isSel       = selectedId === c.id
          const displayName = c.name || c.businessName || 'Client'
          const initials    = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
          return (
            <div key={c.id} style={{ position: 'relative', flexShrink: 0 }}>
              <button onClick={() => onSelect(c.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 40px 10px 16px', borderRadius: 12, border: `2px solid ${isSel ? PU : BD}`, background: isSel ? `${PU}12` : CARD, cursor: 'pointer', fontFamily: "'Outfit',sans-serif", transition: 'all .15s', boxShadow: isSel ? `0 0 0 3px ${PU}20` : SH, whiteSpace: 'nowrap' }}>
                <div
                  onClick={e => { e.stopPropagation(); onProfileClick?.(c) }}
                  title="View profile"
                  style={{ width: 32, height: 32, borderRadius: '50%', background: isSel ? PU : `${PU}20`, color: isSel ? '#fff' : PL, fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden', cursor: 'pointer' }}
                >
                  {c.profilePhoto
                    ? <img src={c.profilePhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none' }} />
                    : initials}
                </div>
                <div style={{ textAlign: 'left' }} onClick={e => { e.stopPropagation(); onProfileClick?.(c) }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: isSel ? PL : TX }}>{displayName}</div>
                  <div style={{ fontSize: 11, color: MI, marginTop: 1 }}>{c.businessType}</div>
                </div>
              </button>
              <button
                onClick={e => { e.stopPropagation(); onDeleteClient?.(c) }}
                title="Delete client"
                style={{ position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: 6, border: 'none', background: 'rgba(239,68,68,0.12)', color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
              </button>
            </div>
          )
        })}

        <button onClick={onAddNew} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 12, border: `2px dashed ${BD}`, background: 'transparent', cursor: 'pointer', fontFamily: "'Outfit',sans-serif", flexShrink: 0, color: PL, fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add New Client
        </button>
      </div>

      {!selectedId && clients.length > 0 && <p style={{ margin: '10px 0 0', fontSize: 13, color: `${PL}90`, fontFamily: "'Outfit',sans-serif", fontWeight: 500 }}>Select a client to get started</p>}
      {clients.length === 0 && <p style={{ margin: '10px 0 0', fontSize: 13, color: `${PL}90`, fontFamily: "'Outfit',sans-serif", fontWeight: 500 }}>No clients yet — click "Add New Client" to get started.</p>}
    </div>
  )
}
