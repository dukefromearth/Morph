// Dependencies.
/*jshint esversion: 6 *///
import express from 'express';
import http from 'http';
import path from 'path';
import socketIO from 'socket.io';
import runGA from './run.mjs';
import Game from './src/game.mjs';

const __dirname = path.resolve(path.dirname(''));
const HOST = process.env.HOST || '0.0.0.0';
const environment = process.env.ENV || "prod";
const game = new Game(4000, 4000);
var num_users = 0;
const app = express();
const server = http.Server(app);
const io = socketIO(server);
const refresh_rate = 1000 / 60;
const port_num = 5000;

app.set('port', port_num);
app.use('/static', express.static('./static'));
app.use('/node_modules', express.static('./node_modules'))

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

function currentState(){
  const state = {
    players: Object.keys(game.players).map(i=>game.players[i].serialize()),
    objects: game.object_array,
    collisions: game.collisions,
    time: Date.now()
  }
  return state;
}

//Run the genetic algorithm
setInterval(function() {
  runGA([[12,1],[45,8],[66,3]]);
}, 1000)

//This is where the game is updated
//Update the game 120 times a second
setInterval(function(){
  // console.time("update");
  if (num_users) {
    game.update()
  }
  // console.timeEnd("update");
}, 1000/120);

//Send socket emits 30 times a second
setInterval(function () {
  // console.time("Send Socket");
  if (num_users) {
    io.sockets.emit('state', currentState());
    game.collisions.length = 0;
  }
  // console.timeEnd("Send Socket");
}, refresh_rate);