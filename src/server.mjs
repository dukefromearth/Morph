// Dependencies.
/*jshint esversion: 6 *///
import express from 'express';
import http from 'http';
import path from 'path';
import socketIO from 'socket.io';
import Game from './server/game.mjs';
import { MAP_SIZE } from './shared/constants.mjs';

const __dirname = path.resolve(path.dirname(''));
const map_size = MAP_SIZE;
const HOST = process.env.HOST || '0.0.0.0';
const environment = process.env.ENV || "prod";
const game = new Game(map_size, map_size);
var num_users = 0;
const app = express();
const server = http.Server(app);
const io = socketIO(server);
const refresh_rate = 1000 / 60;
const port_num = 5000;

app.set('port', port_num);
app.use('/client', express.static('./client'));
app.use('/shared', express.static('./shared'))

// Routing
app.get('/', function (request, response) {
  response.sendFile(path.join(__dirname, '/index.html'));
});

app.get('/call', function(request, response){
  fetch('http://localhost:5001/call', { method: 'GET'})
    .then(res => res.json()) // expecting a json response
    .then(json => {
      console.log(json)
      return json
    });
})
server.listen(port_num, function () {
  console.log(`Running as ${environment} environment`);
  console.log('Starting server on port', port_num);
});

io.on('connection', function (socket) {
  num_users++;
  socket.on('new player', function () {
    game.new_player(socket.id);
  });

  socket.on('disconnect', function () {
    game.delete_player(socket.id);
    num_users--;
  });

  socket.on('movement', function (data) {
    game.update_player_pos(socket.id, data);
  });
  
  socket.on('shoot-bomb', function () {
    game.new_bomb(socket.id);
  });

});

function currentState(socket_id) {
  if (!game.individual_client_objects[socket_id]) return {};
  const state = {
    players: game.individual_client_objects[socket_id].players,
    objects: game.individual_client_objects[socket_id].objects,
    time: Date.now(),
    bombs: game.bomb,
    top: game.top_scores
  }
  return state;
}

setInterval(function () {
  if (num_users) {
    // console.time("update");
    game.update();
    // console.timeEnd("update");
    // console.time("Send Socket");
    let sockets = io.sockets.sockets;
    for (let id in sockets) {
      let socket = sockets[id];
      let update = currentState(socket.id);
      if (game.individual_client_objects[socket.id]) {
        // console.log("Players: ", Object.keys(update.players).length,
        //   "Objects: ", Object.keys(update.objects).length);
        io.to(socket.id).emit('state', update);
      }
    }
  }
}, 1000/120);