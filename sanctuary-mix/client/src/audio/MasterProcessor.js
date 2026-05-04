/**
 * MasterProcessor.js
 * Master bus: DynamicsCompressorNode + GainNode
 */

export class MasterProcessor {
  constructor(ctx) {
    this.ctx = ctx

    // Input gain (master fader)
    this.faderNode = ctx.createGain()
    this.faderNode.gain.value = 0.85

    // Master compressor (light bus glue)
    this.compressor = ctx.createDynamicsCompressor()
    this.compressor.threshold.value = -6
    this.compressor.knee.value = 6
    this.compressor.ratio.value = 2
    this.compressor.attack.value = 0.003
    this.compressor.release.value = 0.25

    // Output gain
    this.outputGain = ctx.createGain()
    this.outputGain.gain.value = 1.0

    // Chain: fader → compressor → outputGain
    this.faderNode.connect(this.compressor)
    this.compressor.connect(this.outputGain)

    this.inputNode = this.faderNode
    this.outputNode = this.outputGain
  }

  setGain(percent) {
    const val = percent / 100
    this.faderNode.gain.setTargetAtTime(val, this.ctx.currentTime, 0.02)
  }
}
