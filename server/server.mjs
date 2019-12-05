// Dependencies.
/*jshint esversion: 6 *///
import express from 'express';
import http from 'http';
import path from 'path';
import socketIO from 'socket.io';
<<<<<<< HEAD
import Game from './src/game.mjs';

import * as Sentry from '@sentry/node';



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
=======
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
>>>>>>> b687f972ea970693077e6b124d3e6d4b5b84140d

if(environment === "prod")
  Sentry.init({ dsn: 'https://c0345c3b5bad4241afe661e1e23d5197@sentry.io/1835657' });

// The request handler must be the first middleware on the app
app.use(Sentry.Handlers.requestHandler());
// The error handler must be before any other error middleware
app.use(Sentry.Handlers.errorHandler());

app.listen(3000);


app.set('port', port_num);
<<<<<<< HEAD
app.use('/static', express.static('./static'));
=======
app.use('/client', express.static('./client'));
app.use('/shared', express.static('./shared'))
>>>>>>> b687f972ea970693077e6b124d3e6d4b5b84140d

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
<<<<<<< HEAD
    game.new_player(socket.id);
  });

  socket.on('disconnect', function () {
    game.delete_player(socket.id);
    num_users--;
  });

  socket.on('movement', function (data) {
    game.update_player_pos(socket.id, data);
    game.new_bullet(socket.id);
  });

  // socket.on('shoot-bullet', function () {
  //   game.new_bullet(socket.id);
  // });

  socket.on('shoot-bomb', function () {
    game.new_bomb(socket.id);
=======
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
>>>>>>> b687f972ea970693077e6b124d3e6d4b5b84140d
  });
});

function currentState(){
  const state = {
    players: game.players_serialized,
    time: Date.now(),
    asteroids: game.asteroid_belt,
    bombs: game.bomb,
    planets: game.planets,
    home_planet: game.home_planet,
    collisions: game.collisions.collisions
  }
  return state;
}

<<<<<<< HEAD
setInterval(function () {
  if (num_users) {
    game.update();
  }
}, 1000/120);


setInterval(function () {
  if (num_users) {
    io.sockets.emit('state', currentState()); 
  }
}, refresh_rate);

=======
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
>>>>>>> b687f972ea970693077e6b124d3e6d4b5b84140d
