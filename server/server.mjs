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


//Send socket emits
setInterval(function () {
  game.update()
  // console.time("Send Socket");
  if (num_users) {
    for (let id in sockets) {
      let socket = sockets[id];
      socket.emit('state', game.individual_client_objects[socket.id], Date.now());
    }
    game.bullet_array.length = 0;
  }
  // console.timeEnd("Send Socket");
}, refresh_rate);
