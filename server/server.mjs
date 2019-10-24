// Dependencies.
/*jshint esversion: 6 */
import express from 'express';
import http from 'http';
import path from 'path';
import socketIO from 'socket.io';
import Game from './game.mjs';

const HOST = process.env.HOST || '0.0.0.0';
const environment = process.env.ENV || "prod";

var game = new Game(800,600);

var app = express();
var server = http.Server(app);
var io = socketIO(server);

var refresh_rate = 1000/60;
var port_num = 5050;

app.set('port', port_num);
app.use('/static', express.static('./static'));

// Routing
app.get('/', function(request, response) {
  response.sendFile('/Users/stephenduke/Documents/GitHub/Morph/server/index.html');
});

server.listen(port_num, function() {
  console.log(`Running as ${environment} environment`);
  console.log('Starting server on port', port_num);
});

io.on('connection', function(socket) {
  socket.on('new player', function() {
    game.new_player(socket.id);
  });
  
  socket.on('disconnect', function() {
    game.delete_player(socket.id);
  });

  socket.on('movement', function(data) {
    game.update_player_pos(socket.id,data);
  });

  socket.on('shoot-bullet', function(){
    game.new_bullet(socket.id);
  });
});

setInterval(function() {
  io.sockets.emit('state', game.players);
  io.sockets.emit('bullets-update', game.bullets);
  game.update();
}, refresh_rate);

