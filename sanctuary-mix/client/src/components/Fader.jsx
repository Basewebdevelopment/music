import { useRef, useCallback, useEffect, useState } from 'react'

// Convert 0-100 gain % to approximate dB string
function gainToDb(gain) {
  if (gain === 0) return '-∞'
  const db = 20 * Math.log10(gain / 100)
  return (db >= 0 ? '+' : '') + db.toFixed(1)
}

export default function Fader({ value = 75, onChange, disabled = false }) {
  const trackRef = useRef(null)
  const dragging = useRef(false)
  const [localVal, setLocalVal] = useState(value)

  useEffect(() => { setLocalVal(value) }, [value])

  const getNewValue = useCallback((clientY) => {
    const rect = trackRef.current.getBoundingClientRect()
    const ratio = 1 - Math.max(0, Math.min(1, (clientY - rect.top) / rect.height))
    return Math.round(ratio * 100)
  }, [])

  const handleMouseDown = useCallback((e) => {
    if (disabled) return
    e.preventDefault()
    dragging.current = true

    const onMove = (me) => {
      if (!dragging.current) return
      const v = getNewValue(me.clientY)
      setLocalVal(v)
      onChange(v)
    }
    const onUp = () => {
      dragging.current = false
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [disabled, getNewValue, onChange])

  const handleTrackClick = useCallback((e) => {
    if (disabled) return
    const v = getNewValue(e.clientY)
    setLocalVal(v)
    onChange(v)
  }, [disabled, getNewValue, onChange])

  const thumbPos = 100 - localVal // % from top

  return (
    <div className="flex flex-col items-center gap-1 select-none" style={{ width: 24 }}>
      {/* dB readout */}
      <span
        className="font-mono"
        style={{ fontSize: 9, color: localVal === 0 ? '#8892a4' : '#e8a23c', letterSpacing: '-0.5px' }}
      >
        {gainToDb(localVal)}
      </span>

      {/* Track */}
      <div
        ref={trackRef}
        onClick={handleTrackClick}
        style={{
          width: 8,
          height: 80,
          background: 'linear-gradient(to top, #0d1a0d 0%, #1a2030 40%, #1a1010 100%)',
          borderRadius: 4,
          border: '1px solid #252b38',
          position: 'relative',
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      >
        {/* Unity mark at ~75% */}
        <div style={{
          position: 'absolute',
          left: -3,
          top: '25%',
          width: 14,
          height: 1,
          background: '#363e52',
        }} />

        {/* Fill */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 1,
          right: 1,
          height: `${localVal}%`,
          background: localVal > 90
            ? 'linear-gradient(to top, #ef535033, #ef535066)'
            : 'linear-gradient(to top, #4fc3f722, #4fc3f744)',
          borderRadius: 3,
          transition: dragging.current ? 'none' : 'height 80ms',
        }} />

        {/* Thumb */}
        <div
          onMouseDown={handleMouseDown}
          style={{
            position: 'absolute',
            left: '50%',
            top: `${thumbPos}%`,
            transform: 'translate(-50%, -50%)',
            width: 20,
            height: 10,
            background: disabled ? '#252b38' : 'linear-gradient(135deg, #2a3040, #1a2030)',
            border: `1px solid ${disabled ? '#363e52' : '#4fc3f7'}`,
            borderRadius: 3,
            cursor: disabled ? 'not-allowed' : 'ns-resize',
            boxShadow: disabled ? 'none' : '0 1px 4px #00000088',
            zIndex: 2,
          }}
        />
      </div>

      <span className="font-mono" style={{ fontSize: 8, color: '#8892a4' }}>
        {localVal}%
      </span>
    </div>
  )
}
