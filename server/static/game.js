
/*jshint esversion: 6 */
//Thanks to https://github.com/vzhou842
var socket = io();
var refresh_rate = 1000/60;
var angle = 0;
var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
var MAP_SIZE = 2000;

draw.test();

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
var asteroid = false;
var _asteroids = [];
var _bombs = [];
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
    MAP_SIZE / 30,
    backgroundX,
    backgroundY,
    MAP_SIZE / 2
  );
  backgroundGradient.addColorStop(0, 'orange');
  backgroundGradient.addColorStop(0.2, 'purple');
  backgroundGradient.addColorStop(1, 'black');
  
  context.fillStyle = backgroundGradient;
  context.fillRect(0, 0, canvas.width, canvas.height);
}

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
  socket_id = socket.id;

  socket.on('disconnect', function() {
    players[socket.id].disconnect();
  });
});

// update player updates to server
socket.emit('new player');
setInterval(function() {
    socket.emit('movement', movement);
    if(bullet) socket.emit('shoot-bullet', movement.angle);
    if(bomb) socket.emit('shoot-bomb');
    if(asteroid) socket.emit('new_asteroid', angle);
}, refresh_rate);

socket.on('state', function(players) {
  _players = players;
});

socket.on('bullets-update', function(bullets){
  _bullets = bullets;
});

socket.on('bombs-update', function(bomb_locs){
  _bombs = bomb_locs;
});

socket.on('asteroids_update',function(asteroid){
  _asteroids = asteroid;
});

function drawAsteroid(asteroid, myPlayer){
  const canvasX = canvas.width / 2 + asteroid.x - myPlayer.x;
  const canvasY = canvas.height / 2 + asteroid.y - myPlayer.y;
  context.save();
  context.translate(canvasX,canvasY);
  var asteroid_img = document.getElementById('img_asteroid2');
  context.drawImage(asteroid_img, -15, -15,30,30);
  context.restore();
}

function drawBullet(bullet){
  context.beginPath();
  context.arc(bullet.x, bullet.y, bullet.size, 0, 2 * Math.PI);
  context.fill();
  context.closePath();
}

var bullet_img = document.getElementById("img_blast");
function drawBulletImage(bullet,myPlayer){
  const canvasX = canvas.width / 2 + bullet.x - myPlayer.x;
  const canvasY = canvas.height / 2 + bullet.y - myPlayer.y;
  context.save();
  context.translate(canvasX,canvasY);
  context.rotate(bullet.angle);
  context.drawImage(bullet_img, -15, -15, 30,30);
  context.restore();
}

function drawBombs(bomb, myPlayer){
  const canvasX = canvas.width / 2 + bomb[0] - myPlayer.x;
  const canvasY = canvas.height / 2 + bomb[1] - myPlayer.y;
  context.save();
  context.translate(canvasX,canvasY);
  var bomb_img;
  if(Math.random() < 0.5){
    bomb_img = document.getElementById('img_flame');
  }
  else bomb_img = document.getElementById('img_electric');
  context.drawImage(bomb_img, -myPlayer.size/2, -myPlayer.size/2,60,60);
  // context.beginPath();
  // context.arc(0, 0, 6, 0, 2 * Math.PI);
  // context.fill();
  // context.closePath();
  context.restore();
}

function renderPlayer(myPlayer, player, ship_type){
  const canvasX = canvas.width / 2 + player.x - myPlayer.x;
  const canvasY = canvas.height / 2 + player.y - myPlayer.y;
  context.save();
  context.translate(canvasX,canvasY);    
  context.rotate(player.gun_angle); 
  var player_img = document.getElementById(ship_type);
  context.drawImage(player_img, 0-(player.size/2), 0-(player.size/2),player.size,player.size);
  context.fillStyle = 'white';
  
  context.restore();
  context.beginPath();
  context.globalAlpha = 0.2;
  context.lineWidth = 8;
  context.strokeStyle = 'green';
  context.arc(canvasX, canvasY, player.size, 0, player.health*2 * Math.PI/player.max_health);
  context.stroke();
  context.globalAlpha = 1;
  context.closePath();
}

function Draw(){
  context.fillStyle = 'black';
  var myPlayer = {};
  // Draw boundaries
  for (var pID in _players) {
    if(_players[pID].id === socket.id){
      myPlayer = _players[pID];
      renderBackground(myPlayer.x, myPlayer.y);
      renderPlayer(myPlayer,myPlayer,"img_ship");
      context.strokeStyle = 'blue';
      context.lineWidth = 1;
      context.strokeRect(canvas.width / 2 - myPlayer.x, canvas.height / 2 - myPlayer.y, MAP_SIZE, MAP_SIZE);
      context.fillStyle = 'white';
      context.font = "15px Courier";
      context.fillText("Score: " + myPlayer.score, canvas.width-100, 20);
      context.fillText("Health: " + myPlayer.health, canvas.width-100, 35); 
    }
  }
  //draw asteroids
  context.fillStyle = 'white';
  for(var aID in _asteroids) {
    var asteroid = _asteroids[aID];
    if(asteroid.is_alive){
      drawAsteroid(asteroid, myPlayer);
    }
  }
  
  //draw players
  for (var id in _players) {
    var player = _players[id];
    if(player.id != myPlayer.id){
      renderPlayer(myPlayer,player,"img_enemy");
    }
  }
    //draw bullets
    for (var bid in _bullets) {
      var bullet = _bullets[bid];
      if(bullet.is_alive){
        drawBulletImage(bullet,myPlayer);
      }
    }
    
    //draw bombs
    context.fillStyle = 'white';
    for (var bombID in _bombs){
      var bomb = _bombs[bombID];
        drawBombs(bomb,myPlayer);
    }
    _bombs = [];

  window.requestAnimationFrame(Draw);
}

window.requestAnimationFrame(Draw);