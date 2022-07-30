import { useEffect, useRef } from "react";
import styles from '../styles/Home.module.css'
import type { Peer } from "../types";

export default function Video({ peer, userName } : { peer: Peer, userName: string }) {
  const vRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (vRef.current && peer.stream) {
      vRef.current.srcObject = peer.stream;
      vRef.current.play();
    }
  }, [peer]);
  return peer && peer.stream ? (
    <article
      className="w-full h-full bg-black rounded-lg shadow-md remote-video"
      data-username={userName}
    >
      <video
        ref={vRef}
        className={styles.remoteVideo}
        autoPlay
        muted
        playsInline
        loop
      >
      </video>
    </article>
  ) : null;
}
