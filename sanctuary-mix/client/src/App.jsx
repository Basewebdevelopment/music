import { useEffect, useRef, useCallback } from 'react'
import { useMixerStore } from './store/mixerStore.js'
import Channel from './components/Channel.jsx'
import MasterBus from './components/MasterBus.jsx'
import Toolbar from './components/Toolbar.jsx'
import RightPanel from './components/RightPanel.jsx'
import { audioEngine } from './audio/AudioEngine.js'
import { AIAutoMix } from './audio/AIAutoMix.js'

export default function App() {
  const channels = useMixerStore((s) => s.channels)
  const demoMode = useMixerStore((s) => s.demoMode)
  const setDemoMode = useMixerStore((s) => s.setDemoMode)
  const setConnectedDevice = useMixerStore((s) => s.setConnectedDevice)
  const setInputChannelCount = useMixerStore((s) => s.setInputChannelCount)
  const setAvailableDevices = useMixerStore((s) => s.setAvailableDevices)
  const setAvailableOutputDevices = useMixerStore((s) => s.setAvailableOutputDevices)
  const setOutputDevice = useMixerStore((s) => s.setOutputDevice)
  const setChannelVU = useMixerStore((s) => s.setChannelVU)
  const setMasterVU = useMixerStore((s) => s.setMasterVU)
  const updateChannel = useMixerStore((s) => s.updateChannel)
  const addAILog = useMixerStore((s) => s.addAILog)

  const demoIntervalRef = useRef(null)
  const aiRef = useRef(null)
  const lastChannelsRef = useRef(channels)

  useEffect(() => { lastChannelsRef.current = channels }, [channels])

  // Demo mode: simulate VU meters
  useEffect(() => {
    if (!demoMode) {
      if (demoIntervalRef.current) clearInterval(demoIntervalRef.current)
      return
    }

    let levels = channels.map(() => Math.random() * 0.3)

    demoIntervalRef.current = setInterval(() => {
      const chs = lastChannelsRef.current
      levels = levels.map((l, i) => {
        const ch = chs[i]
        if (!ch || ch.muted || ch.gain === 0) return 0
        const target = (ch.gain / 100) * (0.3 + Math.random() * 0.5)
        return l * 0.6 + target * 0.4 + (Math.random() - 0.5) * 0.05
      })
      levels.forEach((l, i) => setChannelVU(i + 1, Math.max(0, Math.min(1, l))))

      const masterL = Math.max(...levels) * (0.9 + Math.random() * 0.15)
      const masterR = Math.max(...levels) * (0.85 + Math.random() * 0.15)
      setMasterVU(Math.min(1, masterL), Math.min(1, masterR))
    }, 60)

    return () => clearInterval(demoIntervalRef.current)
  }, [demoMode])

  // Wire audio engine callbacks when connected
  useEffect(() => {
    if (demoMode) return
    audioEngine.onMasterVU = (l, r) => setMasterVU(l, r)
    audioEngine.onVUUpdate = (id, level) => setChannelVU(id, level)
  }, [demoMode])

  const handleConnectDevice = useCallback(async (preferredDeviceId = null) => {
    try {
      await audioEngine.init()
      const devices = await navigator.mediaDevices.enumerateDevices()
      const inputs = devices.filter((d) => d.kind === 'audioinput')
      const outputs = devices.filter((d) => d.kind === 'audiooutput')
      setAvailableDevices(inputs)
      setAvailableOutputDevices(outputs)

      if (inputs.length === 0) {
        setDemoMode(true)
        return
      }

      // Prefer USB mixer; fallback to default
      const usbMixer = inputs.find((d) =>
        d.label.toLowerCase().includes('usb') ||
        d.label.toLowerCase().includes('midas') ||
        d.label.toLowerCase().includes('m32') ||
        d.label.toLowerCase().includes('interface')
      )

      const manuallySelected = preferredDeviceId
        ? inputs.find((d) => d.deviceId === preferredDeviceId)
        : null
      const target = manuallySelected || usbMixer || inputs[0]
      const channelCount = await audioEngine.connectDevice(target.deviceId)
      setConnectedDevice(target)
      setInputChannelCount(channelCount)
      audioEngine.onMasterVU = (l, r) => setMasterVU(l, r)
      audioEngine.onVUUpdate = (channelId, level) => setChannelVU(channelId, level)
      setDemoMode(false)
    } catch (err) {
      console.warn('Device connection failed, staying in demo mode', err)
      setDemoMode(true)
    }
  }, [setAvailableDevices, setAvailableOutputDevices, setConnectedDevice, setDemoMode])

  const handleSelectOutputDevice = useCallback(async (deviceId) => {
    const ok = await audioEngine.setOutputDevice(deviceId)
    if (!ok) return false
    const devices = await navigator.mediaDevices.enumerateDevices()
    const outputs = devices.filter((d) => d.kind === 'audiooutput')
    setAvailableOutputDevices(outputs)
    const selected = outputs.find((d) => d.deviceId === deviceId) || null
    setOutputDevice(selected)
    return true
  }, [setAvailableOutputDevices, setOutputDevice])

  // Sync channel gains to audio engine
  useEffect(() => {
    if (demoMode) return
    channels.forEach((ch) => {
      audioEngine.setChannelTrim(ch.id, ch.trim ?? 0)
      audioEngine.setChannelGain(ch.id, ch.gain)
      audioEngine.setChannelMute(ch.id, ch.muted)
      audioEngine.setChannelEQ(ch.id, ch.eq.hi, ch.eq.mid, ch.eq.lo)
    })
  }, [channels, demoMode])

  const handleAIToggle = useCallback((enabled) => {
    if (enabled) {
      if (!aiRef.current) {
        aiRef.current = new AIAutoMix({
          getChannels: () => lastChannelsRef.current,
          updateChannel: (id, updates) => updateChannel(id, updates),
          addLog: addAILog,
          audioEngine,
        })
      }
      aiRef.current.start()
    } else {
      aiRef.current?.stop()
    }
  }, [updateChannel, addAILog])

  useEffect(() => {
    return () => {
      audioEngine.destroy()
      aiRef.current?.stop()
    }
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: '#0a0c0f' }}>
      {/* Header */}
      <header
        style={{
          height: 44,
          background: '#0d1016',
          borderBottom: '1px solid #252b38',
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          gap: 12,
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span
            style={{
              fontSize: 18,
              fontWeight: 800,
              fontFamily: 'Syne',
              letterSpacing: '-0.02em',
              color: '#e8a23c',
            }}
          >
            SanctuaryMix
          </span>
          <span
            style={{
              fontSize: 9,
              color: '#8892a4',
              fontFamily: 'IBM Plex Mono',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
            }}
          >
            Live Audio Mixer
          </span>
        </div>

        <div style={{ flex: 1 }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: demoMode ? '#e8a23c' : '#81c784',
              boxShadow: `0 0 5px ${demoMode ? '#e8a23c' : '#81c784'}`,
            }}
          />
          <span
            style={{
              fontSize: 9,
              color: demoMode ? '#e8a23c' : '#81c784',
              fontFamily: 'IBM Plex Mono',
              letterSpacing: '0.1em',
            }}
          >
            {demoMode ? 'DEMO' : 'LIVE'}
          </span>
        </div>

        <div
          style={{
            fontSize: 9,
            color: '#8892a4',
            fontFamily: 'IBM Plex Mono',
            letterSpacing: '0.05em',
          }}
        >
          16 CH
        </div>
      </header>

      {/* Toolbar */}
      <Toolbar onAIToggle={handleAIToggle} />

      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Channel strips */}
        <div
          style={{
            flex: 1,
            overflowX: 'auto',
            overflowY: 'hidden',
            padding: '10px 12px',
            display: 'flex',
            gap: 4,
            alignItems: 'flex-start',
          }}
        >
          {channels.map((ch) => (
            <Channel key={ch.id} channelId={ch.id} />
          ))}
          <MasterBus />
        </div>

        {/* Right panel */}
        <RightPanel onConnectDevice={handleConnectDevice} onSelectOutputDevice={handleSelectOutputDevice} outputRoutingSupported={audioEngine.supportsOutputRouting()} />
      </div>
    </div>
  )
}
