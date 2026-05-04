/**
 * AIAutoMix.js
 * Intelligent auto-mixing engine.
 * Runs every 500ms, analyzes channel levels, applies corrections.
 */

export class AIAutoMix {
  constructor({ getChannels, updateChannel, addLog, audioEngine }) {
    this.getChannels = getChannels
    this.updateChannel = updateChannel
    this.addLog = addLog
    this.audioEngine = audioEngine
    this.intervalId = null
    this.active = false

    // Thresholds
    this.VAD_THRESHOLD = 0.02       // RMS threshold for voice activity
    this.PEAK_THRESHOLD = 0.9       // Above this → duck
    this.QUIET_MIC_THRESHOLD = 0.01 // Below this → boost mic
    this.MUSIC_DUCK_DB = 3          // dB to duck music when speech active
  }

  start() {
    if (this.active) return
    this.active = true
    this.intervalId = setInterval(() => this._tick(), 500)
    this.addLog({ type: 'info', message: 'AI AutoMix activated' })
  }

  stop() {
    this.active = false
    if (this.intervalId) clearInterval(this.intervalId)
    this.intervalId = null

    // Clear AI managed flags
    const channels = this.getChannels()
    channels.forEach((ch) => {
      if (ch.aiManaged) this.updateChannel(ch.id, { aiManaged: false })
    })
    this.addLog({ type: 'info', message: 'AI AutoMix deactivated' })
  }

  _tick() {
    const channels = this.getChannels()
    const activeMics = []
    const hotChannels = []

    // 1. Voice Activity Detection
    channels.forEach((ch) => {
      if (ch.muted || ch.gain === 0) return
      const rms = this.audioEngine.getChannelRMS(ch.id)

      if (ch.type === 'Mic' && rms > this.VAD_THRESHOLD) {
        activeMics.push({ ...ch, rms })
      }
      if (rms > this.PEAK_THRESHOLD) {
        hotChannels.push({ ...ch, rms })
      }
    })

    // 2. Peak Prevention — duck channels approaching clip
    hotChannels.forEach((ch) => {
      const newGain = Math.max(ch.gain - 5, 0)
      this.updateChannel(ch.id, { gain: newGain, aiManaged: true })
      this.addLog({
        type: 'warn',
        message: `CH${ch.id} [${ch.name}] peak detected — gain reduced to ${newGain}%`,
      })
    })

    // 3. Music/Speech Balance — duck music when vocal mic is active
    const hasActiveSpeech = activeMics.length > 0
    if (hasActiveSpeech) {
      channels.forEach((ch) => {
        if (ch.type === 'Music' || ch.type === 'Backing') {
          const duckFactor = 0.708 // -3dB ≈ 0.708
          const baseGain = ch.gain
          const duckedGain = Math.round(baseGain * duckFactor)
          if (Math.abs(baseGain - duckedGain) > 2) {
            this.updateChannel(ch.id, { gain: duckedGain, aiManaged: true })
            this.addLog({
              type: 'action',
              message: `CH${ch.id} [${ch.name}] ducked -3dB (speech active)`,
            })
          }
        }
      })
    }

    // 4. Auto Gain Control — boost quiet mics, reduce hot mics
    channels.forEach((ch) => {
      if (ch.type !== 'Mic' || ch.muted) return
      const rms = this.audioEngine.getChannelRMS(ch.id)

      if (rms > 0 && rms < this.QUIET_MIC_THRESHOLD && ch.gain < 90) {
        const boost = Math.min(ch.gain + 3, 95)
        this.updateChannel(ch.id, { gain: boost, aiManaged: true })
        this.addLog({
          type: 'action',
          message: `CH${ch.id} [${ch.name}] boosted to ${boost}% (low level)`,
        })
      } else if (rms > 0.7 && ch.gain > 20) {
        const cut = Math.max(ch.gain - 5, 20)
        this.updateChannel(ch.id, { gain: cut, aiManaged: true })
        this.addLog({
          type: 'action',
          message: `CH${ch.id} [${ch.name}] reduced to ${cut}% (hot signal)`,
        })
      }
    })
  }
}
