import React, { useState } from 'react'

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function fmtMonth(m) {
  const [y, mo] = m.split('-')
  return `${MONTH_NAMES[parseInt(mo) - 1]} '${y.slice(2)}`
}

function num(v) {
  if (v === null || v === undefined || v === '') return '—'
  return typeof v === 'number' ? v.toLocaleString() : v
}

function LineChart({ metrics }) {
  if (metrics.length < 2) {
    return (
      <div style={{ padding: '32px', textAlign: 'center', color: 'var(--mid-grey)', fontSize: '13px' }}>
        Add at least 2 months of data to see the trend chart.
      </div>
    )
  }

  const sorted = [...metrics].sort((a, b) => a.month.localeCompare(b.month))
  const n = sorted.length
  const W = 600, H = 160
  const pL = 10, pR = 10, pT = 16, pB = 30
  const cW = W - pL - pR
  const cH = H - pT - pB

  const xPos = (i) => pL + (n === 1 ? cW / 2 : (i / (n - 1)) * cW)

  const followers = sorted.map(m => m.followerCount || 0)
  const maxF = Math.max(...followers)
  const minF = Math.min(...followers)
  const rangeF = maxF - minF || 1
  const yF = (v) => pT + cH - ((v - minF) / rangeF) * cH * 0.85 - cH * 0.075

  const engs = sorted.map(m => m.engagementRate || 0)
  const maxE = Math.max(...engs)
  const minE = Math.min(...engs)
  const rangeE = maxE - minE || 1
  const yE = (v) => pT + cH - ((v - minE) / rangeE) * cH * 0.85 - cH * 0.075

  const followerPts = sorted.map((m, i) => `${xPos(i)},${yF(m.followerCount || 0)}`).join(' ')
  const engPts = sorted.map((m, i) => `${xPos(i)},${yE(m.engagementRate || 0)}`).join(' ')

  const gridYs = [0, 0.25, 0.5, 0.75, 1].map(pct => pT + cH - pct * cH * 0.85 - cH * 0.075)

  return (
    <div>
      <div style={{ display: 'flex', gap: '20px', padding: '12px 20px 0', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12px', fontWeight: 600, color: 'var(--accent)' }}>
          <svg width="24" height="8" viewBox="0 0 24 8"><line x1="0" y1="4" x2="24" y2="4" stroke="var(--accent)" strokeWidth="2"/><circle cx="12" cy="4" r="3" fill="var(--accent)"/></svg>
          Follower Count
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12px', fontWeight: 600, color: '#4A8C8C' }}>
          <svg width="24" height="8" viewBox="0 0 24 8"><line x1="0" y1="4" x2="24" y2="4" stroke="#4A8C8C" strokeWidth="2" strokeDasharray="4 2"/><circle cx="12" cy="4" r="3" fill="#4A8C8C"/></svg>
          Engagement Rate %
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: '160px' }} preserveAspectRatio="none">
        {/* Grid lines */}
        {gridYs.map((y, i) => (
          <line key={i} x1={pL} y1={y} x2={W - pR} y2={y} stroke="#E8E4DF" strokeWidth="1" />
        ))}

        {/* Follower count line */}
        <polyline points={followerPts} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinejoin="round" />
        {sorted.map((m, i) => (
          <circle key={`f${i}`} cx={xPos(i)} cy={yF(m.followerCount || 0)} r="3.5" fill="var(--accent)" />
        ))}

        {/* Engagement rate line */}
        <polyline points={engPts} fill="none" stroke="#4A8C8C" strokeWidth="2" strokeLinejoin="round" strokeDasharray="5 3" />
        {sorted.map((m, i) => (
          <circle key={`e${i}`} cx={xPos(i)} cy={yE(m.engagementRate || 0)} r="3.5" fill="#4A8C8C" />
        ))}

        {/* X axis labels */}
        {sorted.map((m, i) => (
          <text key={`x${i}`} x={xPos(i)} y={H - 6} textAnchor="middle" fontSize="10" fill="#9E948C">
            {fmtMonth(m.month)}
          </text>
        ))}
      </svg>
    </div>
  )
}

const EMPTY_FORM = { month: '', followerCount: '', reach: '', impressions: '', engagementRate: '', contentPieces: '', bookingsAttributed: '', paidAdSpend: '', paidAdResults: '' }

function MetricsForm({ initial, clientId, onSave, onClose }) {
  const [form, setForm] = useState(initial ? { ...initial } : { ...EMPTY_FORM })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = () => {
    if (!form.month) return
    onSave({
      clientId,
      month: form.month,
      followerCount: form.followerCount === '' ? null : Number(form.followerCount),
      reach: form.reach === '' ? null : Number(form.reach),
      impressions: form.impressions === '' ? null : Number(form.impressions),
      engagementRate: form.engagementRate === '' ? null : Number(form.engagementRate),
      contentPieces: form.contentPieces === '' ? null : Number(form.contentPieces),
      bookingsAttributed: form.bookingsAttributed === '' ? null : Number(form.bookingsAttributed),
      paidAdSpend: form.paidAdSpend === '' ? null : Number(form.paidAdSpend),
      paidAdResults: form.paidAdResults || '',
    })
    onClose()
  }

  const fields = [
    { key: 'followerCount',      label: 'Follower Count',             type: 'number', placeholder: 'e.g. 3500' },
    { key: 'reach',              label: 'Reach',                      type: 'number', placeholder: 'e.g. 18000' },
    { key: 'impressions',        label: 'Impressions',                type: 'number', placeholder: 'e.g. 28000' },
    { key: 'engagementRate',     label: 'Engagement Rate (%)',        type: 'number', placeholder: 'e.g. 5.4', step: '0.1' },
    { key: 'contentPieces',      label: 'Content Pieces Published',   type: 'number', placeholder: 'e.g. 15' },
    { key: 'bookingsAttributed', label: 'Bookings Attributed',        type: 'number', placeholder: 'e.g. 8' },
    { key: 'paidAdSpend',        label: 'Paid Ad Spend ($)',          type: 'number', placeholder: 'e.g. 300' },
    { key: 'paidAdResults',      label: 'Paid Ad Results',            type: 'text',   placeholder: 'e.g. 34 link clicks, 7 bookings' },
  ]

  return (
    <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '400px', background: '#fff', borderLeft: '1px solid var(--border)', boxShadow: '-4px 0 24px rgba(0,0,0,0.1)', zIndex: 200, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--dark)', margin: 0 }}>
          {initial ? 'Edit Metrics' : 'Add Monthly Metrics'}
        </h3>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--mid-grey)', display: 'flex', alignItems: 'center' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, overflowY: 'auto' }}>
        <div>
          <label style={fLabel}>Month <span style={{ color: 'var(--red)' }}>*</span></label>
          <input type="month" style={fInput} value={form.month} onChange={e => set('month', e.target.value)} />
        </div>
        {fields.map(f => (
          <div key={f.key}>
            <label style={fLabel}>{f.label}</label>
            <input
              type={f.type}
              step={f.step}
              style={fInput}
              value={form[f.key]}
              onChange={e => set(f.key, e.target.value)}
              placeholder={f.placeholder}
            />
          </div>
        ))}
      </div>

      <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border)', display: 'flex', gap: '8px', flexShrink: 0 }}>
        <button type="button" onClick={onClose} style={{ flex: 1, background: 'none', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '8px', fontSize: '13px', cursor: 'pointer', color: 'var(--mid-grey)', fontWeight: 600, fontFamily: "'Outfit', sans-serif" }}>
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={!form.month}
          style={{ flex: 2, background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', padding: '8px', fontSize: '13px', cursor: 'pointer', fontWeight: 600, fontFamily: "'Outfit', sans-serif", opacity: !form.month ? 0.5 : 1 }}
        >
          Save Metrics
        </button>
      </div>
    </div>
  )
}

const fLabel = { fontSize: '11.5px', fontWeight: 700, color: 'var(--mid-grey)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '6px' }
const fInput = { width: '100%', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '8px 10px', fontSize: '13px', color: 'var(--dark)', fontFamily: "'Outfit', sans-serif", background: '#fff', boxSizing: 'border-box', outline: 'none' }

const COL_HEADERS = [
  { key: 'month',              label: 'Month',               w: '90px' },
  { key: 'followerCount',      label: 'Followers',           w: '90px' },
  { key: 'reach',              label: 'Reach',               w: '80px' },
  { key: 'impressions',        label: 'Impressions',         w: '100px' },
  { key: 'engagementRate',     label: 'Eng. Rate',           w: '80px' },
  { key: 'contentPieces',      label: 'Posts',               w: '60px' },
  { key: 'bookingsAttributed', label: 'Bookings',            w: '80px' },
  { key: 'paidAdSpend',        label: 'Ad Spend',            w: '80px' },
  { key: 'paidAdResults',      label: 'Ad Results',          w: null   },
]

export default function MetricsTracker({ clientId, metrics, onUpsert }) {
  const [showForm, setShowForm] = useState(false)
  const [editRow, setEditRow] = useState(null)

  const clientMetrics = metrics
    .filter(m => m.clientId === clientId)
    .sort((a, b) => a.month.localeCompare(b.month))

  const openAdd = () => { setEditRow(null); setShowForm(true) }
  const openEdit = (row) => { setEditRow(row); setShowForm(true) }
  const close = () => { setShowForm(false); setEditRow(null) }

  return (
    <div>
      {/* Chart */}
      <div style={{ borderBottom: '1px solid var(--border)' }}>
        <LineChart metrics={clientMetrics} />
      </div>

      {/* Table header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--dark)', margin: 0 }}>Monthly Metrics</h3>
        <button
          type="button"
          onClick={openAdd}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', padding: '7px 14px', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Outfit', sans-serif" }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Month
        </button>
      </div>

      {clientMetrics.length === 0 ? (
        <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--mid-grey)', fontSize: '13px' }}>
          No metrics recorded yet. Add your first month to start tracking growth.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#FAFAFA', borderBottom: '1px solid var(--border)' }}>
                {COL_HEADERS.map(col => (
                  <th key={col.key} style={{ padding: '9px 14px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: 'var(--mid-grey)', letterSpacing: '0.07em', textTransform: 'uppercase', whiteSpace: 'nowrap', width: col.w || 'auto' }}>
                    {col.label}
                  </th>
                ))}
                <th style={{ padding: '9px 14px', width: '50px' }} />
              </tr>
            </thead>
            <tbody>
              {clientMetrics.map((row, i) => {
                const isLatest = i === clientMetrics.length - 1
                const prev = clientMetrics[i - 1]
                const followerDelta = prev ? row.followerCount - prev.followerCount : null
                const engDelta = prev ? (row.engagementRate - prev.engagementRate).toFixed(1) : null
                return (
                  <tr
                    key={row.id}
                    style={{ borderBottom: '1px solid var(--border)', background: isLatest ? 'rgba(196,135,74,0.03)' : '#fff', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
                    onMouseLeave={e => e.currentTarget.style.background = isLatest ? 'rgba(196,135,74,0.03)' : '#fff'}
                    onClick={() => openEdit(row)}
                  >
                    <td style={{ padding: '11px 14px', fontWeight: 600, color: 'var(--dark)', whiteSpace: 'nowrap' }}>
                      {fmtMonth(row.month)}
                      {isLatest && <span style={{ marginLeft: '6px', fontSize: '10px', background: 'rgba(196,135,74,0.1)', color: 'var(--accent)', padding: '1px 6px', borderRadius: '10px', fontWeight: 600 }}>Latest</span>}
                    </td>
                    <td style={{ padding: '11px 14px', whiteSpace: 'nowrap' }}>
                      <span style={{ fontWeight: 600 }}>{num(row.followerCount)}</span>
                      {followerDelta !== null && followerDelta !== 0 && (
                        <span style={{ marginLeft: '5px', fontSize: '11px', color: followerDelta > 0 ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>
                          {followerDelta > 0 ? '+' : ''}{followerDelta.toLocaleString()}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '11px 14px', color: 'var(--dark)', whiteSpace: 'nowrap' }}>{num(row.reach)}</td>
                    <td style={{ padding: '11px 14px', color: 'var(--dark)', whiteSpace: 'nowrap' }}>{num(row.impressions)}</td>
                    <td style={{ padding: '11px 14px', whiteSpace: 'nowrap' }}>
                      <span style={{ fontWeight: 600 }}>{row.engagementRate != null ? `${row.engagementRate}%` : '—'}</span>
                      {engDelta !== null && parseFloat(engDelta) !== 0 && (
                        <span style={{ marginLeft: '5px', fontSize: '11px', color: parseFloat(engDelta) > 0 ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>
                          {parseFloat(engDelta) > 0 ? '+' : ''}{engDelta}%
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '11px 14px', color: 'var(--dark)', whiteSpace: 'nowrap' }}>{num(row.contentPieces)}</td>
                    <td style={{ padding: '11px 14px', color: 'var(--dark)', whiteSpace: 'nowrap' }}>{num(row.bookingsAttributed)}</td>
                    <td style={{ padding: '11px 14px', color: 'var(--dark)', whiteSpace: 'nowrap' }}>
                      {row.paidAdSpend ? `$${row.paidAdSpend.toLocaleString()}` : '—'}
                    </td>
                    <td style={{ padding: '11px 14px', color: 'var(--mid-grey)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {row.paidAdResults || '—'}
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); openEdit(row) }}
                        style={{ background: 'none', border: 'none', color: 'var(--mid-grey)', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
                        title="Edit"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)', zIndex: 199 }} onClick={close} />
          <MetricsForm
            initial={editRow ? { ...editRow, followerCount: editRow.followerCount ?? '', reach: editRow.reach ?? '', impressions: editRow.impressions ?? '', engagementRate: editRow.engagementRate ?? '', contentPieces: editRow.contentPieces ?? '', bookingsAttributed: editRow.bookingsAttributed ?? '', paidAdSpend: editRow.paidAdSpend ?? '', paidAdResults: editRow.paidAdResults ?? '' } : null}
            clientId={clientId}
            onSave={onUpsert}
            onClose={close}
          />
        </>
      )}
    </div>
  )
}
