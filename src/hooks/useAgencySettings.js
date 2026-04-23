import { useState } from 'react'
import { DEFAULT_AGENCY } from '../config/platform-config'

const KEY = 'pulse_agency_settings_v1'

const defaults = {
  agencyName: DEFAULT_AGENCY.name,
  logoInitials: 'SI',
  contactEmail: DEFAULT_AGENCY.email,
  reportFooter: DEFAULT_AGENCY.reportFooter,
  timezone: DEFAULT_AGENCY.timezone,
  onboardingDismissed: false,
  users: [
    { id: 'user-1', name: 'Sonia Khan', email: 'admin@stratinsightdigital.com', role: 'Admin', invitedAt: '2025-01-01' },
    { id: 'user-2', name: 'Jehangir Khan', email: 'jehangir@stratinsightdigital.com', role: 'Team Member', invitedAt: '2025-01-01' },
  ],
}

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return null
}

function persist(data) {
  try { localStorage.setItem(KEY, JSON.stringify(data)) } catch {}
}

export function useAgencySettings() {
  const [settings, setSettings] = useState(() => load() ?? defaults)

  const save = (next) => { setSettings(next); persist(next) }

  const updateSettings = (changes) => save({ ...settings, ...changes })

  const inviteUser = (user) => {
    save({ ...settings, users: [...settings.users, { id: `user-${Date.now()}`, ...user, invitedAt: new Date().toISOString().slice(0, 10) }] })
  }

  const removeUser = (id) => {
    save({ ...settings, users: settings.users.filter(u => u.id !== id) })
  }

  const dismissOnboarding = () => save({ ...settings, onboardingDismissed: true })

  // Onboarding auto-detection
  const hasClients = () => {
    try { return JSON.parse(localStorage.getItem('pulse_clients_v2') || '[]').length > 0 } catch { return false }
  }
  const hasReports = () => {
    try { const d = JSON.parse(localStorage.getItem('pulse_reports_v1') || '{}'); return Object.values(d).some(arr => arr.length > 0) } catch { return false }
  }

  const onboarding = {
    agencyDetails: settings.agencyName !== DEFAULT_AGENCY.name || settings.contactEmail !== DEFAULT_AGENCY.email,
    firstClient: hasClients(),
    firstReport: hasReports(),
    teamMember: settings.users.length > 1,
    dismissed: settings.onboardingDismissed,
  }

  return { settings, updateSettings, inviteUser, removeUser, dismissOnboarding, onboarding }
}
