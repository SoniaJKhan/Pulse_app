import React, { useState } from 'react'
import { BG, CARD, PU, PL, MI, BD, TX, AIBlock, SPill, callClaude, offsetDate, DAY_NAMES } from './socialUtils.jsx'

export default function ReportTab({ analysis, upd, clientId, addContent, pushToast, onGoToCalendar }) {
  const [loadingMap, setLoadingMap] = useState({})
  const [hasKey, setHasKey]         = useState(() => !!localStorage.getItem('pulse_anthropic_key'))
  const [planSent, setPlanSent]     = useState(false)

  const run = async (key, prompt, maxTokens = 1200) => {
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

  const ctx     = JSON.stringify({ strategy: analysis.strategyResult, formatRules: analysis.formatRules, executionRules: analysis.executionRules, weeklyObjective: analysis.weeklyObjective })
  const pillarP = `Generate 4–6 content pillars for this client. Each must be tied to their brand, audience, and goals.\n\nReturn valid JSON array only:\n[{"name":"pillar name","description":"what this covers","whyItWorks":"why this works for THIS client","examples":["example 1","example 2"]}]\n\nData: ${ctx}`
  const ideasP  = `Generate 15 content ideas based strictly on the pillars, brand, and audience. Short and actionable.\n\nReturn valid JSON array only:\n[{"pillar":"pillar name","idea":"short actionable idea","contentType":"Reel or Carousel or Static or Story"}]\n\nData: ${JSON.stringify({ ...JSON.parse(ctx), pillars: analysis.pillars })}`
  const planP   = `Generate a 7-day content plan based strictly on the client's strategy and pillars.\n\nReturn valid JSON array of exactly 7 items:\n[{"day":1,"contentType":"Reel","hookIdea":"short hook","description":"brief description"}]\n\nData: ${JSON.stringify({ ...JSON.parse(ctx), pillars: analysis.pillars, ideas: analysis.ideas })}`

  const sendToCalendar = () => {
    if (!analysis.weeklyPlan?.length) return
    analysis.weeklyPlan.forEach((item, i) => {
      addContent({ clientId, title: (item.hookIdea || `Day ${item.day || i + 1}`).slice(0, 80), caption: item.hookIdea || '', platforms: ['Instagram'], contentType: item.contentType || 'Post', status: 'Draft', scheduledDate: offsetDate(i + 1), notes: item.description || '', createdAt: new Date().toISOString() })
    })
    setPlanSent(true)
    pushToast('7 days added to your calendar!')
    setTimeout(() => onGoToCalendar(), 800)
  }

  return (
    <div>
      <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700, color: TX, fontFamily: "'Outfit',sans-serif" }}>Output</h3>
      <p style={{ margin: '0 0 22px', fontSize: 13, color: MI, fontFamily: "'Outfit',sans-serif" }}>Turn your strategy into content pillars, ideas, and a 7-day plan.</p>
      {!hasKey && <div style={{ padding: '11px 14px', background: `${PU}12`, borderRadius: 10, color: PL, fontSize: 13, fontFamily: "'Outfit',sans-serif", marginBottom: 16 }}>Add your Anthropic API key in Settings to generate output.</div>}
      <AIBlock title="Generate Content Pillars" desc="4–6 content pillars tied to your client's brand, audience, and goals." onRun={() => run('pillars', pillarP)} loading={!!loadingMap.pillars} output={analysis.pillars?.length ? analysis.pillars : null} hasKey={hasKey} />
      {analysis.pillars?.length > 0 && <AIBlock title="Generate Ideas Bank" desc="15 short, actionable content ideas mapped to your pillars." onRun={() => run('ideas', ideasP)} loading={!!loadingMap.ideas} output={analysis.ideas?.length ? analysis.ideas : null} hasKey={hasKey} />}
      {analysis.ideas?.length > 0 && (
        <>
          <AIBlock title="Generate 7-Day Plan" desc="A 7-day action plan — each day has a content type, hook idea, and short description." onRun={() => run('weeklyPlan', planP)} loading={!!loadingMap.weeklyPlan} output={null} hasKey={hasKey} />
          {analysis.weeklyPlan?.length > 0 && (
            <div style={{ background: CARD, borderRadius: 12, border: `1px solid ${BD}`, padding: '18px 20px', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: TX, fontFamily: "'Outfit',sans-serif" }}>7-Day Plan</h4>
                {planSent
                  ? <span style={{ padding: '7px 14px', borderRadius: 9, background: 'rgba(74,124,92,0.15)', color: '#5DA875', fontSize: 13, fontWeight: 700, fontFamily: "'Outfit',sans-serif" }}>Sent to Calendar</span>
                  : <button onClick={sendToCalendar} style={{ padding: '8px 18px', borderRadius: 9, border: 'none', background: PU, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}>Send to Calendar →</button>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 10 }}>
                {analysis.weeklyPlan.map((item, i) => (
                  <div key={i} style={{ background: BG, borderRadius: 10, padding: '12px 12px', border: `1px solid ${BD}` }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: PL, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6, fontFamily: "'Outfit',sans-serif" }}>Day {item.day || i + 1}</div>
                    <SPill s={item.contentType || 'Post'} sm />
                    <div style={{ fontSize: 12, fontWeight: 600, color: TX, marginTop: 8, lineHeight: 1.4, fontFamily: "'Outfit',sans-serif" }}>{item.hookIdea}</div>
                    {item.description && <p style={{ margin: '6px 0 0', fontSize: 10.5, color: MI, lineHeight: 1.45, fontFamily: "'Outfit',sans-serif" }}>{item.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
