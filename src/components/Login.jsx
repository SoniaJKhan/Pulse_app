import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const { login, error, setError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 400))
    login(email, password)
    setLoading(false)
  }

  return (
    <div style={styles.root}>
      <div style={styles.card}>
        <div style={styles.brand}>
          <div style={styles.logoMark}>P</div>
          <div>
            <h1 style={styles.logoText}>Pulse</h1>
            <p style={styles.tagline}>Client Intelligence Platform</p>
          </div>
        </div>

        <div style={styles.divider} />

        <h2 style={styles.heading}>Welcome back</h2>
        <p style={styles.subheading}>Sign in to your account to continue.</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email address</label>
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError('') }}
              placeholder="you@example.com"
              style={styles.input}
              required
              autoComplete="email"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <div style={styles.passWrap}>
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
                placeholder="Enter your password"
                style={{ ...styles.input, paddingRight: '44px' }}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                style={styles.showBtn}
                tabIndex={-1}
              >
                {showPass ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? (
              <span style={styles.spinner} />
            ) : (
              'Sign in'
            )}
          </button>
        </form>
      </div>

      <p style={styles.footer}>© 2026 Strat Insight Digital · Pulse Platform</p>
    </div>
  )
}

const styles = {
  root: {
    minHeight: '100vh',
    background: 'var(--bg)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 16px',
  },
  card: {
    background: 'var(--bg-card)',
    borderRadius: '12px',
    boxShadow: 'var(--shadow-md)',
    padding: '40px',
    width: '100%',
    maxWidth: '420px',
    border: '1px solid var(--border)',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    marginBottom: '24px',
  },
  logoMark: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    background: 'var(--accent)',
    color: '#fff',
    fontFamily: "'Libre Baskerville', serif",
    fontSize: '22px',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  logoText: {
    fontSize: '22px',
    fontWeight: 700,
    color: 'var(--dark)',
    fontFamily: "'Libre Baskerville', serif",
    lineHeight: 1.1,
  },
  tagline: {
    fontSize: '12px',
    color: 'var(--mid-grey)',
    fontFamily: "'Outfit', sans-serif",
    marginTop: '2px',
    letterSpacing: '0.02em',
  },
  divider: {
    height: '1px',
    background: 'var(--border)',
    marginBottom: '28px',
  },
  heading: {
    fontSize: '20px',
    fontWeight: 700,
    color: 'var(--dark)',
    marginBottom: '6px',
  },
  subheading: {
    fontSize: '14px',
    color: 'var(--mid-grey)',
    marginBottom: '28px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: 500,
    color: 'var(--dark)',
    letterSpacing: '0.01em',
  },
  input: {
    padding: '10px 14px',
    border: '1.5px solid var(--border)',
    borderRadius: 'var(--radius)',
    fontSize: '14px',
    color: 'var(--dark)',
    background: 'var(--bg)',
    outline: 'none',
    width: '100%',
    transition: 'border-color var(--transition)',
  },
  passWrap: {
    position: 'relative',
  },
  showBtn: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: 'var(--mid-grey)',
    padding: '4px',
    display: 'flex',
    cursor: 'pointer',
  },
  error: {
    background: 'var(--red-bg)',
    color: 'var(--red)',
    border: '1px solid #FECACA',
    borderRadius: 'var(--radius)',
    padding: '10px 14px',
    fontSize: '13px',
    fontWeight: 500,
  },
  btn: {
    padding: '12px',
    background: 'var(--accent)',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--radius)',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background var(--transition)',
    marginTop: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '46px',
  },
  spinner: {
    width: '18px',
    height: '18px',
    border: '2px solid rgba(255,255,255,0.4)',
    borderTop: '2px solid #fff',
    borderRadius: '50%',
    animation: 'spin 0.6s linear infinite',
    display: 'inline-block',
  },
  footer: {
    marginTop: '28px',
    fontSize: '12px',
    color: 'var(--mid-grey)',
    textAlign: 'center',
  },
}
