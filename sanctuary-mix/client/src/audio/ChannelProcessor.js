/**
 * ChannelProcessor.js
 * Per-channel audio graph: Trim (preamp) → Pre-fader VU tap → Fader → 3-band EQ
 *
 * Signal flow:
 *   input → trimNode → preFaderAnalyser (VU) → gainNode (fader) → hiEQ → midEQ → loEQ → output
 */

export class ChannelProcessor {
  constructor(ctx, channelId) {
    this.ctx = ctx
    this.channelId = channelId
    this.muted = false
    this._gainValue = 1.0
    this._trimDb = 0

    // ── Trim / Preamp ──────────────────────────────────────────────────────────
    // Boosts raw input signal (mic/line level) before the fader.
    // Range: -20 to +40 dB. Default: 0 dB (1.0 linear).
    this.trimNode = ctx.createGain()
    this.trimNode.gain.value = 1.0

    // ── Pre-fader analyser (VU meter source) ──────────────────────────────────
    // Tapped after trim so VU shows boosted level regardless of fader position.
    this.preFaderAnalyser = ctx.createAnalyser()
    this.preFaderAnalyser.fftSize = 256
    this._preFaderBuf = new Float32Array(this.preFaderAnalyser.fftSize)
    this.trimNode.connect(this.preFaderAnalyser)

    // ── Fader ─────────────────────────────────────────────────────────────────
    this.gainNode = ctx.createGain()
    this.gainNode.gain.value = 1.0
    this.trimNode.connect(this.gainNode)

    // ── 3-band EQ ─────────────────────────────────────────────────────────────
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

    this.gainNode.connect(this.hiEQ)
    this.hiEQ.connect(this.midEQ)
    this.midEQ.connect(this.loEQ)

    this.inputNode = this.trimNode
    this.outputNode = this.loEQ
  }

  /** Trim/preamp gain in dB. Range: -20 to +40. */
  setTrim(db) {
    this._trimDb = db
    const linear = Math.pow(10, db / 20)
    this.trimNode.gain.setTargetAtTime(linear, this.ctx.currentTime, 0.02)
  }

  /** Fader position 0–100. */
  setGain(percent) {
    this._gainValue = percent / 100
    if (!this.muted) {
      this.gainNode.gain.setTargetAtTime(this._gainValue, this.ctx.currentTime, 0.01)
    }
  }

  setMute(muted) {
    this.muted = muted
    const target = muted ? 0 : this._gainValue
    this.gainNode.gain.setTargetAtTime(target, this.ctx.currentTime, 0.01)
  }

  setEQ(hi, mid, lo) {
    this.hiEQ.gain.setTargetAtTime(hi, this.ctx.currentTime, 0.02)
    this.midEQ.gain.setTargetAtTime(mid, this.ctx.currentTime, 0.02)
    this.loEQ.gain.setTargetAtTime(lo, this.ctx.currentTime, 0.02)
  }

  getRMS() {
    this.preFaderAnalyser.getFloatTimeDomainData(this._preFaderBuf)
    const sum = this._preFaderBuf.reduce((s, v) => s + v * v, 0)
    return Math.sqrt(sum / this._preFaderBuf.length)
  }
}
