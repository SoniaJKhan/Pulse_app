import React from 'react'

const PAGE_META = {
  clients: {
    title: 'Clients',
    subtitle: 'Manage all your agency clients, onboarding checklists, and account health scores.',
    emoji: '👥',
    actionLabel: 'Add New Client',
  },
  operations: {
    title: 'Operations',
    subtitle: 'Task management, workflow tracking, team assignments, and capacity planning.',
    emoji: '⚙️',
    actionLabel: 'Create Task',
  },
  research: {
    title: 'Research',
    subtitle: 'Competitor analysis, market insights, keyword research, and trend monitoring.',
    emoji: '🔍',
    actionLabel: 'New Research Brief',
  },
  'va-support': {
    title: 'VA Support',
    subtitle: 'Virtual assistant task log, support requests, and communication history.',
    emoji: '🎧',
    actionLabel: 'Create Request',
  },
  websites: {
    title: 'Website Projects',
    subtitle: 'Project timelines, milestones, revision logs, and launch checklists.',
    emoji: '🌐',
    actionLabel: 'New Project',
  },
  reports: {
    title: 'Reports',
    subtitle: 'Monthly performance reports, custom analytics exports, and client presentations.',
    emoji: '📊',
    actionLabel: 'Generate Report',
  },
  alerts: {
    title: 'Alerts',
    subtitle: 'Manage and configure client alerts, thresholds, and notification preferences.',
    emoji: '🔔',
    actionLabel: 'Configure Alerts',
  },
  settings: {
    title: 'Settings',
    subtitle: 'Agency profile, user management, integrations, and platform preferences.',
    emoji: '⚙️',
    actionLabel: 'Save Changes',
  },
}

const UPCOMING = [
  { label: 'Task board with drag-and-drop', emoji: '🗂️' },
  { label: 'Document uploads and file library', emoji: '📁' },
  { label: 'Team assignments and workload view', emoji: '👤' },
  { label: 'Client-facing reporting hub', emoji: '📈' },
]

export default function PlaceholderPage({ page }) {
  const meta = PAGE_META[page] || {
    title: page, subtitle: 'This section is coming soon.', emoji: '🏗️', actionLabel: 'Get Started',
  }

  return (
    <div style={s.page}>
      {/* Page header */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>{meta.title}</h1>
          <p style={s.subtitle}>{meta.subtitle}</p>
        </div>
        <button style={s.actionBtn} disabled>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          {meta.actionLabel}
        </button>
      </div>

      {/* Empty state card */}
      <div style={s.card}>
        <div style={s.emojiWrap}>
          <span style={s.emoji}>{meta.emoji}</span>
        </div>
        <h2 style={s.cardTitle}>Coming in the next build</h2>
        <p style={s.cardDesc}>
          The structure, navigation, and data model for this section are in place. The UI and full functionality will be shipped in the next sprint.
        </p>

        <div style={s.statusRow}>
          <span style={{ ...s.pill, background: 'rgba(74,124,92,0.1)', color: '#4A7C5C' }}>
            ✓ Data model ready
          </span>
          <span style={{ ...s.pill, background: 'rgba(74,124,92,0.1)', color: '#4A7C5C' }}>
            ✓ Navigation wired
          </span>
          <span style={{ ...s.pill, background: 'rgba(196,135,74,0.1)', color: 'var(--accent)' }}>
            ↻ UI in progress
          </span>
        </div>
      </div>

      {/* Upcoming features */}
      <div style={s.upcomingSection}>
        <h3 style={s.upcomingTitle}>What's coming in this module</h3>
        <div style={s.upcomingGrid}>
          {UPCOMING.map((item, i) => (
            <div key={i} style={s.upcomingCard}>
              <span style={s.upcomingEmoji}>{item.emoji}</span>
              <span style={s.upcomingLabel}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const s = {
  page: { padding: '32px', maxWidth: '900px' },
  header: {
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
    marginBottom: '28px', gap: '16px', flexWrap: 'wrap',
  },
  title: { fontSize: '28px', fontWeight: 700, color: 'var(--dark)', marginBottom: '5px' },
  subtitle: { fontSize: '14px', color: 'var(--mid-grey)', maxWidth: '520px', lineHeight: 1.5 },
  actionBtn: {
    display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 18px',
    background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 'var(--radius)',
    fontSize: '13.5px', fontWeight: 600, cursor: 'not-allowed', opacity: 0.5,
  },
  card: {
    background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
    padding: '48px 40px', display: 'flex', flexDirection: 'column',
    alignItems: 'center', textAlign: 'center', gap: '16px',
    boxShadow: 'var(--shadow-card)',
  },
  emojiWrap: {
    width: '80px', height: '80px', borderRadius: '20px',
    background: 'rgba(196,135,74,0.1)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', marginBottom: '4px',
  },
  emoji: { fontSize: '36px' },
  cardTitle: { fontSize: '22px', fontWeight: 700, color: 'var(--dark)' },
  cardDesc: {
    fontSize: '14px', color: 'var(--mid-grey)', maxWidth: '420px', lineHeight: 1.65,
  },
  statusRow: { display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '4px' },
  pill: {
    fontSize: '12px', fontWeight: 600, padding: '5px 14px',
    borderRadius: '20px', letterSpacing: '0.02em',
  },
  upcomingSection: { marginTop: '28px' },
  upcomingTitle: {
    fontSize: '14px', fontWeight: 700, color: 'var(--mid-grey)', marginBottom: '14px',
    textTransform: 'uppercase', letterSpacing: '0.06em',
  },
  upcomingGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px',
  },
  upcomingCard: {
    background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
    padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '12px',
    boxShadow: 'var(--shadow-sm)',
  },
  upcomingEmoji: { fontSize: '24px', flexShrink: 0 },
  upcomingLabel: { fontSize: '13px', color: 'var(--mid-grey)', fontWeight: 500, lineHeight: 1.4 },
}
