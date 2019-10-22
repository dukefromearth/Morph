// Dependencies.
/*jshint esversion: 6 */
import express from 'express';
import http from 'http';
import path from 'path';
import socketIO from 'socket.io';
import Player from './player.mjs';  
import Bullet from './bullet.js';


var app = express();
var server = http.Server(app);
var io = socketIO(server);

var WINDOW_WIDTH = 800;
var WINDOW_HEIGHT = 600; 

var bullet_speed = 4;
var bullet_delay_millis =  50*bullet_speed;
var max_bullets = 100;
var last_bullet_time = 0;

var refresh_rate = 1000/60;
var port_num = 5050;

var free_bullet_index = -1;

app.set('port', port_num);
app.use('/static', express.static('./static'));

// Routing
app.get('/', function(request, response) {
  response.sendFile('/Users/stephenduke/Documents/GitHub/Morph/server/index.html');
});

server.listen(port_num, function() {
  //console.log(`Running as ${environment} environment`);
  console.log('Starting server on port', port_num);
});

var players = {};
var bullets = [];

io.on('connection', function(socket) {

  socket.on('new player', function() {
    players[socket.id] = new Player(socket.id);
    console.log(players[socket.id]);
  });
  
  socket.on('disconnect', function() {
    delete players[socket.id];
  });

  socket.on('movement', function(data) {
    var player = players[socket.id] || {};
    if (data.left) {
      player.x -= player.speed;
    }
    if (data.up) {
      player.y -= player.speed;
    }
    if (data.right) {
      player.x += player.speed;
    }
    if (data.down) {
      player.y += player.speed;
    }
    player.mousex = data.mousex;
    player.mousey = data.mousey;
  });

  //When player presses shoot key, mouse position is sent here, a new bullet is pushed to bullet array.
  socket.on('shoot-bullet', function(angle){
    var player = players[socket.id];
    if(player === undefined) return; //happens if server restarts
    var curr_time = Date.now();
    if (curr_time - player.time_at_last_shot > player.bullets_per_sec){
      var x = Math.cos(angle) * 10; //start away from player
      var y = Math.sin(angle) * 10; //start away from player.
      var new_bullet = new Bullet(player.x+x,player.y+y,angle,player.id);
      if(bullets.length > max_bullets) bullets.shift();
      bullets.push(new_bullet);
      player.time_at_last_shot = curr_time;
    }
  });
});


function collision(){
  for (var bID in bullets){
    var bullet = bullets[bID];
    for(var pID in players){
      var player = players[pID];
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

