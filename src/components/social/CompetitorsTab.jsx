import React, { useState } from 'react'
import { BG, CARD, PU, PL, MI, BD, TX, LBL, INP, PBtn, EmptyState, RunBtn, OutlineBtn, OutputRenderer, PlatDot, callClaude, PLATS, CTYPES } from './socialUtils.jsx'

export default function CompetitorsTab({ analysis, upd, pushToast }) {
  const [adding, setAdding]     = useState(false)
  const [compForm, setCompForm] = useState({ handle: '', platform: 'Instagram', niche: '' })
  const [postForms, setPostForms] = useState({})
  const [loading, setLoading]   = useState(false)
  const [hasKey, setHasKey]     = useState(() => !!localStorage.getItem('pulse_anthropic_key'))
  const cf = (k, v) => setCompForm(p => ({ ...p, [k]: v }))

  const saveComp = () => {
    if (!compForm.handle.trim()) return
    upd({ competitors: [...analysis.competitors, { id: `comp${Date.now()}`, ...compForm, topPosts: [] }] })
    setCompForm({ handle: '', platform: 'Instagram', niche: '' }); setAdding(false)
  }

  const addPost = (compId) => {
    const pf = postForms[compId] || {}
    if (!pf.type) return
    upd({ competitors: analysis.competitors.map(c => c.id === compId ? { ...c, topPosts: [...(c.topPosts || []), { id: `tp${Date.now()}`, views: Number(pf.views) || 0, type: pf.type || '', hookStyle: pf.hookStyle || '' }] } : c) })
    setPostForms(p => ({ ...p, [compId]: {} }))
  }

  const runAnalysis = async () => {
    if (!hasKey) return
    setLoading(true)
    try {
      const prompt = `Analyse only the competitor data provided. Identify specific hook patterns, content formats and engagement triggers.\n\nReturn valid JSON only:\n{"formats":"common high-performing formats","hookPatterns":"hook patterns from top posts","videoStructure":"video structure trends","engagementTriggers":"what drives engagement"}\n\nData: ${JSON.stringify(analysis.competitors)}`
      const res = await callClaude([{ role: 'user', content: prompt }], 800)
      upd({ competitorResult: res })
      pushToast('Competitor analysis complete!')
    } catch (e) {
      if (e.message === 'NO_KEY') setHasKey(false)
      else pushToast(e.message.slice(0, 80), 'error')
    }
    setLoading(false)
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: TX, fontFamily: "'Outfit',sans-serif" }}>Competitor Analysis</h3>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: MI, fontFamily: "'Outfit',sans-serif" }}>Add competitors and their top posts.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {hasKey && analysis.competitors.length > 0 && <RunBtn label="Run Analysis" onClick={runAnalysis} loading={loading} />}
          <OutlineBtn label="+ Add Competitor" onClick={() => setAdding(true)} />
        </div>
      </div>
      {!hasKey && <div style={{ padding: '11px 14px', background: `${PU}12`, borderRadius: 10, color: PL, fontSize: 13, fontFamily: "'Outfit',sans-serif", marginBottom: 16 }}>Add your Anthropic API key in Settings to run AI analysis.</div>}
      {adding && (
        <div style={{ background: BG, borderRadius: 12, padding: 20, marginBottom: 16, border: `1px solid ${BD}` }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div><label style={LBL}>Handle / Name</label><input value={compForm.handle} onChange={e => cf('handle', e.target.value)} placeholder="@handle" style={INP} /></div>
            <div><label style={LBL}>Platform</label><select value={compForm.platform} onChange={e => cf('platform', e.target.value)} style={INP}>{PLATS.map(p => <option key={p}>{p}</option>)}</select></div>
            <div><label style={LBL}>Niche</label><input value={compForm.niche} onChange={e => cf('niche', e.target.value)} placeholder="e.g. yoga studio" style={INP} /></div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={saveComp} style={{ ...PBtn(), width: 'auto', padding: '9px 22px' }}>Add Competitor</button>
            <button onClick={() => setAdding(false)} style={{ padding: '9px 18px', borderRadius: 10, border: `1.5px solid ${BD}`, background: 'none', color: MI, fontSize: 13, cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}>Cancel</button>
          </div>
        </div>
      )}
      {analysis.competitors.length === 0 && !adding
        ? <EmptyState icon="🔍" msg="No competitors added yet." sub="Add competitors to analyse their content strategy." />
        : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
            {analysis.competitors.map(comp => (
              <div key={comp.id} style={{ background: CARD, borderRadius: 12, border: `1px solid ${BD}`, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: `1px solid ${BD}`, background: BG }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <PlatDot p={comp.platform} size={10} />
                    <span style={{ fontSize: 15, fontWeight: 700, color: TX, fontFamily: "'Outfit',sans-serif" }}>{comp.handle}</span>
                    <span style={{ fontSize: 12, color: MI, fontFamily: "'Outfit',sans-serif" }}>{comp.platform} · {comp.niche}</span>
                  </div>
                  <button onClick={() => upd({ competitors: analysis.competitors.filter(c => c.id !== comp.id) })} style={{ background: 'none', border: 'none', color: '#C4503A', cursor: 'pointer', fontSize: 13, fontFamily: "'Outfit',sans-serif" }}>Remove</button>
                </div>
                <div style={{ padding: '14px 18px' }}>
                  {(comp.topPosts || []).map((post, i) => (
                    <div key={post.id} style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 6, padding: '7px 10px', background: BG, borderRadius: 8 }}>
                      <span style={{ fontSize: 12, color: MI, fontFamily: "'Outfit',sans-serif", width: 20 }}>#{i + 1}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: TX, fontFamily: "'Outfit',sans-serif" }}>{post.type}</span>
                      {post.hookStyle && <span style={{ fontSize: 11, color: PL, fontFamily: "'Outfit',sans-serif" }}>{post.hookStyle}</span>}
                      {post.views > 0 && <span style={{ fontSize: 11, color: MI, fontFamily: "'Outfit',sans-serif" }}>{post.views.toLocaleString()} views</span>}
                    </div>
                  ))}
                  <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                    <select value={postForms[comp.id]?.type || ''} onChange={e => setPostForms(p => ({ ...p, [comp.id]: { ...(p[comp.id] || {}), type: e.target.value } }))} style={{ ...INP, width: 110 }}><option value="">Type…</option>{CTYPES.map(t => <option key={t}>{t}</option>)}</select>
                    <input placeholder="Hook style" value={postForms[comp.id]?.hookStyle || ''} onChange={e => setPostForms(p => ({ ...p, [comp.id]: { ...(p[comp.id] || {}), hookStyle: e.target.value } }))} style={{ ...INP, width: 120 }} />
                    <input type="number" placeholder="Views" value={postForms[comp.id]?.views || ''} onChange={e => setPostForms(p => ({ ...p, [comp.id]: { ...(p[comp.id] || {}), views: e.target.value } }))} style={{ ...INP, width: 90 }} />
                    <button onClick={() => addPost(comp.id)} style={{ padding: '9px 16px', borderRadius: 9, border: 'none', background: PU, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'Outfit',sans-serif", whiteSpace: 'nowrap' }}>Add Post</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      {analysis.competitorResult && (
        <div style={{ marginTop: 16, background: BG, borderRadius: 10, padding: '14px 16px', border: `1px solid ${BD}` }}>
          <OutputRenderer data={analysis.competitorResult} />
        </div>
      )}
    </div>
  )
}
