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

//up right pi/2 -> pi/4
var dir1_bank = [
  [[46,49],[51,49],[47,48],[50,51],[53,46],[48,49],[52,46],[53,52],[50,52],[47,53],[52,47],[49,52],[49,47],[48,52],[50,46],[48,53],[46,52],[51,48],[46,47],[50,50],[50,53]]
]

//up right pi/4 -> 2pi
var dir2_bank = [
  [[48,51],[50,48],[49,51],[53,48],[53,49],[46,49],[46,46],[46,50],[53,50],[50,47],[52,53],[52,47],[51,49],[52,49],[46,52],[49,48],[48,48],[53,47],[50,46],[53,52],[48,47]]
]
//right down 2pi -> 7pi/4
var dir3_bank = [
  [[50,49],[46,51],[46,47],[49,53],[47,50],[52,50],[53,46],[53,47],[51,48],[51,53],[48,47],[46,48],[51,52],[49,50],[47,49],[48,51],[51,51],[49,47],[49,49],[48,46],[52,47]]
]
//right down 7pi/4 -> 3pi/2
var dir4_bank = [
  [[49,49],[47,48],[49,50],[46,52],[48,46],[49,46],[51,52],[48,48],[48,49],[48,53],[50,53],[49,51],[51,53],[50,50],[49,52],[53,50],[52,50],[50,51]]
]
//left down 3pi/2 -> 5pi/4
var dir5_bank = [
  [[49,48],[50,52],[52,46],[46,53][50,49],[51,48],[46,48],[51,46],[50,46],[48,49],[48,52],[48,51],[47,49],[49,50],[51,47],[47,50],[50,47],[52,49],[49,46],[53,48],[46,49]]
]
//left down 5pi/4 -> pi
var dir6_bank =[
  [[48,52],[52,48],[52,51],[52,52],[48,48],[52,50],[51,47],[53,52],[47,53],[50,51],[48,46],[50,47],[47,51],[47,49],[46,52],[51,53],[52,49],[47,50],[46,48]]
]
// left up pi -> 3pi/4
var dir7_bank = [
  [[50,52],[46,47],[49,47],[52,49],[51,52],[50,51],[49,49],[49,51],[53,49],[51,49],[51,48],[47,53],[51,46],[52,53],[48,50],[46,49],[51,53],[52,50],[49,52],[53,46],[50,53]]
]
// left up 3pi/4 -> pi/2
var dir8_bank = [
  [[52,46],[51,51],[53,46],[48,53],[48,52],[52,48],[51,49],[46,48],[49,53],[48,47],[47,52],[53,49],[47,50],[52,53],[50,52],[52,52],[48,49],[47,48],[53,48],[47,49],[51,47],[51,46]]
]

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
  getPolling()
},5000)

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
