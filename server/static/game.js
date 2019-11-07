


var movement = {
    up: false,
    down: false,
    left: false,

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
  players[socket.id] = socket;
  
  socket.on('disconnect', function() {
    players[socket.id].disconnect();
  });
});

// update player movement to server
socket.emit('new player');
setInterval(function() {
    socket.emit('movement', movement);
    if(bullet) socket.emit('shoot-bullet', movement.angle);
    if(bomb) socket.emit('shoot-bomb');
    if(asteroid) socket.emit('new_asteroid', angle);
}, refresh_rate);


var canvas = document.getElementById('canvas');
canvas.width = 800;
canvas.height = 600;
var context = canvas.getContext('2d');
socket.on('state', function(players) {

