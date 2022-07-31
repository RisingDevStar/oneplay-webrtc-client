export interface Mouse {
  altKey: Boolean,
  button: number,
  buttons: number,
  ctrlKey: boolean,
  metaKey: boolean,
  movementX: number,
  movementY: number,
  offsetX: number,
  offsetY: number,
  shiftKey: boolean,
}

export const MOUSE_CLICK = 'click'
export const MOUSE_DOUBLECLICK = 'dblclick'
export const MOUSE_UP = 'mouseup'
export const MOUSE_DOWN = 'mousedown'
export const MOUSE_MOVE = 'mousemove'
export const MOUSE_WHELL = 'wheel'

export const KEY_PRESS = 'keypress'
export const KEY_DOWN = 'keydown'
export const KEY_UP = 'keyup'

export const GAMEPAD_CONNECTED = 'gamepadconnected'
export const GAMEPAD_DISCONNECTED = 'gamepadconnected'
