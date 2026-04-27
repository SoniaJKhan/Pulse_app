import React, { useState, useEffect, useCallback } from 'react'
import { BG, CARD, MI, BD, TX, LBL, INP, SH } from './socialUtils.jsx'
import { safeGet, safeSet } from '../../utils/storage'

const PLATFORMS   = ['Instagram', 'TikTok', 'Facebook', 'LinkedIn', 'YouTube']
const CTYPES      = ['Reel', 'Carousel', 'Static Post', 'Story', 'Video', 'Blog']
const HOOK_TYPES  = ['Emotional', 'Educational', 'Trend', 'Humour', 'Inspirational']

const ORANGE = '#F97316'
const PURPLE = '#7C3AED'

const emptyPost = () => ({ id: `tp${Date.now()}${Math.random().toString(36).slice(2)}`, contentType: '', views: '', likes: '', hookType: '', whyItWorked: '' })
const emptyComp = () => ({ id: `c${Date.now()}${Math.random().toString(36).slice(2)}`, handle: '', platform: 'Instagram', niche: '', posts: [] })

function load(clientId) {
  if (!clientId) return [emptyComp()]
  const parsed = safeGet(`pulse_competitors_${clientId}`, null)
  return Array.isArray(parsed) && parsed.length ? parsed : [emptyComp()]
}

export default function CompetitorsTab({ clientId, pushToast, onAdvance }) {
  const [comps, setComps] = useState(() => load(clientId))

  useEffect(() => {
    setComps(load(clientId))
  }, [clientId])

  const setComp = useCallback((id, patch) => {
    setComps(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c))
  }, [])

  const setPost = useCallback((compId, postId, patch) => {
    setComps(prev => prev.map(c =>
      c.id === compId
        ? { ...c, posts: c.posts.map(p => p.id === postId ? { ...p, ...patch } : p) }
        : c
    ))
  }, [])

  const removePost = useCallback((compId, postId) => {
    setComps(prev => prev.map(c =>
      c.id === compId ? { ...c, posts: c.posts.filter(p => p.id !== postId) } : c
    ))
  }, [])

  const addPost = useCallback((compId) => {
    setComps(prev => prev.map(c =>
      c.id === compId ? { ...c, posts: [...c.posts, emptyPost()] } : c
    ))
  }, [])

  const removeComp = useCallback((id) => {
    setComps(prev => prev.filter(c => c.id !== id))
  }, [])

  const addComp = () => setComps(prev => [...prev, emptyComp()])

  const handleSave = () => {
    if (clientId) {
      safeSet(`pulse_competitors_${clientId}`, comps)
    }
    pushToast?.('Competitors saved')
    onAdvance?.()
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: TX, fontFamily: "'Outfit',sans-serif" }}>Competitor Analysis</h3>
        <p style={{ margin: '5px 0 0', fontSize: 13, color: MI, fontFamily: "'Outfit',sans-serif" }}>Add 2–5 competitors. This sharpens your strategy.</p>
      </div>

      {/* Competitor blocks */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 20 }}>
        {comps.map((comp, ci) => (
          <div key={comp.id} style={{ background: CARD, borderRadius: 16, boxShadow: SH, borderLeft: `4px solid ${ORANGE}`, overflow: 'hidden' }}>

            {/* Competitor header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: `1px solid ${BD}` }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: MI, fontFamily: "'Outfit',sans-serif", textTransform: 'uppercase', letterSpacing: '.05em' }}>
                Competitor {ci + 1}
              </span>
              <button
                onClick={() => removeComp(comp.id)}
                title="Remove competitor"
                style={{ background: 'rgba(239,68,68,0.1)', border: 'none', color: '#EF4444', cursor: 'pointer', borderRadius: 7, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                </svg>
              </button>
            </div>

            <div style={{ padding: '18px 20px' }}>
              {/* Competitor fields */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 20 }}>
                <div>
                  <label style={LBL}>Handle</label>
                  <input value={comp.handle} onChange={e => setComp(comp.id, { handle: e.target.value })} placeholder="@handle" style={INP} />
                </div>
                <div>
                  <label style={LBL}>Platform</label>
                  <select value={comp.platform} onChange={e => setComp(comp.id, { platform: e.target.value })} style={INP}>
                    {PLATFORMS.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label style={LBL}>Niche</label>
                  <input value={comp.niche} onChange={e => setComp(comp.id, { niche: e.target.value })} placeholder="e.g. yoga, fitness, wellness" style={INP} />
                </div>
              </div>

              {/* Post rows */}
              {comp.posts.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                  {comp.posts.map(post => (
                    <div key={post.id} style={{ background: BG, borderRadius: 8, padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                      <div style={{ flex: '0 0 130px' }}>
                        <label style={LBL}>Content Type</label>
                        <select value={post.contentType} onChange={e => setPost(comp.id, post.id, { contentType: e.target.value })} style={INP}>
                          <option value="">Select…</option>
                          {CTYPES.map(t => <option key={t}>{t}</option>)}
                        </select>
                      </div>
                      <div style={{ flex: '0 0 90px' }}>
                        <label style={LBL}>Views</label>
                        <input type="number" min="0" value={post.views} onChange={e => setPost(comp.id, post.id, { views: e.target.value })} placeholder="0" style={INP} />
                      </div>
                      <div style={{ flex: '0 0 90px' }}>
                        <label style={LBL}>Likes</label>
                        <input type="number" min="0" value={post.likes} onChange={e => setPost(comp.id, post.id, { likes: e.target.value })} placeholder="0" style={INP} />
                      </div>
                      <div style={{ flex: '0 0 145px' }}>
                        <label style={LBL}>Hook Type</label>
                        <select value={post.hookType} onChange={e => setPost(comp.id, post.id, { hookType: e.target.value })} style={INP}>
                          <option value="">Select…</option>
                          {HOOK_TYPES.map(h => <option key={h}>{h}</option>)}
                        </select>
                      </div>
                      <div style={{ flex: '1 1 160px' }}>
                        <label style={LBL}>Why It Worked</label>
                        <input value={post.whyItWorked} onChange={e => setPost(comp.id, post.id, { whyItWorked: e.target.value })} placeholder="Why did this perform?" style={INP} />
                      </div>
                      <button
                        onClick={() => removePost(comp.id, post.id)}
                        title="Remove post"
                        style={{ background: 'rgba(239,68,68,0.1)', border: 'none', color: '#EF4444', cursor: 'pointer', borderRadius: 7, width: 34, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, flexShrink: 0, alignSelf: 'flex-end' }}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Post button */}
              <button
                onClick={() => addPost(comp.id)}
                style={{ padding: '8px 18px', borderRadius: 9, border: 'none', background: ORANGE, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}
              >
                + Add Post
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Competitor + Save */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={addComp}
          style={{ padding: '10px 22px', borderRadius: 11, border: 'none', background: PURPLE, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}
        >
          + Add Competitor
        </button>
        <button
          onClick={handleSave}
          style={{ padding: '10px 28px', borderRadius: 11, border: 'none', background: ORANGE, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}
        >
          Save &amp; Continue
        </button>
      </div>
    </div>
  )
}
