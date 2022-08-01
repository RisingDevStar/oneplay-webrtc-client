import type { GetStaticProps, NextPage } from 'next'
import React, { useState, useEffect, useRef, ChangeEvent, ChangeEventHandler, useLayoutEffect } from 'react'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import adapter from 'webrtc-adapter'
import type { Peer, WsMsg } from '../types'
import { WSType } from '../types'
import { iceServers, SIGNALING_URL } from '../config/index'
import { iceConfig } from '../utils/constants'
import useSocketConnection from '../hooks/socketConnection'
import usePeerConnection from '../hooks/peerConnection'
import { debug, DebugType } from '../utils/logs'
import { gamepadHandler, keyBoardEventHandler, mouseEventHandler, wheelEventHandler } from '../utils/HIDInputHandler'
import { KEY_DOWN, KEY_PRESS, KEY_UP, MOUSE_CLICK, MOUSE_DOUBLECLICK, MOUSE_DOWN, MOUSE_MOVE, MOUSE_UP, MOUSE_WHELL } from '../types/HID'

// let peerConnection: RTCPeerConnection | null;


export default function Home () {
  const [errMsg, setErrMsg] = useState("")
  const [selectedScreen, setSelectedScreen] = useState(0)
  const [screens, setScreens] = useState([])
  const [enabled, setEnabled] = useState(true)
  const [btnTitle, setBtnTitle] = useState("Start")
  const [isStarted, setIsStarted] = useState(true)

  const { socket } = useSocketConnection(true)
  const peer =  usePeerConnection(true)

  const remoteVideo = useRef<HTMLVideoElement>(null);

  const makeOffer = (screen: number, { audio, video }: { audio: boolean, video: boolean }) => {
    // addIceCandidateHandler(peer)
    let currentPeerConnection = peer?.peerConnection
    console.log(currentPeerConnection)
    currentPeerConnection?.createOffer({
      offerToReceiveAudio: audio,
      offerToReceiveVideo: video
    }).then((sdp: RTCSessionDescriptionInit) => {
      currentPeerConnection?.setLocalDescription(sdp)
      console.log(sdp)
      sendWSMsg({
        WSType: WSType.SDP,
        Screen: screen,
        SDP: sdp.sdp
      })
    }).catch((reason: any) => {
      showError(reason)
      debug(DebugType.ERROR, "createOffer failed", reason)
    })
  }

  const setRemoteDescription = (sdp: RTCSessionDescriptionInit) => {
    return new Promise<void>((resolve, rejects) => {
      const currentPeerConnection = peer?.peerConnection
      currentPeerConnection?.setRemoteDescription(
        new RTCSessionDescription(sdp)
      ).then(() => {
        resolve()
      }, (reason: any) => {
        rejects()
      }).catch((reason: any) => {
        debug(DebugType.ERROR, "setRemoteDescription failed", reason)
      })
    })
  }

  const addIceCandidate = (ice: RTCIceCandidateInit | undefined) => {
    const currentPeerConnection = peer?.peerConnection
    ice && currentPeerConnection?.addIceCandidate(new RTCIceCandidate(ice))
      .then(() => {
        debug(DebugType.LOG, "addIceCandidate success: ", ice)
      }, (reason: any) => {
        debug(DebugType.ERROR, "addIceCandidate failed: ", reason)
        debug(DebugType.ERROR, "addIceCandidate ice info: ", ice)
      }).catch((reason: any) => {
        showError(reason)
      })
  }

  //////////////////////////////////////////////////////

  const sendWSMsg = (data: WsMsg) => {
    console.log(socket)
    if (socket) {
      socket.send(JSON.stringify(data))
    }
  }

  // const sendWebRTCMsg = (peer: Peer) => (data: any) => {
  //   let sendChannel = peer.sendChannel
  //   if (sendChannel) {
  //     console.log("send via data channel")
  //     console.log(data)
  //     if (sendChannel.readyState === 'open') {
  //       sendChannel.send(JSON.stringify(data))
  //     }
  //   }
  // }

  const currentScreenChange : ChangeEventHandler = (evt: ChangeEvent<HTMLSelectElement>) => {
    let value : number = parseInt(evt.currentTarget.value, 10)
    console.log(value)
    setSelectedScreen(value)
  }

  const btnClick = () => {
    setEnabled(false)
    makeOffer(selectedScreen, { audio: false, video: true })
  }

  const btnClick1 = () => {
    setEnabled(false)
    makeOffer(selectedScreen, {audio: false, video: true})
    // console.log(adapter.browserDetails.browser)
    // const userMediaPromise = (adapter.browserDetails.browser === 'safari') ?
    //   navigator.mediaDevices.getUserMedia({ video: true }) :
    //   Promise.resolve(null)

    // console.log("userMediaPromise")
    // console.log(userMediaPromise)

    // if (!peerConnection) {
    //   userMediaPromise.then((stream: any) => {
    //     console.log('ss', stream)

    //     return startRemoteSession(selectedScreen, stream, iceServers)
    //   })
    //     .catch(showError)

    // } else {
    //   peerConnection.close()
    //   peerConnection = null
    //   setEnabled(true)
    //   setBtnTitle("Start")
    // }
  }

  const showError = (error: any) => {
    setErrMsg(String(error))
  }

  // async function startSession(offer: any, screen: any) {
  //   console.log("to agent")
  //   console.log(JSON.stringify({
  //     offer,
  //     screen
  //   }))
  //   console.log(offer)
  //   sendWSMsg({
  //     WSType: WSType.SDP,
  //     Screen: screen,
  //     SDP: offer
  //   })
  // }

  // async function createOffer(pc: RTCPeerConnection, { audio, video }: { audio: boolean, video: boolean })
  //   : Promise<any> {
  //   return new Promise((accept: (value: any) => void, reject: (reason?: any) => void) => {
  //     pc.onicecandidate = (evt: RTCPeerConnectionIceEvent) => {
  //       console.log(evt.candidate?.toJSON())
  //       if (evt.candidate) {
  //         sendWSMsg({
  //           WSType: WSType.ICE,
  //           ICE: evt.candidate.toJSON()
  //           // ICE: JSON.stringify(evt.candidate.toJSON())
  //         })
  //       }
  //       if (!evt.candidate && pc.localDescription) {
  //         const { sdp: offer } = pc.localDescription
  //         accept(offer)
  //       }
  //     }
  //     pc.createOffer({
  //       offerToReceiveAudio: audio,
  //       offerToReceiveVideo: video
  //     }).then(ld => {
  //       pc.setLocalDescription(ld)
  //     }).catch(reject)
  //   })
  // }

  // function startRemoteSession(screen: number, stream: MediaStream, iceServers: RTCIceServer[] | undefined) {
  //   let pc : RTCPeerConnection;

  //   return Promise.resolve().then(() => {
  //     pc = new RTCPeerConnection(iceConfig);
  //     pc.ontrack = (evt) => {
  //       console.log("pc.ontrack() evt")
  //       console.log(evt)
  //       console.info('ontrack triggered')

  //       if (evt.streams[0] && remoteVideo.current) {
  //         remoteVideo.current.srcObject = evt.streams[0]
  //         remoteVideo.current.play()
  //       }
  //     };

  //     console.log("stream", stream)
  //     stream && stream.getTracks().forEach(track => {
  //       pc.addTrack(track, stream)
  //     })
  //     return createOffer(pc, { audio: false, video: true})
  //   }).then(offer => {
  //     console.info("offer");
  //     console.info(offer);
  //     startSession(offer, screen);
  //     peerConnection = pc
  //   })
  // }

  // async function receiveAnswer(answer: string) {
  //   if (peerConnection) {
  //     peerConnection.setRemoteDescription(new RTCSessionDescription({
  //         sdp: answer,
  //         type: 'answer'
  //     })).then(() => {
  //         setEnabled(true)
  //         setBtnTitle("Stop")
  //     })
  //   }
  // }

  function requestScreen() {
    sendWSMsg({
      WSType: WSType.SCREEN,
      Screen: 0,
      SDP: ""
    })
  }

  const addSocketOpenHandler = (socket: WebSocket) => {
    if (socket) {
      socket.onopen = () => {
        // sendWSMsg({
        //   WSType: WSType.SCREEN,
        //   Screen: "-1"
        // })
        debug(DebugType.INFO, "socket connected")
        socket.send("client")
      }
    }
  }

  const addSocketCloseHandler = (socket: WebSocket) => {
    if (socket) {
      socket.onclose = ((evt: CloseEvent) => {
        debug(DebugType.INFO, "socket disconnected")
      })
    }
  }
  const addSocketMessageHandlers = (socket: WebSocket) => {
    if (socket) {
      socket.onmessage = async (evt: MessageEvent<any>) => {
        console.log(evt.data)
        let received: WsMsg = JSON.parse(evt.data)
        console.log(received)
        switch (received.WSType) {
          case WSType.CONNECTED:
            console.log("Recieved COnnected")
            requestScreen()
            break
          case WSType.SCREEN:
            console.log(received.Screen)
            setScreens(received.Screen)
            break
          case WSType.SDP:
            let answer = received.Answer
            setRemoteDescription(new RTCSessionDescription({
              sdp: answer,
              type: 'answer'
            })).then(() => {
              setEnabled(true)
              setBtnTitle("Stop")
              const iceQueue = peer?.iceQueue
              const peerConnection = peer?.peerConnection
              if (iceQueue && peerConnection) {
                while (iceQueue.length > 0) {
                  const ice = iceQueue.pop()
                  peerConnection.addIceCandidate(ice)
                    .then(() => {
                      debug(DebugType.LOG, "ice candidate added", ice)
                    })
                    .catch((reason: any) => {
                      debug(DebugType.ERROR, "ice candidate adding failed", reason)
                      debug(DebugType.LOG, "ice candidate adding failed", ice)
                    })
                }
              }
            })
            break
          case WSType.ICE:
            let ice = received.ICE || {}
            // console.log(ice)
            // console.log(peerConnection)
            // console.log(peerConnection !== null ? peerConnection.remoteDescription : null)
            // console.log(peerConnection && peerConnection.remoteDescription && peerConnection.remoteDescription.type)
            console.log(ice)
            // ice.sdpMid = "0"
            let peerConnection = peer?.peerConnection
            let iceQueue = peer?.iceQueue
            if (peerConnection) {
              console.log(peerConnection.currentRemoteDescription)
              console.log(peerConnection.remoteDescription)
              if (peerConnection.remoteDescription) {
                addIceCandidate(new RTCIceCandidate(ice))
              } else {
                iceQueue?.push(ice)
              }
            }
            break
          case WSType.ERROR:
            showError(received.Data)
            break
          default:
            console.error(`unknown WSType: ${received.WSType}`)
        }
      }
    }
  }

  const addIceCandidateHandler = (peer: Peer) => {
    const peerConnection = peer?.peerConnection
    if (peerConnection) {
      peerConnection.onicecandidate = (evt: RTCPeerConnectionIceEvent) => {
        debug(DebugType.LOG, "my candidate:", evt.candidate?.toJSON())
        if (evt.candidate) {
          sendWSMsg({
            WSType: WSType.ICE,
            ICE: evt.candidate.toJSON()
          })
        }
      }
    }
  }

  const addTrackHandler = (peer: Peer) => {
    const peerConnection = peer?.peerConnection
    if (peerConnection) {
      peerConnection.ontrack = (evt) => {
        console.log("pc.ontrack() evt")
        console.log(evt)
        // const el = document.createElement(evt.track.kind)
        // if (el) {
        //   el.curre = evt.streams[0]
        //   el.autoplay = true
        //   el.controls = true
        //   document.getElementById('remoteVideos').appendChild(el)
        // }
        console.info('ontrack triggered')
        if (evt.streams[0] && remoteVideo.current) {

          debug(DebugType.INFO, 'Stream added to video')
          console.log(evt.streams[0].getVideoTracks())
          remoteVideo.current.srcObject = evt.streams[0]
          remoteVideo.current.play().then(() => {
            console.log("Success to play video")
          }, (reason: any) => {
            console.log("failed to play video")
            console.log(reason)
          }).catch((reason: any) => {
            showError(reason)
          })
        }
      };
    }
  }

  // const addSendChannelHandler = (peer: Peer) => {
  //   const sendChannel = peer.sendChannel
  //   sendChannel.onopen()
  // }

  // const addHIDhandler = (element: HTMLVideoElement) => {
  //   // Mouse event
  //   if (peer) {
  //     element.addEventListener(MOUSE_CLICK, mouseEventHandler(element, MOUSE_CLICK, sendWebRTCMsg(peer)))
  //     element.addEventListener(MOUSE_DOUBLECLICK, mouseEventHandler(element, MOUSE_DOUBLECLICK, sendWebRTCMsg(peer)))
  //     element.addEventListener(MOUSE_UP, mouseEventHandler(element, MOUSE_UP, sendWebRTCMsg(peer)))
  //     element.addEventListener(MOUSE_DOWN, mouseEventHandler(element, MOUSE_DOWN, sendWebRTCMsg(peer)))
  //     element.addEventListener(MOUSE_MOVE, mouseEventHandler(element, MOUSE_MOVE, sendWebRTCMsg(peer)))
  //     // Mouse wheel event
  //     element.addEventListener(MOUSE_WHELL, wheelEventHandler(element, MOUSE_WHELL, sendWebRTCMsg(peer)))
  //     // Keyboard event
  //     document.addEventListener(KEY_PRESS, keyBoardEventHandler(element, KEY_PRESS, sendWebRTCMsg(peer)))
  //     document.addEventListener(KEY_DOWN, keyBoardEventHandler(element, KEY_DOWN, sendWebRTCMsg(peer)))
  //     document.addEventListener(KEY_UP, keyBoardEventHandler(element, KEY_UP, sendWebRTCMsg(peer)))
  //     // Gamepad event
  //     // window.addEventListener('gamepadconnected', gamepadHandler())
  //     // window.addEventListener('gamepaddisconnected', )
  //   }
  // }

  // const removeHIDhandler = (element: HTMLVideoElement) => {
  //   if (peer) {

  //     // Mouse event
  //     element.removeEventListener(MOUSE_CLICK, mouseEventHandler(element, MOUSE_CLICK, sendWebRTCMsg(peer)))
  //     element.removeEventListener(MOUSE_DOUBLECLICK, mouseEventHandler(element, MOUSE_DOUBLECLICK, sendWebRTCMsg(peer)))
  //     element.removeEventListener(MOUSE_UP, mouseEventHandler(element, MOUSE_UP, sendWebRTCMsg(peer)))
  //     element.removeEventListener(MOUSE_DOWN, mouseEventHandler(element, MOUSE_DOWN, sendWebRTCMsg(peer)))
  //     element.removeEventListener(MOUSE_MOVE, mouseEventHandler(element, MOUSE_MOVE, sendWebRTCMsg(peer)))
  //     // Mouse wheel event
  //     element.removeEventListener(MOUSE_WHELL, wheelEventHandler(element, MOUSE_WHELL, sendWebRTCMsg(peer)))
  //     // Keyboard event
  //     document.removeEventListener(KEY_PRESS, keyBoardEventHandler(element, KEY_PRESS, sendWebRTCMsg(peer)))
  //     document.removeEventListener(KEY_DOWN, keyBoardEventHandler(element, KEY_DOWN, sendWebRTCMsg(peer)))
  //     document.removeEventListener(KEY_UP, keyBoardEventHandler(element, KEY_UP, sendWebRTCMsg(peer)))
  //   }
  // }

  const addDataChannelHandler = (peer: Peer) => {
    const sendChannel = peer.sendChannel
    if (sendChannel) {
      sendChannel.onopen = () => {
        debug(DebugType.INFO, "datachannel has opend")
      }
      sendChannel.onclose = () => {
        debug(DebugType.INFO, "datachannel has closed")
      }
      sendChannel.onmessage = (ev: MessageEvent) => {
        debug(DebugType.LOG, "WebRTC datachannel message has received", ev.data)
      }
    }
  }

  useLayoutEffect(() => {
    if (socket) {
      addSocketCloseHandler(socket)
      addSocketOpenHandler(socket)
      addSocketMessageHandlers(socket)
    }
  }, [socket])

  useEffect(() => {
    // const videoEle = remoteVideo.current
    // if (videoEle) {
    //   addHIDhandler(videoEle)
    // }

    if (peer) {
      addIceCandidateHandler(peer)
      addTrackHandler(peer)
      addDataChannelHandler(peer)
    }
    return function cleanup() {
      // if (videoEle) {
      //   removeHIDhandler(videoEle)
      // }
    };
  }, [peer])

  // useEffect(() => {
    
  // }, [])

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
              // onClick={getPeerConnection}
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
      {/* {
        enabled && (
          <div className={styles.instructions}>Select a screen and press Start</div>
        )
      } */}
      <div id="remoteVideos"></div>
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
