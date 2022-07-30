export const mouseEventHandler = (element: HTMLVideoElement, inputType: string) => (ev: MouseEvent) => {
  // console.log(element.clientWidth, element.clientHeight)
  const width = element.clientWidth
  const height = element.clientHeight
  // if (MouseEvent) {
  // }
  console.log({
    inputType: inputType,
    altKey: ev.altKey,
    button: ev.button,
    buttons: ev.buttons,
    ctrlKey: ev.ctrlKey,
    metaKey: ev.metaKey,
    movementX: ev.movementX / width,
    movementY: ev.movementY / height,
    offsetX: ev.offsetX / width,
    offsetY: ev.offsetY / height,
    shiftKey: ev.shiftKey,
  })
}

export const wheelEventHandler = (element: HTMLVideoElement, inputType: string) => (ev: WheelEvent) => {
  console.log({
    inputType: inputType,
    deltaX: ev.deltaX,
    deltaY: ev.deltaY,
    deltaZ: ev.deltaZ,
    deltaMode: ev.deltaMode,
  })
}

export const keyBoardEventHandler = (element: HTMLVideoElement, inputType: string) => (ev: KeyboardEvent) => {
  console.log({
    inputType: inputType,
    altKey: ev.altKey,
    code: ev.code,
    ctrlKey: ev.ctrlKey,
    isComposing: ev.isComposing,
    key: ev.key,
    metaKey: ev.metaKey,
    repeat: ev.repeat,
    shiftKey: ev.shiftKey
  })
}

// const gamepads: Gamepad[] = []

export const gamepadHandler = (connecting: boolean) => (ev: GamepadEvent) => {
  // const gamepad = ev.gamepad
  // if (connecting) {
  //   gamepads[gamepad.index] = gamepad
  // } else {
  //   delete gamepads[gamepad.index]
  // }
  const gp = navigator.getGamepads()[ev.gamepad.index];
  if (gp) {
    console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
      gp.index, gp.id,
      gp.buttons.length, gp.axes.length);
  }

  console.log({
    // gamepads
  })
}