
/*jshint esversion: 6 */
//Thanks to https://github.com/vzhou842

var socket = io();
var refresh_rate = 1000/60;
var angle = 0;
var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
var MAP_SIZE = 3000;

var socket_id = 0;

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
var _players = {};
var _bullets = [];

setCanvasDimensions();

function setCanvasDimensions() {
  // On small screens (e.g. phones), we want to "zoom out" so players can still see at least
  // 800 in-game units of width.
  const scaleRatio = Math.max(1, 800 / window.innerWidth);
  canvas.width = scaleRatio * (window.innerWidth - 15);
  canvas.height = scaleRatio * (window.innerHeight - 30);
}

function renderBackground(x, y) {
  const backgroundX = (MAP_SIZE/2) - x + (canvas.width/2);
  const backgroundY = (MAP_SIZE/2) - y + (canvas.height/2);
  const backgroundGradient = context.createRadialGradient(
    backgroundX,
    backgroundY,
    MAP_SIZE / 10,
    backgroundX,
    backgroundY,
    MAP_SIZE / 2
  );
  backgroundGradient.addColorStop(0, 'black');
  backgroundGradient.addColorStop(1, 'gray');
  context.fillStyle = backgroundGradient;
  context.fillRect(0, 0, canvas.width, canvas.height);
}

socket.on('message', function(data){
    console.log(data);
});

document.addEventListener("mousemove", function(event) {
  movement.mousex = event.clientX;
  movement.mousey = event.clientY;
});

document.addEventListener('keydown', function(event) {
    switch (event.keyCode) {
      case 65: // A
      case 37:        
  movement.left = true;
        break;
      case 87: // W
      case 38:
        movement.up = true;
        break;
      case 68: // D
      case 39:
        movement.right = true;
        break;
      case 83: // S
      case 40:
        movement.down = true;
        break;
      case 32: // Space
        bullet = true;
        break;
    } 
  });

document.addEventListener('keyup', function(event) {
    switch (event.keyCode) {
        case 65: // A
        case 37:
            movement.left = false;
            break;
        case 87: // W
        case 38:
            movement.up = false;
            break;
        case 68: // D
        case 39:
            movement.right = false;
            break;
        case 83: // S
        case 40:
            movement.down = false;
            break;
        case 32:
            bullet = false;
            break;
    }
});

socket.on('connection', function(socket) {
  players[socket.id] = socket;
  socket_id = socket.id;

  socket.on('disconnect', function() {
    players[socket.id].disconnect();
  });
});

// update player updates to server
socket.emit('new player');
setInterval(function() {
    socket.emit('movement', movement);
    if(bullet) socket.emit('shoot-bullet', angle);
}, refresh_rate);

socket.on('state', function(players) {
  _players = players;
});

socket.on('bullets-update', function(bullets){
  _bullets = bullets;
});

function Draw(){
  context.fillStyle = 'black';  
  context.fillRect(0, 0, canvas.width, canvas.height);
  
  for (var id in _players) {
    var player = _players[id];
    
    //draw this players health and score
    if(player.id === socket.id) {
      context.fillStyle = 'white';
      context.font = "15px Courier";
      context.fillText("Score: " + player.score, canvas.width-100, 20);
      context.fillText("Health: " + player.health, canvas.width-100, 35);
    }

    //set transparency of player
    context.globalAlpha = player.health/80;
    context.save();
    context.translate(player.x,player.y);    
    angle = Math.atan2(player.mousey-player.y,player.mousex-player.x);
    context.rotate(angle);
    //draw player
    var player_img = document.getElementById(player.image);
    console.log(player_img);
    context.drawImage(player_img, 0-(player.size/2), 0-(player.size/2),player.size,player.size);
    context.restore();

    context.globalAlpha = 1;

    context.fillStyle = 'red';
    for (var bid in _bullets) {
      var bullet = _bullets[bid];
      if(bullet.is_alive){
        context.beginPath();
        context.arc(bullet.x, bullet.y, bullet.size, 0, 2 * Math.PI);
        context.fill();
        context.closePath();
      }
    }

  }
  window.requestAnimationFrame(Draw);
}

window.requestAnimationFrame(Draw);