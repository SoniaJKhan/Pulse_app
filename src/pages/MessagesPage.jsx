import React, { useState, useEffect, useRef } from 'react'
import { useMessages } from '../hooks/useMessages'
import { useClients } from '../hooks/useClients'
import { useAgencySettings } from '../hooks/useAgencySettings'

function timeLabel(iso) {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now - d
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffDays === 0) return d.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return d.toLocaleDateString('en-AU', { weekday: 'short' })
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
}

function fullTimeLabel(iso) {
  const d = new Date(iso)
  return d.toLocaleString('en-AU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export default function MessagesPage() {
  const { getThreadForClient, getUnreadCountForClient, getAllClientIds, sendMessage, markClientThreadRead } = useMessages()
  const { clients } = useClients()
  const { settings } = useAgencySettings()
  const [selectedClientId, setSelectedClientId] = useState(null)
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)

  const allClientIds = getAllClientIds()

  // Build client list — all clients who have messages, sorted by latest message
  const clientThreads = allClientIds.map(cid => {
    const thread = getThreadForClient(cid)
    const client = clients.find(c => c.id === cid)
    const last = thread[thread.length - 1]
    return {
      clientId: cid,
      clientName: client?.businessName || client?.name || `Client ${cid}`,
      unread: getUnreadCountForClient(cid),
      lastMessage: last?.content || '',
      lastTimestamp: last?.timestamp || '',
    }
  }).sort((a, b) => new Date(b.lastTimestamp) - new Date(a.lastTimestamp))

  // Auto-select first thread
  useEffect(() => {
    if (!selectedClientId && clientThreads.length > 0) {
      setSelectedClientId(clientThreads[0].clientId)
    }
  }, [clientThreads.length])

  // Mark read when thread is selected
  useEffect(() => {
    if (selectedClientId) markClientThreadRead(selectedClientId)
  }, [selectedClientId])

  // Scroll to bottom on thread change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [selectedClientId])

  const selectedThread = selectedClientId ? getThreadForClient(selectedClientId) : []
  const selectedClient = clients.find(c => c.id === selectedClientId)

  const agentName = settings.users.find(u => u.role === 'Admin')?.name?.split(' ')[0] || 'Agency'

  const handleSend = () => {
    if (!input.trim() || !selectedClientId) return
    sendMessage(selectedClientId, 'agency', agentName, input.trim())
    setInput('')
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }

  const totalUnread = clientThreads.reduce((sum, t) => sum + t.unread, 0)

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Messages</h1>
          <p style={s.subtitle}>
            {totalUnread > 0
              ? `${totalUnread} unread message${totalUnread > 1 ? 's' : ''} from clients`
              : 'All client conversations'}
          </p>
        </div>
      </div>

      <div style={s.container}>
        {/* Thread list sidebar */}
        <div style={s.threadList}>
          {clientThreads.length === 0 ? (
            <div style={s.emptyThreads}>No messages yet</div>
          ) : clientThreads.map(t => (
            <button
              key={t.clientId}
              style={{
                ...s.threadItem,
                background: selectedClientId === t.clientId ? 'rgba(196,135,74,0.1)' : 'transparent',
                borderLeft: selectedClientId === t.clientId ? '3px solid var(--accent)' : '3px solid transparent',
              }}
              onClick={() => setSelectedClientId(t.clientId)}
            >
              <div style={s.threadAvatar}>{t.clientName.charAt(0)}</div>
              <div style={s.threadInfo}>
                <div style={s.threadTop}>
                  <span style={{ ...s.threadName, fontWeight: t.unread > 0 ? 700 : 600 }}>{t.clientName}</span>
                  <span style={s.threadTime}>{t.lastTimestamp ? timeLabel(t.lastTimestamp) : ''}</span>
                </div>
                <div style={s.threadPreviewRow}>
                  <span style={{
                    ...s.threadPreview,
                    color: t.unread > 0 ? 'var(--dark)' : 'var(--mid-grey)',
                    fontWeight: t.unread > 0 ? 600 : 400,
                  }}>
                    {t.lastMessage.length > 55 ? t.lastMessage.slice(0, 55) + '…' : t.lastMessage}
                  </span>
                  {t.unread > 0 && <span style={s.unreadBadge}>{t.unread}</span>}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Conversation pane */}
        <div style={s.conversation}>
          {!selectedClientId ? (
            <div style={s.noSelection}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--mid-grey)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <p style={{ color: 'var(--mid-grey)', fontSize: '14px', marginTop: '12px' }}>Select a conversation</p>
            </div>
          ) : (
            <>
              {/* Thread header */}
              <div style={s.threadHeader}>
                <div style={s.threadHeaderAvatar}>{selectedClient?.businessName?.charAt(0) || '?'}</div>
                <div>
                  <div style={s.threadHeaderName}>{selectedClient?.businessName || selectedClientId}</div>
                  <div style={s.threadHeaderMeta}>{selectedClient?.businessType || 'Client'}</div>
                </div>
              </div>

              {/* Messages */}
              <div style={s.messages}>
                {selectedThread.map((msg, i) => {
                  const isAgency = msg.sender === 'agency'
                  const showDate = i === 0 || new Date(msg.timestamp).toDateString() !== new Date(selectedThread[i-1].timestamp).toDateString()
                  return (
                    <React.Fragment key={msg.id}>
                      {showDate && (
                        <div style={s.dateDivider}>
                          {new Date(msg.timestamp).toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </div>
                      )}
                      <div style={{ ...s.msgRow, justifyContent: isAgency ? 'flex-end' : 'flex-start' }}>
                        {!isAgency && <div style={s.msgAvatar}>{msg.senderName.charAt(0)}</div>}
                        <div style={{ maxWidth: '62%' }}>
                          <div style={{ ...s.msgMeta, textAlign: isAgency ? 'right' : 'left' }}>
                            {msg.senderName} · {fullTimeLabel(msg.timestamp)}
                          </div>
                          <div style={{
                            ...s.bubble,
                            background: isAgency ? 'var(--green)' : 'var(--bg-card)',
                            color: isAgency ? '#fff' : 'var(--dark)',
                            border: isAgency ? 'none' : '1px solid var(--border)',
                            borderRadius: isAgency ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                          }}>
                            {msg.content}
                          </div>
                        </div>
                        {isAgency && <div style={{ ...s.msgAvatar, background: 'var(--green)' }}>{msg.senderName.charAt(0)}</div>}
                      </div>
                    </React.Fragment>
                  )
                })}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div style={s.inputArea}>
                <textarea
                  style={s.textarea}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder={`Reply to ${selectedClient?.businessName || 'client'}…`}
                  rows={2}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
                  }}
                />
                <button
                  style={{ ...s.sendBtn, opacity: input.trim() ? 1 : 0.45 }}
                  onClick={handleSend}
                  disabled={!input.trim()}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                  Send
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const s = {
  page: { padding: '32px', maxWidth: '1200px', height: '100%' },
  header: { marginBottom: '24px' },
  title: { fontSize: '28px', fontWeight: 700, color: 'var(--dark)', marginBottom: '4px' },
  subtitle: { fontSize: '14px', color: 'var(--mid-grey)' },

  container: {
    display: 'grid',
    gridTemplateColumns: '280px 1fr',
    gap: '0',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-card)',
    height: 'calc(100vh - 200px)',
    minHeight: '500px',
  },

  threadList: {
    borderRight: '1px solid var(--border)',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
  },
  emptyThreads: { padding: '24px', color: 'var(--mid-grey)', fontSize: '13px', textAlign: 'center' },
  threadItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    padding: '14px 16px',
    border: 'none',
    borderBottom: '1px solid var(--border)',
    cursor: 'pointer',
    textAlign: 'left',
    fontFamily: "'Outfit', sans-serif",
    transition: 'background 0.15s',
    width: '100%',
  },
  threadAvatar: {
    width: '36px', height: '36px', borderRadius: '50%',
    background: 'rgba(196,135,74,0.15)', color: 'var(--accent)',
    fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center',
    justifyContent: 'center', flexShrink: 0,
  },
  threadInfo: { flex: 1, minWidth: 0 },
  threadTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px', marginBottom: '3px' },
  threadName: { fontSize: '13px', color: 'var(--dark)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  threadTime: { fontSize: '11px', color: 'var(--mid-grey)', flexShrink: 0 },
  threadPreviewRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' },
  threadPreview: { fontSize: '12px', lineHeight: 1.4, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  unreadBadge: {
    background: 'var(--red)', color: '#fff', fontSize: '10px', fontWeight: 700,
    padding: '1px 6px', borderRadius: '10px', flexShrink: 0,
  },

  conversation: { display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  noSelection: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },

  threadHeader: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '14px 20px',
    borderBottom: '1px solid var(--border)',
    background: 'var(--bg)',
    flexShrink: 0,
  },
  threadHeaderAvatar: {
    width: '38px', height: '38px', borderRadius: '50%',
    background: 'rgba(196,135,74,0.15)', color: 'var(--accent)',
    fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  threadHeaderName: { fontSize: '15px', fontWeight: 700, color: 'var(--dark)' },
  threadHeaderMeta: { fontSize: '12px', color: 'var(--mid-grey)' },

  messages: {
    flex: 1, overflowY: 'auto', padding: '20px',
    display: 'flex', flexDirection: 'column', gap: '8px',
  },
  dateDivider: {
    textAlign: 'center', fontSize: '11px', color: 'var(--mid-grey)',
    padding: '8px 0', fontWeight: 600, letterSpacing: '0.04em',
  },
  msgRow: { display: 'flex', alignItems: 'flex-end', gap: '8px' },
  msgAvatar: {
    width: '28px', height: '28px', borderRadius: '50%',
    background: 'rgba(196,135,74,0.15)', color: 'var(--accent)',
    fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center',
    justifyContent: 'center', flexShrink: 0,
  },
  msgMeta: { fontSize: '10.5px', color: 'var(--mid-grey)', marginBottom: '3px', fontWeight: 500 },
  bubble: {
    padding: '10px 14px', fontSize: '13.5px', lineHeight: 1.55,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },

  inputArea: {
    display: 'flex', alignItems: 'flex-end', gap: '10px',
    padding: '14px 20px',
    borderTop: '1px solid var(--border)',
    background: 'var(--bg)',
    flexShrink: 0,
  },
  textarea: {
    flex: 1, padding: '10px 14px', border: '1.5px solid var(--border)',
    borderRadius: '10px', fontSize: '13.5px', color: 'var(--dark)',
    background: 'var(--bg-card)', outline: 'none',
    fontFamily: "'Outfit', sans-serif", resize: 'none', lineHeight: 1.5,
  },
  sendBtn: {
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '10px 18px', background: 'var(--green)', color: '#fff',
    border: 'none', borderRadius: '10px', fontSize: '13.5px', fontWeight: 600,
    cursor: 'pointer', fontFamily: "'Outfit', sans-serif", flexShrink: 0,
  },
}
