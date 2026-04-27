import React, { useState } from 'react'
import { BG, CARD, PU, PL, MI, BD, TX, LBL, INP, PBtn, EmptyState, RunBtn, OutlineBtn, OutputRenderer, callClaude, PLATS, CTYPES } from './socialUtils.jsx'

export default function AuditTab({ analysis, upd, client, pushToast }) {
  const [adding, setAdding]   = useState(false)
  const [form, setForm]       = useState({ description: '', platform: 'Instagram', contentType: 'Reel', views: '', likes: '', comments: '', saves: '', notes: '' })
  const [loading, setLoading] = useState(false)
  const [hasKey, setHasKey]   = useState(() => !!localStorage.getItem('pulse_anthropic_key'))
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const savePost = () => {
    if (!form.description.trim()) return
    upd({ contentAudit: [...analysis.contentAudit, { id: `ca${Date.now()}`, ...form, views: Number(form.views) || 0, likes: Number(form.likes) || 0, comments: Number(form.comments) || 0, saves: Number(form.saves) || 0 }] })
    setForm({ description: '', platform: 'Instagram', contentType: 'Reel', views: '', likes: '', comments: '', saves: '', notes: '' })
    setAdding(false)
  }

  const runAnalysis = async () => {
    if (!hasKey) return
    setLoading(true)
    try {
      const prompt = `You are a social media analyst. Analyse only the data provided. Never give generic advice.\n\nReturn valid JSON only:\n{"patterns":"what content patterns exist","working":[{"finding":"observation","reasoning":"why it works"}],"notWorking":[{"finding":"observation","reasoning":"why it underperforms"}]}\n\nData: ${JSON.stringify({ client: client?.businessName, audit: analysis.contentAudit })}`
      const res = await callClaude([{ role: 'user', content: prompt }], 1000)
      upd({ contentResult: res })
      pushToast('Content analysis complete!')
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
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: TX, fontFamily: "'Outfit',sans-serif" }}>Content Audit</h3>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: MI, fontFamily: "'Outfit',sans-serif" }}>Add your top posts, then run the analysis.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {hasKey && analysis.contentAudit.length > 0 && <RunBtn label="Run Analysis" onClick={runAnalysis} loading={loading} />}
          <OutlineBtn label="+ Add Post" onClick={() => setAdding(true)} />
        </div>
      </div>
      {!hasKey && <div style={{ padding: '11px 14px', background: `${PU}12`, borderRadius: 10, color: PL, fontSize: 13, fontFamily: "'Outfit',sans-serif", marginBottom: 16 }}>Add your Anthropic API key in Settings to run AI analysis.</div>}
      {adding && (
        <div style={{ background: BG, borderRadius: 12, padding: 20, marginBottom: 16, border: `1px solid ${BD}` }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div style={{ gridColumn: '1/-1' }}><label style={LBL}>Description / Caption</label><input value={form.description} onChange={e => f('description', e.target.value)} placeholder="What was this post about?" style={INP} /></div>
            <div><label style={LBL}>Platform</label><select value={form.platform} onChange={e => f('platform', e.target.value)} style={INP}>{PLATS.map(p => <option key={p}>{p}</option>)}</select></div>
            <div><label style={LBL}>Content Type</label><select value={form.contentType} onChange={e => f('contentType', e.target.value)} style={INP}>{CTYPES.map(t => <option key={t}>{t}</option>)}</select></div>
            <div><label style={LBL}>Views</label><input type="number" value={form.views} onChange={e => f('views', e.target.value)} placeholder="0" style={INP} /></div>
            <div><label style={LBL}>Likes</label><input type="number" value={form.likes} onChange={e => f('likes', e.target.value)} placeholder="0" style={INP} /></div>
            <div><label style={LBL}>Comments</label><input type="number" value={form.comments} onChange={e => f('comments', e.target.value)} placeholder="0" style={INP} /></div>
            <div><label style={LBL}>Saves</label><input type="number" value={form.saves} onChange={e => f('saves', e.target.value)} placeholder="0" style={INP} /></div>
            <div style={{ gridColumn: '1/-1' }}><label style={LBL}>Notes</label><input value={form.notes} onChange={e => f('notes', e.target.value)} placeholder="Any context about this post…" style={INP} /></div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={savePost} style={{ ...PBtn(), width: 'auto', padding: '9px 22px' }}>Save Post</button>
            <button onClick={() => setAdding(false)} style={{ padding: '9px 18px', borderRadius: 10, border: `1.5px solid ${BD}`, background: 'none', color: MI, fontSize: 13, cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}>Cancel</button>
          </div>
        </div>
      )}
      {analysis.contentAudit.length === 0 && !adding
        ? <EmptyState icon="📊" msg="No posts added yet." sub="Add your top performing posts to run a content analysis." />
        : analysis.contentAudit.length > 0 && (
          <div style={{ background: CARD, borderRadius: 12, border: `1px solid ${BD}`, overflow: 'hidden', marginBottom: 20 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Outfit',sans-serif" }}>
              <thead><tr style={{ background: BG, borderBottom: `1px solid ${BD}` }}>{['Description', 'Platform', 'Type', 'Views', 'Likes', 'Comments', ''].map(h => <th key={h} style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, color: MI, textAlign: 'left', textTransform: 'uppercase', letterSpacing: '.04em' }}>{h}</th>)}</tr></thead>
              <tbody>{analysis.contentAudit.map(post => (
                <tr key={post.id} style={{ borderBottom: `1px solid ${BD}` }}>
                  <td style={{ padding: '11px 14px', fontSize: 13, color: TX, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.description}</td>
                  <td style={{ padding: '11px 14px', fontSize: 13, color: MI }}>{post.platform}</td>
                  <td style={{ padding: '11px 14px', fontSize: 13, color: MI }}>{post.contentType}</td>
                  <td style={{ padding: '11px 14px', fontSize: 13, color: TX, fontWeight: 600 }}>{post.views?.toLocaleString()}</td>
                  <td style={{ padding: '11px 14px', fontSize: 13, color: TX }}>{post.likes?.toLocaleString()}</td>
                  <td style={{ padding: '11px 14px', fontSize: 13, color: TX }}>{post.comments?.toLocaleString()}</td>
                  <td style={{ padding: '11px 14px' }}><button onClick={() => upd({ contentAudit: analysis.contentAudit.filter(p => p.id !== post.id) })} style={{ background: 'none', border: 'none', color: '#C4503A', cursor: 'pointer', fontSize: 13 }}>✕</button></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      {analysis.contentResult && (
        <div style={{ marginTop: 16, background: BG, borderRadius: 10, padding: '14px 16px', border: `1px solid ${BD}` }}>
          <OutputRenderer data={analysis.contentResult} />
        </div>
      )}
    </div>
  )
}
