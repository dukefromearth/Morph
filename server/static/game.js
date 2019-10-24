var socket = io();
var refresh_rate = 1000/60;
var angle = 0;
var canvas = document.getElementById('canvas');
canvas.width = 800;
canvas.height = 600;
var context = canvas.getContext('2d');

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
        case 32:
            bullet = false;
            break;
    }
});

socket.on('connection', function(socket) {
  players[socket.id] = socket;

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
  console.log(players);
  context.clearRect(0, 0, 800, 600);
  for (var id in players) {
    var player = players[id];
    if(player.id === socket.id) {
      context.fillStyle = 'black';
      context.font = "15px Courier";
      context.fillText("Score: " + player.score, 700, 20);
      context.fillText("Health: " + player.health, 700, 35);
    }
    console.log(player.score);
    context.globalAlpha = player.health/100;
    context.fillStyle = 'blue';
    angle = Math.atan2(player.mousey-player.y,player.mousex-player.x);
    context.drawImage(document.getElementById(player.image), player.x-(player.size/2),player.y-(player.size/2),player.size,player.size);
    context.fillStyle = 'blue'; 
    context.arc(player.x, player.y, player.size/6, 0, 2 * Math.PI);
    context.fill();
    context.globalAlpha = 1;
    context.strokeStyle = 'green';
    context.beginPath();
    context.lineWidth = 8;
    context.arc(player.x,player.y,(player.size/2),angle-(2*Math.PI)/20,angle+(2*Math.PI)/20);
    context.stroke();
    context.closePath();
  }
});

socket.on('bullets-update', function(bullets){
  context.fillStyle = 'red';
  for (var id in bullets) {
    var bullet = bullets[id];
    if(bullet.is_alive){
      context.beginPath();
      context.arc(bullet.x, bullet.y, bullet.size, 0, 2 * Math.PI);
      context.fill();
    }
  }
});

