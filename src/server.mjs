// Dependencies.
/*jshint esversion: 6 *///
import express from 'express';
import http from 'http';
import path from 'path';
import socketIO from 'socket.io';
import Game from './server/game.mjs';
import Run from './run.mjs';
import { MAP_SIZE } from './shared/constants.mjs'

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

});

function currentState(socket_id) {
  if (!game.individual_client_objects[socket_id]) return {};
  const state = {
    players: game.individual_client_objects[socket_id].players,
    objects: game.individual_client_objects[socket_id].objects,
    time: Date.now()
  }
  return state;
}


//Run the genetic algorithm
// setInterval(function() {
//   Run("123123123");
// }, 1000)

//This is where the game is updated
//Update the game 60 times a second
setInterval(function () {
  console.time("update");
  if (num_users) {
    game.update()
  }
  console.timeEnd("update");
}, 1000 / 60);

//Send socket emits 30 times a second
setInterval(function () {
  console.time("Send Socket");
  if (num_users) {
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
  console.timeEnd("Send Socket");
}, refresh_rate);