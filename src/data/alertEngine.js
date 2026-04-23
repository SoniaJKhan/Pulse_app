// Pure evaluation — returns trigger objects for all conditions that should be alerting.
// AlertsContext calls this and merges results with stored alerts.

export const ALERT_META = {
  'task-overdue':     { label: 'Task Overdue',               priority: 'High',   color: 'red' },
  'monthly-report':   { label: 'Monthly Report Overdue',     priority: 'High',   color: 'red' },
  'response-time':    { label: 'Response Time Critical',     priority: 'High',   color: 'red' },
  'day7-checkin':     { label: 'Day 7 Check-in Missing',     priority: 'High',   color: 'red' },
  'at-risk-member':   { label: 'At-Risk Member Unactioned',  priority: 'High',   color: 'red' },
  'content-pending':  { label: 'Content Pending Approval',   priority: 'Medium', color: 'amber' },
  'quarterly-review': { label: 'Quarterly Review Due',       priority: 'Medium', color: 'amber' },
  'survey-not-sent':  { label: 'Survey Not Sent',            priority: 'Medium', color: 'amber' },
}

function daysAgo(dateStr) {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
}
function hoursAgo(dateStr) {
  return (Date.now() - new Date(dateStr).getTime()) / 3600000
}
function isoOffset(days) {
  return new Date(Date.now() - days * 86400000).toISOString()
}

export function evaluateAlerts({ clients, tasks, contentItems, atRiskMembers }) {
  const now = new Date()
  const triggers = []
  const activeClients = clients.filter(c => c.status === 'Active')

  // ── 1. Task overdue (High) ───────────────────────────────────────────────
  tasks.forEach(task => {
    const due = new Date(task.due)
    if (due < now && !['done', 'complete'].includes(task.status)) {
      const days = daysAgo(task.due)
      triggers.push({
        signature: `task-overdue-${task.id}`,
        type: 'task-overdue',
        clientId: task.clientId,
        clientName: task.client,
        title: 'Task Overdue',
        description: `"${task.title}" was due on ${task.due} and has not been completed.`,
        priority: 'High',
        createdAt: new Date(due.getTime() + 3600000).toISOString(),
        metadata: { taskId: task.id },
      })
    }
  })

  // ── 2. Monthly report not generated (High) ──────────────────────────────
  // Fires when active client has had no report in 30+ days.
  activeClients.forEach(client => {
    const days = client.lastReportDate ? daysAgo(client.lastReportDate) : 999
    if (days > 30) {
      const triggerDate = client.lastReportDate
        ? new Date(new Date(client.lastReportDate).getTime() + 30 * 86400000).toISOString()
        : isoOffset(5)
      triggers.push({
        signature: `monthly-report-${client.id}-${now.getFullYear()}-${now.getMonth()}`,
        type: 'monthly-report',
        clientId: client.id,
        clientName: client.businessName,
        title: 'Monthly Report Overdue',
        description: client.lastReportDate
          ? `No report generated since ${client.lastReportDate} — ${days} days ago.`
          : `No monthly report has ever been generated for this client.`,
        priority: 'High',
        createdAt: triggerDate,
        metadata: { daysSince: days },
      })
    }
  })

  // ── 3. Content pending approval > 48 h (Medium) ─────────────────────────
  contentItems.forEach(item => {
    if (item.status !== 'Pending Approval') return
    const hrs = hoursAgo(item.submittedAt)
    if (hrs > 48) {
      triggers.push({
        signature: `content-pending-${item.id}`,
        type: 'content-pending',
        clientId: item.clientId,
        clientName: item.clientName,
        title: 'Content Pending Approval',
        description: `"${item.title}" on ${item.platform} has been awaiting approval for ${Math.floor(hrs)} hours.`,
        priority: 'Medium',
        createdAt: new Date(new Date(item.submittedAt).getTime() + 48 * 3600000).toISOString(),
        metadata: { contentId: item.id, platform: item.platform },
      })
    }
  })

  // ── 4. Response time > 6 h (High) ───────────────────────────────────────
  activeClients.forEach(client => {
    if ((client.avgResponseTimeHours || 0) > 6) {
      triggers.push({
        signature: `response-time-${client.id}`,
        type: 'response-time',
        clientId: client.id,
        clientName: client.businessName,
        title: 'Response Time Critical',
        description: `Average enquiry response time is ${client.avgResponseTimeHours}h — exceeds the 6-hour threshold.`,
        priority: 'High',
        createdAt: isoOffset(3),
        metadata: { hours: client.avgResponseTimeHours },
      })
    }
  })

  // ── 5. Quarterly review > 75 days (Medium) ──────────────────────────────
  activeClients.forEach(client => {
    if (!client.lastQuarterlyReview) return
    const days = daysAgo(client.lastQuarterlyReview)
    if (days > 75) {
      const triggerDate = new Date(
        new Date(client.lastQuarterlyReview).getTime() + 75 * 86400000
      ).toISOString()
      triggers.push({
        signature: `quarterly-review-${client.id}`,
        type: 'quarterly-review',
        clientId: client.id,
        clientName: client.businessName,
        title: 'Quarterly Review Due',
        description: `Last quarterly review was ${days} days ago. A review is now overdue.`,
        priority: 'Medium',
        createdAt: triggerDate,
        metadata: { daysSince: days },
      })
    }
  })

  // ── 6. Day 7 check-in missing (High) ────────────────────────────────────
  atRiskMembers.forEach(member => {
    if (member.resolved || member.day7ActionLogged) return
    const days = daysAgo(member.flaggedAt)
    if (days >= 7) {
      triggers.push({
        signature: `day7-checkin-${member.id}`,
        type: 'day7-checkin',
        clientId: member.clientId,
        clientName: member.clientName,
        title: 'Day 7 Check-in Missing',
        description: `${member.memberName} was added to the at-risk tracker ${days} days ago with no day 7 check-in logged. Reason: ${member.reason}.`,
        priority: 'High',
        createdAt: new Date(new Date(member.flaggedAt).getTime() + 7 * 86400000).toISOString(),
        metadata: { memberId: member.id, memberName: member.memberName },
      })
    }
  })

  // ── 7. At-risk member not actioned within 3 days (High) ─────────────────
  atRiskMembers.forEach(member => {
    if (member.resolved || member.lastActionDate) return
    const days = daysAgo(member.flaggedAt)
    if (days > 3) {
      triggers.push({
        signature: `at-risk-${member.id}`,
        type: 'at-risk-member',
        clientId: member.clientId,
        clientName: member.clientName,
        title: 'At-Risk Member Unactioned',
        description: `${member.memberName} has been at-risk for ${days} days with no action logged. Reason: ${member.reason}.`,
        priority: 'High',
        createdAt: new Date(new Date(member.flaggedAt).getTime() + 3 * 86400000).toISOString(),
        metadata: { memberId: member.id, memberName: member.memberName, days },
      })
    }
  })

  // ── 8. Survey not sent this month (Medium) ──────────────────────────────
  // Fires after the 15th if no survey sent in current calendar month.
  if (now.getDate() >= 15) {
    const month = now.getMonth()
    const year = now.getFullYear()
    activeClients
      .filter(c => ['Growth', 'Full Service'].includes(c.package))
      .forEach(client => {
        const sentThisMonth = client.lastSurveySent
          ? (() => { const d = new Date(client.lastSurveySent); return d.getMonth() === month && d.getFullYear() === year })()
          : false
        if (!sentThisMonth) {
          triggers.push({
            signature: `survey-not-sent-${client.id}-${year}-${month}`,
            type: 'survey-not-sent',
            clientId: client.id,
            clientName: client.businessName,
            title: 'Survey Not Sent This Month',
            description: `${client.businessName} (${client.package}) hasn't had a member survey sent this month.`,
            priority: 'Medium',
            createdAt: new Date(year, month, 15).toISOString(),
            metadata: { package: client.package },
          })
        }
      })
  }

  return triggers
}

// Merges engine triggers with existing stored alerts.
// Never recreates manually-resolved alerts for the same condition.
export function mergeAlerts(existing, triggers) {
  const bySignature = {}
  existing.forEach(a => { bySignature[a.signature] = a })

  const result = [...existing]
  triggers.forEach(trigger => {
    if (!bySignature[trigger.signature]) {
      result.push({
        id: `alert-${trigger.signature}`,
        ...trigger,
        resolved: false,
        resolvedAt: null,
      })
    }
  })
  return result
}
