import { RefObject, useEffect, useRef } from "react";
import adapter from "webrtc-adapter";
import type { Peer } from "../types";

// let peerConnection: RTCPeerConnection | null;

export default function Video({ peer } : { peer : Peer }) {
  const vRef: RefObject<HTMLVideoElement> = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    if (vRef.current) {
      vRef.current.srcObject = peer.stream
    }
  }, [peer])

  return (
    <video>
    </video>
  )

}