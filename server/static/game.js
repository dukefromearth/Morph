var socket = io();
var refresh_rate = 1000/60;
var mouse = {x: 0, y: 0};
var angle = 0;

var movement = {
    up: false,
    down: false,
    left: false,
    right: false,
    mousex: 0,
    mousey: 0
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


var canvas = document.getElementById('canvas');
canvas.width = 800;
canvas.height = 600;
var context = canvas.getContext('2d');
socket.on('state', function(players) {
  //console.log(players);
  context.clearRect(0, 0, 800, 600);
  for (var id in players) {
    var player = players[id];
    context.fillStyle = 'blue';
    angle = Math.atan2(player.mousey-player.y,player.mousex-player.x);
    context.beginPath();
    context.arc(player.x, player.y, 12, 0,  2* Math.PI);
    context.fill();
    context.strokeStyle = 'purple';
    context.beginPath();
    context.lineWidth = 8;
    context.arc(player.x,player.y,15,angle-(2*Math.PI)/12,angle+(2*Math.PI)/12);
    context.stroke();
    context.lineWidth = 1;
    context.fillStyle = 'white';
    context.fillText(player.health,player.x-5,player.y+5);
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
