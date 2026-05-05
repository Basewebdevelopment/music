import { useState, useEffect } from 'react'
import { useMixerStore } from '../store/mixerStore.js'
import Fader from './Fader.jsx'
import VUMeter from './VUMeter.jsx'

export default function MasterBus() {
  const master = useMixerStore((s) => s.master)
  const updateMaster = useMixerStore((s) => s.updateMaster)
  const [peakHoldL, setPeakHoldL] = useState(0)
  const [peakHoldR, setPeakHoldR] = useState(0)
  const [clipFlash, setClipFlash] = useState(false)

  // Peak hold decay
  useEffect(() => {
    const t = setTimeout(() => {
      setPeakHoldL((p) => Math.max(0, p - 0.02))
      setPeakHoldR((p) => Math.max(0, p - 0.02))
    }, 2000)
    return () => clearTimeout(t)
  }, [master.vuLeft, master.vuRight])

  useEffect(() => {
    if (master.vuLeft > peakHoldL) setPeakHoldL(master.vuLeft)
    if (master.vuRight > peakHoldR) setPeakHoldR(master.vuRight)
  }, [master.vuLeft, master.vuRight])

  useEffect(() => {
    if (master.clip) {
      setClipFlash(true)
      const t = setTimeout(() => setClipFlash(false), 1500)
      return () => clearTimeout(t)
    }
  }, [master.clip])

  return (
    <div
      style={{
        width: 80,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: '#111418',
        border: '1px solid #252b38',
        borderTop: '2px solid #e8a23c',
        borderRadius: '0 0 4px 4px',
        padding: '6px 6px 8px',
        gap: 4,
        position: 'relative',
      }}
    >
      {/* Clip indicator */}
      {clipFlash && (
        <div
          className="clip-flash"
          style={{
            position: 'absolute',
            top: 4,
            right: 4,
            fontSize: 8,
            color: '#ef5350',
            fontFamily: 'IBM Plex Mono',
            fontWeight: 600,
            letterSpacing: '0.05em',
          }}
        >
          CLIP
        </div>
      )}

      <div style={{ fontSize: 9, color: '#8892a4', fontFamily: 'IBM Plex Mono' }}>MASTER</div>
      <div
        style={{
          fontSize: 10,
          color: '#e8a23c',
          fontFamily: 'Syne',
          fontWeight: 800,
          letterSpacing: '0.12em',
        }}
      >
        OUT
      </div>

      {/* Stereo VU meters */}
      <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <span style={{ fontSize: 8, color: '#8892a4', fontFamily: 'IBM Plex Mono' }}>L</span>
          <VUMeter level={master.vuLeft} vertical width={8} height={90} peakHold={peakHoldL} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <span style={{ fontSize: 8, color: '#8892a4', fontFamily: 'IBM Plex Mono' }}>R</span>
          <VUMeter level={master.vuRight} vertical width={8} height={90} peakHold={peakHoldR} />
        </div>
        <Fader
          value={master.gain}
          onChange={(v) => updateMaster({ gain: v })}
        />
      </div>

      {/* Peak indicator */}
      <div
        style={{
          width: '100%',
          height: 4,
          background: master.peak ? '#e8a23c' : '#1a1f28',
          borderRadius: 2,
          transition: 'background 200ms',
        }}
      />

      <div style={{ fontSize: 8, color: master.peak ? '#e8a23c' : '#363e52', fontFamily: 'IBM Plex Mono', letterSpacing: '0.05em' }}>
        {master.peak ? 'PEAK' : 'SAFE'}
      </div>
    </div>
  )
}
