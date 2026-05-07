import { useState, useCallback } from 'react'
import { useMixerStore } from '../store/mixerStore.js'
import Fader from './Fader.jsx'
import Knob from './Knob.jsx'
import VUMeter from './VUMeter.jsx'

const TYPE_COLORS = {
  Mic: '#4fc3f7',
  Music: '#e8a23c',
  Backing: '#81c784',
}

const TYPE_BG = {
  Mic: '#0d1620',
  Music: '#1a1200',
  Backing: '#0d1a0d',
}

export default function Channel({ channelId }) {
  const channel = useMixerStore((s) => s.channels.find((c) => c.id === channelId))
  const updateChannel = useMixerStore((s) => s.updateChannel)
  const updateChannelEQ = useMixerStore((s) => s.updateChannelEQ)
  const soloChannel = useMixerStore((s) => s.soloChannel)

  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState('')

  const accentColor = TYPE_COLORS[channel.type] || '#8892a4'

  const handleNameClick = useCallback(() => {
    setNameInput(channel.name)
    setEditingName(true)
  }, [channel.name])

  const commitName = useCallback(() => {
    if (nameInput.trim()) updateChannel(channelId, { name: nameInput.trim() })
    setEditingName(false)
  }, [nameInput, channelId, updateChannel])

  const handleTypeClick = useCallback(() => {
    const types = ['Mic', 'Music', 'Backing']
    const idx = types.indexOf(channel.type)
    updateChannel(channelId, { type: types[(idx + 1) % types.length] })
  }, [channel.type, channelId, updateChannel])

  return (
    <div
      style={{
        width: 64,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: '#111418',
        border: `1px solid #252b38`,
        borderTop: `2px solid ${accentColor}`,
        borderRadius: '0 0 4px 4px',
        padding: '6px 4px 8px',
        gap: 4,
        position: 'relative',
        opacity: channel.muted ? 0.55 : 1,
        transition: 'opacity 150ms',
      }}
    >
      {/* AI badge */}
      {channel.aiManaged && (
        <div
          className="ai-pulse"
          style={{
            position: 'absolute',
            top: 4,
            right: 4,
            fontSize: 7,
            color: '#e8a23c',
            fontFamily: 'IBM Plex Mono',
            letterSpacing: '0.05em',
          }}
        >
          AI
        </div>
      )}

      {/* Channel number */}
      <div
        className="font-mono"
        style={{ fontSize: 9, color: '#8892a4', letterSpacing: '0.05em' }}
      >
        CH{String(channelId).padStart(2, '0')}
      </div>

      {/* Channel name */}
      {editingName ? (
        <input
          autoFocus
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          onBlur={commitName}
          onKeyDown={(e) => { if (e.key === 'Enter') commitName(); if (e.key === 'Escape') setEditingName(false) }}
          style={{
            width: '100%',
            background: '#0a0c0f',
            border: '1px solid #4fc3f7',
            borderRadius: 2,
            color: '#e8eaf0',
            fontSize: 9,
            padding: '1px 3px',
            fontFamily: 'Syne',
            textAlign: 'center',
            outline: 'none',
          }}
        />
      ) : (
        <div
          onClick={handleNameClick}
          title="Click to rename"
          style={{
            fontSize: 9,
            color: '#e8eaf0',
            cursor: 'text',
            width: '100%',
            textAlign: 'center',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontFamily: 'Syne',
            fontWeight: 600,
          }}
        >
          {channel.name}
        </div>
      )}

      {/* Type badge */}
      <div
        onClick={handleTypeClick}
        title="Click to change type"
        style={{
          fontSize: 8,
          color: accentColor,
          background: TYPE_BG[channel.type] || '#111',
          border: `1px solid ${accentColor}33`,
          borderRadius: 2,
          padding: '1px 4px',
          cursor: 'pointer',
          letterSpacing: '0.05em',
          fontFamily: 'Syne',
          fontWeight: 600,
          textTransform: 'uppercase',
        }}
      >
        {channel.type}
      </div>

      {/* Gain Trim knob */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
        <div style={{ fontSize: 7, color: '#e8a23c', fontFamily: 'IBM Plex Mono', letterSpacing: '0.05em' }}>
          GAIN
        </div>
        <Knob
          label={`${channel.trim >= 0 ? '+' : ''}${channel.trim}dB`}
          value={channel.trim ?? 0}
          min={-20}
          max={40}
          size={22}
          onChange={(v) => updateChannel(channelId, { trim: Math.round(v) })}
        />
      </div>

      {/* EQ Knobs */}
      <div style={{ display: 'flex', gap: 2 }}>
        <Knob
          label="HI"
          value={channel.eq.hi}
          min={-15}
          max={15}
          size={16}
          onChange={(v) => updateChannelEQ(channelId, 'hi', v)}
        />
        <Knob
          label="MD"
          value={channel.eq.mid}
          min={-15}
          max={15}
          size={16}
          onChange={(v) => updateChannelEQ(channelId, 'mid', v)}
        />
        <Knob
          label="LO"
          value={channel.eq.lo}
          min={-15}
          max={15}
          size={16}
          onChange={(v) => updateChannelEQ(channelId, 'lo', v)}
        />
      </div>

      {/* VU + Fader row */}
      <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', marginTop: 2 }}>
        <VUMeter level={channel.vuLevel} vertical width={6} height={80} />
        <Fader
          value={channel.gain}
          onChange={(v) => updateChannel(channelId, { gain: v })}
        />
      </div>

      {/* Mute / Solo */}
      <div style={{ display: 'flex', gap: 4, marginTop: 2 }}>
        <button
          onClick={() => updateChannel(channelId, { muted: !channel.muted })}
          style={{
            width: 24,
            height: 18,
            fontSize: 9,
            fontWeight: 700,
            fontFamily: 'Syne',
            border: 'none',
            borderRadius: 2,
            cursor: 'pointer',
            background: channel.muted ? '#ef5350' : '#1a1f28',
            color: channel.muted ? '#fff' : '#8892a4',
            transition: 'all 100ms',
            letterSpacing: '0.05em',
          }}
        >
          M
        </button>
        <button
          onClick={() => soloChannel(channelId)}
          style={{
            width: 24,
            height: 18,
            fontSize: 9,
            fontWeight: 700,
            fontFamily: 'Syne',
            border: 'none',
            borderRadius: 2,
            cursor: 'pointer',
            background: channel.solo ? '#4fc3f7' : '#1a1f28',
            color: channel.solo ? '#0a0c0f' : '#8892a4',
            transition: 'all 100ms',
            letterSpacing: '0.05em',
          }}
        >
          S
        </button>
      </div>
    </div>
  )
}
