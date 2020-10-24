import { config } from './config'
import r, { Expression, Time } from 'rethinkdb'
import WebSocket from 'ws'
import './message-generator'

const wsserver = new WebSocket.Server({ port: config.websocketServer.port, host: config.websocketServer.host })

interface IMessage {
  jsonrpc: string
  method: string
  params: { createdAt?: Expression<Time>; deskId?: string }
}

interface IPlayer {
  id: string
  desk: string
  params: { createdAt?: Expression<Time>; deskId?: string }
}

const playersAtDesks = [{}]

var rdbConn
r.connect(config.rethinkdb, (err, conn) => {
  rdbConn = conn
  if (err) {
    console.log('Could not connect to rethinkdb.')
    console.log(err.message)
  } else {
    console.log('Rethinkdb connection successful.')
    
    //check an existance required db and table
    //add function accepts list of required db and tables
    r.dbList().run(rdbConn, (err, result) => {
      if (!result.includes('chat')) {
        r.dbCreate('chat')
          .run(rdbConn)
          .then(() => {
            r.db('chat')
              .tableList()
              .run(rdbConn)
              .then(() => {
                !result.includes('messages') && r.db('chat').tableCreate('messages').run(rdbConn)
              })
          })
      }
    })
  }
})

wsserver.on('connection', (ws, req) => {
  const ip = req.socket.remoteAddress
  let ipProxy = req.headers['x-forwarded-for']
  if (ipProxy instanceof String) {
    ipProxy = ipProxy.split(/\s*,\s*/)[0]
  }
  console.log(`Connected ip ${ip}`)
  console.log(`Connected ipProxy ${ip}`)

  ws.on('message', (message: string) => {
    const externalCommand: IMessage = JSON.parse(message)
    // console.log('Server receiving message', externalCommand)
    switch (externalCommand.method) {
      case 'addMessage':
        const newMessage = externalCommand.params
        newMessage.createdAt = r.now()
        try {
          r.table('messages')
            .insert(newMessage, { returnChanges: true })
            .run(rdbConn, (err: Error, result: any) => {
              if (err) throw err
              console.log('\nMessage added: \n', result.changes[0].new_val)
              wsserver.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                  client.send(message)
                }
              })
            })
        } catch (e) {
          console.log(e)
        }

        break
      case 'getDesk':
        const deskId = externalCommand.params.deskId
        r.table('messages')
          .filter(r.row('deskId').eq(deskId))
          .run(rdbConn, (err, result) => {
            if (err) throw err
            result.toArray((err, result) => {
              if (err) throw err
              const deskData = JSON.stringify(result, null, 2)
              console.log(deskData)
              ws.send(deskData)
            })
          })
        break
      default:
        console.log(`Method ${externalCommand.method} does not exist.`)
    }
  })

  ws.send(JSON.stringify('Server is online'))
  ws.on('open', (event) => {
    console.log('Client connected')
  })
  ws.on('close', (event) => {
    console.log('Client left')
  })
})
