import React, { useState, useMemo } from 'react'
import { useClients } from '../hooks/useClients'
import { useSocialData } from '../hooks/useSocialData'
import { useResearchData } from '../hooks/useResearchData'
import { useVATasks } from '../hooks/useVATasks'
import { useWebsiteData } from '../hooks/useWebsiteData'
import { useReportData } from '../hooks/useReportData'

const TODAY = '2026-04-18'
const AGENCY_NAME = 'Strat Insight Digital'

const MONTHS = ['January 2026', 'February 2026', 'March 2026', 'April 2026', 'December 2025', 'November 2025', 'October 2025']

function monthToKey(m) {
  const idx = ['January','February','March','April','May','June','July','August','September','October','November','December']
  const [name, year] = m.split(' ')
  const n = idx.indexOf(name) + 1
  return `${year}-${String(n).padStart(2,'0')}`
}

function addDays(dateStr, n) {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
}

const inp = {
  width: '100%', boxSizing: 'border-box', padding: '8px 10px',
  border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 13,
  fontFamily: "'Outfit', sans-serif", background: 'var(--bg)', color: 'var(--dark)', outline: 'none',
}
const ta = { ...inp, resize: 'vertical', minHeight: 100 }

function Label({ children }) {
  return <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--mid-grey)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: "'Outfit', sans-serif" }}>{children}</label>
}

function MiniTrendChart({ data, valueKey, color = '#4A8C8C', labelKey = 'month' }) {
  if (!data || data.length < 2) return null
  const vals = data.map(d => d[valueKey])
  const min = Math.min(...vals)
  const max = Math.max(...vals)
  const w = 240, h = 48, pad = 4
  const range = max - min || 1
  const points = vals.map((v, i) => {
    const x = pad + (i / (vals.length - 1)) * (w - pad * 2)
    const y = pad + ((max - v) / range) * (h - pad * 2)
    return `${x},${y}`
  })
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height: 40, display: 'block' }}>
      <polyline points={points.join(' ')} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"/>
    </svg>
  )
}

// ─── Data collector ────────────────────────────────────────────────────────────
function collectSnapshot(clientId, month, socialData, researchData, vaTasks, websiteData) {
  const mk = monthToKey(month)

  // Social
  const clientMetrics = socialData.metrics.filter(m => m.clientId === clientId)
  const monthMetric = clientMetrics.find(m => m.month === mk)
  const prevKey = mk.slice(0, 5) + String(Number(mk.slice(5)) - 1).padStart(2, '0')
  const prevMetric = clientMetrics.find(m => m.month === prevKey)

  const delta = (curr, prev, key) => {
    if (!curr || !prev || curr[key] == null || prev[key] == null) return null
    return curr[key] - prev[key]
  }

  const social = monthMetric ? {
    month,
    followerCount: monthMetric.followerCount,
    followerDelta: delta(monthMetric, prevMetric, 'followerCount'),
    reach: monthMetric.reach,
    reachDelta: delta(monthMetric, prevMetric, 'reach'),
    impressions: monthMetric.impressions,
    engagementRate: monthMetric.engagementRate,
    engagementDelta: delta(monthMetric, prevMetric, 'engagementRate'),
    contentPieces: monthMetric.contentPieces,
    bookingsAttributed: monthMetric.bookingsAttributed,
    paidAdSpend: monthMetric.paidAdSpend,
    paidAdResults: monthMetric.paidAdResults,
    trend: clientMetrics.slice(-5).map(m => ({ month: m.month.slice(5), followers: m.followerCount, engagement: m.engagementRate })),
  } : null

  // Research
  const rd = researchData.getClient(clientId)
  const latestNPS = [...rd.nps].sort((a, b) => a.quarter.localeCompare(b.quarter)).slice(-1)[0]
  const surveyAvg = rd.surveys.length ? (rd.surveys.reduce((s, sv) => s + sv.avgScore, 0) / rd.surveys.length).toFixed(1) : null
  const reviewAvg = rd.reviews.length ? (rd.reviews.reduce((s, r) => s + r.avgScore, 0) / rd.reviews.length).toFixed(1) : null
  const finding = rd.findings.find(f => f.month === month)
  const latestRT = [...rd.responseTime].sort((a, b) => a.month.localeCompare(b.month)).slice(-1)[0]
  const research = {
    npsScore: latestNPS?.score ?? null,
    npsQuarter: latestNPS?.quarter ?? null,
    surveyAvg,
    reviewAvg,
    findingsText: finding?.text || '',
    responseTimeLatest: latestRT?.avgHours ?? null,
    responseTimeMonth: latestRT?.month ?? null,
    responseTimeTrend: rd.responseTime.slice(-4),
    competitors: rd.competitors.slice(0, 3),
  }

  // VA
  const clientTasks = vaTasks.filter(t => t.clientId === clientId)
  const completed = clientTasks.filter(t => t.status === 'Done').length
  const total = clientTasks.length
  const pending = clientTasks.filter(t => t.status !== 'Done').length
  const va = { total, completed, pending, resolutionRate: total ? Math.round((completed / total) * 100) : null }

  // Website
  const wd = websiteData.getClient(clientId)
  const website = wd.project ? {
    name: wd.project.name,
    status: wd.project.status,
    currentPhase: wd.phases.find(p => p.status === 'In Progress')?.name || (wd.phases.every(p => p.status === 'Complete') ? 'Post-Launch' : null),
    completionPct: Math.round((wd.phases.filter(p => p.status === 'Complete').length / wd.phases.length) * 100),
    checklistDone: wd.checklist.filter(i => i.completed).length,
    checklistTotal: wd.checklist.length,
  } : null

  return { social, research, va, website }
}

// ─── Report preview ────────────────────────────────────────────────────────────
function ReportPreview({ report, clientName }) {
  const { snapshot, manual } = report

  const section = (title, children) => (
    <div style={{ marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid var(--border)' }}>
      <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700, fontFamily: "'Libre Baskerville', serif", color: 'var(--dark)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{title}</h3>
      {children}
    </div>
  )

  const metaLine = (label, value, color) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: 13, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: color || 'var(--dark)', fontFamily: "'Outfit', sans-serif" }}>{value ?? '—'}</span>
    </div>
  )

  const signed = v => v === null ? null : v > 0 ? `+${v}` : `${v}`
  const npsC = (s) => s >= 50 ? '#4A7C5C' : s >= 20 ? 'var(--accent)' : 'var(--red)'

  return (
    <div style={{ maxWidth: 740, margin: '0 auto' }}>
      {/* Report header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, paddingBottom: 20, borderBottom: '2px solid var(--accent)' }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', fontFamily: "'Outfit', sans-serif", letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>{AGENCY_NAME}</div>
          <h1 style={{ margin: '0 0 4px', fontSize: 22, fontFamily: "'Libre Baskerville', serif", color: 'var(--dark)' }}>{clientName}</h1>
          <div style={{ fontSize: 14, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}>{report.month} — Monthly Report</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}>Generated</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--dark)', fontFamily: "'Outfit', sans-serif" }}>{formatDate(report.createdAt.slice(0, 10))}</div>
        </div>
      </div>

      {/* Executive Summary */}
      {section('Executive Summary',
        <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--dark)', fontFamily: "'Outfit', sans-serif", whiteSpace: 'pre-wrap', margin: 0 }}>
          {manual.executiveSummary || <em style={{ color: 'var(--mid-grey)' }}>No summary written.</em>}
        </p>
      )}

      {/* Social Media */}
      {snapshot.social && section('Social Media Performance',
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 10, marginBottom: 16 }}>
            {[
              { label: 'Followers', value: snapshot.social.followerCount?.toLocaleString(), delta: signed(snapshot.social.followerDelta) },
              { label: 'Reach', value: snapshot.social.reach?.toLocaleString(), delta: signed(snapshot.social.reachDelta) },
              { label: 'Impressions', value: snapshot.social.impressions?.toLocaleString(), delta: null },
              { label: 'Engagement', value: `${snapshot.social.engagementRate}%`, delta: snapshot.social.engagementDelta !== null ? signed(Math.round(snapshot.social.engagementDelta * 10) / 10) + '%' : null },
              { label: 'Content Pieces', value: snapshot.social.contentPieces, delta: null },
            ].map(s => (
              <div key={s.label} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px' }}>
                <div style={{ fontSize: 11, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif", marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--dark)', fontFamily: "'Libre Baskerville', serif", lineHeight: 1 }}>{s.value}</div>
                {s.delta && <div style={{ fontSize: 11, color: s.delta.startsWith('+') ? '#4A7C5C' : 'var(--red)', fontFamily: "'Outfit', sans-serif", marginTop: 3 }}>{s.delta} MoM</div>}
              </div>
            ))}
          </div>
          {snapshot.social.paidAdSpend > 0 && (
            <div style={{ fontSize: 12, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}>
              Paid ads: <strong style={{ color: 'var(--dark)' }}>${snapshot.social.paidAdSpend}</strong> spend — {snapshot.social.paidAdResults || 'results pending'}
            </div>
          )}
        </div>
      )}

      {/* Research Insights */}
      {section('Research Insights',
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
            <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif", marginBottom: 6 }}>NPS Score</div>
              {snapshot.research.npsScore !== null
                ? <><div style={{ fontSize: 28, fontWeight: 800, color: npsC(snapshot.research.npsScore), fontFamily: "'Libre Baskerville', serif", lineHeight: 1 }}>{snapshot.research.npsScore}</div>
                  <div style={{ fontSize: 10, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif", marginTop: 4 }}>{snapshot.research.npsQuarter}</div></>
                : <div style={{ fontSize: 13, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}>No data</div>}
            </div>
            <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif", marginBottom: 6 }}>Survey Avg Score</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--accent)', fontFamily: "'Libre Baskerville', serif", lineHeight: 1 }}>{snapshot.research.surveyAvg ?? '—'}</div>
              {snapshot.research.surveyAvg && <div style={{ fontSize: 10, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif", marginTop: 4 }}>out of 10</div>}
            </div>
            <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif", marginBottom: 6 }}>Review Average</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 6 }}>
                {snapshot.research.reviewAvg ? (
                  <><svg width="14" height="14" viewBox="0 0 24 24" fill="#C4874A"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--accent)', fontFamily: "'Libre Baskerville', serif" }}>{snapshot.research.reviewAvg}</span></>
                ) : <span style={{ fontSize: 13, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}>No data</span>}
              </div>
              {snapshot.research.reviewAvg && <div style={{ fontSize: 10, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif", marginTop: 4 }}>combined avg</div>}
            </div>
          </div>
          {snapshot.research.findingsText && (
            <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--mid-grey)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: "'Outfit', sans-serif", marginBottom: 8 }}>Research Findings</div>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7, color: 'var(--dark)', fontFamily: "'Outfit', sans-serif" }}>{snapshot.research.findingsText}</p>
            </div>
          )}
        </div>
      )}

      {/* Response Time */}
      {snapshot.research.responseTimeLatest !== null && section('Response Time',
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 32, fontWeight: 800, fontFamily: "'Libre Baskerville', serif", color: snapshot.research.responseTimeLatest <= 2 ? '#4A7C5C' : snapshot.research.responseTimeLatest <= 4 ? 'var(--accent)' : 'var(--red)', lineHeight: 1 }}>
              {snapshot.research.responseTimeLatest}h
            </div>
            <div style={{ fontSize: 12, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif", marginTop: 4 }}>avg ({snapshot.research.responseTimeMonth})</div>
            <div style={{ fontSize: 11, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif", marginTop: 2 }}>Industry benchmark: 2hr</div>
          </div>
          {snapshot.research.responseTimeTrend.length >= 2 && (
            <div style={{ flex: 1 }}>
              <MiniTrendChart data={snapshot.research.responseTimeTrend} valueKey="avgHours" labelKey="month" color={snapshot.research.responseTimeLatest <= 2 ? '#4A7C5C' : 'var(--accent)'} />
            </div>
          )}
        </div>
      )}

      {/* VA Activity */}
      {section('VA Activity',
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {[
            { label: 'Total Tasks', value: snapshot.va.total },
            { label: 'Completed', value: snapshot.va.completed },
            { label: 'Resolution Rate', value: snapshot.va.resolutionRate !== null ? `${snapshot.va.resolutionRate}%` : '—' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif", marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--dark)', fontFamily: "'Libre Baskerville', serif", lineHeight: 1 }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Website Status */}
      {snapshot.website && section('Website Status',
        <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--dark)', fontFamily: "'Outfit', sans-serif" }}>{snapshot.website.name}</div>
              <div style={{ fontSize: 12, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif", marginTop: 2 }}>
                Status: <strong style={{ color: 'var(--dark)' }}>{snapshot.website.status}</strong>
                {snapshot.website.currentPhase && <span> · Current phase: <strong style={{ color: 'var(--dark)' }}>{snapshot.website.currentPhase}</strong></span>}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: snapshot.website.completionPct === 100 ? '#4A7C5C' : 'var(--accent)', fontFamily: "'Libre Baskerville', serif" }}>{snapshot.website.completionPct}%</div>
              <div style={{ fontSize: 10, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}>complete</div>
            </div>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: 'var(--border)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${snapshot.website.completionPct}%`, background: snapshot.website.completionPct === 100 ? '#4A7C5C' : 'var(--accent)', borderRadius: 3 }} />
          </div>
          {snapshot.website.checklistTotal > 0 && (
            <div style={{ fontSize: 12, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif", marginTop: 8 }}>
              Post-launch checklist: <strong style={{ color: 'var(--dark)' }}>{snapshot.website.checklistDone}/{snapshot.website.checklistTotal}</strong> items complete
            </div>
          )}
        </div>
      )}

      {/* Competitor Notes */}
      {snapshot.research.competitors.length > 0 && section('Competitor Notes',
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {snapshot.research.competitors.map((c, i) => (
            <div key={i} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--dark)', fontFamily: "'Outfit', sans-serif", marginBottom: 4 }}>{c.name}</div>
              {c.theyDoBetter && <div style={{ fontSize: 12, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}><strong style={{ color: 'var(--red)' }}>They do better:</strong> {c.theyDoBetter}</div>}
              {c.weDoBetter && <div style={{ fontSize: 12, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}><strong style={{ color: '#4A7C5C' }}>We do better:</strong> {c.weDoBetter}</div>}
              {c.monthlyNotes && <div style={{ fontSize: 12, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif", marginTop: 4 }}>This month: {c.monthlyNotes}</div>}
            </div>
          ))}
        </div>
      )}

      {/* Manual sections */}
      {[
        { key: 'wins', label: 'Wins This Month' },
        { key: 'areasToImprove', label: 'Areas to Improve' },
        { key: 'nextPriorities', label: 'Next Month Priorities' },
      ].map(s => manual[s.key] && section(s.label,
        <p key={s.key} style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--dark)', fontFamily: "'Outfit', sans-serif", whiteSpace: 'pre-wrap', margin: 0 }}>{manual[s.key]}</p>
      ))}
    </div>
  )
}

// ─── PDF export ────────────────────────────────────────────────────────────────
function exportPDF(report, clientName) {
  const npsC = s => s >= 50 ? '#2D7A50' : s >= 20 ? '#B87840' : '#C0402A'
  const sn = report.snapshot
  const mn = report.manual

  const row = (label, value) => `<tr><td style="padding:6px 0;color:#666;font-size:13px;border-bottom:1px solid #e8e4de;">${label}</td><td style="padding:6px 0;font-weight:700;color:#1A1A1A;font-size:13px;border-bottom:1px solid #e8e4de;text-align:right;">${value ?? '—'}</td></tr>`

  const secHdr = title => `<h3 style="margin:28px 0 12px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#8A8480;font-family:'Outfit',sans-serif;border-top:1px solid #e8e4de;padding-top:20px;">${title}</h3>`

  const socialSection = sn.social ? `
    ${secHdr('Social Media Performance')}
    <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-bottom:12px;">
      ${[
        ['Followers', sn.social.followerCount?.toLocaleString()],
        ['Reach', sn.social.reach?.toLocaleString()],
        ['Impressions', sn.social.impressions?.toLocaleString()],
        ['Engagement', `${sn.social.engagementRate}%`],
        ['Content', sn.social.contentPieces],
      ].map(([l, v]) => `<div style="background:#f5f0e8;border-radius:8px;padding:10px;text-align:center;">
        <div style="font-size:10px;color:#8A8480;font-family:'Outfit',sans-serif;">${l}</div>
        <div style="font-size:18px;font-weight:800;color:#1A1A1A;font-family:'Libre Baskerville',serif;">${v}</div>
      </div>`).join('')}
    </div>` : ''

  const researchSection = `
    ${secHdr('Research Insights')}
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px;">
      <div style="background:#f5f0e8;border-radius:8px;padding:12px;text-align:center;">
        <div style="font-size:10px;color:#8A8480;font-family:'Outfit',sans-serif;">NPS Score</div>
        <div style="font-size:26px;font-weight:800;color:${sn.research.npsScore !== null ? npsC(sn.research.npsScore) : '#8A8480'};font-family:'Libre Baskerville',serif;">${sn.research.npsScore ?? '—'}</div>
        <div style="font-size:10px;color:#8A8480;font-family:'Outfit',sans-serif;">${sn.research.npsQuarter ?? ''}</div>
      </div>
      <div style="background:#f5f0e8;border-radius:8px;padding:12px;text-align:center;">
        <div style="font-size:10px;color:#8A8480;font-family:'Outfit',sans-serif;">Survey Avg</div>
        <div style="font-size:26px;font-weight:800;color:#B87840;font-family:'Libre Baskerville',serif;">${sn.research.surveyAvg ?? '—'}<span style="font-size:12px;">/10</span></div>
      </div>
      <div style="background:#f5f0e8;border-radius:8px;padding:12px;text-align:center;">
        <div style="font-size:10px;color:#8A8480;font-family:'Outfit',sans-serif;">Review Avg</div>
        <div style="font-size:26px;font-weight:800;color:#B87840;font-family:'Libre Baskerville',serif;">★ ${sn.research.reviewAvg ?? '—'}</div>
      </div>
    </div>
    ${sn.research.findingsText ? `<p style="font-size:13px;line-height:1.7;color:#3A3632;font-family:'Outfit',sans-serif;margin:0;background:#f5f0e8;border-radius:8px;padding:14px;">${sn.research.findingsText}</p>` : ''}`

  const rtSection = sn.research.responseTimeLatest !== null ? `
    ${secHdr('Response Time')}
    <p style="font-size:13px;color:#3A3632;font-family:'Outfit',sans-serif;">Current average: <strong style="font-size:18px;color:${sn.research.responseTimeLatest <= 2 ? '#2D7A50' : sn.research.responseTimeLatest <= 4 ? '#B87840' : '#C0402A'}">${sn.research.responseTimeLatest}h</strong> (${sn.research.responseTimeMonth}) · Industry benchmark: 2hr</p>` : ''

  const vaSection = `
    ${secHdr('VA Activity')}
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">
      ${[['Total Tasks', sn.va.total], ['Completed', sn.va.completed], ['Resolution Rate', sn.va.resolutionRate !== null ? `${sn.va.resolutionRate}%` : '—']].map(([l, v]) =>
        `<div style="background:#f5f0e8;border-radius:8px;padding:12px;text-align:center;"><div style="font-size:10px;color:#8A8480;font-family:'Outfit',sans-serif;">${l}</div><div style="font-size:22px;font-weight:800;color:#1A1A1A;font-family:'Libre Baskerville',serif;">${v}</div></div>`
      ).join('')}
    </div>`

  const websiteSection = sn.website ? `
    ${secHdr('Website Status')}
    <div style="background:#f5f0e8;border-radius:8px;padding:14px;">
      <strong style="font-size:13px;font-family:'Outfit',sans-serif;">${sn.website.name}</strong>
      <span style="font-size:12px;color:#8A8480;font-family:'Outfit',sans-serif;margin-left:10px;">${sn.website.status}${sn.website.currentPhase ? ` · ${sn.website.currentPhase} phase` : ''} · ${sn.website.completionPct}% complete</span>
    </div>` : ''

  const compSection = sn.research.competitors.length ? `
    ${secHdr('Competitor Notes')}
    ${sn.research.competitors.map(c => `<div style="margin-bottom:10px;padding:12px;background:#f5f0e8;border-radius:8px;">
      <strong style="font-size:13px;font-family:'Outfit',sans-serif;">${c.name}</strong><br>
      ${c.theyDoBetter ? `<span style="font-size:12px;color:#8A8480;font-family:'Outfit',sans-serif;"><strong style="color:#C0402A">They do better:</strong> ${c.theyDoBetter}</span><br>` : ''}
      ${c.weDoBetter ? `<span style="font-size:12px;color:#8A8480;font-family:'Outfit',sans-serif;"><strong style="color:#2D7A50">We do better:</strong> ${c.weDoBetter}</span>` : ''}
    </div>`).join('')}` : ''

  const manualSection = (title, content) => content ? `${secHdr(title)}<p style="font-size:13px;line-height:1.7;color:#3A3632;font-family:'Outfit',sans-serif;white-space:pre-wrap;margin:0;">${content}</p>` : ''

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
    <title>${clientName} — ${report.month} Report</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&family=Outfit:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { background: #fff; color: #1A1A1A; padding: 48px; max-width: 800px; margin: 0 auto; font-family: 'Outfit', sans-serif; }
      @media print {
        body { padding: 0; }
        button { display: none !important; }
      }
    </style>
  </head><body>
    <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #C4874A;padding-bottom:20px;margin-bottom:28px;">
      <div>
        <div style="font-size:11px;font-weight:700;color:#C4874A;letter-spacing:.08em;text-transform:uppercase;margin-bottom:6px;font-family:'Outfit',sans-serif;">${AGENCY_NAME}</div>
        <h1 style="font-size:24px;font-family:'Libre Baskerville',serif;color:#1A1A1A;margin-bottom:4px;">${clientName}</h1>
        <div style="font-size:14px;color:#8A8480;font-family:'Outfit',sans-serif;">${report.month} — Monthly Performance Report</div>
      </div>
      <div style="text-align:right;font-size:12px;color:#8A8480;font-family:'Outfit',sans-serif;">Generated ${new Date(report.createdAt).toLocaleDateString('en-AU',{day:'numeric',month:'long',year:'numeric'})}</div>
    </div>

    ${manualSection('Executive Summary', mn.executiveSummary)}
    ${socialSection}
    ${researchSection}
    ${rtSection}
    ${vaSection}
    ${websiteSection}
    ${compSection}
    ${manualSection('Wins This Month', mn.wins)}
    ${manualSection('Areas to Improve', mn.areasToImprove)}
    ${manualSection('Next Month Priorities', mn.nextPriorities)}

    <div style="margin-top:48px;padding-top:16px;border-top:1px solid #e8e4de;font-size:11px;color:#8A8480;font-family:'Outfit',sans-serif;text-align:center;">
      ${AGENCY_NAME} · Confidential · ${report.month}
    </div>
    <script>window.onload = () => { setTimeout(() => window.print(), 400) }<\/script>
  </body></html>`

  const w = window.open('', '_blank')
  w.document.write(html)
  w.document.close()
}

// ─── Completeness checker ──────────────────────────────────────────────────────
function computeCompleteness(report) {
  const { snapshot, manual } = report
  const sections = [
    { label: 'Social Media Metrics', filled: !!snapshot.social },
    { label: 'Research Data (NPS / Surveys / Reviews)', filled: !!(snapshot.research.npsScore !== null || snapshot.research.surveyAvg !== null || snapshot.research.reviewAvg !== null) },
    { label: 'Research Findings', filled: !!(snapshot.research.findingsText) },
    { label: 'Executive Summary', filled: !!(manual.executiveSummary?.trim()) },
  ]
  const filled = sections.filter(s => s.filled).length
  const score = Math.round((filled / sections.length) * 100)
  const warnings = sections.filter(s => !s.filled).map(s => s.label)
  return { score, warnings }
}

// ─── Export Confirm Modal ──────────────────────────────────────────────────────
function ExportConfirmModal({ report, clientName, onConfirm, onCancel }) {
  const { score, warnings } = computeCompleteness(report)
  const scoreColor = score === 100 ? 'var(--green)' : score >= 75 ? 'var(--accent)' : score >= 50 ? 'var(--amber)' : 'var(--red)'
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '32px 36px', maxWidth: 460, width: '90%', boxShadow: 'var(--shadow-card)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: `${scoreColor}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 18, fontWeight: 800, color: scoreColor, fontFamily: "'DM Mono', monospace" }}>{score}%</span>
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--dark)', fontFamily: "'Libre Baskerville', serif" }}>Data Completeness</div>
            <div style={{ fontSize: 12, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif", marginTop: 2 }}>{warnings.length === 0 ? 'All sections populated — report is complete.' : `${warnings.length} section${warnings.length > 1 ? 's' : ''} missing data`}</div>
          </div>
        </div>

        {warnings.length > 0 && (
          <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px', marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--mid-grey)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10, fontFamily: "'Outfit', sans-serif" }}>Missing Sections</div>
            {warnings.map(w => (
              <div key={w} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid var(--border)', fontFamily: "'Outfit', sans-serif" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="2.5" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                <span style={{ fontSize: 13, color: 'var(--dark)' }}>{w}</span>
              </div>
            ))}
          </div>
        )}

        <p style={{ fontSize: 13, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif", lineHeight: 1.6, marginBottom: 20 }}>
          {warnings.length > 0
            ? 'Exporting with missing sections will produce an incomplete report. You can go back and fill them in, or proceed anyway.'
            : 'Your report is fully complete and ready to export.'}
        </p>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{ padding: '9px 18px', background: 'none', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 13, color: 'var(--mid-grey)', cursor: 'pointer', fontFamily: "'Outfit', sans-serif" }}>Go Back</button>
          <button onClick={onConfirm} style={{ padding: '9px 20px', background: 'var(--dark)', color: 'var(--bg)', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'Outfit', sans-serif", display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Confirm & Export
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Report Editor ─────────────────────────────────────────────────────────────
function ReportEditor({ client, month, existingReport, snapshot, onSave, onCancel }) {
  const emptyManual = { executiveSummary: '', wins: '', areasToImprove: '', nextPriorities: '' }
  const [manual, setManual] = useState(existingReport?.manual || emptyManual)
  const [preview, setPreview] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const m = (k, v) => setManual(p => ({ ...p, [k]: v }))

  const report = {
    id: existingReport?.id || `rpt-${Date.now()}`,
    clientId: client.id,
    month,
    createdAt: existingReport?.createdAt || new Date().toISOString(),
    snapshot,
    manual,
  }

  const FieldRow = ({ label, field, placeholder, rows = 4 }) => (
    <div style={{ marginBottom: 20 }}>
      <Label>{label}</Label>
      <textarea style={{ ...ta, minHeight: rows * 24 }} value={manual[field]} onChange={e => m(field, e.target.value)} placeholder={placeholder} />
    </div>
  )

  const { score } = computeCompleteness(report)
  const scoreColor = score === 100 ? 'var(--green)' : score >= 75 ? 'var(--accent)' : score >= 50 ? 'var(--amber)' : 'var(--red)'

  if (preview) return (
    <div>
      {showExportModal && (
        <ExportConfirmModal
          report={report}
          clientName={client.businessName}
          onConfirm={() => { setShowExportModal(false); exportPDF(report, client.businessName) }}
          onCancel={() => setShowExportModal(false)}
        />
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, gap: 10 }}>
        <button onClick={() => setPreview(false)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1.5px solid var(--border)', borderRadius: 8, padding: '8px 14px', fontSize: 13, cursor: 'pointer', fontFamily: "'Outfit', sans-serif", color: 'var(--mid-grey)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          Back to Editor
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: scoreColor }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: scoreColor, fontFamily: "'DM Mono', monospace" }}>{score}%</span>
            <span style={{ fontSize: 12, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}>complete</span>
          </div>
          <button onClick={() => setShowExportModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--dark)', color: 'var(--bg)', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Outfit', sans-serif" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export as PDF
          </button>
          <button onClick={() => onSave(report)} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Outfit', sans-serif" }}>Save Report</button>
        </div>
      </div>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '32px 40px' }}>
        <ReportPreview report={report} clientName={client.businessName} />
      </div>
    </div>
  )

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--mid-grey)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontFamily: "'Outfit', sans-serif" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          Back
        </button>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontFamily: "'Libre Baskerville', serif", color: 'var(--dark)' }}>{client.businessName} — {month}</h2>
          <div style={{ fontSize: 12, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif", marginTop: 2 }}>Report generator</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 24, alignItems: 'start' }}>
        {/* Left: manual fields */}
        <div>
          <h3 style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 700, color: 'var(--mid-grey)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: "'Outfit', sans-serif" }}>Manual Sections</h3>
          <FieldRow label="Executive Summary" field="executiveSummary" placeholder="Write a 2-3 sentence summary of the month…" rows={5} />
          <FieldRow label="Wins This Month" field="wins" placeholder="What went well? Highlight achievements…" rows={4} />
          <FieldRow label="Areas to Improve" field="areasToImprove" placeholder="What needs attention next month?" rows={4} />
          <FieldRow label="Next Month Priorities" field="nextPriorities" placeholder="3-5 priority actions for the coming month…" rows={4} />

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onCancel} style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1.5px solid var(--border)', background: 'none', cursor: 'pointer', fontSize: 13, fontFamily: "'Outfit', sans-serif", color: 'var(--mid-grey)' }}>Cancel</button>
            <button onClick={() => setPreview(true)} style={{ flex: 2, padding: '10px', borderRadius: 8, border: 'none', background: 'var(--accent)', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: "'Outfit', sans-serif" }}>Preview Report →</button>
          </div>
        </div>

        {/* Right: auto-data summary */}
        <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 14, padding: 20 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 700, color: 'var(--mid-grey)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: "'Outfit', sans-serif" }}>Auto-Populated Data</h3>

          {snapshot.social ? (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--dark)', fontFamily: "'Outfit', sans-serif", marginBottom: 6 }}>Social Media</div>
              <div style={{ fontSize: 12, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}>
                {snapshot.social.followerCount?.toLocaleString()} followers · {snapshot.social.engagementRate}% eng · {snapshot.social.reach?.toLocaleString()} reach
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: 16, fontSize: 12, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif", fontStyle: 'italic' }}>No social metrics for {month}</div>
          )}

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--dark)', fontFamily: "'Outfit', sans-serif", marginBottom: 6 }}>Research</div>
            <div style={{ fontSize: 12, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}>
              NPS: {snapshot.research.npsScore ?? '—'} · Survey avg: {snapshot.research.surveyAvg ?? '—'}/10 · Reviews: ★{snapshot.research.reviewAvg ?? '—'}
              {snapshot.research.responseTimeLatest !== null && <span> · Response time: {snapshot.research.responseTimeLatest}h</span>}
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--dark)', fontFamily: "'Outfit', sans-serif", marginBottom: 6 }}>VA Activity</div>
            <div style={{ fontSize: 12, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}>
              {snapshot.va.completed}/{snapshot.va.total} tasks completed · {snapshot.va.resolutionRate ?? '—'}% resolution rate
            </div>
          </div>

          {snapshot.website && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--dark)', fontFamily: "'Outfit', sans-serif", marginBottom: 6 }}>Website</div>
              <div style={{ fontSize: 12, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}>
                {snapshot.website.name} · {snapshot.website.status} · {snapshot.website.completionPct}% complete
              </div>
            </div>
          )}

          {snapshot.research.competitors.length > 0 && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--dark)', fontFamily: "'Outfit', sans-serif", marginBottom: 6 }}>Competitors ({snapshot.research.competitors.length})</div>
              {snapshot.research.competitors.map((c, i) => (
                <div key={i} style={{ fontSize: 12, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}>· {c.name}</div>
              ))}
            </div>
          )}

          {snapshot.research.findingsText && (
            <div style={{ marginTop: 16, padding: '12px', background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--mid-grey)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: "'Outfit', sans-serif", marginBottom: 6 }}>Research Findings Pulled</div>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif", lineHeight: 1.5 }}>{snapshot.research.findingsText.slice(0, 140)}…</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main ReportsPage ──────────────────────────────────────────────────────────
export default function ReportsPage() {
  const { clients } = useClients()
  const { metrics } = useSocialData()
  const researchData = useResearchData()
  const { tasks: vaTasks } = useVATasks()
  const websiteData = useWebsiteData()
  const { getReportsForClient, saveReport, deleteReport, getAllLatestReports } = useReportData()

  const [view, setView] = useState('overview') // 'overview' | 'generate' | 'history'
  const [selectedClientId, setSelectedClientId] = useState(null)
  const [selectedMonth, setSelectedMonth] = useState('April 2026')
  const [editingReport, setEditingReport] = useState(null)
  const [historyClientId, setHistoryClientId] = useState(null)
  const [viewingReport, setViewingReport] = useState(null)
  const [search, setSearch] = useState('')

  const activeClients = clients.filter(c => c.status !== 'Churned')
  const latestReports = getAllLatestReports()

  const getLastReport = (clientId) => latestReports.find(r => r.clientId === clientId)?.latest || null
  const getNextDue = (clientId) => {
    const last = getLastReport(clientId)
    return last ? addDays(last.createdAt.slice(0, 10), 30) : null
  }
  const isOverdue = (clientId) => {
    const next = getNextDue(clientId)
    return next ? next < TODAY : false
  }

  const filteredClients = activeClients.filter(c =>
    c.businessName.toLowerCase().includes(search.toLowerCase()) ||
    c.ownerName.toLowerCase().includes(search.toLowerCase())
  )

  const snapshot = useMemo(() => {
    if (!selectedClientId || !selectedMonth) return null
    return collectSnapshot(selectedClientId, selectedMonth, { metrics }, researchData, vaTasks, websiteData)
  }, [selectedClientId, selectedMonth, metrics, vaTasks])

  const selectedClient = clients.find(c => c.id === selectedClientId)

  if (viewingReport && selectedClient) return (
    <div style={{ padding: '28px 32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <button onClick={() => setViewingReport(null)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1.5px solid var(--border)', borderRadius: 8, padding: '8px 14px', fontSize: 13, cursor: 'pointer', fontFamily: "'Outfit', sans-serif", color: 'var(--mid-grey)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          Back
        </button>
        <button onClick={() => exportPDF(viewingReport, selectedClient.businessName)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--dark)', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Outfit', sans-serif" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export as PDF
        </button>
      </div>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '32px 40px' }}>
        <ReportPreview report={viewingReport} clientName={selectedClient.businessName} />
      </div>
    </div>
  )

  if (view === 'generate' && selectedClient && snapshot) return (
    <div style={{ padding: '28px 32px' }}>
      <ReportEditor
        client={selectedClient}
        month={selectedMonth}
        existingReport={editingReport}
        snapshot={snapshot}
        onSave={(report) => { saveReport(report.clientId, report); setView('overview'); setEditingReport(null) }}
        onCancel={() => { setView('overview'); setEditingReport(null) }}
      />
    </div>
  )

  if (view === 'history' && historyClientId) {
    const hClient = clients.find(c => c.id === historyClientId)
    const hReports = getReportsForClient(historyClientId)
    return (
      <div style={{ padding: '28px 32px', maxWidth: 900 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <button onClick={() => setView('overview')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--mid-grey)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontFamily: "'Outfit', sans-serif" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
            Reports
          </button>
          <span style={{ color: 'var(--mid-grey)' }}>›</span>
          <h2 style={{ margin: 0, fontSize: 18, fontFamily: "'Libre Baskerville', serif", color: 'var(--dark)' }}>{hClient?.businessName} — History</h2>
        </div>

        {hReports.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--mid-grey)', fontSize: 13, fontFamily: "'Outfit', sans-serif" }}>No saved reports yet.</div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {hReports.map(r => (
            <div key={r.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--dark)', fontFamily: "'Outfit', sans-serif" }}>{r.month}</div>
                <div style={{ fontSize: 11, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif", marginTop: 2 }}>Generated {formatDate(r.createdAt.slice(0, 10))}</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => { setSelectedClientId(historyClientId); setViewingReport(r) }} style={{ padding: '7px 14px', borderRadius: 8, border: '1.5px solid var(--border)', background: 'none', cursor: 'pointer', fontSize: 12, fontFamily: "'Outfit', sans-serif", color: 'var(--mid-grey)' }}>View</button>
                <button onClick={() => { setSelectedClientId(historyClientId); setSelectedMonth(r.month); setEditingReport(r); setView('generate') }} style={{ padding: '7px 14px', borderRadius: 8, border: '1.5px solid var(--border)', background: 'none', cursor: 'pointer', fontSize: 12, fontFamily: "'Outfit', sans-serif", color: 'var(--mid-grey)' }}>Edit</button>
                <button onClick={() => exportPDF(r, hClient?.businessName)} style={{ padding: '7px 14px', borderRadius: 8, border: 'none', background: 'var(--dark)', color: '#fff', cursor: 'pointer', fontSize: 12, fontFamily: "'Outfit', sans-serif" }}>PDF</button>
                <button onClick={() => deleteReport(historyClientId, r.id)} style={{ padding: '7px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'none', cursor: 'pointer', color: 'var(--red)' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Overview
  return (
    <div style={{ padding: '28px 32px', maxWidth: 1200 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, fontFamily: "'Libre Baskerville', serif", color: 'var(--dark)' }}>Reports</h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}>Generate and manage monthly client reports</p>
        </div>

        {/* Generator inline */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 16px', flexWrap: 'wrap' }}>
          <select value={selectedClientId || ''} onChange={e => setSelectedClientId(e.target.value || null)}
            style={{ ...inp, width: 'auto', minWidth: 180, padding: '7px 10px', fontSize: 12 }}>
            <option value="">Select client…</option>
            {activeClients.map(c => <option key={c.id} value={c.id}>{c.businessName}</option>)}
          </select>
          <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}
            style={{ ...inp, width: 'auto', minWidth: 140, padding: '7px 10px', fontSize: 12 }}>
            {MONTHS.map(m => <option key={m}>{m}</option>)}
          </select>
          <button
            disabled={!selectedClientId}
            onClick={() => { setEditingReport(null); setView('generate') }}
            style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: selectedClientId ? 'var(--accent)' : 'var(--border)', color: selectedClientId ? '#fff' : 'var(--mid-grey)', cursor: selectedClientId ? 'pointer' : 'default', fontSize: 13, fontWeight: 600, fontFamily: "'Outfit', sans-serif", whiteSpace: 'nowrap' }}>
            Generate Report
          </button>
        </div>
      </div>

      {/* Overdue count */}
      {activeClients.some(c => isOverdue(c.id)) && (
        <div style={{ background: 'rgba(196,135,74,0.08)', border: '1.5px solid rgba(196,135,74,0.3)', borderRadius: 10, padding: '10px 16px', marginBottom: 20, fontSize: 13, fontFamily: "'Outfit', sans-serif", color: 'var(--accent)' }}>
          <strong>{activeClients.filter(c => isOverdue(c.id)).length}</strong> client{activeClients.filter(c => isOverdue(c.id)).length !== 1 ? 's' : ''} with overdue reports — reports are due monthly.
        </div>
      )}

      {/* Search */}
      <div style={{ marginBottom: 16 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search clients…"
          style={{ padding: '9px 14px', border: '1.5px solid var(--border)', borderRadius: 10, fontSize: 13, fontFamily: "'Outfit', sans-serif", background: 'var(--bg-card)', color: 'var(--dark)', outline: 'none', width: 280, boxSizing: 'border-box' }} />
      </div>

      {/* Table */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: 0, borderBottom: '1px solid var(--border)', background: 'var(--bg)', padding: '10px 20px' }}>
          {['Client', 'Last Report', 'Next Due', 'Status', 'Actions'].map(h => (
            <span key={h} style={{ fontSize: 11, fontWeight: 700, color: 'var(--mid-grey)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: "'Outfit', sans-serif" }}>{h}</span>
          ))}
        </div>

        {filteredClients.map((client, i) => {
          const last = getLastReport(client.id)
          const nextDue = getNextDue(client.id)
          const od = isOverdue(client.id)
          const isLast = i === filteredClients.length - 1
          const histCount = getReportsForClient(client.id).length

          return (
            <div key={client.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: 0, padding: '14px 20px', borderBottom: isLast ? 'none' : '1px solid var(--border)', alignItems: 'center', background: od ? 'rgba(196,135,74,0.03)' : 'transparent' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--dark)', fontFamily: "'Outfit', sans-serif" }}>{client.businessName}</div>
                <div style={{ fontSize: 11, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}>{client.ownerName}</div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}>
                {last ? formatDate(last.createdAt.slice(0, 10)) : <em>Never</em>}
                {last && <div style={{ fontSize: 11, color: '#4A8C8C', fontFamily: "'Outfit', sans-serif" }}>{last.month}</div>}
              </div>
              <div style={{ fontSize: 12, fontWeight: od ? 700 : 400, color: od ? 'var(--accent)' : nextDue ? 'var(--dark)' : 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}>
                {nextDue ? formatDate(nextDue) : '—'}
                {od && <div style={{ fontSize: 11, color: 'var(--accent)', fontFamily: "'Outfit', sans-serif" }}>Overdue</div>}
              </div>
              <div>
                {last
                  ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: '#4A7C5C', fontFamily: "'Outfit', sans-serif" }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#4A7C5C" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    {histCount} report{histCount !== 1 ? 's' : ''}
                  </span>
                  : <span style={{ fontSize: 11, color: 'var(--mid-grey)', fontStyle: 'italic', fontFamily: "'Outfit', sans-serif" }}>None yet</span>}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => { setSelectedClientId(client.id); setSelectedMonth('April 2026'); setEditingReport(null); setView('generate') }}
                  style={{ padding: '5px 10px', borderRadius: 6, border: 'none', background: 'var(--accent)', color: '#fff', cursor: 'pointer', fontSize: 11, fontWeight: 600, fontFamily: "'Outfit', sans-serif" }}>
                  Generate
                </button>
                {histCount > 0 && (
                  <button onClick={() => { setHistoryClientId(client.id); setSelectedClientId(client.id); setView('history') }}
                    style={{ padding: '5px 10px', borderRadius: 6, border: '1.5px solid var(--border)', background: 'none', cursor: 'pointer', fontSize: 11, fontFamily: "'Outfit', sans-serif", color: 'var(--mid-grey)' }}>
                    History ({histCount})
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
