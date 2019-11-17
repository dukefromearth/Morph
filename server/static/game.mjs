
/*jshint esversion: 6 */
//Thanks to https://github.com/vzhou842
import DrawGame from './draw_game.mjs';
import {initState, processGameUpdate, getCurrentState, modifyGamestart} from './state_manager.js'

var socket = io();
var refresh_rate = 1000 / 60;
var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
var MAP_SIZE = 4000;
var drawGame = new DrawGame(canvas, context, MAP_SIZE);
var ping_sent = 0;
var ping_count = 1;
var ping_avg = 0;

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

socket.on('message', function (data) {
  console.log(data);
});

document.addEventListener("mousemove", function (event) {
  movement.mousex = event.clientX;
  movement.mousey = event.clientY;
  movement.angle = Math.atan2(movement.mousey - canvas.height / 2, movement.mousex - canvas.width / 2);
});

document.addEventListener('keydown', function (event) {
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
  }
});

document.addEventListener('keyup', function (event) {
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
  }
});

socket.on('connection', function (socket) {
  drawGame.players[socket.id] = socket;
  
  socket.on('disconnect', function () {
    drawGame.players[socket.id].disconnect();
  });
});

socket.emit('new player');
initState();
ping_sent = Date.now();
socket.emit('pip','ping_sent');

// update player movement to server

// setInterval(function () {
//   socket.emit('movement', movement);
//   if (bullet) socket.emit('shoot-bullet', movement.angle);
//   if (bomb) socket.emit('shoot-bomb');
// }, refresh_rate);

var time1,time2;
socket.on('state', function (players,time) {
  time1 = performance.now();
  processGameUpdate(players,time,ping_avg);
  //console.log("Time since last update: ", time1 - time2);
  time2 = time1;
});

socket.on('bombs-update', function (bomb_locs) {
  drawGame.bombs = bomb_locs;
});

socket.on('asteroids_update', function (asteroid) {
  drawGame.asteroids = asteroid;
});

//Sends a number of packets back and forth between server to determine the average server ping
//Adds that delay to our gamestart in state_manager
socket.on('pop', function(){
  if(ping_count<400){
    ping_avg = (ping_count*ping_avg + (Date.now()-ping_sent))/++ping_count;
    ping_sent = Date.now();
    socket.emit('pip');
  } else {
    console.log("TCL: ping_avg", ping_avg)
    modifyGamestart(ping_avg/2);
  }
});

setInterval(function() {
  drawGame.players = getCurrentState();
  drawGame.all(socket.id, movement);
  socket.emit('movement', movement);
  if (bullet) socket.emit('shoot-bullet', movement.angle);
  if (bomb) socket.emit('shoot-bomb');
}, refresh_rate)


// function Draw() {
//   drawTime1 = performance.now();
//   drawGame.players = getCurrentState();
//   drawGame.all(socket.id, movement);
//   console.log("Time since last draw: ", drawTime1 - drawTime2);
//   drawTime2 = drawTime1;
//   window.requestAnimationFrame(Draw);
// }
// window.requestAnimationFrame(Draw);
