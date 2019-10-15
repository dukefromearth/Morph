// Dependencies.
var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');

var app = express();
var server = http.Server(app);
var io = socketIO(server);

var WINDOW_WIDTH = 800;
var WINDOW_HEIGHT = 600;

var move_speed = 5;
var bullet_speed = 2;
var bullet_delay_millis =  50*bullet_speed;
var bullet_size = 3;
var max_bullets = 100;
var last_bullet_time = 0;
var min_health = 5;
var refresh_rate = 1000/60;
var port_num = process.env.PORT || 5000;

const environment = process.env.ENV || "prod";

app.set('port', port_num);
app.use('/static', express.static(__dirname + '/static'));

// Routing
app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, 'index.html'));
});

server.listen(port_num, function() {
  console.log(`Running as ${environment} environment`);
  console.log('Starting server on port', port_num);
});

var players = {};
var bullets = [];

io.on('connection', function(socket) {

  socket.on('new player', function() {
    players[socket.id] = {
      x: 30+Math.floor(Math.random()*(WINDOW_WIDTH-60)),
      y: 30+Math.floor(Math.random()*(WINDOW_HEIGHT-60)),
      gun_angle: 0,
      health: min_health,
      collision: false,
      id: socket.id,
      mousex: 0,
      mousey: 0
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
    player.mousex = data.mousex;
    player.mousey = data.mousey;
  });

  free_bullet_index = -1;

  //When player presses shoot key, mouse position is sent here, a new bullet is pushed to bullet array.
  socket.on('shoot-bullet', function(angle){
    if(players[socket.id] === undefined) return; //happens if server restarts
    //Check time since last bullet
    console.log(players[socket.id]);
    var curr_time = Date.now();
    if (curr_time - last_bullet_time > bullet_delay_millis){
      var x = Math.cos(angle) * 10;
      var y = Math.sin(angle) * 10; 
      var new_bullet = {owner: players[socket.id].id, x: players[socket.id].x + x, y: players[socket.id].y + y, time: curr_time, angle: angle, size: bullet_size, is_alive: true};
      if(bullets.length > max_bullets) bullets.shift();
      bullets.push(new_bullet);
      last_bullet_time = curr_time;
    }
  });
});
 
function collision(){
  for (var bID in bullets){
    bullet = bullets[bID];
    for(var pID in players){
      player = players[pID];
      if((Math.abs(bullet.x - player.x)) < 10 && (Math.abs(bullet.y - player.y)) < 10 && bullet.owner != player.id && bullet.is_alive){
        player.health -= 1;
        bullet.is_alive = false;
      }
    }
    bullet.x += Math.cos(bullet.angle) * bullet_speed;
    bullet.y += Math.sin(bullet.angle) * bullet_speed; 
    if (bullet.x > 800 || bullet.y > 600 || bullet.x < 0 || bullet.y < 0) {
      free_bullet_index = bID;
    }
  }
}

setInterval(function() {
  io.sockets.emit('state', players);
  io.sockets.emit('bullets-update', bullets);
  collision();
}, refresh_rate);

