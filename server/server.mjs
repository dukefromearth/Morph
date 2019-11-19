// Dependencies.
/*jshint esversion: 6 */
import express from 'express';
import http from 'http';
import path from 'path';
import socketIO from 'socket.io';
import Game from './src/game.mjs';

var __dirname = path.resolve(path.dirname(''));

const HOST = process.env.HOST || '0.0.0.0';
const environment = process.env.ENV || "prod";

var game = new Game(4000, 4000);

var num_users = 0;

var app = express();
var server = http.Server(app);
var io = socketIO(server);

var refresh_rate = 1000 / 30;
var port_num = 5000;

app.set('port', port_num);
app.use('/static', express.static('./static'));

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

  socket.on('shoot-bullet', function () {
    game.new_bullet(socket.id);
    game.new_seeker(socket.id);
  });

  socket.on('shoot-bomb', function () {
    game.new_bomb(socket.id);
  });
});

function currentState(){
  const state = {
    players: game.players_serialized,
    time: Date.now(),
    asteroids: game.asteroid_belt,
    bombs: game.bomb
  }
  return state;
}

setInterval(function () {
  const used = process.memoryUsage();
        console.log("\nUpdate Beginning");
        for (let key in used) {
        console.log(`${key} ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);
        }
  if (num_users) {
    console.time('update');
    game.update();
    console.timeEnd('update');
    io.sockets.emit('state', currentState());
  }
}, refresh_rate);

