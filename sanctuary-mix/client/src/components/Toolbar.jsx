import { useMixerStore } from '../store/mixerStore.js'
import sundayService from '../presets/sundayService.json'
import worshipBand from '../presets/worshipBand.json'
import prayerMeeting from '../presets/prayerMeeting.json'
import podcast from '../presets/podcast.json'

const PRESETS = [sundayService, worshipBand, prayerMeeting, podcast]

export default function Toolbar({ onAIToggle }) {
  const aiEnabled = useMixerStore((s) => s.aiEnabled)
  const setAIEnabled = useMixerStore((s) => s.setAIEnabled)
  const applyPreset = useMixerStore((s) => s.applyPreset)
  const demoMode = useMixerStore((s) => s.demoMode)

  const handlePreset = (preset) => {
    applyPreset(preset)
  }

  const handleAIToggle = () => {
    const next = !aiEnabled
    setAIEnabled(next)
    if (onAIToggle) onAIToggle(next)
  }

  return (
    <div
      style={{
        height: 40,
        background: '#0d1016',
        borderBottom: '1px solid #252b38',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '0 12px',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          fontSize: 9,
          color: '#8892a4',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          fontFamily: 'Syne',
          marginRight: 4,
        }}
      >
        Presets
      </span>

      {PRESETS.map((p) => (
        <button
          key={p.id}
          onClick={() => handlePreset(p)}
          style={{
            height: 26,
            padding: '0 10px',
            fontSize: 10,
            fontFamily: 'Syne',
            fontWeight: 600,
            background: '#181c22',
            border: '1px solid #252b38',
            borderRadius: 3,
            color: '#e8eaf0',
            cursor: 'pointer',
            letterSpacing: '0.05em',
            whiteSpace: 'nowrap',
            transition: 'all 100ms',
          }}
          onMouseEnter={(e) => { e.target.style.borderColor = '#e8a23c'; e.target.style.color = '#e8a23c' }}
          onMouseLeave={(e) => { e.target.style.borderColor = '#252b38'; e.target.style.color = '#e8eaf0' }}
        >
          {p.name}
        </button>
      ))}

      <div style={{ flex: 1 }} />

      {/* Demo mode badge */}
      {demoMode && (
        <div
          style={{
            padding: '2px 8px',
            fontSize: 9,
            fontFamily: 'IBM Plex Mono',
            color: '#e8a23c',
            background: '#1a120044',
            border: '1px solid #e8a23c44',
            borderRadius: 3,
            letterSpacing: '0.05em',
          }}
        >
          DEMO MODE
        </div>
      )}

      {/* AI AutoMix toggle */}
      <button
        onClick={handleAIToggle}
        style={{
          height: 26,
          padding: '0 12px',
          fontSize: 10,
          fontFamily: 'Syne',
          fontWeight: 700,
          background: aiEnabled ? '#e8a23c' : '#181c22',
          border: `1px solid ${aiEnabled ? '#e8a23c' : '#363e52'}`,
          borderRadius: 3,
          color: aiEnabled ? '#0a0c0f' : '#8892a4',
          cursor: 'pointer',
          letterSpacing: '0.08em',
          transition: 'all 150ms',
          display: 'flex',
          alignItems: 'center',
          gap: 5,
        }}
      >
        <span style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: aiEnabled ? '#0a0c0f' : '#363e52',
          display: 'inline-block',
          flexShrink: 0,
          ...(aiEnabled ? { animation: 'ai-pulse 1.5s ease infinite' } : {}),
        }} />
        AI AutoMix
      </button>
    </div>
  )
}
