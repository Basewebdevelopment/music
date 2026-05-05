import { useState } from 'react'
import { useMixerStore } from '../store/mixerStore.js'
import VUMeter from './VUMeter.jsx'
import AILog from './AILog.jsx'

function ProcessingSlider({ label, value, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 9, color: '#8892a4', fontFamily: 'Syne', letterSpacing: '0.08em' }}>{label}</span>
        <span style={{ fontSize: 9, color: '#e8a23c', fontFamily: 'IBM Plex Mono' }}>{value}%</span>
      </div>
      <div style={{ position: 'relative', height: 4, background: '#1a1f28', borderRadius: 2 }}>
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: `${value}%`,
            background: 'linear-gradient(to right, #4fc3f7, #e8a23c)',
            borderRadius: 2,
          }}
        />
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{
            position: 'absolute',
            inset: '-6px 0',
            opacity: 0,
            cursor: 'pointer',
            width: '100%',
            margin: 0,
          }}
        />
      </div>
    </div>
  )
}

export default function RightPanel({ onConnectDevice }) {
  const master = useMixerStore((s) => s.master)
  const processing = useMixerStore((s) => s.processing)
  const updateProcessing = useMixerStore((s) => s.updateProcessing)
  const availableDevices = useMixerStore((s) => s.availableDevices)
  const connectedDevice = useMixerStore((s) => s.connectedDevice)
  const demoMode = useMixerStore((s) => s.demoMode)
  const [activeTab, setActiveTab] = useState('device')

  const tabs = ['device', 'processing', 'ai log']

  return (
    <div
      style={{
        width: 220,
        flexShrink: 0,
        background: '#181c22',
        borderLeft: '1px solid #252b38',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Tab bar */}
      <div style={{ display: 'flex', borderBottom: '1px solid #252b38' }}>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              height: 30,
              fontSize: 8,
              fontFamily: 'Syne',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              background: activeTab === tab ? '#111418' : 'transparent',
              border: 'none',
              borderBottom: activeTab === tab ? '2px solid #e8a23c' : '2px solid transparent',
              color: activeTab === tab ? '#e8a23c' : '#8892a4',
              cursor: 'pointer',
              transition: 'all 100ms',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: 10 }}>
        {/* Output meters always visible */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 9, color: '#8892a4', fontFamily: 'Syne', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
            Output Level
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <span style={{ fontSize: 8, color: '#8892a4', fontFamily: 'IBM Plex Mono' }}>L</span>
              <VUMeter level={master.vuLeft} vertical width={12} height={60} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <span style={{ fontSize: 8, color: '#8892a4', fontFamily: 'IBM Plex Mono' }}>R</span>
              <VUMeter level={master.vuRight} vertical width={12} height={60} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 8, fontFamily: 'IBM Plex Mono', color: master.clip ? '#ef5350' : '#363e52', marginBottom: 3 }}>
                {master.clip ? '⚠ CLIP' : 'NOMINAL'}
              </div>
              <div style={{ fontSize: 9, color: '#e8a23c', fontFamily: 'IBM Plex Mono' }}>
                {(master.vuLeft * 100).toFixed(0)}%
              </div>
            </div>
          </div>
        </div>

        <div style={{ height: 1, background: '#252b38', marginBottom: 10 }} />

        {/* Device tab */}
        {activeTab === 'device' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div>
              <div style={{ fontSize: 9, color: '#8892a4', fontFamily: 'Syne', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
                Audio Device
              </div>
              <button
                onClick={onConnectDevice}
                style={{
                  width: '100%',
                  height: 32,
                  fontSize: 11,
                  fontFamily: 'Syne',
                  fontWeight: 700,
                  background: connectedDevice ? '#0d1a0d' : 'linear-gradient(135deg, #1a2030, #0d1626)',
                  border: `1px solid ${connectedDevice ? '#81c784' : '#4fc3f7'}`,
                  borderRadius: 4,
                  color: connectedDevice ? '#81c784' : '#4fc3f7',
                  cursor: 'pointer',
                  letterSpacing: '0.05em',
                  transition: 'all 150ms',
                }}
              >
                {connectedDevice ? '● Connected' : '+ Connect Device'}
              </button>
            </div>

            {connectedDevice && (
              <div
                style={{
                  padding: '8px',
                  background: '#0d1016',
                  border: '1px solid #252b38',
                  borderRadius: 4,
                }}
              >
                <div style={{ fontSize: 8, color: '#8892a4', fontFamily: 'IBM Plex Mono', marginBottom: 3 }}>ACTIVE DEVICE</div>
                <div style={{ fontSize: 10, color: '#e8eaf0', fontFamily: 'Syne', fontWeight: 600 }}>
                  {connectedDevice.label || 'USB Audio Device'}
                </div>
              </div>
            )}

            {availableDevices.length > 0 && (
              <div>
                <div style={{ fontSize: 9, color: '#8892a4', fontFamily: 'Syne', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
                  Available Inputs ({availableDevices.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {availableDevices.map((d) => (
                    <div
                      key={d.deviceId}
                      style={{
                        fontSize: 9,
                        color: '#8892a4',
                        fontFamily: 'IBM Plex Mono',
                        padding: '4px 6px',
                        background: '#0d1016',
                        borderRadius: 3,
                        border: '1px solid #1a1f28',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {d.label || `Input ${d.deviceId.slice(0, 8)}`}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ padding: '10px', background: '#0d1016', borderRadius: 4, border: '1px solid #1a1f28' }}>
              <div style={{ fontSize: 9, color: '#e8a23c', fontFamily: 'Syne', fontWeight: 700, marginBottom: 6 }}>
                VMix Setup
              </div>
              <ol style={{ fontSize: 9, color: '#8892a4', fontFamily: 'IBM Plex Mono', paddingLeft: 14, display: 'flex', flexDirection: 'column', gap: 4, lineHeight: 1.5 }}>
                <li>Install VB-Cable (Win) or BlackHole (Mac)</li>
                <li>Set output → VB-Cable Input</li>
                <li>In VMix → VB-Cable Output</li>
              </ol>
            </div>
          </div>
        )}

        {/* Processing tab */}
        {activeTab === 'processing' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 9, color: '#8892a4', fontFamily: 'Syne', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>
              Global Processing
            </div>
            {Object.entries({
              noiseGate: 'Noise Gate',
              compressor: 'Compressor',
              reverb: 'Reverb',
              clarityEQ: 'Clarity EQ',
              deEsser: 'De-esser',
            }).map(([key, label]) => (
              <ProcessingSlider
                key={key}
                label={label}
                value={processing[key]}
                onChange={(v) => updateProcessing(key, v)}
              />
            ))}
          </div>
        )}

        {/* AI Log tab */}
        {activeTab === 'ai log' && (
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <AILog />
          </div>
        )}
      </div>
    </div>
  )
}
