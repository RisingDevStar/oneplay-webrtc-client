export interface WsMsg {
  WSType: string,
  Screen: any,
  SDP?: string,
  Answer?: string
}

export const SCREENINFO = 'Screen'
export const SDPEXCHANGE = 'SDP'
// export interface ScreenInfo {
//   WSType: string,
//   Screen: Array<any>
// }

