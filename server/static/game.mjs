
/*jshint esversion: 6 */
//Thanks to https://github.com/vzhou842
//Duke from Earth
import DrawGame from './draw_game.mjs';
import { getCurrentState, initState, processGameUpdate } from './state_manager.js';

var socket = io();
var refresh_rate = 1000 / 60;
var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
var MAP_SIZE = 4000;
var drawGame = new DrawGame(canvas, context, MAP_SIZE);

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

function updateDirection(x, y) {
  return Math.atan2(y - canvas.height / 2, x - canvas.width / 2);
}

canvas.addEventListener('touchmove', function (event) {
  event.preventDefault();
  const touch = event.touches[0];
  movement.angle = updateDirection(touch0.clientX, touch1.clientY);
})

canvas.addEventListener('touchstart', function (event) {
  event.preventDefault();
  const touch = event.touches[0];
  const direction = updateDirection(touch.clientX, touch.clientY);
  //right
  if (direction > -Math.PI / 16 || direction < Math.PI / 16) {
    movement.right = true;
    movement.down = false;
    movement.left = false;
    movement.up = false;
  }
  //down right
  else if (direction > Math.PI / 16 && direction < 3 * Math.PI / 16) {
    movement.right = true;
    movement.down = true;
    movement.left = false;
    movement.up = false;
  }
  //down
  else if (direction > 3 * Math.PI / 16 && direction < 5 * Math.PI / 16) {
    movement.right = false;
    movement.down = true;
    movement.left = false;
    movement.up = false;
  }
  //down left
  else if (direction > 5 * Math.PI / 16 && direction < 7 * Math.PI / 16) {
    movement.right = false;
    movement.down = true;
    movement.left = true;
    movement.up = false;
  }
  //left
  else if (direction > 7 * Math.PI / 16 && direction < -7 * Math.PI / 16) {
    movement.right = false;
    movement.down = false;
    movement.left = true;
    movement.up = false;
  }
  //up left
  else if (direction > -7 * Math.PI / 16 && direction < -5 * Math.PI / 16) {
    movement.right = false;
    movement.down = false;
    movement.left = true;
    movement.up = true;
  }
  //up
  else if (direction > -5 * Math.PI / 16 && direction < -3 * Math.PI / 16) {
    movement.right = false;
    movement.down = false;
    movement.left = false;
    movement.up = true;
  }
  //up right
  else if (direction > -3 * Math.PI / 16 && direction < -Math.PI / 16) {
    movement.right = true;
    movement.down = false;
    movement.left = false;
    movement.up = true;
  }

})

document.addEventListener("mousemove", function (event) {
  movement.mousex = event.clientX;
  movement.mousey = event.clientY;
  movement.angle = updateDirection(movement.mousex, movement.mousey);
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

// update player movement to server


socket.on('state', function (state) {
  processGameUpdate(state);
});

socket.on('bombs-update', function (bomb_locs) {
  drawGame.bombs = bomb_locs;
});


var current_state = {};
setInterval(function () {
  console.log(movement.angle);
  current_state = getCurrentState();
  drawGame.players = current_state.players;
  drawGame.asteroids = current_state.asteroids;
  drawGame.planets = current_state.planets;
  // if(current_state.bombs.is_alive){
  //   drawGame.bombs = current_state.bombs.bomb_locations;
  // }
  // else drawGame.bombs = [];
  drawGame.all(socket.id, movement);
  socket.emit('movement', movement);
  socket.emit('shoot-bullet', movement.angle);
  //if (bomb) socket.emit('shoot-bomb');
}, refresh_rate)
