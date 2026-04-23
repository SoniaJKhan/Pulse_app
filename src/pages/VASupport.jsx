import React, { useState, useMemo, useRef } from 'react'
import { useVATasks } from '../hooks/useVATasks'

const ASSIGNEES = ['Sonia', 'Jehangir']
const PRIORITIES = ['high', 'medium', 'low']
const STATUSES = ['pending', 'in-progress', 'done', 'overdue']

const PRIORITY_STYLE = {
  high:   { bg: 'rgba(196,80,58,0.1)',   color: '#C4503A', label: 'High' },
  medium: { bg: 'rgba(196,135,74,0.12)', color: '#C4874A', label: 'Medium' },
  low:    { bg: 'rgba(74,124,92,0.1)',   color: '#4A7C5C', label: 'Low' },
}

const STATUS_STYLE = {
  pending:     { bg: 'rgba(138,132,128,0.1)', color: '#8A8480',  label: 'Pending' },
  'in-progress': { bg: 'rgba(58,116,168,0.1)',  color: '#3A74A8',  label: 'In Progress' },
  done:        { bg: 'rgba(74,124,92,0.12)',  color: '#4A7C5C',  label: 'Done' },
  overdue:     { bg: 'rgba(196,80,58,0.1)',   color: '#C4503A',  label: 'Overdue' },
}

const ASSIGNEE_STYLE = {
  Sonia:    { bg: 'rgba(196,135,74,0.15)', color: '#C4874A' },
  Jehangir: { bg: 'rgba(74,124,92,0.15)',  color: '#4A7C5C' },
}

const EMPTY_FORM = {
  title: '', clientName: '', clientId: '', due: '', priority: 'medium',
  status: 'pending', assignedTo: 'Sonia', notes: '', timeSpent: '',
}

function TaskDrawer({ task, onSave, onClose, onDelete }) {
  const isNew = !task
  const [form, setForm] = useState(task ? { ...task } : { ...EMPTY_FORM })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <>
      <div style={s.backdrop} onClick={onClose} />
      <aside style={s.drawer}>
        <div style={s.drawerHead}>
          <div>
            <h2 style={s.drawerTitle}>{isNew ? 'Add Task' : 'Edit Task'}</h2>
            <p style={s.drawerSub}>Assign tasks to Sonia or Jehangir with priority and due date.</p>
          </div>
          <button style={s.closeBtn} onClick={onClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div style={s.drawerBody}>
          <div style={s.fieldGroup}>
            <label style={s.label}>Task Title *</label>
            <input style={s.input} value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Write captions for April posts" />
          </div>

          <div style={s.fieldGroup}>
            <label style={s.label}>Client</label>
            <input style={s.input} value={form.clientName} onChange={e => set('clientName', e.target.value)} placeholder="e.g. Bloom Wellness Studio" />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ ...s.fieldGroup, flex: 1 }}>
              <label style={s.label}>Assigned To</label>
              <select style={s.input} value={form.assignedTo || ''} onChange={e => set('assignedTo', e.target.value)}>
                <option value="">Unassigned</option>
                {ASSIGNEES.map(a => <option key={a}>{a}</option>)}
              </select>
            </div>
            <div style={{ ...s.fieldGroup, flex: 1 }}>
              <label style={s.label}>Priority</label>
              <select style={s.input} value={form.priority} onChange={e => set('priority', e.target.value)}>
                {PRIORITIES.map(p => <option key={p} value={p}>{PRIORITY_STYLE[p].label}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ ...s.fieldGroup, flex: 1 }}>
              <label style={s.label}>Due Date</label>
              <input style={s.input} type="date" value={form.due} onChange={e => set('due', e.target.value)} />
            </div>
            <div style={{ ...s.fieldGroup, flex: 1 }}>
              <label style={s.label}>Status</label>
              <select style={s.input} value={form.status} onChange={e => set('status', e.target.value)}>
                {STATUSES.map(st => <option key={st} value={st}>{STATUS_STYLE[st]?.label || st}</option>)}
              </select>
            </div>
          </div>

          <div style={s.fieldGroup}>
            <label style={s.label}>Time Spent (hours)</label>
            <input style={s.input} type="number" step="0.25" min="0" value={form.timeSpent || ''} onChange={e => set('timeSpent', e.target.value)} placeholder="e.g. 1.5" />
          </div>

          <div style={s.fieldGroup}>
            <label style={s.label}>Notes</label>
            <textarea style={{ ...s.input, resize: 'vertical', minHeight: '80px', lineHeight: 1.6 }} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Context, links, or instructions for the VA…" />
          </div>
        </div>

        <div style={s.drawerFooter}>
          {!isNew && (
            <button style={s.deleteBtn} onClick={() => { onDelete(task.id); onClose() }}>Delete</button>
          )}
          <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
            <button style={s.cancelBtn} onClick={onClose}>Cancel</button>
            <button style={s.saveBtn} onClick={() => { if (form.title.trim()) { onSave(form); onClose() } }}>
              {isNew ? 'Add Task' : 'Save Changes'}
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

function generateWeeklySummary(tasks) {
  const cutoff = new Date(Date.now() - 7 * 86400000)
  const done = tasks.filter(t =>
    t.status === 'done' && t.completedAt && new Date(t.completedAt) >= cutoff
  )
  if (done.length === 0) return 'No tasks completed in the last 7 days.'

  const byClient = {}
  done.forEach(t => {
    const k = t.clientName || 'General'
    if (!byClient[k]) byClient[k] = []
    byClient[k].push(t)
  })

  const lines = [`Weekly VA Summary — ${new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}`, '']
  Object.entries(byClient).forEach(([client, tasks]) => {
    lines.push(`${client}`)
    tasks.forEach(t => {
      const hrs = t.timeSpent ? ` (${t.timeSpent}h)` : ''
      lines.push(`  • ${t.title}${hrs}`)
    })
    lines.push('')
  })
  lines.push(`Total tasks completed: ${done.length}`)
  const totalHrs = done.reduce((s, t) => s + (parseFloat(t.timeSpent) || 0), 0)
  if (totalHrs > 0) lines.push(`Total hours logged: ${totalHrs.toFixed(1)}h`)
  return lines.join('\n')
}

export default function VASupport() {
  const { tasks, addTask, updateTask, deleteTask } = useVATasks()
  const [filterAssignee, setFilterAssignee] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')
  const [editTask, setEditTask] = useState(null)
  const [showNew, setShowNew] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const summaryText = useMemo(() => generateWeeklySummary(tasks), [tasks, showSummary])
  const summaryRef = useRef(null)

  const filtered = useMemo(() => {
    return tasks.filter(t => {
      if (filterAssignee !== 'All' && t.assignedTo !== filterAssignee) return false
      if (filterStatus !== 'All' && t.status !== filterStatus) return false
      return true
    }).sort((a, b) => {
      const pOrder = { high: 0, medium: 1, low: 2 }
      const sOrder = { overdue: 0, 'in-progress': 1, pending: 2, done: 3 }
      return (sOrder[a.status] ?? 9) - (sOrder[b.status] ?? 9) || (pOrder[a.priority] ?? 9) - (pOrder[b.priority] ?? 9)
    })
  }, [tasks, filterAssignee, filterStatus])

  const totals = useMemo(() => ({
    all: tasks.length,
    sonia: tasks.filter(t => t.assignedTo === 'Sonia').length,
    jehangir: tasks.filter(t => t.assignedTo === 'Jehangir').length,
    overdue: tasks.filter(t => t.status === 'overdue').length,
    done: tasks.filter(t => t.status === 'done').length,
  }), [tasks])

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>VA Support</h1>
          <p style={s.subtitle}>Task inbox for Sonia and Jehangir — assigned work across all clients.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button style={s.summaryBtn} onClick={() => setShowSummary(true)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            Weekly Summary
          </button>
          <button style={s.addBtn} onClick={() => setShowNew(true)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Task
          </button>
        </div>
      </div>

      {/* Summary bar */}
      <div style={s.summaryBar}>
        {[
          { label: 'Total Tasks',      count: totals.all,      color: 'var(--dark)' },
          { label: "Sonia's Tasks",    count: totals.sonia,    color: '#C4874A' },
          { label: "Jehangir's Tasks", count: totals.jehangir, color: '#4A7C5C' },
          { label: 'Overdue',          count: totals.overdue,  color: '#C4503A' },
          { label: 'Completed',        count: totals.done,     color: '#4A7C5C' },
        ].map(({ label, count, color }) => (
          <div key={label} style={s.summaryCard}>
            <div style={{ fontSize: '26px', fontWeight: 700, fontFamily: "'Libre Baskerville', serif", color, lineHeight: 1, marginBottom: '4px' }}>{count}</div>
            <div style={{ fontSize: '12px', color: 'var(--mid-grey)', fontWeight: 500 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={s.filterBar}>
        <div style={s.filterGroup}>
          <span style={s.filterLabel}>Assigned to</span>
          {['All', 'Sonia', 'Jehangir'].map(a => (
            <button key={a} style={{ ...s.filterChip, ...(filterAssignee === a ? s.filterChipActive : {}) }} onClick={() => setFilterAssignee(a)}>
              {a}
            </button>
          ))}
        </div>
        <div style={s.filterGroup}>
          <span style={s.filterLabel}>Status</span>
          {['All', 'pending', 'in-progress', 'overdue', 'done'].map(st => (
            <button key={st} style={{ ...s.filterChip, ...(filterStatus === st ? s.filterChipActive : {}) }} onClick={() => setFilterStatus(st)}>
              {st === 'All' ? 'All' : STATUS_STYLE[st]?.label || st}
            </button>
          ))}
        </div>
      </div>

      {/* Task list */}
      <div style={s.taskList}>
        {filtered.length === 0 ? (
          <div style={s.empty}>
            <div style={{ fontSize: '36px', marginBottom: '10px' }}>🎧</div>
            <p style={s.emptyTitle}>No tasks found</p>
            <p style={s.emptySub}>Try a different filter or add a new task.</p>
          </div>
        ) : filtered.map(task => {
          const pri = PRIORITY_STYLE[task.priority] || PRIORITY_STYLE.low
          const sts = STATUS_STYLE[task.status] || STATUS_STYLE.pending
          const asg = task.assignedTo ? ASSIGNEE_STYLE[task.assignedTo] : null
          const isOverdue = task.status === 'overdue'

          return (
            <div
              key={task.id}
              style={{ ...s.taskRow, borderLeft: `3px solid ${pri.color}` }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-card)'}
              onClick={() => setEditTask(task)}
            >
              {/* Status toggle */}
              <button
                style={{
                  width: 20, height: 20, borderRadius: '50%', border: `2px solid ${sts.color}`,
                  background: task.status === 'done' ? sts.color : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, cursor: 'pointer',
                }}
                onClick={e => {
                  e.stopPropagation()
                  updateTask(task.id, { status: task.status === 'done' ? 'pending' : 'done' })
                }}
                title={task.status === 'done' ? 'Mark pending' : 'Mark done'}
              >
                {task.status === 'done' && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </button>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '3px' }}>
                  <span style={{ fontSize: '13.5px', fontWeight: 600, color: task.status === 'done' ? 'var(--mid-grey)' : 'var(--dark)', textDecoration: task.status === 'done' ? 'line-through' : 'none' }}>
                    {task.title}
                  </span>
                  {task.clientName && (
                    <span style={{ fontSize: '11px', fontWeight: 600, background: 'rgba(196,135,74,0.1)', color: 'var(--accent)', padding: '1px 8px', borderRadius: '10px' }}>
                      {task.clientName}
                    </span>
                  )}
                </div>
                {task.notes && (
                  <p style={{ fontSize: '12px', color: 'var(--mid-grey)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '520px' }}>
                    {task.notes}
                  </p>
                )}
              </div>

              {/* Meta */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                <span style={{ fontSize: '11.5px', fontWeight: 600, background: pri.bg, color: pri.color, padding: '2px 9px', borderRadius: '20px' }}>
                  {pri.label}
                </span>
                <span style={{ fontSize: '11.5px', fontWeight: 600, background: sts.bg, color: sts.color, padding: '2px 9px', borderRadius: '20px' }}>
                  {sts.label}
                </span>
                {task.assignedTo && asg && (
                  <span style={{ fontSize: '11.5px', fontWeight: 700, background: asg.bg, color: asg.color, padding: '2px 10px', borderRadius: '20px' }}>
                    {task.assignedTo}
                  </span>
                )}
                {task.due && (
                  <span style={{ fontSize: '11.5px', color: isOverdue ? '#C4503A' : 'var(--mid-grey)', fontWeight: isOverdue ? 600 : 400 }}>
                    {task.due}
                  </span>
                )}
                {task.timeSpent && (
                  <span style={{ fontSize: '11.5px', color: 'var(--teal)', fontWeight: 500, fontFamily: "'DM Mono', monospace" }}>
                    {task.timeSpent}h
                  </span>
                )}
              </div>

              {/* Assign quick-change */}
              <select
                style={s.assignSelect}
                value={task.assignedTo || ''}
                onClick={e => e.stopPropagation()}
                onChange={e => { e.stopPropagation(); updateTask(task.id, { assignedTo: e.target.value || null }) }}
                title="Change assignee"
              >
                <option value="">Unassigned</option>
                {ASSIGNEES.map(a => <option key={a}>{a}</option>)}
              </select>
            </div>
          )
        })}
      </div>

      {/* Weekly Summary Modal */}
      {showSummary && (
        <>
          <div style={s.backdrop} onClick={() => setShowSummary(false)} />
          <aside style={{ ...s.drawer, width: '520px' }}>
            <div style={s.drawerHead}>
              <div>
                <h2 style={s.drawerTitle}>Weekly Summary</h2>
                <p style={s.drawerSub}>Tasks completed in the last 7 days — ready to copy and send.</p>
              </div>
              <button style={s.closeBtn} onClick={() => setShowSummary(false)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
              <textarea
                ref={summaryRef}
                readOnly
                value={summaryText}
                style={{ width: '100%', minHeight: '320px', padding: '14px', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '13px', fontFamily: "'DM Mono', monospace", background: 'var(--bg)', color: 'var(--dark)', resize: 'vertical', lineHeight: 1.7 }}
              />
            </div>
            <div style={s.drawerFooter}>
              <button style={s.saveBtn} onClick={() => { summaryRef.current?.select(); document.execCommand('copy') }}>
                Copy to Clipboard
              </button>
              <button style={s.cancelBtn} onClick={() => setShowSummary(false)}>Close</button>
            </div>
          </aside>
        </>
      )}

      {/* Drawers */}
      {showNew && (
        <TaskDrawer
          task={null}
          onSave={addTask}
          onClose={() => setShowNew(false)}
          onDelete={() => {}}
        />
      )}
      {editTask && (
        <TaskDrawer
          task={editTask}
          onSave={changes => updateTask(editTask.id, changes)}
          onClose={() => setEditTask(null)}
          onDelete={deleteTask}
        />
      )}
    </div>
  )
}

const s = {
  page: { padding: '28px 32px', maxWidth: '1100px' },
  header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', gap: '16px', flexWrap: 'wrap' },
  title: { fontSize: '28px', fontWeight: 700, color: 'var(--dark)', fontFamily: "'Libre Baskerville', serif", marginBottom: '5px' },
  subtitle: { fontSize: '13px', color: 'var(--mid-grey)' },
  addBtn: {
    display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 18px',
    background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 'var(--radius)',
    fontSize: '13.5px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
  },
  summaryBtn: {
    display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 18px',
    background: 'rgba(74,124,92,0.12)', color: 'var(--green)',
    border: '1.5px solid rgba(74,124,92,0.3)', borderRadius: 'var(--radius)',
    fontSize: '13.5px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
  },
  summaryBar: { display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' },
  summaryCard: {
    background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
    padding: '16px 20px', flex: 1, minWidth: '130px', boxShadow: 'var(--shadow-card)',
  },
  filterBar: { display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap', padding: '14px 18px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' },
  filterGroup: { display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' },
  filterLabel: { fontSize: '11px', fontWeight: 700, color: 'var(--mid-grey)', textTransform: 'uppercase', letterSpacing: '0.07em', marginRight: '4px' },
  filterChip: {
    padding: '4px 12px', borderRadius: '20px', fontSize: '12.5px', fontWeight: 500,
    background: 'transparent', border: '1.5px solid var(--border)', color: 'var(--mid-grey)',
    cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
  },
  filterChipActive: { background: 'var(--accent)', borderColor: 'var(--accent)', color: '#fff', fontWeight: 600 },
  taskList: { display: 'flex', flexDirection: 'column', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: 'var(--shadow-card)' },
  taskRow: {
    display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 20px',
    borderBottom: '1px solid var(--border)', background: 'var(--bg-card)',
    cursor: 'pointer', transition: 'background 0.12s',
  },
  assignSelect: {
    padding: '4px 8px', border: '1.5px solid var(--border)', borderRadius: '8px',
    fontSize: '12px', color: 'var(--dark)', background: 'var(--bg)',
    cursor: 'pointer', fontFamily: "'Outfit', sans-serif", flexShrink: 0,
  },
  empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px', textAlign: 'center' },
  emptyTitle: { fontSize: '16px', fontWeight: 700, color: 'var(--dark)', fontFamily: "'Libre Baskerville', serif", marginBottom: '6px' },
  emptySub: { fontSize: '13px', color: 'var(--mid-grey)' },

  // Drawer
  backdrop: { position: 'fixed', inset: 0, background: 'rgba(26,26,26,0.4)', zIndex: 100 },
  drawer: {
    position: 'fixed', top: 0, right: 0, bottom: 0, width: '460px', maxWidth: '100vw',
    background: 'var(--bg-card)', zIndex: 101, display: 'flex', flexDirection: 'column',
    boxShadow: '-4px 0 24px rgba(26,26,26,0.12)',
  },
  drawerHead: {
    padding: '22px 24px 18px', borderBottom: '1px solid var(--border)',
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexShrink: 0,
  },
  drawerTitle: { fontSize: '17px', fontWeight: 700, color: 'var(--dark)', marginBottom: '4px', fontFamily: "'Libre Baskerville', serif" },
  drawerSub: { fontSize: '12.5px', color: 'var(--mid-grey)', lineHeight: 1.5 },
  closeBtn: {
    background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
    width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'var(--mid-grey)', cursor: 'pointer', flexShrink: 0,
  },
  drawerBody: { flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' },
  drawerFooter: {
    padding: '14px 24px', borderTop: '1px solid var(--border)',
    display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0,
  },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { fontSize: '12px', fontWeight: 600, color: 'var(--mid-grey)', textTransform: 'uppercase', letterSpacing: '0.06em' },
  input: {
    padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: '8px',
    fontSize: '13.5px', color: 'var(--dark)', background: 'var(--bg)',
    outline: 'none', fontFamily: "'Outfit', sans-serif", width: '100%',
  },
  saveBtn: {
    padding: '9px 20px', background: 'var(--accent)', border: 'none', borderRadius: 'var(--radius)',
    fontSize: '13px', fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
  },
  cancelBtn: {
    padding: '9px 16px', background: 'none', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)',
    fontSize: '13px', fontWeight: 500, color: 'var(--mid-grey)', cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
  },
  deleteBtn: {
    padding: '9px 16px', background: 'rgba(196,80,58,0.1)', border: 'none', borderRadius: 'var(--radius)',
    fontSize: '13px', fontWeight: 600, color: '#C4503A', cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
  },
}
