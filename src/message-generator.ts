import WebSocket from 'ws'
import { getRandomInt, splitedText } from './utils'
import { deskIds, playerIds } from './data'
import { getRandomElemenet } from './utils'
import { config } from './config'

const ws = new WebSocket(`ws://localhost:${config.websocketServer.port}`)

ws.on('open', () => {
  setInterval(() => {
    const newMessage = {
      jsonrpc: '2.0',
      method: 'getDesk',
      params: { deskId: 'd9bed5a0-74c7-412e-9971-f6218ed519b8' },
    }
    ws.send(JSON.stringify(newMessage))
  }, 5000)

  setInterval(() => {
    const text = getRandomElemenet(splitedText)
    const playerId = getRandomElemenet(playerIds)
    const deskId = getRandomElemenet(deskIds)
    if (text && playerId && deskId) {
      const newMessage = {
        jsonrpc: '2.0',
        method: 'addMessage',
        params: {
          text,
          playerId,
          deskId,
        },
      }
      //   console.log('Message generator send message: ', newMessage)
      ws.send(JSON.stringify(newMessage))
    }
  }, 1000)
})
