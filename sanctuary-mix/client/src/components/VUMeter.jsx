import { useMemo } from 'react'

const SEGMENTS = 20

export default function VUMeter({ level = 0, vertical = true, width = 8, height = 80, peakHold = 0 }) {
  const segments = useMemo(() => {
    return Array.from({ length: SEGMENTS }, (_, i) => {
      const threshold = i / SEGMENTS
      const active = level >= threshold
      let color
      if (threshold >= 0.9) color = active ? '#ef5350' : '#1a1010'
      else if (threshold >= 0.75) color = active ? '#e8a23c' : '#1a1500'
      else color = active ? '#81c784' : '#0e1a0e'
      return { color, active }
    })
  }, [level])

  const peakSegment = Math.min(Math.floor(peakHold * SEGMENTS), SEGMENTS - 1)

  if (vertical) {
    const segH = (height - SEGMENTS + 1) / SEGMENTS
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column-reverse',
          gap: '1px',
          width,
          height,
        }}
      >
        {segments.map((seg, i) => (
          <div
            key={i}
            style={{
              height: segH,
              width: '100%',
              background: seg.color,
              borderRadius: '1px',
              transition: 'background 40ms',
              boxShadow: seg.active && i >= 15 ? '0 0 3px ' + seg.color : 'none',
            }}
          />
        ))}
      </div>
    )
  }

  // Horizontal
  const segW = (width - SEGMENTS + 1) / SEGMENTS
  return (
    <div style={{ display: 'flex', flexDirection: 'row', gap: '1px', height, width }}>
      {segments.map((seg, i) => (
        <div
          key={i}
          style={{
            width: segW,
            height: '100%',
            background: seg.color,
            borderRadius: '1px',
            transition: 'background 40ms',
          }}
        />
      ))}
    </div>
  )
}
