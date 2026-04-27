import React, { useState } from 'react'
import { PU, TX, MI, BD } from './socialUtils.jsx'
import AuditTab from './AuditTab'
import CompetitorsTab from './CompetitorsTab'
import StrategyTab from './StrategyTab'
import ReportTab from './ReportTab'

const ANALYSIS_TABS = [
  { id: 'audit',       label: 'Content Audit' },
  { id: 'competitors', label: 'Competitor Analysis' },
  { id: 'strategy',    label: 'Strategy' },
  { id: 'output',      label: 'Output' },
]

export default function AnalysisTab({ analysis, upd, clientId, client, content, addContent, pushToast, onGoToCalendar }) {
  const [subTab, setSubTab] = useState('audit')
  return (
    <div>
      <div style={{ display: 'flex', gap: 4, borderBottom: `1px solid ${BD}`, marginBottom: 28 }}>
        {ANALYSIS_TABS.map(t => (
          <button key={t.id} onClick={() => setSubTab(t.id)} style={{ padding: '9px 20px', borderRadius: '8px 8px 0 0', fontSize: 13, fontWeight: 600, border: 'none', background: 'transparent', color: subTab === t.id ? TX : MI, cursor: 'pointer', fontFamily: "'Outfit',sans-serif", borderBottom: subTab === t.id ? `2px solid ${PU}` : '2px solid transparent', marginBottom: -1 }}>
            {t.label}
          </button>
        ))}
      </div>
      {subTab === 'audit'       && <AuditTab analysis={analysis} upd={upd} client={client} pushToast={pushToast} />}
      {subTab === 'competitors' && <CompetitorsTab clientId={clientId} pushToast={pushToast} />}
      {subTab === 'strategy'    && <StrategyTab analysis={analysis} upd={upd} pushToast={pushToast} />}
      {subTab === 'output'      && <ReportTab analysis={analysis} upd={upd} clientId={clientId} addContent={addContent} pushToast={pushToast} onGoToCalendar={onGoToCalendar} />}
    </div>
  )
}
