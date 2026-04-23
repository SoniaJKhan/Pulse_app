import React, { useState } from 'react'
import { useWebsiteData } from '../../hooks/useWebsiteData'

const TODAY = '2026-04-18'
const PHASE_NAMES = ['Discovery', 'Design', 'Development', 'Client Review', 'Launch', 'Post-Launch']
const PHASE_STATUS = ['Not Started', 'In Progress', 'Complete']
const TASK_STATUS = ['Not Started', 'In Progress', 'Complete']
const FEEDBACK_PRIORITY = ['Low', 'Medium', 'High', 'Critical']
const FEEDBACK_STATUS = ['Pending', 'In Progress', 'Resolved']
const PROJECT_STATUS = ['Planning', 'In Progress', 'In Review', 'Live', 'Maintenance']
const SUB_TABS = ['Project Overview', 'Phase Tracker', 'Client Feedback', 'Post-Launch Checklist']

const inp = {
  width: '100%', boxSizing: 'border-box', padding: '8px 10px',
  border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 13,
  fontFamily: "'Outfit', sans-serif", background: 'var(--bg)', color: 'var(--dark)', outline: 'none',
}
const ta = { ...inp, resize: 'vertical', minHeight: 60 }
const iconBtn = {
  background: 'none', border: '1px solid var(--border)', borderRadius: 6,
  padding: '4px 6px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--mid-grey)',
}

function isOverdue(due, status) {
  return status !== 'Complete' && due && due < TODAY
}

function completionPct(phases) {
  if (!phases.length) return 0
  const done = phases.filter(p => p.status === 'Complete').length
  return Math.round((done / phases.length) * 100)
}

function currentPhaseName(phases) {
  const ip = phases.find(p => p.status === 'In Progress')
  if (ip) return ip.name
  const allDone = phases.every(p => p.status === 'Complete')
  if (allDone && phases.length) return phases[phases.length - 1].name
  const first = phases.find(p => p.status === 'Not Started')
  if (first) return `${first.name} (upcoming)`
  return '—'
}

function statusStyle(s) {
  if (s === 'Planning') return { color: '#4A8C8C', bg: 'rgba(74,140,140,0.1)', border: 'rgba(74,140,140,0.25)' }
  if (s === 'In Progress') return { color: 'var(--accent)', bg: 'rgba(196,135,74,0.1)', border: 'rgba(196,135,74,0.25)' }
  if (s === 'In Review') return { color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.25)' }
  if (s === 'Live') return { color: '#4A7C5C', bg: 'rgba(74,124,92,0.1)', border: 'rgba(74,124,92,0.25)' }
  if (s === 'Maintenance') return { color: 'var(--mid-grey)', bg: 'rgba(138,132,128,0.1)', border: 'rgba(138,132,128,0.25)' }
  return { color: 'var(--mid-grey)', bg: 'var(--bg)', border: 'var(--border)' }
}

function FormRow({ label, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--mid-grey)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: "'Outfit', sans-serif" }}>{label}</label>
      {children}
    </div>
  )
}

function Badge({ text, color, bg, border }) {
  return (
    <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 6, background: bg, border: `1px solid ${border}`, color, fontWeight: 600, fontFamily: "'Outfit', sans-serif" }}>
      {text}
    </span>
  )
}

// ─── Project Overview ──────────────────────────────────────────────────────────
function ProjectOverview({ clientId, client, onUpsertProject }) {
  const { project, phases } = client
  const [editing, setEditing] = useState(false)
  const [creating, setCreating] = useState(false)
  const empty = { name: '', startDate: '', targetLaunchDate: '', actualLaunchDate: '', status: 'Planning' }
  const [form, setForm] = useState(empty)
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const pct = completionPct(phases)
  const ss = project ? statusStyle(project.status) : null

  if (!project && !creating) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0' }}>
        <div style={{ fontSize: 13, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif", marginBottom: 16 }}>No website project recorded for this client.</div>
        <button onClick={() => { setForm(empty); setCreating(true) }}
          style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Outfit', sans-serif" }}>
          + Start Project
        </button>
      </div>
    )
  }

  if (creating) {
    return (
      <div style={{ background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 12, padding: 24 }}>
        <h4 style={{ margin: '0 0 20px', fontFamily: "'Libre Baskerville', serif", fontSize: 15 }}>New Website Project</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
          <FormRow label="Project Name"><input style={{ ...inp, gridColumn: '1/-1' }} value={form.name} onChange={e => f('name', e.target.value)} placeholder="e.g. Website Redesign 2026" /></FormRow>
          <FormRow label="Status">
            <select style={inp} value={form.status} onChange={e => f('status', e.target.value)}>
              {PROJECT_STATUS.map(s => <option key={s}>{s}</option>)}
            </select>
          </FormRow>
          <FormRow label="Start Date"><input style={inp} type="date" value={form.startDate} onChange={e => f('startDate', e.target.value)} /></FormRow>
          <FormRow label="Target Launch"><input style={inp} type="date" value={form.targetLaunchDate} onChange={e => f('targetLaunchDate', e.target.value)} /></FormRow>
          <FormRow label="Actual Launch (if live)"><input style={inp} type="date" value={form.actualLaunchDate} onChange={e => f('actualLaunchDate', e.target.value)} /></FormRow>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
          <button onClick={() => setCreating(false)} style={{ padding: '8px 16px', borderRadius: 8, border: '1.5px solid var(--border)', background: 'none', cursor: 'pointer', fontSize: 13, fontFamily: "'Outfit', sans-serif", color: 'var(--mid-grey)' }}>Cancel</button>
          <button onClick={() => { if (form.name.trim()) { onUpsertProject(form, true); setCreating(false) } }} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: 'var(--accent)', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: "'Outfit', sans-serif" }}>Create Project</button>
        </div>
      </div>
    )
  }

  if (editing) {
    return (
      <div style={{ background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 12, padding: 24 }}>
        <h4 style={{ margin: '0 0 20px', fontFamily: "'Libre Baskerville', serif", fontSize: 15 }}>Edit Project</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
          <FormRow label="Project Name"><input style={inp} value={form.name} onChange={e => f('name', e.target.value)} /></FormRow>
          <FormRow label="Status">
            <select style={inp} value={form.status} onChange={e => f('status', e.target.value)}>
              {PROJECT_STATUS.map(s => <option key={s}>{s}</option>)}
            </select>
          </FormRow>
          <FormRow label="Start Date"><input style={inp} type="date" value={form.startDate} onChange={e => f('startDate', e.target.value)} /></FormRow>
          <FormRow label="Target Launch"><input style={inp} type="date" value={form.targetLaunchDate} onChange={e => f('targetLaunchDate', e.target.value)} /></FormRow>
          <FormRow label="Actual Launch"><input style={inp} type="date" value={form.actualLaunchDate} onChange={e => f('actualLaunchDate', e.target.value)} /></FormRow>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
          <button onClick={() => setEditing(false)} style={{ padding: '8px 16px', borderRadius: 8, border: '1.5px solid var(--border)', background: 'none', cursor: 'pointer', fontSize: 13, fontFamily: "'Outfit', sans-serif", color: 'var(--mid-grey)' }}>Cancel</button>
          <button onClick={() => { onUpsertProject(form, false); setEditing(false) }} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: 'var(--accent)', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: "'Outfit', sans-serif" }}>Save</button>
        </div>
      </div>
    )
  }

  const daysToLaunch = project.targetLaunchDate
    ? Math.ceil((new Date(project.targetLaunchDate) - new Date(TODAY)) / 86400000)
    : null
  const isOver = daysToLaunch !== null && daysToLaunch < 0 && !project.actualLaunchDate

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, gap: 12 }}>
        <div>
          <h3 style={{ margin: '0 0 6px', fontSize: 17, fontFamily: "'Libre Baskerville', serif", color: 'var(--dark)' }}>{project.name}</h3>
          <Badge text={project.status} {...ss} />
        </div>
        <button onClick={() => { setForm({ ...project }); setEditing(true) }} style={{ ...iconBtn, padding: '6px 12px', gap: 5, fontSize: 12, fontFamily: "'Outfit', sans-serif" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          Edit
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 28 }}>
        {[
          { label: 'Start Date', value: project.startDate || '—' },
          { label: 'Target Launch', value: project.targetLaunchDate || '—' },
          { label: 'Actual Launch', value: project.actualLaunchDate || '—' },
          { label: 'Days to Launch', value: project.actualLaunchDate ? 'Launched' : daysToLaunch !== null ? (isOver ? `${Math.abs(daysToLaunch)}d overdue` : `${daysToLaunch}d`) : '—', color: isOver ? 'var(--red)' : daysToLaunch !== null && daysToLaunch <= 7 ? 'var(--accent)' : 'var(--dark)' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ fontSize: 11, color: 'var(--mid-grey)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: "'Outfit', sans-serif", marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: s.color || 'var(--dark)', fontFamily: "'Outfit', sans-serif" }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Overall completion */}
      <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 700, fontFamily: "'Outfit', sans-serif", color: 'var(--dark)' }}>Overall Completion</span>
          <span style={{ fontSize: 22, fontWeight: 800, fontFamily: "'Libre Baskerville', serif", color: pct === 100 ? '#4A7C5C' : 'var(--accent)' }}>{pct}%</span>
        </div>
        <div style={{ height: 10, borderRadius: 5, background: 'var(--border)', overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 5, width: `${pct}%`, background: pct === 100 ? '#4A7C5C' : 'var(--accent)', transition: 'width 0.4s ease' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
          {phases.map(p => {
            const c = p.status === 'Complete' ? '#4A7C5C' : p.status === 'In Progress' ? 'var(--accent)' : 'var(--border)'
            return (
              <div key={p.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
                <span style={{ fontSize: 9, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif", textAlign: 'center', maxWidth: 48 }}>{p.name}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Current phase */}
      <div style={{ fontSize: 12, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}>
        Current phase: <strong style={{ color: 'var(--dark)' }}>{currentPhaseName(phases)}</strong>
      </div>
    </div>
  )
}

// ─── Phase Tracker ─────────────────────────────────────────────────────────────
function PhaseTracker({ clientId, phases, onUpdatePhase, onAddTask, onUpdateTask, onDeleteTask }) {
  const [openPhase, setOpenPhase] = useState(null)
  const [addingTask, setAddingTask] = useState(null)
  const [editingTask, setEditingTask] = useState(null)
  const emptyTask = { name: '', owner: '', due: '', status: 'Not Started', notes: '' }
  const [taskForm, setTaskForm] = useState(emptyTask)
  const tf = (k, v) => setTaskForm(p => ({ ...p, [k]: v }))

  const phaseColor = (status) => {
    if (status === 'Complete') return '#4A7C5C'
    if (status === 'In Progress') return 'var(--accent)'
    return '#D0CBC4'
  }

  const overdueCount = phases.reduce((sum, p) =>
    sum + p.tasks.filter(t => isOverdue(t.due, t.status)).length, 0)

  return (
    <div>
      {overdueCount > 0 && (
        <div style={{ background: 'rgba(196,80,58,0.08)', border: '1.5px solid rgba(196,80,58,0.25)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span style={{ fontSize: 13, fontFamily: "'Outfit', sans-serif", color: 'var(--red)', fontWeight: 600 }}>
            {overdueCount} overdue task{overdueCount !== 1 ? 's' : ''} across phases
          </span>
        </div>
      )}

      {/* Visual stepper */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 28, overflowX: 'auto', paddingBottom: 8 }}>
        {phases.map((phase, i) => {
          const c = phaseColor(phase.status)
          const isOpen = openPhase === phase.id
          const phaseOverdue = phase.tasks.some(t => isOverdue(t.due, t.status))
          return (
            <React.Fragment key={phase.id}>
              <div
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', minWidth: 72 }}
                onClick={() => setOpenPhase(isOpen ? null : phase.id)}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', background: c === '#D0CBC4' ? 'var(--bg)' : c,
                  border: `2.5px solid ${c}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative', transition: 'all 0.2s',
                  boxShadow: isOpen ? `0 0 0 3px ${c}30` : 'none',
                }}>
                  {phase.status === 'Complete'
                    ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    : phase.status === 'In Progress'
                    ? <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#fff' }} />
                    : <span style={{ fontSize: 11, fontWeight: 700, color: '#8A8480', fontFamily: "'Outfit', sans-serif" }}>{i + 1}</span>
                  }
                  {phaseOverdue && (
                    <div style={{ position: 'absolute', top: -3, right: -3, width: 12, height: 12, borderRadius: '50%', background: 'var(--red)', border: '2px solid var(--bg)' }} />
                  )}
                </div>
                <span style={{ fontSize: 10, marginTop: 6, color: phase.status === 'Not Started' ? 'var(--mid-grey)' : 'var(--dark)', fontFamily: "'Outfit', sans-serif", fontWeight: 600, textAlign: 'center', lineHeight: 1.2 }}>{phase.name}</span>
                <span style={{ fontSize: 9, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}>{phase.status}</span>
              </div>
              {i < phases.length - 1 && (
                <div style={{ flex: 1, height: 2.5, background: phases[i + 1].status !== 'Not Started' || phase.status === 'Complete' ? c : 'var(--border)', minWidth: 20, transition: 'background 0.3s', marginBottom: 28 }} />
              )}
            </React.Fragment>
          )
        })}
      </div>

      {/* Expanded phase panel */}
      {phases.map(phase => {
        if (openPhase !== phase.id) return null
        const phOverdue = phase.tasks.filter(t => isOverdue(t.due, t.status))
        return (
          <div key={phase.id} style={{ background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 14, padding: 20, marginBottom: 16 }}>
            {/* Phase header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, gap: 12 }}>
              <div>
                <h4 style={{ margin: '0 0 8px', fontSize: 14, fontFamily: "'Libre Baskerville', serif" }}>{phase.name}</h4>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {PHASE_STATUS.map(s => (
                    <button key={s} onClick={() => onUpdatePhase(phase.id, { status: s })} style={{
                      padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
                      border: `1.5px solid ${phase.status === s ? phaseColor(s) : 'var(--border)'}`,
                      background: phase.status === s ? `${phaseColor(s)}18` : 'none',
                      color: phase.status === s ? phaseColor(s) : 'var(--mid-grey)',
                    }}>{s}</button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px', minWidth: 240 }}>
                <span style={{ fontSize: 10, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}>Start date</span>
                <span style={{ fontSize: 10, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}>Completion date</span>
                <input type="date" value={phase.startDate} onChange={e => onUpdatePhase(phase.id, { startDate: e.target.value })}
                  style={{ ...inp, fontSize: 12, padding: '5px 8px' }} />
                <input type="date" value={phase.completionDate} onChange={e => onUpdatePhase(phase.id, { completionDate: e.target.value })}
                  style={{ ...inp, fontSize: 12, padding: '5px 8px' }} />
              </div>
            </div>

            {/* Tasks */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--mid-grey)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: "'Outfit', sans-serif" }}>Tasks</span>
              <button onClick={() => { setTaskForm(emptyTask); setAddingTask(phase.id); setEditingTask(null) }} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 6, padding: '5px 12px', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: "'Outfit', sans-serif" }}>+ Add Task</button>
            </div>

            {addingTask === phase.id && (
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 14, marginBottom: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 8 }}>
                  <input style={inp} placeholder="Task name" value={taskForm.name} onChange={e => tf('name', e.target.value)} />
                  <input style={inp} placeholder="Owner" value={taskForm.owner} onChange={e => tf('owner', e.target.value)} />
                  <input style={inp} type="date" value={taskForm.due} onChange={e => tf('due', e.target.value)} />
                  <select style={inp} value={taskForm.status} onChange={e => tf('status', e.target.value)}>
                    {TASK_STATUS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div style={{ marginTop: 8 }}>
                  <input style={inp} placeholder="Notes (optional)" value={taskForm.notes} onChange={e => tf('notes', e.target.value)} />
                </div>
                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', marginTop: 8 }}>
                  <button onClick={() => setAddingTask(null)} style={{ padding: '6px 12px', borderRadius: 6, border: '1.5px solid var(--border)', background: 'none', cursor: 'pointer', fontSize: 12, fontFamily: "'Outfit', sans-serif", color: 'var(--mid-grey)' }}>Cancel</button>
                  <button onClick={() => { if (taskForm.name.trim()) { onAddTask(phase.id, taskForm); setAddingTask(null) } }} style={{ padding: '6px 12px', borderRadius: 6, border: 'none', background: 'var(--accent)', color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: "'Outfit', sans-serif" }}>Save</button>
                </div>
              </div>
            )}

            {phase.tasks.length === 0 && addingTask !== phase.id && (
              <div style={{ fontSize: 12, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif", padding: '10px 0', textAlign: 'center' }}>No tasks yet.</div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {phase.tasks.map(task => {
                const od = isOverdue(task.due, task.status)
                const isEditingThis = editingTask === task.id
                const tc = task.status === 'Complete' ? '#4A7C5C' : task.status === 'In Progress' ? 'var(--accent)' : od ? 'var(--red)' : 'var(--mid-grey)'

                if (isEditingThis) return (
                  <div key={task.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 12 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 8 }}>
                      <input style={inp} value={taskForm.name} onChange={e => tf('name', e.target.value)} />
                      <input style={inp} placeholder="Owner" value={taskForm.owner} onChange={e => tf('owner', e.target.value)} />
                      <input style={inp} type="date" value={taskForm.due} onChange={e => tf('due', e.target.value)} />
                      <select style={inp} value={taskForm.status} onChange={e => tf('status', e.target.value)}>
                        {TASK_STATUS.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <input style={inp} placeholder="Notes" value={taskForm.notes} onChange={e => tf('notes', e.target.value)} />
                    </div>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', marginTop: 8 }}>
                      <button onClick={() => setEditingTask(null)} style={{ padding: '6px 12px', borderRadius: 6, border: '1.5px solid var(--border)', background: 'none', cursor: 'pointer', fontSize: 12, fontFamily: "'Outfit', sans-serif", color: 'var(--mid-grey)' }}>Cancel</button>
                      <button onClick={() => { onUpdateTask(phase.id, task.id, taskForm); setEditingTask(null) }} style={{ padding: '6px 12px', borderRadius: 6, border: 'none', background: 'var(--accent)', color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: "'Outfit', sans-serif" }}>Save</button>
                    </div>
                  </div>
                )

                return (
                  <div key={task.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', background: 'var(--bg-card)', border: `1px solid ${od ? 'rgba(196,80,58,0.3)' : 'var(--border)'}`, borderRadius: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: tc, marginTop: 5, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--dark)', fontFamily: "'Outfit', sans-serif" }}>{task.name}</span>
                        <span style={{ fontSize: 11, color: tc, fontWeight: 600, fontFamily: "'Outfit', sans-serif" }}>{task.status}</span>
                        {od && <span style={{ fontSize: 10, color: 'var(--red)', fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>OVERDUE</span>}
                      </div>
                      <div style={{ display: 'flex', gap: 12, marginTop: 3, flexWrap: 'wrap' }}>
                        {task.owner && <span style={{ fontSize: 11, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}>Owner: <strong style={{ color: 'var(--dark)' }}>{task.owner}</strong></span>}
                        {task.due && <span style={{ fontSize: 11, color: od ? 'var(--red)' : 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}>Due: {task.due}</span>}
                        {task.notes && <span style={{ fontSize: 11, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}>{task.notes}</span>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                      <button onClick={() => { setTaskForm({ ...task }); setEditingTask(task.id); setAddingTask(null) }} style={iconBtn}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button onClick={() => onDeleteTask(phase.id, task.id)} style={{ ...iconBtn, color: 'var(--red)' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {!openPhase && (
        <p style={{ fontSize: 12, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif", textAlign: 'center', marginTop: 8 }}>Click a phase to expand tasks and details.</p>
      )}
    </div>
  )
}

// ─── Client Feedback ───────────────────────────────────────────────────────────
function FeedbackSection({ feedback, onAdd, onUpdate, onDelete, phases }) {
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const empty = { description: '', dateReceived: TODAY, phase: '', priority: 'Medium', status: 'Pending', resolutionNotes: '', dateResolved: '' }
  const [form, setForm] = useState(empty)
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSave = () => {
    if (!form.description.trim()) return
    if (editId) onUpdate(editId, form)
    else onAdd(form)
    setShowForm(false)
  }

  const priorityColor = (p) => {
    if (p === 'Critical') return { color: 'var(--red)', bg: 'rgba(196,80,58,0.1)', border: 'rgba(196,80,58,0.25)' }
    if (p === 'High') return { color: 'var(--accent)', bg: 'rgba(196,135,74,0.1)', border: 'rgba(196,135,74,0.25)' }
    if (p === 'Medium') return { color: '#4A8C8C', bg: 'rgba(74,140,140,0.1)', border: 'rgba(74,140,140,0.25)' }
    return { color: 'var(--mid-grey)', bg: 'rgba(138,132,128,0.1)', border: 'rgba(138,132,128,0.25)' }
  }

  const fbStatusColor = (s) => {
    if (s === 'Resolved') return '#4A7C5C'
    if (s === 'In Progress') return 'var(--accent)'
    return 'var(--mid-grey)'
  }

  const sorted = [...feedback].sort((a, b) => new Date(b.dateReceived) - new Date(a.dateReceived))
  const phaseOptions = phases.map(p => p.name)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, fontFamily: "'Libre Baskerville', serif", color: 'var(--dark)' }}>Client Feedback Log</h3>
        <button onClick={() => { setForm(empty); setEditId(null); setShowForm(true) }} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'Outfit', sans-serif" }}>+ Add Feedback</button>
      </div>

      {showForm && (
        <div style={{ background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 12, padding: 20, marginBottom: 16 }}>
          <h4 style={{ margin: '0 0 16px', fontSize: 14, fontFamily: "'Libre Baskerville', serif" }}>{editId ? 'Edit Feedback' : 'New Feedback Item'}</h4>
          <FormRow label="Description"><textarea style={ta} value={form.description} onChange={e => f('description', e.target.value)} placeholder="What did the client flag?" /></FormRow>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0 12px' }}>
            <FormRow label="Date Received"><input style={inp} type="date" value={form.dateReceived} onChange={e => f('dateReceived', e.target.value)} /></FormRow>
            <FormRow label="Phase">
              <select style={inp} value={form.phase} onChange={e => f('phase', e.target.value)}>
                <option value="">— Select —</option>
                {phaseOptions.map(o => <option key={o}>{o}</option>)}
              </select>
            </FormRow>
            <FormRow label="Priority">
              <select style={inp} value={form.priority} onChange={e => f('priority', e.target.value)}>
                {FEEDBACK_PRIORITY.map(p => <option key={p}>{p}</option>)}
              </select>
            </FormRow>
            <FormRow label="Status">
              <select style={inp} value={form.status} onChange={e => f('status', e.target.value)}>
                {FEEDBACK_STATUS.map(s => <option key={s}>{s}</option>)}
              </select>
            </FormRow>
          </div>
          {form.status === 'Resolved' && (
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0 12px' }}>
              <FormRow label="Resolution Notes"><input style={inp} value={form.resolutionNotes} onChange={e => f('resolutionNotes', e.target.value)} placeholder="How was this resolved?" /></FormRow>
              <FormRow label="Date Resolved"><input style={inp} type="date" value={form.dateResolved} onChange={e => f('dateResolved', e.target.value)} /></FormRow>
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
            <button onClick={() => setShowForm(false)} style={{ padding: '8px 16px', borderRadius: 8, border: '1.5px solid var(--border)', background: 'none', cursor: 'pointer', fontSize: 13, fontFamily: "'Outfit', sans-serif", color: 'var(--mid-grey)' }}>Cancel</button>
            <button onClick={handleSave} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: 'var(--accent)', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: "'Outfit', sans-serif" }}>Save</button>
          </div>
        </div>
      )}

      {sorted.length === 0 && !showForm && (
        <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--mid-grey)', fontSize: 13, fontFamily: "'Outfit', sans-serif" }}>No feedback logged yet.</div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {sorted.map(fb => {
          const pc = priorityColor(fb.priority)
          const sc = fbStatusColor(fb.status)
          return (
            <div key={fb.id} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Badge text={fb.priority} {...pc} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: sc, fontFamily: "'Outfit', sans-serif" }}>{fb.status}</span>
                    {fb.phase && <span style={{ fontSize: 11, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}>Phase: {fb.phase}</span>}
                    <span style={{ fontSize: 11, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}>{fb.dateReceived}</span>
                  </div>
                  <p style={{ margin: '0 0 6px', fontSize: 13, color: 'var(--dark)', fontFamily: "'Outfit', sans-serif", lineHeight: 1.5 }}>{fb.description}</p>
                  {fb.resolutionNotes && (
                    <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#4A7C5C', fontFamily: "'Outfit', sans-serif", flexShrink: 0 }}>Resolution:</span>
                      <span style={{ fontSize: 12, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}>{fb.resolutionNotes}</span>
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                  <button onClick={() => { setForm({ ...fb }); setEditId(fb.id); setShowForm(true) }} style={iconBtn}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button onClick={() => onDelete(fb.id)} style={{ ...iconBtn, color: 'var(--red)' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Post-Launch Checklist ─────────────────────────────────────────────────────
function PostLaunchChecklist({ checklist, onUpdate }) {
  const completed = checklist.filter(i => i.completed).length
  const pct = Math.round((completed / checklist.length) * 100)

  const renderInput = (item) => {
    if (item.type === 'score') {
      return (
        <input style={{ ...inp, width: 120 }} value={item.value} onChange={e => onUpdate(item.id, { value: e.target.value })} placeholder="e.g. 92/100" />
      )
    }
    const opts = item.type === 'pass-fail' ? ['', 'Pass', 'Fail'] : ['', 'Yes', 'No']
    return (
      <div style={{ display: 'flex', gap: 6 }}>
        {opts.filter(Boolean).map(o => (
          <button key={o} onClick={() => onUpdate(item.id, { value: o, completed: true })} style={{
            padding: '5px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
            background: item.value === o ? (o === 'Pass' || o === 'Yes' ? 'rgba(74,124,92,0.15)' : 'rgba(196,80,58,0.1)') : 'var(--bg-card)',
            color: item.value === o ? (o === 'Pass' || o === 'Yes' ? '#4A7C5C' : 'var(--red)') : 'var(--mid-grey)',
            border: `1.5px solid ${item.value === o ? (o === 'Pass' || o === 'Yes' ? 'rgba(74,124,92,0.3)' : 'rgba(196,80,58,0.3)') : 'var(--border)'}`,
          }}>{o}</button>
        ))}
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, fontFamily: "'Libre Baskerville', serif", color: 'var(--dark)' }}>Post-Launch Checklist</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ height: 8, width: 100, borderRadius: 4, background: 'var(--border)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? '#4A7C5C' : 'var(--accent)', borderRadius: 4, transition: 'width 0.3s' }} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: pct === 100 ? '#4A7C5C' : 'var(--dark)', fontFamily: "'Outfit', sans-serif" }}>{completed}/{checklist.length}</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {checklist.map(item => (
          <div key={item.id} style={{ background: 'var(--bg)', border: `1px solid ${item.completed ? 'rgba(74,124,92,0.2)' : 'var(--border)'}`, borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <button onClick={() => onUpdate(item.id, { completed: !item.completed, completionDate: !item.completed ? TODAY : '' })} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: 1, flexShrink: 0 }}>
                <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${item.completed ? '#4A7C5C' : 'var(--border)'}`, background: item.completed ? '#4A7C5C' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {item.completed && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                </div>
              </button>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: item.completed ? '#4A7C5C' : 'var(--dark)', fontFamily: "'Outfit', sans-serif" }}>{item.item}</span>
                  {renderInput(item)}
                  {item.value && <span style={{ fontSize: 12, fontWeight: 700, color: item.value === 'Pass' || item.value === 'Yes' ? '#4A7C5C' : item.value === 'Fail' || item.value === 'No' ? 'var(--red)' : 'var(--dark)', fontFamily: "'Outfit', sans-serif" }}>{item.value}</span>}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, alignItems: 'center' }}>
                  <input style={{ ...inp, fontSize: 12, padding: '6px 9px' }} placeholder="Notes…" value={item.notes} onChange={e => onUpdate(item.id, { notes: e.target.value })} />
                  <input style={{ ...inp, fontSize: 12, padding: '6px 9px', width: 140 }} type="date" value={item.completionDate} onChange={e => onUpdate(item.id, { completionDate: e.target.value })} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main WebsiteTab ───────────────────────────────────────────────────────────
export default function WebsiteTab({ clientId }) {
  const [subTab, setSubTab] = useState('Project Overview')
  const {
    getClient, upsertProject, createProject,
    updatePhase, addTask, updateTask, deleteTask,
    addFeedback, updateFeedback, deleteFeedback,
    updateChecklistItem,
  } = useWebsiteData()

  const client = getClient(clientId)

  return (
    <div>
      {/* Sub-tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--bg)', overflowX: 'auto' }}>
        {SUB_TABS.map(tab => (
          <button key={tab} onClick={() => setSubTab(tab)} style={{
            padding: '11px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            border: 'none', borderBottom: subTab === tab ? '2px solid var(--accent)' : '2px solid transparent',
            background: 'transparent', color: subTab === tab ? 'var(--accent)' : 'var(--mid-grey)',
            fontFamily: "'Outfit', sans-serif", marginBottom: '-1px', whiteSpace: 'nowrap',
          }}>{tab}</button>
        ))}
      </div>

      <div style={{ padding: '24px 0' }}>
        {subTab === 'Project Overview' && (
          <ProjectOverview
            clientId={clientId}
            client={client}
            onUpsertProject={(data, isNew) => isNew ? createProject(clientId, data) : upsertProject(clientId, data)}
          />
        )}
        {subTab === 'Phase Tracker' && (
          client.project ? (
            <PhaseTracker
              clientId={clientId}
              phases={client.phases}
              onUpdatePhase={(phId, ch) => updatePhase(clientId, phId, ch)}
              onAddTask={(phId, task) => addTask(clientId, phId, task)}
              onUpdateTask={(phId, taskId, ch) => updateTask(clientId, phId, taskId, ch)}
              onDeleteTask={(phId, taskId) => deleteTask(clientId, phId, taskId)}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--mid-grey)', fontSize: 13, fontFamily: "'Outfit', sans-serif" }}>Create a project first in the Project Overview tab.</div>
          )
        )}
        {subTab === 'Client Feedback' && (
          client.project ? (
            <FeedbackSection
              feedback={client.feedback}
              phases={client.phases}
              onAdd={fb => addFeedback(clientId, fb)}
              onUpdate={(id, ch) => updateFeedback(clientId, id, ch)}
              onDelete={id => deleteFeedback(clientId, id)}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--mid-grey)', fontSize: 13, fontFamily: "'Outfit', sans-serif" }}>Create a project first in the Project Overview tab.</div>
          )
        )}
        {subTab === 'Post-Launch Checklist' && (
          client.project ? (
            <PostLaunchChecklist
              checklist={client.checklist}
              onUpdate={(id, ch) => updateChecklistItem(clientId, id, ch)}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--mid-grey)', fontSize: 13, fontFamily: "'Outfit', sans-serif" }}>Create a project first in the Project Overview tab.</div>
          )
        )}
      </div>
    </div>
  )
}
