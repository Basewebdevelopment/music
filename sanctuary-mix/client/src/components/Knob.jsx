import { useRef, useCallback } from 'react'

/**
 * Knob — drag up/down to adjust value. Double-click to reset.
 * value: current value (number)
 * min/max: range
 * onChange: (newValue) => void
 * label: string
 * size: number (px)
 */
export default function Knob({ value = 0, min = -15, max = 15, onChange, label, size = 36 }) {
  const dragRef = useRef(null)

  const startY = useRef(0)
  const startValue = useRef(0)

  const handleMouseDown = useCallback((e) => {
    e.preventDefault()
    startY.current = e.clientY
    startValue.current = value

    const onMove = (me) => {
      const delta = (startY.current - me.clientY) * 0.3 // sensitivity
      const range = max - min
      const newVal = Math.max(min, Math.min(max, startValue.current + (delta / 100) * range))
      onChange(Math.round(newVal * 10) / 10)
    }

    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [value, min, max, onChange])

  const handleDoubleClick = useCallback(() => {
    onChange(0)
  }, [onChange])

  // Map value to rotation: -150deg to +150deg
  const normalized = (value - min) / (max - min)
  const rotation = -150 + normalized * 300

  const color = value > 0 ? '#e8a23c' : value < 0 ? '#4fc3f7' : '#8892a4'
  const strokeColor = Math.abs(value) > 10 ? '#ef5350' : color

  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - 4
  const trackStart = -150 * (Math.PI / 180)
  const trackEnd = 150 * (Math.PI / 180)

  // Arc path helper
  const polarToCart = (angle, radius) => ({
    x: cx + radius * Math.cos(angle - Math.PI / 2),
    y: cy + radius * Math.sin(angle - Math.PI / 2),
  })

  const startPt = polarToCart(trackStart, r)
  const endPt = polarToCart(trackEnd, r)

  const valuePt = polarToCart((rotation - 90) * (Math.PI / 180), r)
  const zeroPt = polarToCart(0, r)

  const valueAngleRad = (rotation - 90) * (Math.PI / 180)
  const zeroAngleRad = 0

  return (
    <div
      className="flex flex-col items-center gap-0.5 select-none"
      title={`${label}: ${value > 0 ? '+' : ''}${value}dB — drag to adjust, double-click to reset`}
    >
      <svg
        width={size}
        height={size}
        ref={dragRef}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        style={{ cursor: 'ns-resize', overflow: 'visible' }}
      >
        {/* Background track */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="#1a1f28"
          stroke="#252b38"
          strokeWidth="1"
        />

        {/* Arc track background */}
        <path
          d={`M ${startPt.x} ${startPt.y} A ${r} ${r} 0 1 1 ${endPt.x} ${endPt.y}`}
          fill="none"
          stroke="#252b38"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Value arc */}
        {value !== 0 && (() => {
          const fromAngle = value > 0 ? zeroAngleRad : valueAngleRad
          const toAngle = value > 0 ? valueAngleRad : zeroAngleRad
          const from = polarToCart(fromAngle, r)
          const to = polarToCart(toAngle, r)
          const diff = Math.abs(rotation)
          const largeArc = diff > 180 ? 1 : 0
          return (
            <path
              d={`M ${from.x} ${from.y} A ${r} ${r} 0 ${largeArc} ${value > 0 ? 1 : 0} ${to.x} ${to.y}`}
              fill="none"
              stroke={strokeColor}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          )
        })()}

        {/* Pointer dot */}
        <circle
          cx={cx + (r - 4) * Math.cos((rotation - 90) * (Math.PI / 180))}
          cy={cy + (r - 4) * Math.sin((rotation - 90) * (Math.PI / 180))}
          r="2.5"
          fill={value === 0 ? '#8892a4' : strokeColor}
        />

        {/* Center dot */}
        <circle cx={cx} cy={cy} r="3" fill="#252b38" />
      </svg>

      <span
        className="font-mono text-center leading-none"
        style={{ fontSize: '9px', color: value === 0 ? '#8892a4' : strokeColor, width: size }}
      >
        {value > 0 ? '+' : ''}{value}
      </span>
      <span
        className="font-sans text-center leading-none"
        style={{ fontSize: '9px', color: '#8892a4', width: size }}
      >
        {label}
      </span>
    </div>
  )
}
