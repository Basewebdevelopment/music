/**
 * AudioEngine.js
 * Core Web Audio API engine for SanctuaryMix.
 * Manages AudioContext lifecycle, device routing, and channel processors.
 */

import { ChannelProcessor } from './ChannelProcessor.js'
import { MasterProcessor } from './MasterProcessor.js'

export class AudioEngine {
  constructor() {
    this.ctx = null
    this.stream = null
    this.channels = new Map()
    this.master = null
    this.analyserL = null
    this.analyserR = null
    this.animFrameId = null
    this.onVUUpdate = null // callback(channelId, level)
    this.onMasterVU = null // callback(left, right)
    this.initialized = false
  }

  /**
   * Initialize AudioContext — MUST be called from a user gesture.
   */
  async init() {
    if (this.initialized) return

    this.ctx = new (window.AudioContext || window.webkitAudioContext)({
      latencyHint: 'interactive',
      sampleRate: 48000,
    })

    if (this.ctx.state === 'suspended') {
      await this.ctx.resume()
    }

    this.master = new MasterProcessor(this.ctx)
    this.initialized = true
  }

  /**
   * Connect a real audio input device.
   */
  async connectDevice(deviceId) {
    await this.init()

    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop())
    }

    const constraints = {
      audio: {
        deviceId: deviceId ? { exact: deviceId } : undefined,
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
        sampleRate: 48000,
      },
    }

    this.stream = await navigator.mediaDevices.getUserMedia(constraints)
    const sourceNode = this.ctx.createMediaStreamSource(this.stream)

    // Route through master
    sourceNode.connect(this.master.inputNode)
    this.master.outputNode.connect(this.ctx.destination)

    this._startAnalysers()
    return true
  }

  /**
   * Create/update a channel processor.
   */
  setChannelGain(channelId, gainValue) {
    if (!this.initialized) return
    let proc = this.channels.get(channelId)
    if (!proc) {
      proc = new ChannelProcessor(this.ctx, channelId)
      proc.outputNode.connect(this.master.inputNode)
      this.channels.set(channelId, proc)
    }
    proc.setGain(gainValue)
  }

  setChannelMute(channelId, muted) {
    const proc = this.channels.get(channelId)
    if (proc) proc.setMute(muted)
  }

  setChannelEQ(channelId, hi, mid, lo) {
    const proc = this.channels.get(channelId)
    if (proc) proc.setEQ(hi, mid, lo)
  }

  setMasterGain(value) {
    if (this.master) this.master.setGain(value)
  }

  getChannelRMS(channelId) {
    const proc = this.channels.get(channelId)
    return proc ? proc.getRMS() : 0
  }

  _startAnalysers() {
    if (!this.master) return

    this.analyserL = this.ctx.createAnalyser()
    this.analyserR = this.ctx.createAnalyser()
    this.analyserL.fftSize = 256
    this.analyserR.fftSize = 256

    const splitter = this.ctx.createChannelSplitter(2)
    this.master.outputNode.connect(splitter)
    splitter.connect(this.analyserL, 0)
    splitter.connect(this.analyserR, 1)

    this._animateVU()
  }

  _animateVU() {
    const bufL = new Float32Array(this.analyserL.fftSize)
    const bufR = new Float32Array(this.analyserR.fftSize)

    const tick = () => {
      this.analyserL.getFloatTimeDomainData(bufL)
      this.analyserR.getFloatTimeDomainData(bufR)

      const rmsL = Math.sqrt(bufL.reduce((s, v) => s + v * v, 0) / bufL.length)
      const rmsR = Math.sqrt(bufR.reduce((s, v) => s + v * v, 0) / bufR.length)

      if (this.onMasterVU) this.onMasterVU(rmsL, rmsR)

      this.animFrameId = requestAnimationFrame(tick)
    }

    this.animFrameId = requestAnimationFrame(tick)
  }

  destroy() {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId)
    if (this.stream) this.stream.getTracks().forEach((t) => t.stop())
    if (this.ctx) this.ctx.close()
    this.channels.clear()
    this.initialized = false
  }
}

// Singleton
export const audioEngine = new AudioEngine()
