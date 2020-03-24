const app = require('express')()
const server = require('http').Server(app)
const p2pserver = require('socket.io-p2p-server').Server
const uuidv4 = require('uuid').v4
const io = require('socket.io')(server)
const faker = require('faker')

// app.use(express.static(__dirname))
app.get('/', function(req, res) {
  res.send(roomsToString());
});
io.use(p2pserver)

const rooms = {}

const roomsToString = () => JSON.stringify(Object.values(rooms).map(room => ({
  ...room,
  host: null,
  players: room.players.map(player => ({name: player.name}))
})))

const createRoom = ({socket, io}) => (name) => {
  try {
    const rid = uuidv4()
    const roomName = faker.hacker.noun()
    rooms[rid] = {
      id: rid,
      host: socket,
      name: roomName,
      players: [
        {
          socket,
          name
        }
      ]
    }
    dispatchRooms(io)
    socket.emit('create-room', rid)
  } catch (e) {
    console.error(e)
  }
}

const enterRoom = ({socket, io}) => ({rid, name}) => {
  try {
    if (!(rooms[rid].players.find(p => p.socket === socket))) {
      rooms[rid].players.push({socket, name})
      dispatchRooms(io)
    }
  } catch (e) {
    console.error(e)
  }
}

const leaveRoom = ({socket, io}) => (rid) => {
  try {
    if (rid) {
      if (rooms[rid].players.find(p => p.socket === socket)) {
        rooms[rid].players = rooms[rid].players.filter(p => p.socket !== socket)
        if (rooms[rid].host === socket) {
          delete rooms[rid]
        }
        dispatchRooms(io)
      }
    } else {
      let changed = false
      Object.values(rooms).forEach(room => {
        if (room.players.find(p => p.socket === socket)) {
          changed = true
          room.players = room.players.filter(p => p.socket !== socket)
          if (room.host === socket) {
            delete rooms[room.id]
          }
        }
      })
      if (changed) {
        dispatchRooms(io)
      }
    }
  } catch (e) {
    console.error(e)
  }
}

const dispatchRooms = (socket) => socket.emit('rooms', Object.values(rooms).map(room => ({
  ...room,
  host: null,
  players: room.players.map(player => ({name: player.name}))
})))

io.on('connection', function(socket) {

  dispatchRooms(socket)

  socket.on('enter-room', enterRoom({socket, io}))

  socket.on('create-room', createRoom({socket, io}))

  socket.on('leave-room', leaveRoom({socket, io}))

  socket.on('get-rooms', () => dispatchRooms(socket))

  socket.on('disconnect', leaveRoom({socket, io}))

  // socket.on('peer-msg', function(data) {
  //   console.log('Message from peer: %s', data);
  //   socket.broadcast.emit('peer-msg', data);
  // })
  //
  // socket.on('go-private', function(data) {
  //   console.log('private')
  //   socket.broadcast.emit('go-private', data);
  // });
});

server.listen(3030, function() {
  console.log("Listening on 3030")
})
