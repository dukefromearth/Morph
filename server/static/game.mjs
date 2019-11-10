
/*jshint esversion: 6 */
//Thanks to https://github.com/vzhou842
import DrawGame from './draw_game.mjs';

var socket = io();
var refresh_rate = 1000/60;
var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
var MAP_SIZE = 2000;
var drawGame = new DrawGame(canvas,context,MAP_SIZE);

var movement = {
    up: false,
    down: false,
    left: false,
    right: false,
    mousex: 0,
    mousey: 0,
    angle: 0
};

var bullet = false;
var bomb = false;
var asteroid = false;

socket.on('message', function(data){
    console.log(data);
});

document.addEventListener("mousemove", function(event) {
  movement.mousex = event.clientX;
  movement.mousey = event.clientY;
  movement.angle = Math.atan2(movement.mousey - canvas.height/2, movement.mousex - canvas.width/2);
});

document.addEventListener('keydown', function(event) {
    switch (event.keyCode) {
      case 65: // A
        movement.left = true;
        break;
      case 87: // W
        movement.up = true;
        break;
      case 68: // D
        movement.right = true;
        break;
      case 83: // S
        movement.down = true;
        break;
      case 32: // Space
        bullet = true;
        break;
      case 16: // Shift
        bomb = true;
        break;
      case 81: //q temp for asteroid testing
        asteroid = true;
        break;
    } 
  });

document.addEventListener('keyup', function(event) {
    switch (event.keyCode) {
      case 65: // A
          movement.left = false;
          break;
      case 87: // W
          movement.up = false;
          break;
      case 68: // D
          movement.right = false;
          break;
      case 83: // S
          movement.down = false;
          break;
      case 32: // Space
          bullet = false;
          break;
      case 16: // Shift
          bomb = false;
          break;
      case 81: //q for testing asteroids
          asteroid = false;
          break;
    }
});

socket.on('connection', function(socket) {
  drawGame.players[socket.id] = socket;
  
  socket.on('disconnect', function() {
    drawGame.players[socket.id].disconnect();
  });
});
socket.emit('new player');
// update player movement to server

setInterval(function() {
  console.log("bullet: ", bullet);
    socket.emit('movement', movement);
    if(bullet) socket.emit('shoot-bullet', movement.angle);
    if(bomb) socket.emit('shoot-bomb');
    if(asteroid) socket.emit('new_asteroid');
}, refresh_rate);

socket.on('state', function(players) {
  drawGame.players = players;
});

socket.on('bullets-update', function(bullets){
  drawGame.bullets = bullets;
});

socket.on('bombs-update', function(bomb_locs){
  drawGame.bombs = bomb_locs;
});

socket.on('asteroids_update',function(asteroid){
  drawGame.asteroids = asteroid;
});

function Draw(){
  drawGame.all(socket.id);
  window.requestAnimationFrame(Draw);
}
window.requestAnimationFrame(Draw);
