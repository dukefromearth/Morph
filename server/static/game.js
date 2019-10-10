

var socket = io("http://ec2-3-82-14-140.compute-1.amazonaws.com:8080/");
var refresh_rate = 1000/60;

var movement = {
    up: false,
    down: false,
    left: false,
    right: false
};

socket.on('message', function(data){
    console.log(data);
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
    }
});

socket.on('connection', function(socket) {
  players[socket.id] = socket;
  
  socket.on('disconnect', function() {
    players[socket.id].disconnect();
  });
});

// update player movement to server
socket.emit('new player');
setInterval(function() {
    socket.emit('movement', movement);
}, refresh_rate);


var canvas = document.getElementById('canvas');
canvas.width = 800;
canvas.height = 600;
var context = canvas.getContext('2d');
socket.on('state', function(players) {
  //console.log(players);
  context.clearRect(0, 0, 800, 600);
  context.fillStyle = 'green';
  for (var id in players) {
    var player = players[id];
    context.beginPath();
    context.arc(player.x, player.y, 10, 0, 2 * Math.PI);
    context.fill();
  }
});
