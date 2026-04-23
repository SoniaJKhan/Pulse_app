import React, { useMemo } from 'react'
import { useClients } from '../hooks/useClients'
import { useSocialData } from '../hooks/useSocialData'
import { PLATFORM_COLORS, PLATFORM_ABBREV } from '../components/social/ContentCalendar'

const TODAY = '2026-04-17'
const CURRENT_MONTH_PREFIX = '2026-04'

function PlatformBar({ platforms }) {
  if (!platforms || platforms.length === 0) return null
  return (
    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
      {platforms.map(p => {
        const pc = PLATFORM_COLORS[p] || {}
        return (
          <span key={p} style={{ fontSize: '10.5px', fontWeight: 700, background: pc.bg, color: pc.color, padding: '1px 7px', borderRadius: '9px' }}>
            {PLATFORM_ABBREV[p] || p}
          </span>
        )
      })}
    </div>
  )
}

function CountCell({ count, bg, color }) {
  if (count === 0) return <span style={{ fontSize: '13px', color: 'var(--border)' }}>—</span>
  return (
    <span style={{ background: bg, color, padding: '2px 10px', borderRadius: '20px', fontSize: '12.5px', fontWeight: 700, display: 'inline-block' }}>
      {count}
    </span>
  )
}

function SummaryCard({ count, label, bg, color, icon }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '18px 20px', flex: 1, minWidth: '150px', boxShadow: 'var(--shadow-card)' }}>
      <div style={{ fontSize: '28px', fontWeight: 700, fontFamily: "'Libre Baskerville', serif", color: count > 0 ? color : 'var(--mid-grey)', lineHeight: 1, marginBottom: '5px' }}>{count}</div>
      <div style={{ fontSize: '12px', color: 'var(--mid-grey)', fontWeight: 500 }}>{label}</div>
    </div>
  )
}

export default function SocialMediaPage({ onGoToClientSocial }) {
  const { clients } = useClients()
  const { content } = useSocialData()

  const activeClients = useMemo(() => clients.filter(c => c.status !== 'Churned'), [clients])

  const clientSummaries = useMemo(() => {
    return activeClients.map(client => {
      const thisMonth = content.filter(
        item => item.clientId === client.id && item.scheduledDate?.startsWith(CURRENT_MONTH_PREFIX)
      )
      const live             = thisMonth.filter(i => i.status === 'Live').length
      const pendingApproval  = thisMonth.filter(i => i.status === 'Pending Approval').length
      const changesRequested = thisMonth.filter(i => i.clientApproval === 'Changes Requested').length
      const overdue          = thisMonth.filter(i => i.status === 'Scheduled' && i.scheduledDate < TODAY).length
      const platformSet      = new Set()
      thisMonth.forEach(i => i.platforms?.forEach(p => platformSet.add(p)))
      const platforms = Array.from(platformSet)
      return { client, live, pendingApproval, changesRequested, overdue, platforms, total: thisMonth.length }
    })
  }, [activeClients, content])

  const totals = useMemo(() => ({
    live:    clientSummaries.reduce((s, c) => s + c.live, 0),
    pending: clientSummaries.reduce((s, c) => s + c.pendingApproval, 0),
    changes: clientSummaries.reduce((s, c) => s + c.changesRequested, 0),
    overdue: clientSummaries.reduce((s, c) => s + c.overdue, 0),
  }), [clientSummaries])

  return (
    <div style={s.page}>
      {/* Page header */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Social Media</h1>
          <p style={s.subtitle}>April 2026 content overview across all active clients.</p>
        </div>
        <button style={s.actionBtn} onClick={() => onGoToClientSocial && activeClients[0] && onGoToClientSocial(activeClients[0].id)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Content
        </button>
      </div>

      {/* Summary bar */}
      <div style={s.summaryBar}>
        <SummaryCard count={totals.live}    label="Live This Month"      color="#4A7C5C" />
        <SummaryCard count={totals.pending} label="Pending Approval"     color="#C4874A" />
        <SummaryCard count={totals.changes} label="Changes Requested"    color="#C4503A" />
        <SummaryCard count={totals.overdue} label="Overdue"              color="#C4503A" />
      </div>

      {/* Table */}
      <div style={s.tableCard}>
        <div style={s.tableHead}>
          <div style={{ ...s.th, flex: 2 }}>Client</div>
          <div style={{ ...s.th, width: '120px', textAlign: 'center' }}>Platforms</div>
          <div style={{ ...s.th, width: '90px',  textAlign: 'center' }}>Live</div>
          <div style={{ ...s.th, width: '110px', textAlign: 'center' }}>Pending</div>
          <div style={{ ...s.th, width: '120px', textAlign: 'center' }}>Changes</div>
          <div style={{ ...s.th, width: '90px',  textAlign: 'center' }}>Overdue</div>
          <div style={{ ...s.th, width: '80px' }} />
        </div>

        {clientSummaries.length === 0 ? (
          <div style={s.empty}>
            <span style={{ fontSize: '36px', marginBottom: '10px' }}>📅</span>
            <p style={s.emptyTitle}>No content this month</p>
            <p style={s.emptySub}>Open a client and start adding content to the calendar.</p>
          </div>
        ) : (
          clientSummaries.map(({ client, live, pendingApproval, changesRequested, overdue, platforms, total }) => {
            const hasIssues = pendingApproval > 0 || changesRequested > 0 || overdue > 0
            return (
              <div
                key={client.id}
                style={{ ...s.row, borderLeft: hasIssues ? '3px solid var(--accent)' : '3px solid transparent' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-card)'}
              >
                <div style={{ flex: 2, display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(196,135,74,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent)' }}>
                      {client.businessName.charAt(0)}
                    </span>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--dark)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {client.businessName}
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--mid-grey)' }}>
                      {total} piece{total !== 1 ? 's' : ''} this month
                    </div>
                  </div>
                </div>

                <div style={{ width: '120px', display: 'flex', justifyContent: 'center' }}>
                  <PlatformBar platforms={platforms} />
                </div>

                <div style={{ width: '90px', textAlign: 'center' }}>
                  <CountCell count={live}             bg="rgba(74,124,92,0.1)"    color="#4A7C5C" />
                </div>
                <div style={{ width: '110px', textAlign: 'center' }}>
                  <CountCell count={pendingApproval}  bg="rgba(196,135,74,0.12)"  color="#C4874A" />
                </div>
                <div style={{ width: '120px', textAlign: 'center' }}>
                  <CountCell count={changesRequested} bg="rgba(196,80,58,0.1)"    color="#C4503A" />
                </div>
                <div style={{ width: '90px', textAlign: 'center' }}>
                  <CountCell count={overdue}          bg="rgba(196,80,58,0.1)"    color="#C4503A" />
                </div>

                <div style={{ width: '80px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => onGoToClientSocial(client.id)}
                    style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '8px', padding: '6px 14px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Outfit', sans-serif", whiteSpace: 'nowrap' }}
                  >
                    View
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

const s = {
  page: { padding: '28px 32px', maxWidth: '1200px' },
  header: {
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
    marginBottom: '24px', gap: '16px', flexWrap: 'wrap',
  },
  title: { fontSize: '28px', fontWeight: 700, color: 'var(--dark)', fontFamily: "'Libre Baskerville', serif", marginBottom: '5px' },
  subtitle: { fontSize: '13px', color: 'var(--mid-grey)' },
  actionBtn: {
    display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 18px',
    background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 'var(--radius)',
    fontSize: '13.5px', fontWeight: 600, cursor: 'pointer',
  },
  summaryBar: { display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' },
  tableCard: {
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: 'var(--shadow-card)',
  },
  tableHead: {
    display: 'flex', alignItems: 'center', padding: '12px 20px',
    background: 'var(--bg)', borderBottom: '1px solid var(--border)', gap: '8px',
  },
  th: { fontSize: '11px', fontWeight: 700, color: 'var(--mid-grey)', textTransform: 'uppercase', letterSpacing: '0.07em', flexShrink: 0 },
  row: {
    display: 'flex', alignItems: 'center', padding: '14px 20px',
    borderBottom: '1px solid var(--border)', gap: '8px',
    background: 'var(--bg-card)', cursor: 'default', transition: 'background 0.15s',
  },
  empty: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '60px 20px', textAlign: 'center',
  },
  emptyTitle: { fontSize: '16px', fontWeight: 700, color: 'var(--dark)', fontFamily: "'Libre Baskerville', serif", marginBottom: '6px' },
  emptySub: { fontSize: '13px', color: 'var(--mid-grey)' },
}
