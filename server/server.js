// Dependencies.
var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');

var app = express();
var server = http.Server(app);
var io = socketIO(server);

var move_speed = 5;
var bullet_speed = 5;
var bullet_delay_millis = 0;
var bullet_size = 10;
var refresh_rate = 1000/60;
<<<<<<< Updated upstream
var port_num = 5000;
=======
var port_num = process.env.PORT || 5000;

var last_time = 0;

const environment = process.env.ENV || "prod";
>>>>>>> Stashed changes

app.set('port', port_num);
app.use('/static', express.static(__dirname + '/static'));

// Routing
app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, 'index.html'));
});

server.listen(port_num, function() {
<<<<<<< Updated upstream
=======
  console.log(`Running as ${environment} environment`);
>>>>>>> Stashed changes
  console.log('Starting server on port', port_num);
});

var players = {};
var bullets = [];
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

  //When player presses shoot key, mouse position is sent here, a new bullet is pushed to bullet array.
  socket.on('shoot-bullet', function(angle){
    if(players[socket.id] === undefined) return; //happens if server restarts
    //Check time since last bullet
    var curr_time = Date.now();
    if (curr_time - last_time > bullet_delay_millis){
      var x = Math.cos(angle) * 10;
      var y = Math.sin(angle) * 10; 
      var new_bullet = {x: players[socket.id].x + x, y: players[socket.id].y + y, time: curr_time, angle: angle, size: bullet_size};
      bullets.push(new_bullet);
      if(bullets.length > 100) bullets.shift();
      last_time = curr_time;
    }
  });
});

setInterval(function() {
  io.sockets.emit('state', players);
  for (var id in bullets) {
    bullet = bullets[id];
    bullet.x += Math.cos(bullet.angle) * bullet_speed;
    bullet.y += Math.sin(bullet.angle) * bullet_speed; 
    if(id === 0) console.log(bullet.x, bullet.y);
    if (bullet.x > 800 || bullet.y > 600 || bullet.x < 0 || bullet.y < 0) {
      bullets.shift();
    }
  }
  io.sockets.emit('bullets-update', bullets);
}, refresh_rate);

