import { create } from 'zustand'

const DEFAULT_CHANNEL = (index) => ({
  id: index + 1,
  name: `CH ${String(index + 1).padStart(2, '0')}`,
  type: 'Mic', // Mic | Music | Backing
  gain: 0,
  muted: false,
  solo: false,
  eq: { hi: 0, mid: 0, lo: 0 },
  vuLevel: 0,
  aiManaged: false,
})

const DEFAULT_CHANNELS = Array.from({ length: 16 }, (_, i) => DEFAULT_CHANNEL(i))

const DEFAULT_MASTER = {
  gain: 85,
  vuLeft: 0,
  vuRight: 0,
  peak: false,
  clip: false,
}

const DEFAULT_PROCESSING = {
  noiseGate: 30,
  compressor: 50,
  reverb: 10,
  clarityEQ: 60,
  deEsser: 40,
}

export const useMixerStore = create((set, get) => ({
  // Core state
  channels: DEFAULT_CHANNELS,
  master: DEFAULT_MASTER,
  processing: DEFAULT_PROCESSING,

  // UI state
  demoMode: true,
  aiEnabled: false,
  aiLog: [],
  connectedDevice: null,
  outputDevice: null,
  availableDevices: [],
  availableOutputDevices: [],

  // Actions
  updateChannel: (id, updates) =>
    set((state) => ({
      channels: state.channels.map((ch) =>
        ch.id === id ? { ...ch, ...updates } : ch
      ),
    })),

  updateChannelEQ: (id, band, value) =>
    set((state) => ({
      channels: state.channels.map((ch) =>
        ch.id === id ? { ...ch, eq: { ...ch.eq, [band]: value } } : ch
      ),
    })),

  setChannelVU: (id, level) =>
    set((state) => ({
      channels: state.channels.map((ch) =>
        ch.id === id ? { ...ch, vuLevel: level } : ch
      ),
    })),

  setMasterVU: (left, right) =>
    set((state) => ({
      master: {
        ...state.master,
        vuLeft: left,
        vuRight: right,
        clip: left > 0.98 || right > 0.98,
        peak: left > 0.85 || right > 0.85,
      },
    })),

  updateMaster: (updates) =>
    set((state) => ({ master: { ...state.master, ...updates } })),

  updateProcessing: (key, value) =>
    set((state) => ({ processing: { ...state.processing, [key]: value } })),

  setDemoMode: (val) => set({ demoMode: val }),
  setAIEnabled: (val) => set({ aiEnabled: val }),
  setConnectedDevice: (device) => set({ connectedDevice: device, demoMode: !device }),
  setAvailableDevices: (devices) => set({ availableDevices: devices }),
  setAvailableOutputDevices: (devices) => set({ availableOutputDevices: devices }),
  setOutputDevice: (device) => set({ outputDevice: device }),

  addAILog: (entry) =>
    set((state) => ({
      aiLog: [
        { id: Date.now(), timestamp: new Date().toISOString(), ...entry },
        ...state.aiLog,
      ].slice(0, 200),
    })),

  clearAILog: () => set({ aiLog: [] }),

  applyPreset: (preset) =>
    set((state) => {
      const newChannels = state.channels.map((ch) => {
        const presetCh = preset.channels.find((p) => p.id === ch.id)
        if (presetCh) {
          return { ...ch, ...presetCh, vuLevel: 0, aiManaged: false }
        }
        return { ...ch, gain: 0, vuLevel: 0, muted: false, solo: false }
      })
      return { channels: newChannels }
    }),

  soloChannel: (id) =>
    set((state) => {
      const ch = state.channels.find((c) => c.id === id)
      const soloActive = !ch.solo
      return {
        channels: state.channels.map((c) =>
          c.id === id ? { ...c, solo: soloActive } : c
        ),
      }
    }),
}))
