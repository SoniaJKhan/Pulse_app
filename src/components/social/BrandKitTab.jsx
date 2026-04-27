import React, { useState, useEffect } from 'react'
import { CARD, PU, PL, MI, BD, BG, H2, LBL, INP, XBTN, PBtn, loadBrandKit, saveBrandKit } from './socialUtils.jsx'

export default function BrandKitTab({ open, onClose, clientId }) {
  const [kit, setKit]               = useState(() => loadBrandKit(clientId))
  const [colorInput, setColorInput] = useState('#6C4CF1')
  const [colorHex, setColorHex]     = useState('')
  const [topicInput, setTopicInput] = useState('')

  useEffect(() => { if (open) setKit(loadBrandKit(clientId)) }, [open, clientId])

  const upd = (changes) => { const next = { ...kit, ...changes }; setKit(next); saveBrandKit(clientId, next) }

  const addColor = () => {
    const val = (colorHex || colorInput).trim()
    if (!val) return
    upd({ colors: [...(kit.colors || []), val] })
    setColorHex('')
  }
  const addTopic = () => {
    if (!topicInput.trim()) return
    upd({ topics: [...(kit.topics || []), topicInput.trim()] })
    setTopicInput('')
  }

  if (!open) return null
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex' }}>
      <div style={{ flex: 1, background: 'rgba(0,0,0,0.5)' }} onClick={onClose} />
      <div style={{ width: 480, maxWidth: '95vw', background: CARD, overflowY: 'auto', padding: '28px 28px 40px', boxShadow: '-8px 0 40px rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={H2}>My Brand Kit</h2>
          <button onClick={onClose} style={XBTN}>✕</button>
        </div>
        <div style={{ marginBottom: 22 }}>
          <label style={LBL}>Brand Colors</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
            {(kit.colors || []).map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, background: BG, padding: '4px 10px', borderRadius: 8, border: `1px solid ${BD}` }}>
                <div style={{ width: 20, height: 20, borderRadius: 4, background: c, border: '1px solid rgba(0,0,0,0.2)', flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: MI, fontFamily: "'Outfit',sans-serif" }}>{c}</span>
                <button onClick={() => upd({ colors: (kit.colors || []).filter((_, j) => j !== i) })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C4503A', fontSize: 12, padding: 0, lineHeight: 1 }}>✕</button>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="color" value={colorInput} onChange={e => { setColorInput(e.target.value); setColorHex(e.target.value) }} style={{ width: 44, height: 40, padding: 2, border: `1.5px solid ${BD}`, borderRadius: 8, cursor: 'pointer', flexShrink: 0 }} />
            <input value={colorHex} onChange={e => setColorHex(e.target.value)} placeholder="#hex or colour name" style={{ ...INP, flex: 1 }} onKeyDown={e => e.key === 'Enter' && addColor()} />
            <button onClick={addColor} style={{ padding: '10px 16px', borderRadius: 9, border: 'none', background: PU, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'Outfit',sans-serif", flexShrink: 0 }}>Add</button>
          </div>
        </div>
        <div style={{ marginBottom: 22 }}>
          <label style={LBL}>Voice & Tone</label>
          <textarea value={kit.voice || ''} onChange={e => upd({ voice: e.target.value })} placeholder="Describe your brand voice — warm, motivating, professional…" style={{ ...INP, resize: 'vertical', minHeight: 90 }} />
        </div>
        <div style={{ marginBottom: 22 }}>
          <label style={LBL}>Content Topics</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 10 }}>
            {(kit.topics || []).map((t, i) => (
              <span key={i} style={{ padding: '4px 10px', borderRadius: 20, background: `${PU}18`, color: PL, fontSize: 12, fontWeight: 600, fontFamily: "'Outfit',sans-serif", display: 'flex', alignItems: 'center', gap: 5 }}>
                {t}
                <button onClick={() => upd({ topics: (kit.topics || []).filter((_, j) => j !== i) })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: PL, fontSize: 12, padding: 0, lineHeight: 1 }}>✕</button>
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={topicInput} onChange={e => setTopicInput(e.target.value)} placeholder="yoga, wellness, nutrition…" style={{ ...INP, flex: 1 }} onKeyDown={e => { if (e.key === 'Enter') addTopic() }} />
            <button onClick={addTopic} style={{ padding: '10px 16px', borderRadius: 9, border: 'none', background: PU, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'Outfit',sans-serif", flexShrink: 0 }}>Add</button>
          </div>
        </div>
        <div style={{ padding: '12px 14px', background: 'rgba(74,124,92,0.15)', borderRadius: 10, color: '#5DA875', fontSize: 13, fontFamily: "'Outfit',sans-serif" }}>
          Changes save automatically to this client's brand kit.
        </div>
      </div>
    </div>
  )
}
