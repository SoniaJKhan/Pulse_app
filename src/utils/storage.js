export const cleanupLegacyKeys = () => {
  const legacyKeys = [
    'pulse_client_intelligence',
    'pulse_client',
    'pulse_brand',
    'pulse_brand2',
    'pulse_brand_kit_c2',
    'pulse_content_audit',
    'pulse_clients',
  ]
  legacyKeys.forEach(key => localStorage.removeItem(key))
}

export const safeGet = (key, fallback = null) => {
  try {
    const val = localStorage.getItem(key)
    return val ? JSON.parse(val) : fallback
  } catch {
    return fallback
  }
}

export const safeSet = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (e) {
    console.error('Storage failed:', key, e)
    return false
  }
}
