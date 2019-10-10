// Dependencies.
var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');

var app = express();
var server = http.Server(app);
var io = socketIO(server);

var move_speed = 5;
var refresh_rate = 1000/60;
var port_num = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';
const environment = process.env.ENV || "prod"

app.set('port', port_num);
app.use('/static', express.static(__dirname + '/static'));

// Routing
app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, 'index.html'));
});

server.listen(port_num, function() {
  console.log(`Running as ${environment} environment`)
  console.log('Starting server on port', port_num);
});

var players = {};
io.on('connection', function(socket) {
  socket.on('new player', function() {
    players[socket.id] = {
      x: 300,
      y: 300
    };
  });

  socket.on('disconnect', function() {
    delete players[socket.id];
  });

  socket.on('movement', function(data) {
    var player = players[socket.id] || {};
    if (data.left) {
      player.x -= move_speed;
    }
    if (data.up) {
      player.y -= move_speed;
    }
    if (data.right) {
      player.x += move_speed;
    }
    if (data.down) {
      player.y += move_speed;
    }
  });
});

setInterval(function() {
  io.sockets.emit('state', players);
}, refresh_rate);
