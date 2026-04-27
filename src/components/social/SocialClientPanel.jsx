import React from 'react'
import { CARD, R, SH, BD, MI, PU, PL, OR, YL } from './socialUtils.jsx'

export default function SocialClientPanel({ statScheduled, statLive, statEngRate, statPending }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 22 }}>
      {[
        { label: 'Total Scheduled', value: statScheduled, color: PL, iconBg: `${PU}18`, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={PL} strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
        { label: 'Live This Month', value: statLive, color: OR, iconBg: 'rgba(245,114,42,0.1)', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={OR} strokeWidth="2" strokeLinecap="round"><polygon points="5 3 19 12 5 21 5 3"/></svg> },
        { label: 'Avg Engagement', value: statEngRate != null ? `${statEngRate}%` : '—', color: '#5DA875', iconBg: 'rgba(74,124,92,0.1)', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5DA875" strokeWidth="2" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
        { label: 'Pending Approval', value: statPending, color: YL, iconBg: 'rgba(200,154,26,0.12)', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={YL} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> },
      ].map(sc => (
        <div key={sc.label} style={{ background: CARD, borderRadius: R, padding: '16px 18px', boxShadow: SH, border: `1px solid ${BD}`, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: sc.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{sc.icon}</div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: MI, textTransform: 'uppercase', letterSpacing: '.05em', fontFamily: "'Outfit',sans-serif", marginBottom: 3 }}>{sc.label}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: sc.color, fontFamily: "'Outfit',sans-serif", lineHeight: 1 }}>{sc.value}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
