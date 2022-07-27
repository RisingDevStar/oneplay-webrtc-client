export const iceServers: RTCIceServer[] | undefined = [
  { urls: 'stun:stun.l.google.com:19302' }
]

export const SIGNALING_URL: string = typeof process.env.SIGNALING_SERVER !== 'undefined' ? process.env.SIGNALING_SERVER : ""

// export { iceServers, SIGNALING_URL }