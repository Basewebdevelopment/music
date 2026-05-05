import { useRef, useEffect } from 'react'
import { useMixerStore } from '../store/mixerStore.js'

const TYPE_COLORS = {
  info: '#4fc3f7',
  action: '#81c784',
  warn: '#e8a23c',
  error: '#ef5350',
}

export default function AILog() {
  const aiLog = useMixerStore((s) => s.aiLog)
  const clearAILog = useMixerStore((s) => s.clearAILog)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [aiLog.length])

  const fmt = (iso) => {
    const d = new Date(iso)
    return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: 10, color: '#8892a4', fontFamily: 'Syne', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          AI Event Log
        </span>
        {aiLog.length > 0 && (
          <button
            onClick={clearAILog}
            style={{ fontSize: 9, color: '#8892a4', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Syne' }}
          >
            Clear
          </button>
        )}
      </div>

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          fontFamily: 'IBM Plex Mono',
        }}
      >
        {aiLog.length === 0 && (
          <div style={{ fontSize: 10, color: '#363e52', padding: '8px 0', textAlign: 'center', fontFamily: 'IBM Plex Mono' }}>
            — no events —
          </div>
        )}
        {[...aiLog].reverse().map((entry) => (
          <div
            key={entry.id}
            style={{
              display: 'flex',
              gap: 6,
              fontSize: 10,
              lineHeight: 1.4,
              padding: '2px 4px',
              borderRadius: 2,
              background: '#0d1016',
            }}
          >
            <span style={{ color: '#363e52', flexShrink: 0 }}>{fmt(entry.timestamp)}</span>
            <span style={{ color: TYPE_COLORS[entry.type] || '#e8eaf0', wordBreak: 'break-word' }}>
              {entry.message}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
