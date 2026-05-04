/**
 * ChannelProcessor.js
 * Per-channel audio graph: GainNode + BiquadFilter EQ chain + Analyser
 */

export class ChannelProcessor {
  constructor(ctx, channelId) {
    this.ctx = ctx
    this.channelId = channelId
    this.muted = false
    this._gainValue = 1.0

    // Gain node
    this.gainNode = ctx.createGain()
    this.gainNode.gain.value = 1.0

    // 3-band EQ
    this.hiEQ = ctx.createBiquadFilter()
    this.hiEQ.type = 'highshelf'
    this.hiEQ.frequency.value = 8000
    this.hiEQ.gain.value = 0

    this.midEQ = ctx.createBiquadFilter()
    this.midEQ.type = 'peaking'
    this.midEQ.frequency.value = 1000
    this.midEQ.Q.value = 1.0
    this.midEQ.gain.value = 0

    this.loEQ = ctx.createBiquadFilter()
    this.loEQ.type = 'lowshelf'
    this.loEQ.frequency.value = 200
    this.loEQ.gain.value = 0

    // Analyser for VU
    this.analyser = ctx.createAnalyser()
    this.analyser.fftSize = 256
    this._analyserBuf = new Float32Array(this.analyser.fftSize)

    // Chain: gain → hiEQ → midEQ → loEQ → analyser
    this.gainNode.connect(this.hiEQ)
    this.hiEQ.connect(this.midEQ)
    this.midEQ.connect(this.loEQ)
    this.loEQ.connect(this.analyser)

    this.inputNode = this.gainNode
    this.outputNode = this.analyser
  }

  setGain(percent) {
    // percent: 0–100
    this._gainValue = percent / 100
    if (!this.muted) {
      this.gainNode.gain.setTargetAtTime(
        this._gainValue,
        this.ctx.currentTime,
        0.01
      )
    }
  }

  setMute(muted) {
    this.muted = muted
    const target = muted ? 0 : this._gainValue
    this.gainNode.gain.setTargetAtTime(target, this.ctx.currentTime, 0.01)
  }

  setEQ(hi, mid, lo) {
    // Values in dB, range ±15
    this.hiEQ.gain.setTargetAtTime(hi, this.ctx.currentTime, 0.02)
    this.midEQ.gain.setTargetAtTime(mid, this.ctx.currentTime, 0.02)
    this.loEQ.gain.setTargetAtTime(lo, this.ctx.currentTime, 0.02)
  }

  getRMS() {
    this.analyser.getFloatTimeDomainData(this._analyserBuf)
    const sum = this._analyserBuf.reduce((s, v) => s + v * v, 0)
    return Math.sqrt(sum / this._analyserBuf.length)
  }
}
