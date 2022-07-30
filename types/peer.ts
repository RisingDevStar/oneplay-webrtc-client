export interface Peer {
  stream?: MediaStream,
  peerConnection: RTCPeerConnection,
  iceQueue? : RTCIceCandidateInit[]
}