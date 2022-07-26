// import { Server } from 'socket.io'
// import type { NextApiRequest, NextApiResponse } from 'next'
// import { Socket } from 'socket.io-client'
// import Cors from 'cors'

// // const cors = Cors({
// //   methods: ['GET', 'HEAD']
// // })

// const cors = Cors()

// // Helper method to wait for a middleware to execute before continuing
// // And to throw an error when an error happens in a middleware
// function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: any) {
//   return new Promise((resolve, reject) => {
//     fn(req, res, (result : any) => {
//       if (result instanceof Error) {
//         return reject(result)
//       }
//       return resolve(result)
//     })
//   })
// }

// const SocketHandler = (
//   req: NextApiRequest,
//   res: NextApiResponse
// ) => {
//   runMiddleware(req, res, cors)
//   if (res.socket.server.io) {
//     console.log('Socket is already running')
//   } else {
//     console.log('Socket is initializing')
//     const io = new Server(res.socket.server)
//     io.on('connection', (socket: Socket) => {
//       socket.on('close', () => {
//         console.log("closed")
//       })
//     })
//     res.socket.server.io = io
//   }
//   res.end()
// }

// export default SocketHandler

// import { Server, Socket } from "socket.io"

// const io = new Server({
//   path: '/api/socket',
//   cors: {
//     origin: 'http://localhost:3000',
//     methods: ["GET", "POST"]
//   }
// })

// io.on('connection', (socket: Socket) => {
//   console.log('connected')
// })
// const io = require('socket.io')({path: })