import React, { useState } from 'react'
import { BG, CARD, PU, PL, MI, BD, TX, INP, AIBlock, callClaude } from './socialUtils.jsx'

export default function StrategyTab({ analysis, upd, pushToast }) {
  const [loadingMap, setLoadingMap] = useState({})
  const [hasKey, setHasKey]         = useState(() => !!localStorage.getItem('pulse_anthropic_key'))
  const OBJECTIVES = ['Engagement', 'Reach', 'DMs', 'Testing Reels', 'Lead Gen', 'Brand Awareness']

  const run = async (key, prompt, maxTokens = 900) => {
    if (!hasKey) return
    setLoadingMap(l => ({ ...l, [key]: true }))
    try {
      const res = await callClaude([{ role: 'user', content: prompt }], maxTokens)
      upd({ [key]: res })
      pushToast('Generated!')
    } catch (e) {
      if (e.message === 'NO_KEY') setHasKey(false)
      else pushToast(e.message.slice(0, 80), 'error')
    }
    setLoadingMap(l => ({ ...l, [key]: false }))
  }

  const ctx      = JSON.stringify({ contentPatterns: analysis.contentResult, competitorInsights: analysis.competitorResult, weeklyObjective: analysis.weeklyObjective })
  const mergeP   = `You are a social media strategist. Merge the content and competitor findings. Base everything strictly on the provided data.\n\nReturn valid JSON only:\n{"whatToDo":["action 1","action 2","action 3"],"whatToAvoid":["avoid 1","avoid 2"],"contentDirection":"recommended content direction"}\n\nData: ${ctx}`
  const formatP  = `Define format rules based on this client's brand and strategy data.\n\nReturn valid JSON only:\n{"formatType":"best content format","hookType":"best hook type","idealLength":"ideal length with reasoning","style":"visual style and why"}\n\nData: ${JSON.stringify({ strategy: analysis.strategyResult, weeklyObjective: analysis.weeklyObjective })}`
  const execP    = `Define execution rules for this client. No generic advice.\n\nReturn valid JSON only:\n{"postingFrequency":"recommended frequency with reasoning","contentMix":"content mix ratio","toneGuidance":"specific tone guidance","ctaStyle":"CTA style"}\n\nData: ${JSON.stringify({ strategy: analysis.strategyResult, formatRules: analysis.formatRules })}`

  return (
    <div>
      <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700, color: TX, fontFamily: "'Outfit',sans-serif" }}>Strategy</h3>
      <p style={{ margin: '0 0 22px', fontSize: 13, color: MI, fontFamily: "'Outfit',sans-serif" }}>Merge your analysis into a clear strategic direction.</p>
      {!hasKey && <div style={{ padding: '11px 14px', background: `${PU}12`, borderRadius: 10, color: PL, fontSize: 13, fontFamily: "'Outfit',sans-serif", marginBottom: 16 }}>Add your Anthropic API key in Settings to run strategy generation.</div>}
      <AIBlock title="Merge Insights" desc="What to do, what to avoid, and your content direction — merged from content and competitor findings." onRun={() => run('strategyResult', mergeP)} loading={!!loadingMap.strategyResult} output={analysis.strategyResult} hasKey={hasKey} />
      <div style={{ background: CARD, borderRadius: 12, border: `1px solid ${BD}`, padding: '18px 20px', marginBottom: 14 }}>
        <h4 style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 700, color: TX, fontFamily: "'Outfit',sans-serif" }}>Weekly Objective</h4>
        <p style={{ margin: '0 0 12px', fontSize: 12, color: MI, fontFamily: "'Outfit',sans-serif" }}>What are we focusing on this week?</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 10 }}>
          {OBJECTIVES.map(o => <button key={o} onClick={() => upd({ weeklyObjective: analysis.weeklyObjective === o ? '' : o })} style={{ padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'Outfit',sans-serif", border: `1.5px solid ${analysis.weeklyObjective === o ? PU : BD}`, background: analysis.weeklyObjective === o ? `${PU}18` : 'transparent', color: analysis.weeklyObjective === o ? PL : MI }}>{o}</button>)}
        </div>
        <input value={!OBJECTIVES.includes(analysis.weeklyObjective) ? analysis.weeklyObjective : ''} onChange={e => upd({ weeklyObjective: e.target.value })} placeholder="Or type a custom objective…" style={{ ...INP, width: 280 }} />
      </div>
      <AIBlock title="Generate Format Rules" desc="Best format type, hook type, ideal length, and visual style based on your brand and strategy." onRun={() => run('formatRules', formatP)} loading={!!loadingMap.formatRules} output={analysis.formatRules} hasKey={hasKey} />
      <AIBlock title="Generate Execution Rules" desc="Posting frequency, content mix, tone guidance, and CTA style derived from your client's data." onRun={() => run('executionRules', execP)} loading={!!loadingMap.executionRules} output={analysis.executionRules} hasKey={hasKey} />
    </div>
  )
}
