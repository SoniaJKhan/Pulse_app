import React, { useState, useEffect } from 'react'
import { callClaude } from './socialUtils.jsx'

const BG   = '#F7F5FF'
const CARD = '#FFFFFF'
const OR   = '#F97316'
const PU   = '#7C3AED'
const TX   = '#1A1A1A'
const MI   = '#6B7280'
const BD   = '#E5E7EB'
const FF   = "'Outfit', sans-serif"

function loadAudit(clientId) {
  try { return JSON.parse(localStorage.getItem(`pulse_audit_${clientId}`) || '[]') } catch { return [] }
}
function loadCompetitors(clientId) {
  try { return JSON.parse(localStorage.getItem(`pulse_competitors_${clientId}`) || '[]') } catch { return [] }
}
function loadAnalysis(clientId) {
  try { return JSON.parse(localStorage.getItem(`pulse_analysis_${clientId}`) || 'null') } catch { return null }
}

function ResultCard({ title, value, accent }) {
  if (!value) return null
  const isArray = Array.isArray(value)
  return (
    <div style={{ background: CARD, borderRadius: 14, padding: '18px 20px', border: `1px solid ${BD}`, borderLeft: `4px solid ${accent || OR}`, boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: MI, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10, fontFamily: FF }}>{title}</div>
      {isArray
        ? <ul style={{ margin: 0, paddingLeft: 18 }}>{value.map((v, i) => <li key={i} style={{ fontSize: 14, color: TX, fontFamily: FF, marginBottom: 5, lineHeight: 1.5 }}>{v}</li>)}</ul>
        : <p style={{ margin: 0, fontSize: 14, color: TX, fontFamily: FF, lineHeight: 1.6 }}>{String(value)}</p>}
    </div>
  )
}

export default function AnalysisTab({ clientId, pushToast, onGoToStrategy, onGoToAudit, onGoToCompetitors }) {
  const [audit,       setAudit]       = useState([])
  const [competitors, setCompetitors] = useState([])
  const [result,      setResult]      = useState(null)
  const [loading,     setLoading]     = useState(false)
  const [hasKey,      setHasKey]      = useState(() => !!localStorage.getItem('pulse_anthropic_key'))

  useEffect(() => {
    setAudit(loadAudit(clientId))
    setCompetitors(loadCompetitors(clientId))
    setResult(loadAnalysis(clientId))
  }, [clientId])

  const filledPosts    = audit.filter(r => r.url?.trim() || r.hook?.trim() || r.views || r.likes)
  const auditReady     = filledPosts.length >= 5
  const competitorReady = Array.isArray(competitors) && competitors.length > 0

  const runAnalysis = async () => {
    setLoading(true)
    try {
      const prompt = `You are a social media strategist. Analyse the following content audit and competitor data for this client. Be specific and data-driven — no generic advice.

Return ONLY valid JSON in this exact shape:
{
  "topPatterns": ["pattern 1", "pattern 2", "pattern 3"],
  "weakPatterns": ["weak pattern 1", "weak pattern 2"],
  "priorityActions": ["action 1", "action 2", "action 3"],
  "testNext": ["test idea 1", "test idea 2"],
  "avoid": ["avoid 1", "avoid 2"],
  "weeklyFocus": "one clear sentence on what to focus on this week",
  "confidenceScore": "X/10 — brief reason"
}

Content Audit Data: ${JSON.stringify(filledPosts)}
Competitor Data: ${JSON.stringify(competitors)}`

      const res = await callClaude([{ role: 'user', content: prompt }], 1200)
      localStorage.setItem(`pulse_analysis_${clientId}`, JSON.stringify(res))
      setResult(res)
      pushToast?.('Analysis complete!')
    } catch (e) {
      if (e.message === 'NO_KEY') setHasKey(false)
      else pushToast?.(e.message.slice(0, 80), 'error')
    }
    setLoading(false)
  }

  return (
    <div style={{ fontFamily: FF }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 800, color: TX }}>Analysis</h2>
        <p style={{ margin: 0, fontSize: 14, color: MI }}>AI analysis of your content audit and competitor data.</p>
      </div>

      {!hasKey && (
        <div style={{ padding: '14px 18px', borderRadius: 12, background: `${PU}12`, border: `1px solid ${PU}30`, color: PU, fontSize: 13, fontWeight: 600, marginBottom: 20, fontFamily: FF }}>
          Add your Anthropic API key in Settings to run analysis.
        </div>
      )}

      {/* Readiness checks */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, background: CARD, border: `1px solid ${auditReady ? '#16A34A40' : `${OR}40`}` }}>
          <div style={{ width: 22, height: 22, borderRadius: '50%', background: auditReady ? '#16A34A' : OR, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {auditReady
              ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              : <span style={{ color: '#fff', fontSize: 13, fontWeight: 700, lineHeight: 1 }}>!</span>}
          </div>
          <span style={{ fontSize: 13, color: TX, fontWeight: 600 }}>
            Content Audit — {filledPosts.length} post{filledPosts.length !== 1 ? 's' : ''} added
            {!auditReady && <> · <span style={{ color: OR }}>Need 5+ posts</span>{onGoToAudit && <button onClick={onGoToAudit} style={{ marginLeft: 8, fontSize: 12, color: PU, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontFamily: FF }}>Go to Audit →</button>}</>}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, background: CARD, border: `1px solid ${competitorReady ? '#16A34A40' : `${OR}40`}` }}>
          <div style={{ width: 22, height: 22, borderRadius: '50%', background: competitorReady ? '#16A34A' : OR, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {competitorReady
              ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              : <span style={{ color: '#fff', fontSize: 13, fontWeight: 700, lineHeight: 1 }}>!</span>}
          </div>
          <span style={{ fontSize: 13, color: TX, fontWeight: 600 }}>
            Competitors — {competitorReady ? `${competitors.length} competitor${competitors.length !== 1 ? 's' : ''} added` : 'No competitors added'}
            {!competitorReady && onGoToCompetitors && <button onClick={onGoToCompetitors} style={{ marginLeft: 8, fontSize: 12, color: PU, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontFamily: FF }}>Go to Competitors →</button>}
          </span>
        </div>
      </div>

      {/* Run button */}
      {hasKey && (auditReady || competitorReady) && (
        <button
          onClick={runAnalysis}
          disabled={loading}
          style={{ padding: '12px 32px', borderRadius: 11, border: 'none', background: loading ? '#ccc' : OR, color: '#fff', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: FF, marginBottom: 28, display: 'flex', alignItems: 'center', gap: 10, boxShadow: loading ? 'none' : `0 4px 16px ${OR}40` }}
        >
          {loading && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>}
          {loading ? 'Analysing…' : result ? 'Re-run Analysis' : 'Run Analysis'}
        </button>
      )}

      {/* Results */}
      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 28 }}>
          <ResultCard title="Top Performing Patterns"      value={result.topPatterns}      accent="#16A34A" />
          <ResultCard title="Weak Patterns"                value={result.weakPatterns}      accent="#EF4444" />
          <ResultCard title="Priority Actions This Week"   value={result.priorityActions}   accent={OR} />
          <ResultCard title="What To Test Next"            value={result.testNext}          accent={PU} />
          <ResultCard title="What To Avoid"                value={result.avoid}             accent="#EF4444" />
          <div style={{ background: OR, borderRadius: 14, padding: '18px 20px', boxShadow: `0 4px 16px ${OR}40` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8, fontFamily: FF }}>Weekly Focus</div>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#fff', fontFamily: FF, lineHeight: 1.5 }}>{result.weeklyFocus}</p>
          </div>
          <div style={{ background: CARD, borderRadius: 14, padding: '14px 20px', border: `1px solid ${BD}`, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: MI, textTransform: 'uppercase', letterSpacing: '.06em', fontFamily: FF }}>Confidence Score</span>
            <span style={{ fontSize: 15, fontWeight: 800, color: TX, fontFamily: FF }}>{result.confidenceScore}</span>
          </div>

          {onGoToStrategy && (
            <button
              onClick={onGoToStrategy}
              style={{ alignSelf: 'flex-start', marginTop: 8, padding: '12px 28px', borderRadius: 11, border: 'none', background: OR, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: FF, boxShadow: `0 4px 16px ${OR}40` }}
            >
              Generate Strategy →
            </button>
          )}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
