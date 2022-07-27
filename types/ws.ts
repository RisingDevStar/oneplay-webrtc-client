export interface WsMsg {
  WSType: string,
  Screen: any,
  SDP?: string,
  Answer?: string,
  Data?: string
}

export const WSType = {
  SCREEN: "Screen",
  SDP: "SDP",
  ERROR: "Error"
}

// export interface ScreenInfo {
//   WSType: string,
//   Screen: Array<any>
// }

