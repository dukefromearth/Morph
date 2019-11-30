// Dependencies.
/*jshint esversion: 6 *///
import express from 'express';
import http from 'http';
import path from 'path';
import socketIO from 'socket.io';
import Game from './server/game.mjs';
import Constants from './shared/constants.mjs';
import { spawn } from 'child_process';

const constants = new Constants();
const __dirname = path.resolve(path.dirname(''));
const HOST = process.env.HOST || '0.0.0.0';
const environment = process.env.ENV || "prod";
const game = new Game(constants.get_map_size(), constants.get_map_size());
var num_users = 0;
const app = express();
const server = http.Server(app);
const io = socketIO(server);
const refresh_rate = 1000 / 60;
const port_num = 5000;

var sockets = {};

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
    sockets[socket.id] = socket;
    game.new_player(socket.id);
  });

  socket.on('disconnect', function () {
    delete sockets[socket.id];
    game.delete_player(socket.id);
    num_users--;
  });

  socket.on('movement', function (data) {
    game.update_player_pos(socket.id, data);
  });

});

function currentState(socket_id) {
  let players,objects = {};
  if(game.individual_client_objects[socket_id]){
    players = game.individual_client_objects[socket_id].players;
    objects = game.individual_client_objects[socket_id].objects;
  }
  const state = {
    players: players,
    objects: objects,
    time: Date.now()
  }
  //print_size_of_arr(state.objects);
  return state;
}

// //Run the genetic algorithm
// setInterval(function() {
//   runGA("123123123");
// }, 1000)

//This is where the game is updated
//Update the game 120 times a second
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
    for (let id in sockets) {
      let socket = sockets[id];
      if(game.individual_client_objects[socket.id]){
        let players = game.individual_client_objects[socket.id].players;
        let objects = game.individual_client_objects[socket.id].objects;
        socket.emit('state', players, objects , Date.now());
      }
    }
    game.bullet_array.length = 0;
    // io.emit('state',JSON.stringify(currentState2()));
  }
  console.timeEnd("Send Socket");
}, refresh_rate);
