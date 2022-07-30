export interface WsMsg {
  WSType: string,
  Screen?: any,
  SDP?: string,
  ICE?: RTCIceCandidateInit,
  Answer?: string,
  Data?: string
}

export const WSType = {
  CONNECTED: "Connected",
  SCREEN: "Screen",
  SDP: "SDP",
  ICE: "ICE",
  ERROR: "Error"
}

// export interface ScreenInfo {
//   WSType: string,
//   Screen: Array<any>
// }

