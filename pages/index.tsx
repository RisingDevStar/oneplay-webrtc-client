import type { GetStaticProps, NextPage } from 'next'
import React, { useState, useEffect, useRef, ChangeEvent, ChangeEventHandler } from 'react'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import adapter from 'webrtc-adapter'
import type { WsMsg } from '../types'
import { WSType } from '../types'
import { iceServers, SIGNALING_URL } from '../config/index'

let peerConnection: RTCPeerConnection | null;
let ws: WebSocket | null

const Home = ({signaling_url} : {signaling_url: string}) => {
  const [errMsg, setErrMsg] = useState("")
  const [selectedScreen, setSelectedScreen] = useState(0)
  const [screens, setScreens] = useState([])
  const [enabled, setEnabled] = useState(true)
  const [btnTitle, setBtnTitle] = useState("Start")

  const remoteVideo = useRef<HTMLVideoElement>(null);

  const sendWSMsg = (data: WsMsg) => {
    ws?.send(JSON.stringify(data))
  }

  const currentScreenChange : ChangeEventHandler = (evt: ChangeEvent<HTMLSelectElement>) => {
    let value : number = parseInt(evt.currentTarget.value, 10)
    console.log(value)
    setSelectedScreen(value)
  }

  const btnClick = () => {
    setEnabled(false)
    console.log(adapter.browserDetails.browser)
    const userMediaPromise = (adapter.browserDetails.browser === 'safari') ?
      navigator.mediaDevices.getUserMedia({ video: true }) :
      Promise.resolve(null)

    console.log("userMediaPromise")
    console.log(userMediaPromise)

    if (!peerConnection) {
      userMediaPromise.then((stream: any) => {
        console.log('ss', stream)

        return startRemoteSession(selectedScreen, stream, iceServers)
      })
        .catch(showError)

    } else {
      peerConnection.close()
      peerConnection = null
      setEnabled(true)
      setBtnTitle("Start")
    }
  }

  const showError = (error: any) => {
    setErrMsg(String(error))
  }

  async function startSession(offer: any, screen: any) {
    console.log("to agent")
    console.log(JSON.stringify({
      offer,
      screen
    }))
    sendWSMsg({
      WSType: WSType.SDP,
      Screen: screen,
      SDP: offer
    })
  }

  async function createOffer(pc: RTCPeerConnection, { audio, video }: { audio: boolean, video: boolean })
    : Promise<any> {
    return new Promise((accept: (value: any) => void, reject: (reason?: any) => void) => {
      pc.onicecandidate = (evt: RTCPeerConnectionIceEvent) => {
        if (!evt.candidate && pc.localDescription) {
          const { sdp: offer } = pc.localDescription
          accept(offer)
        }
      }
      pc.createOffer({
        offerToReceiveAudio: audio,
        offerToReceiveVideo: video
      }).then(ld => {
        pc.setLocalDescription(ld)
      }).catch(reject)
    })
  }

  function startRemoteSession(screen: number, stream: MediaStream, iceServers: RTCIceServer[] | undefined) {
    let pc : RTCPeerConnection;

    return Promise.resolve().then(() => {
      pc = new RTCPeerConnection({
        iceServers: iceServers
      });
      pc.connectionState
      pc.ontrack = (evt) => {
        console.log("pc.ontrack() evt")
        console.log(evt)
        console.info('ontrack triggered')

        if (evt.streams[0] && remoteVideo.current) {
          remoteVideo.current.srcObject = evt.streams[0]
          remoteVideo.current.play()
        }
      };

      console.log("stream", stream)
      stream && stream.getTracks().forEach(track => {
        pc.addTrack(track, stream)
      })
      return createOffer(pc, { audio: false, video: true})
    }).then(offer => {
      console.info("offer");
      console.info(offer);
      startSession(offer, screen);
      peerConnection = pc
    })
  }

  async function receiveAnswer(answer: string) {
    if (peerConnection) {
      peerConnection.setRemoteDescription(new RTCSessionDescription({
          sdp: answer,
          type: 'answer'
      })).then(() => {
          setEnabled(true)
          setBtnTitle("Stop")
      })
    }
  }

  useEffect(() => {
    function requestScreen() {
      sendWSMsg({
        WSType: WSType.SCREEN,
        Screen: 0,
        SDP: ""
      })
    }

    ws = new WebSocket(signaling_url)

    ws.onopen = (evt: Event) => {
      console.log("ws connected")
      requestScreen()
    }

    ws.onclose = (evt: CloseEvent) => {
      console.log("ws disconnected")
    }

    ws.onmessage = (evt: MessageEvent<any>) => {
      console.log(evt.data)
      let received: WsMsg = JSON.parse(evt.data)
      switch (received.WSType) {
        case WSType.SCREEN:
          console.log(received.Screen)
          setScreens(received.Screen)
          break
        case WSType.SDP:
          let answer = received.Answer
          if (answer) {
            receiveAnswer(answer)
          }
          break
        case WSType.ERROR:
          showError(received.Data)
          break
        default:
          console.error(`unknown WSType: ${received.WSType}`)
      }
    }

    ws.onerror = (evt: Event) => {
      console.log(evt)
    }

    return function cleanup() {
      if (ws) {
        ws.close()
      }
      if (peerConnection) {
        peerConnection.close()
        peerConnection = null
      }
    };
  }, [])

  return (
    <div className={styles.app}>
      <Head>
        <title>WebRTC remote viewer</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.controls}>
        <div className={styles.error}>{ errMsg }</div>
        <select
          className={styles.screenSelect}
          onChange={ currentScreenChange } value={ selectedScreen }
        >
          {screens.map(({ index } : { index : number}) => (
            <option key={`option-${index}`} value={`${index}`}>
              {`Screen ${index+1}`}
            </option>
          ))}
        </select>
        {
          enabled && (
            <button
              className={styles.startStop}
              onClick={btnClick}
            >
              {btnTitle}
            </button>
          )
        }
        {
          !enabled && (
            <button
              className={styles.startStop}
              onClick={btnClick}
              disabled
            >
              {btnTitle}
            </button>
          )
        }
      </div>
      {
        enabled && (
          <div className={styles.instructions}>Select a screen and press Start</div>
        )
      }
      <video
        ref={remoteVideo}
        className={styles.remoteVideo}
        autoPlay
        muted
        playsInline
        loop
      >
      </video>
    </div>
  )
}

export const getStaticProps: GetStaticProps = async (context) => {
  console.log(`signaling server: ${process.env.SIGNALING_SERVER}`)
  return { props: { signaling_url:  process.env.SIGNALING_SERVER ? process.env.SIGNALING_SERVER : ""}}
}

// export async function getStaticProps() {
//   // console.log(`env: ${process.env.SIGNALING_SERVER}`)
// }

export default Home
