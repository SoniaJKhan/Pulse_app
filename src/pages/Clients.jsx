import React, { useState, useMemo } from 'react'
import { useClients, generateChecklist } from '../hooks/useClients'
import AddClientDrawer from '../components/AddClientDrawer'
import ClientProfile from './ClientProfile'

const PLAT_COL = { Instagram: '#E1306C', TikTok: '#69C9D0', YouTube: '#FF0000', LinkedIn: '#0A66C2', Facebook: '#1877F2' }

function completionScore(clientId) {
  let score = 0
  try {
    const bk = JSON.parse(localStorage.getItem(`pulse_brand_kit_${clientId}`) || '{}')
    if (bk.colors?.length || bk.voice || bk.topics?.length) score++
  } catch {}
  try {
    const an = JSON.parse(localStorage.getItem(`pulse_analysis_${clientId}`) || '{}')
    if (an.contentAudit?.length) score++
    if (an.competitors?.length) score++
    if (an.contentResult) score++
    if (an.strategyResult) score++
  } catch {}
  return score
}

const STATUS_OPTIONS  = ['All', 'Active', 'Onboarding', 'Paused', 'Churned']
const PACKAGE_OPTIONS = ['All', 'Starter', 'Growth', 'Full Service', 'Custom']

const STATUS_STYLE = {
  Active:     { bg: 'rgba(74,124,92,0.12)',   color: '#4A7C5C',  dot: '#4A7C5C' },
  Onboarding: { bg: 'rgba(196,135,74,0.12)', color: '#C4874A',  dot: '#C4874A' },
  Paused:     { bg: 'rgba(138,132,128,0.12)', color: '#8A8480', dot: '#8A8480' },
  Churned:    { bg: 'rgba(196,80,58,0.1)',   color: '#C4503A',  dot: '#C4503A' },
}

const BIZ_EMOJI = {
  'Yoga Studio': '🧘', 'Wellness Clinic': '🌿', 'Personal Training Studio': '💪',
  'Spa': '💆', 'Gym': '🏋️', 'Nutrition': '🥗', 'Pilates Studio': '🧘', 'Other': '✨',
}
const BIZ_GRADIENT = {
  'Yoga Studio':               'linear-gradient(135deg, #C4874A 0%, #9A6030 100%)',
  'Wellness Clinic':           'linear-gradient(135deg, #4A7C5C 0%, #2D5A3D 100%)',
  'Personal Training Studio':  'linear-gradient(135deg, #C4503A 0%, #8A3020 100%)',
  'Spa':                       'linear-gradient(135deg, #C4874A 0%, #7A5230 100%)',
  'Gym':                       'linear-gradient(135deg, #3A3430 0%, #1A1410 100%)',
  'Nutrition':                 'linear-gradient(135deg, #4A8C8C 0%, #2A6060 100%)',
  'Other':                     'linear-gradient(135deg, #8A7A6A 0%, #5A4A3A 100%)',
}

const PACKAGE_SERVICES = {
  'Starter':      ['Social Media'],
  'Growth':       ['Social Media', 'Operations'],
  'Full Service': ['Social Media', 'Operations', 'Research', 'Website'],
  'Custom':       ['Social Media', 'Operations', 'Research', 'VA Support', 'Website'],
}
const SERVICE_STYLE = {
  'Social Media': { bg: 'rgba(196,135,74,0.15)', color: '#C4874A', label: 'Social' },
  'Operations':   { bg: 'rgba(74,124,92,0.15)',  color: '#4A7C5C', label: 'Ops' },
  'Research':     { bg: 'rgba(74,140,140,0.15)', color: '#4A8C8C', label: 'Research' },
  'VA Support':   { bg: 'rgba(138,122,106,0.15)',color: '#8A7A6A', label: 'VA' },
  'Website':      { bg: 'rgba(58,52,48,0.15)',   color: '#3A3430', label: 'Website' },
}

function healthDotColor(score) {
  if (score >= 7) return '#4A7C5C'
  if (score >= 4) return '#C4874A'
  return '#C4503A'
}

function ClientCard({ client, onClick }) {
  const st       = STATUS_STYLE[client.status] || STATUS_STYLE.Active
  const services = PACKAGE_SERVICES[client.package] || []
  const emoji    = BIZ_EMOJI[client.businessType] || '✨'
  const gradient = BIZ_GRADIENT[client.businessType] || 'linear-gradient(135deg, #C4874A 0%, #8A5A2A 100%)'
  const name     = client.name || client.businessName || 'Client'
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const score    = completionScore(client.id)
  const scoreColor = score >= 4 ? '#4A7C5C' : score >= 2 ? '#C4874A' : '#C4503A'
  const [hovered, setHovered] = useState(false)

  return (
    <div
      style={{
        ...c.card,
        boxShadow: hovered ? '0 4px 24px rgba(26,26,26,0.12)' : 'var(--shadow-card)',
        borderColor: hovered ? 'rgba(196,135,74,0.4)' : 'var(--border)',
      }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Thumbnail */}
      <div style={{ ...c.thumb, background: client.profilePhoto ? '#f0f0f0' : gradient, position: 'relative' }}>
        {client.profilePhoto
          ? <img src={client.profilePhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} onError={e => { e.target.style.display = 'none' }} />
          : client.status
            ? <span style={c.emoji}>{emoji}</span>
            : <span style={{ fontSize: 28, fontWeight: 800, color: '#fff', fontFamily: "'Outfit',sans-serif" }}>{initials}</span>}
        <div style={{ position: 'absolute', bottom: 8, right: 8, fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 10, background: scoreColor, color: '#fff', fontFamily: "'Outfit',sans-serif" }}>
          {score}/5
        </div>
      </div>

      {/* Card body */}
      <div style={c.body}>
        <h3 style={c.bizName}>{name}</h3>
        {client.ownerName && <p style={c.ownerName}>{client.ownerName}</p>}
        <p style={c.bizType}>
          {client.businessType || '—'}
          {client.country && <span style={{ color: 'var(--mid-grey)', opacity: 0.7 }}> · {client.country}</span>}
        </p>

        {/* Platforms */}
        {client.platforms?.length > 0 && (
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 6 }}>
            {client.platforms.map(p => (
              <span key={p} style={{ width: 8, height: 8, borderRadius: '50%', background: PLAT_COL[p] || '#aaa', display: 'inline-block' }} title={p} />
            ))}
          </div>
        )}

        {/* Service tags */}
        {services.length > 0 && (
          <div style={c.tags}>
            {services.map(svc => {
              const ss = SERVICE_STYLE[svc]
              return (
                <span key={svc} style={{ ...c.tag, background: ss.bg, color: ss.color }}>
                  {ss.label}
                </span>
              )
            })}
          </div>
        )}

        {/* Footer */}
        <div style={c.footer}>
          {client.status ? (
            <div style={{ ...c.statusBadge, background: st.bg, color: st.color }}>
              <span style={{ ...c.statusDot, background: st.dot }} />
              {client.status}
            </div>
          ) : (
            <span style={{ fontSize: 11, color: 'var(--mid-grey)', fontFamily: "'Outfit',sans-serif" }}>
              {client.package || 'Social Media'}
            </span>
          )}
          <button
            onClick={e => { e.stopPropagation(); onClick() }}
            style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: "'Outfit',sans-serif" }}
          >
            Open Profile →
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Clients({ initialClientId, initialTab, onClearInitial }) {
  const { clients, saveClient, deleteClient } = useClients()
  const [selectedId, setSelectedId] = useState(initialClientId || null)

  const addCrmClient = (data) => {
    const id = `c-${Date.now().toString(36)}`
    const newClient = {
      id,
      name: data.businessName,
      businessName: data.businessName,
      ownerName: data.ownerName,
      email: data.email,
      phone: data.phone,
      country: data.country,
      businessType: data.businessType,
      bookingPlatform: data.bookingPlatform,
      package: data.package,
      status: 'Onboarding',
      healthScore: 5,
      monthlyMemberCount: parseInt(data.monthlyMemberCount) || 0,
      startDate: data.startDate,
      lastReportDate: null,
      nextReportDue: null,
      nextQuarterlyReview: null,
      notes: data.notes || '',
      checklist: generateChecklist(),
      createdAt: new Date().toISOString(),
    }
    saveClient(newClient)
    return id
  }

  const updateClient = (id, changes) => {
    const existing = clients.find(c => c.id === id)
    if (existing) saveClient({ ...existing, ...changes })
  }

  const toggleChecklistItem = (clientId, itemId) => {
    const existing = clients.find(c => c.id === clientId)
    if (!existing) return
    saveClient({
      ...existing,
      checklist: (existing.checklist || []).map(item => {
        if (item.id !== itemId) return item
        const completed = !item.completed
        return { ...item, completed, completedAt: completed ? new Date().toISOString().split('T')[0] : null }
      }),
    })
  }
  const [showDrawer, setShowDrawer] = useState(false)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [filterPackage, setFilterPackage] = useState('All')

  const selectedClient = clients.find(cl => cl.id === selectedId)

  const filtered = useMemo(() => {
    return clients.filter(cl => {
      if (filterStatus !== 'All' && cl.status !== filterStatus) return false
      if (filterPackage !== 'All' && cl.package !== filterPackage) return false
      if (search) {
        const q = search.toLowerCase()
        return (
          cl.businessName?.toLowerCase().includes(q) ||
          cl.ownerName?.toLowerCase().includes(q) ||
          cl.email?.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [clients, search, filterStatus, filterPackage])

  const countByStatus = useMemo(() => {
    const counts = { Active: 0, Onboarding: 0, Paused: 0, Churned: 0 }
    clients.forEach(cl => { if (counts[cl.status] !== undefined) counts[cl.status]++ })
    return counts
  }, [clients])

  if (selectedClient) {
    return (
      <ClientProfile
        client={selectedClient}
        initialTab={initialTab}
        onBack={() => { setSelectedId(null); if (onClearInitial) onClearInitial() }}
        onUpdate={changes => updateClient(selectedId, changes)}
        onToggleChecklist={itemId => toggleChecklistItem(selectedId, itemId)}
      />
    )
  }

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Clients</h1>
          <p style={s.subtitle}>Manage all agency clients, health scores, and onboarding progress.</p>
        </div>
        <button style={s.addBtn} onClick={() => setShowDrawer(true)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add New Client
        </button>
      </div>

      {/* Status pills */}
      <div style={s.statusRow}>
        {['Active', 'Onboarding', 'Paused', 'Churned'].map(status => {
          const st = STATUS_STYLE[status]
          const count = countByStatus[status]
          const isFilter = filterStatus === status
          return (
            <button
              key={status}
              style={{
                ...s.summaryPill,
                background: isFilter ? st.bg : 'var(--bg-card)',
                color: isFilter ? st.color : 'var(--mid-grey)',
                borderColor: isFilter ? st.color : 'var(--border)',
                fontWeight: isFilter ? 600 : 400,
              }}
              onClick={() => setFilterStatus(isFilter ? 'All' : status)}
            >
              <span style={{ ...s.pillDot, background: st.dot }} />
              {status} <span style={s.pillCount}>{count}</span>
            </button>
          )
        })}
      </div>

      {/* Search + filters */}
      <div style={s.controls}>
        <div style={s.searchWrap}>
          <svg style={s.searchIcon} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            style={s.searchInput}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search clients by name, owner or email…"
          />
          {search && (
            <button style={s.clearSearch} onClick={() => setSearch('')}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>
        <select style={s.filterSelect} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          {STATUS_OPTIONS.map(o => <option key={o}>{o === 'All' ? 'All Statuses' : o}</option>)}
        </select>
        <select style={s.filterSelect} value={filterPackage} onChange={e => setFilterPackage(e.target.value)}>
          {PACKAGE_OPTIONS.map(o => <option key={o}>{o === 'All' ? 'All Packages' : o}</option>)}
        </select>
      </div>

      {(search || filterStatus !== 'All' || filterPackage !== 'All') && (
        <p style={s.resultsCount}>
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          <button style={s.clearFilters} onClick={() => { setSearch(''); setFilterStatus('All'); setFilterPackage('All') }}>
            Clear filters
          </button>
        </p>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <div style={s.empty}>
          <span style={{ fontSize: '40px', marginBottom: '12px' }}>🌱</span>
          <p style={s.emptyTitle}>No clients found</p>
          <p style={s.emptySub}>Try adjusting your search or filters, or add a new client above.</p>
          <button style={s.emptyAction} onClick={() => setShowDrawer(true)}>Add New Client</button>
        </div>
      ) : (
        <div style={s.grid} data-layout="client-grid">
          {filtered.map(cl => (
            <ClientCard key={cl.id} client={cl} onClick={() => setSelectedId(cl.id)} />
          ))}
        </div>
      )}

      {showDrawer && (
        <AddClientDrawer
          onClose={() => setShowDrawer(false)}
          onAdd={data => { addCrmClient(data); setShowDrawer(false) }}
        />
      )}
    </div>
  )
}

const c = {
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
    display: 'flex',
    flexDirection: 'column',
  },
  thumb: {
    height: '110px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    flexShrink: 0,
  },
  emoji: {
    fontSize: '40px',
    filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.25))',
  },
  healthDot: {
    position: 'absolute',
    bottom: '10px',
    right: '10px',
    width: '13px',
    height: '13px',
    borderRadius: '50%',
    border: '2.5px solid rgba(255,255,255,0.9)',
    boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
  },
  body: {
    padding: '14px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1,
  },
  bizName: {
    fontSize: '14.5px',
    fontWeight: 700,
    color: 'var(--dark)',
    lineHeight: 1.25,
    fontFamily: "'Libre Baskerville', serif",
    marginBottom: '1px',
  },
  ownerName: {
    fontSize: '12.5px',
    color: 'var(--mid-grey)',
  },
  bizType: {
    fontSize: '12px',
    color: 'var(--mid-grey)',
  },
  tags: {
    display: 'flex',
    gap: '4px',
    flexWrap: 'wrap',
    marginTop: '6px',
  },
  tag: {
    fontSize: '10.5px',
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: '20px',
    letterSpacing: '0.03em',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '10px',
    paddingTop: '10px',
    borderTop: '1px solid var(--border)',
  },
  statusBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 600,
  },
  statusDot: {
    width: '5px',
    height: '5px',
    borderRadius: '50%',
  },
  memberCount: {
    fontSize: '11.5px',
    color: 'var(--mid-grey)',
    fontWeight: 500,
  },
}

const s = {
  page: { padding: '32px', maxWidth: '1400px' },
  header: {
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
    marginBottom: '24px', flexWrap: 'wrap', gap: '16px',
  },
  title: { fontSize: '28px', fontWeight: 700, color: 'var(--dark)', marginBottom: '5px' },
  subtitle: { fontSize: '14px', color: 'var(--mid-grey)' },
  addBtn: {
    display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 18px',
    background: 'var(--accent)', color: '#fff', border: 'none',
    borderRadius: 'var(--radius)', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer',
  },
  statusRow: { display: 'flex', gap: '8px', marginBottom: '18px', flexWrap: 'wrap' },
  summaryPill: {
    display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px',
    borderRadius: '20px', border: '1.5px solid', fontSize: '13px', cursor: 'pointer',
    transition: 'all var(--transition)', fontFamily: "'Outfit', sans-serif",
    boxShadow: 'var(--shadow-sm)',
  },
  pillDot: { width: '6px', height: '6px', borderRadius: '50%' },
  pillCount: { opacity: 0.7, fontSize: '12px' },
  controls: { display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' },
  searchWrap: { position: 'relative', flex: '1', minWidth: '220px' },
  searchIcon: { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--mid-grey)', pointerEvents: 'none' },
  searchInput: {
    width: '100%', padding: '9px 36px', border: '1.5px solid var(--border)',
    borderRadius: 'var(--radius)', fontSize: '13.5px', color: 'var(--dark)',
    background: 'var(--bg-card)', outline: 'none', fontFamily: "'Outfit', sans-serif",
  },
  clearSearch: {
    position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', color: 'var(--mid-grey)', cursor: 'pointer',
    display: 'flex', alignItems: 'center', padding: '2px',
  },
  filterSelect: {
    padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)',
    fontSize: '13.5px', color: 'var(--dark)', background: 'var(--bg-card)',
    outline: 'none', cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
  },
  resultsCount: {
    fontSize: '13px', color: 'var(--mid-grey)', marginBottom: '14px',
    display: 'flex', alignItems: 'center', gap: '10px',
  },
  clearFilters: {
    background: 'none', border: 'none', color: 'var(--accent)', fontSize: '13px',
    fontWeight: 500, cursor: 'pointer', padding: 0, fontFamily: "'Outfit', sans-serif",
  },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' },
  empty: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', padding: '80px 20px', background: 'var(--bg-card)',
    borderRadius: 'var(--radius)', border: '1px solid var(--border)',
    textAlign: 'center', gap: '6px', boxShadow: 'var(--shadow-card)',
  },
  emptyTitle: { fontSize: '17px', fontWeight: 700, color: 'var(--dark)', fontFamily: "'Libre Baskerville', serif" },
  emptySub: { fontSize: '13.5px', color: 'var(--mid-grey)', marginBottom: '8px' },
  emptyAction: {
    marginTop: '8px', padding: '10px 20px', background: 'var(--accent)', color: '#fff',
    border: 'none', borderRadius: 'var(--radius)', fontSize: '13.5px', fontWeight: 600,
    cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
  },
}
