/*jshint esversion: 6 */
//Thanks to https://github.com/vzhou842
// fix python script
// funtion to cycle directions give random payloads
// fubntion to insert into direction banks
// function to give random directions and delete them
import { MAP_SIZE } from '../shared/constants.mjs';
import DrawGame from './draw_game.mjs';
import { getCurrentState, initState, processGameUpdate } from './state_manager.js';

const map_size = MAP_SIZE;
const socket = io();
const refresh_rate = 1000 / 60;
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const drawGame = new DrawGame(canvas, context, map_size);
var bomb = false;

var movement = {
  up: false,
  down: false,
  left: false,
  right: false,
  mousex: 0,
  mousey: 0,
  angle: 0,
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
  movement.mousex = event.clientX - (window.innerWidth/2) + (canvas.width/2);
  movement.mousey = event.clientY - (window.innerHeight/2) + (canvas.height/2);
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

socket.on('state', function (state) {
  processGameUpdate(state);
});

socket.on('bombs-update', function (bomb_locs) {
  drawGame.bombs = bomb_locs;
});


var current_state = {};
setInterval(function () {
  socket.emit('movement', movement);
  drawGame.update_state(getCurrentState());

  // console.log("state", current_state)

  current_state = getCurrentState();
  if(current_state.bombs.is_alive){
    drawGame.bombs = current_state.bombs.bomb_locations;
  }
  else drawGame.bombs = [];
  drawGame.all(socket.id, movement);
  if (bomb) socket.emit('shoot-bomb');
}, refresh_rate);

let url = ""
let resp = "" 
let content = ""

async function getPolling(){
  url = window.location.protocol + "//" + window.location.hostname + ":5001/poll"
  //  console.log(url)
  resp = await fetch(url, {
    method:'GET',
    // headers: {
    //   'Accept': 'application/json',
    //   'Content-Type': 'application/json'
    // },
  })
  content = await resp.text()
  console.log("poll",content)
  return content;
}

setInterval(async () =>{
  // fetch()
  url = window.location.protocol + "//" + window.location.hostname + ":5001/call"
  if(getPolling() < 10){
    resp = await fetch(url, {
      method:'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({"payload":[[45,65],[87,8],[67,87]]})
    })
  }
  content = await resp.json()
  console.log("test",content)
},60000)
