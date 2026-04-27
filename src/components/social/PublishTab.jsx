import React, { useState, useMemo } from 'react'
import { CARD, PU, MI, BD, TX, BG, R, LBL, INP, SPill, PlatDot, EmptyState, STAT_MAP, isoToday, fmtDate, fmtMon } from './socialUtils.jsx'

export default function PublishTab({ clientId, clients, content, updateContent, pushToast }) {
  const [editId, setEditId]     = useState(null)
  const [editForm, setEditForm] = useState({})

  const items = useMemo(() =>
    content.filter(c => c.clientId === clientId)
      .sort((a, b) => (a.scheduledDate || '').localeCompare(b.scheduledDate || '')),
    [content, clientId])

  const grouped = useMemo(() => {
    const map = {}
    items.forEach(item => { const key = item.scheduledDate?.slice(0, 7) || 'no-date'; if (!map[key]) map[key] = []; map[key].push(item) })
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b))
  }, [items])

  const startEdit = (item) => { setEditId(item.id); setEditForm({ status: item.status || 'Draft', scheduledDate: item.scheduledDate || isoToday(), scheduledTime: item.scheduledTime || '' }) }
  const saveEdit  = (id)   => { updateContent(id, editForm); pushToast('Post updated!'); setEditId(null) }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: TX, fontFamily: "'Outfit',sans-serif" }}>Content Calendar</h3>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: MI, fontFamily: "'Outfit',sans-serif" }}>{clients.find(c => c.id === clientId)?.businessName || '—'}</p>
        </div>
      </div>
      {items.length === 0
        ? <EmptyState icon="📅" msg="No posts scheduled yet." sub="Create posts from the Home tab to see them here." />
        : grouped.map(([month, monthItems]) => (
          <div key={month} style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: MI, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 12, fontFamily: "'Outfit',sans-serif", display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1, height: 1, background: BD }} />{fmtMon(month)}<div style={{ flex: 1, height: 1, background: BD }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {monthItems.map(item => {
                const isEditing = editId === item.id
                return (
                  <div key={item.id} style={{ background: CARD, borderRadius: 12, border: `1px solid ${BD}`, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px' }}>
                      <div style={{ width: 40, height: 40, borderRadius: 9, background: `${PU}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <PlatDot p={item.platforms?.[0]} size={12} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 600, color: TX, fontFamily: "'Outfit',sans-serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.caption || item.title || 'Untitled'}</div>
                        <div style={{ fontSize: 11.5, color: MI, marginTop: 3, fontFamily: "'Outfit',sans-serif" }}>{item.platforms?.[0]} · {fmtDate(item.scheduledDate)}{item.scheduledTime ? ` at ${item.scheduledTime}` : ''}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                        <SPill s={item.contentType || 'Post'} sm />
                        <SPill s={item.status || 'Draft'} sm />
                        <button onClick={() => isEditing ? setEditId(null) : startEdit(item)} style={{ padding: '5px 12px', borderRadius: 8, border: `1.5px solid ${BD}`, background: 'none', color: MI, fontSize: 12, cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}>{isEditing ? 'Cancel' : 'Edit'}</button>
                      </div>
                    </div>
                    {isEditing && (
                      <div style={{ borderTop: `1px solid ${BD}`, padding: '14px 18px', background: BG, display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                        <div><label style={LBL}>Status</label><select value={editForm.status} onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))} style={{ ...INP, width: 160 }}>{Object.keys(STAT_MAP).map(s => <option key={s}>{s}</option>)}</select></div>
                        <div><label style={LBL}>Date</label><input type="date" value={editForm.scheduledDate} onChange={e => setEditForm(f => ({ ...f, scheduledDate: e.target.value }))} style={{ ...INP, width: 160 }} /></div>
                        <div><label style={LBL}>Time</label><input type="time" value={editForm.scheduledTime} onChange={e => setEditForm(f => ({ ...f, scheduledTime: e.target.value }))} style={{ ...INP, width: 140 }} /></div>
                        <button onClick={() => saveEdit(item.id)} style={{ padding: '10px 20px', borderRadius: 9, border: 'none', background: PU, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}>Save Changes</button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
    </div>
  )
}
