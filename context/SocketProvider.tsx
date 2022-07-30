import { useEffect, useState, createContext, useRef } from "react";
import { debug, DebugType } from '../utils/logs'

let socket: WebSocket | null

export const SocketContext = createContext < { socket:null | WebSocket }>({socket: null});

export {
  socket
}

export const SocketProvider = ({ children } : { children: any }) => {
  // we use a ref to store the socket as it won't be updated frequently
  
  // When the Provider mounts, initialize it 👆
  // and register a few listeners 👇
  
  useEffect(() => {
    // socket = new WebSocket(process.env.NEXT_PUBLIC_WEBSOCKET_URL || '');
    // socket.onopen = () => {
    //   debug(DebugType.WARN, "socket connected", socket)
    // }

    // socket.onclose = () => {
    //   debug(DebugType.INFO, "socket disconnected")
    // }

    // socket.onerror = ( e: Event) => {
    //   debug(DebugType.WARN, "socket error", e)
    // }
    // socket.onmessage = ( e: MessageEvent) => {
    //   debug(DebugType.LOG, "socket message received", e.data)
    // }
    // // Remove all the listeners and
    // // close the socket when it unmounts
    // return () => {
    //   if (socket) {
    //     // socket.current.removeEventListener()
    //     socket.close()
    //   }
    // };
  }, []);

  return (
    <SocketContext.Provider value={{ socket: socket }}>{children}</SocketContext.Provider>
  );
};
