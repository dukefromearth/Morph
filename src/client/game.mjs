/*jshint esversion: 6 */
//Thanks to https://github.com/vzhou842

import DrawGame from './draw_game.mjs';
import { getCurrentState, initState, processGameUpdate } from './state_manager.js';
import { MAP_SIZE } from '../shared/constants.mjs'

const map_size = MAP_SIZE;
const socket = io();
const refresh_rate = 1000 / 60;
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const drawGame = new DrawGame(canvas, context, map_size);

var movement = {
  up: false,
  down: false,
  left: false,
  right: false,
  mousex: 0,
  mousey: 0,
  angle: 0
};

socket.on('message', function (data) {
  console.log(data);
});

function updateDirection(x, y) {
  return Math.atan2(y - canvas.height / 2, x - canvas.width / 2);
}

canvas.addEventListener('touchmove', function (event) {
  event.preventDefault();
  const touch = event.touches[0];
  movement.angle = updateDirection(touch.clientX, touch.clientY);
})

canvas.addEventListener('touchstart', function (event) {
  event.preventDefault();
  const touch = event.touches[0];
  const direction = updateDirection(touch.clientX, touch.clientY);
  //right
  if (direction > -Math.PI / 8 && direction < 0 || direction > 0 && direction < Math.PI / 8) {
    movement.right = true;
    movement.down = false;
    movement.left = false;
    movement.up = false;
  }
  //down right
  else if (direction > Math.PI / 8 && direction < 3 * Math.PI / 8) {
    movement.right = true;
    movement.down = true;
    movement.left = false;
    movement.up = false;
  }
  //down
  else if (direction > 3 * Math.PI / 8 && direction < 5 * Math.PI / 8) {
    movement.right = false;
    movement.down = true;
    movement.left = false;
    movement.up = false;
  }
  //down left
  else if (direction > 5 * Math.PI / 8 && direction < 7 * Math.PI / 8) {
    movement.right = false;
    movement.down = true;
    movement.left = true;
    movement.up = false;
  }
  //left
  else if (direction < Math.PI && direction > 7 * Math.PI / 8 || direction > -Math.PI && direction < -7 * Math.PI / 8) {
    movement.right = false;
    movement.down = false;
    movement.left = true;
    movement.up = false;
  }
  //up left
  else if (direction > -7 * Math.PI / 8 && direction < -5 * Math.PI / 8) {
    movement.right = false;
    movement.down = false;
    movement.left = true;
    movement.up = true;
  }
  //up
  else if (direction > -5 * Math.PI / 8 && direction < -3 * Math.PI / 8) {
    movement.right = false;
    movement.down = false;
    movement.left = false;
    movement.up = true;
  }
  //up right
  else if (direction > -3 * Math.PI / 8 && direction < -Math.PI / 8) {
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

socket.on('state', function (state) {
  processGameUpdate(state);
});

setInterval(function () {
  socket.emit('movement', movement);
  drawGame.update_state(getCurrentState());
  drawGame.all(socket.id, movement);
}, refresh_rate);
