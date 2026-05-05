// Audio device routing is handled client-side via Web Audio API.
// This service provides server-side metadata and routing configuration.

export function getRoutingConfig() {
  return {
    inputChannels: 16,
    outputChannels: 2,
    sampleRate: 48000,
    bufferSize: 256,
  }
}
