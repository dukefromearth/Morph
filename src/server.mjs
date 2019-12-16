// Dependencies.
/*jshint esversion: 6 *///
import express from 'express';
import http from 'http';
import path from 'path';
import socketIO from 'socket.io';
import Game from './server/game.mjs';
import { MAP_SIZE } from './shared/constants.mjs';

const __dirname = path.resolve(path.dirname(''));
const map_size = MAP_SIZE;
const HOST = process.env.HOST || '0.0.0.0';
const environment = process.env.ENV || "prod";
const game = new Game(map_size, map_size);
var num_users = 0;
const app = express();
const server = http.Server(app);
const io = socketIO(server);
const refresh_rate = 1000 / 60;
const port_num = 5000;

app.set('port', port_num);
app.use('/client', express.static('./client'));
app.use('/shared', express.static('./shared'))

// Routing
app.get('/', function (request, response) {
  response.sendFile(path.join(__dirname, '/index.html'));
});

app.get('/call', function(request, response){
  fetch('http://localhost:5001/call', { method: 'GET'})
    .then(res => res.json()) // expecting a json response
    .then(json => {
      console.log(json)
      return json
    });
})
server.listen(port_num, function () {
  console.log(`Running as ${environment} environment`);
  console.log('Starting server on port', port_num);
});

io.on('connection', function (socket) {
  num_users++;
  socket.on('new player', function () {
    game.new_player(socket.id);
  });

  socket.on('disconnect', function () {
    game.delete_player(socket.id);
    num_users--;
  });

  socket.on('movement', function (data) {
    game.update_player_pos(socket.id, data);
  });
  
  socket.on('shoot-bomb', function () {
    game.new_bomb(socket.id);
  });

});

// right 
var dir1_bank = [
  [[46,49],[51,49],[47,48],[50,51],[53,46],[48,49],[52,46],[53,52],[50,52],[47,53],[52,47],[49,52],[49,47],[48,52],[50,46],[48,53],[46,52],[51,48],[46,47],[50,50],[50,53]]
]

// down right
var dir2_bank = [
  [[48,51],[50,48],[49,51],[53,48],[53,49],[46,49],[46,46],[46,50],[53,50],[50,47],[52,53],[52,47],[51,49],[52,49],[46,52],[49,48],[48,48],[53,47],[50,46],[53,52],[48,47]]
]
// down
var dir3_bank = [
  [[50,49],[46,51],[46,47],[49,53],[47,50],[52,50],[53,46],[53,47],[51,48],[51,53],[48,47],[46,48],[51,52],[49,50],[47,49],[48,51],[51,51],[49,47],[49,49],[48,46],[52,47]]
]
// down left
var dir4_bank = [
  [[49,49],[47,48],[49,50],[46,52],[48,46],[49,46],[51,52],[48,48],[48,49],[48,53],[50,53],[49,51],[51,53],[50,50],[49,52],[53,50],[52,50],[50,51]]
]
// left 
var dir5_bank = [
  [[49,48],[50,52],[52,46],[46,53][50,49],[51,48],[46,48],[51,46],[50,46],[48,49],[48,52],[48,51],[47,49],[49,50],[51,47],[47,50],[50,47],[52,49],[49,46],[53,48],[46,49]]
]
// up left
var dir6_bank =[
  [[48,52],[52,48],[52,51],[52,52],[48,48],[52,50],[51,47],[53,52],[47,53],[50,51],[48,46],[50,47],[47,51],[47,49],[46,52],[51,53],[52,49],[47,50],[46,48]]
]
// up
var dir7_bank = [
  [[50,52],[46,47],[49,47],[52,49],[51,52],[50,51],[49,49],[49,51],[53,49],[51,49],[51,48],[47,53],[51,46],[52,53],[48,50],[46,49],[51,53],[52,50],[49,52],[53,46],[50,53]]
]
// up right
var dir8_bank = [
  [[52,46],[51,51],[53,46],[48,53],[48,52],[52,48],[51,49],[46,48],[49,53],[48,47],[47,52],[53,49],[47,50],[52,53],[50,52],[52,52],[48,49],[47,48],[53,48],[47,49],[51,47],[51,46]]
]

function getStart(angle){
  //right
  if (angle > -Math.PI / 8 && angle < 0 || angle > 0 && angle < Math.PI / 8) {
    game.bomb_init(dir1_bank[Math.floor(Math.random()*dir1_bank.length)]);
  }
  //down right
  else if (angle > Math.PI / 8 && angle < 3 * Math.PI / 8) {
    game.bomb_init(dir2_bank[Math.floor(Math.random()*dir2_bank.length)]);
  }
  //down
  else if (angle > 3 * Math.PI / 8 && angle < 5 * Math.PI / 8) {
    game.bomb_init(dir3_bank[Math.floor(Math.random()*dir3_bank.length)]);
  }
  //down left
  else if (angle > 5 * Math.PI / 8 && angle < 7 * Math.PI / 8) {
    game.bomb_init(dir4_bank[Math.floor(Math.random()*dir4_bank.length)]);
  }
  //left
  else if (angle < Math.PI && angle > 7 * Math.PI / 8 || angle > -Math.PI && angle < -7 * Math.PI / 8) {
    game.bomb_init(dir5_bank[Math.floor(Math.random()*dir5_bank.length)]);
  }
  //up left
  else if (angle > -7 * Math.PI / 8 && angle < -5 * Math.PI / 8) {
    game.bomb_init(dir6_bank[Math.floor(Math.random()*dir6_bank.length)]);
  }
  //up
  else if (angle > -5 * Math.PI / 8 && angle < -3 * Math.PI / 8) {
    game.bomb_init(dir7_bank[Math.floor(Math.random()*dir7_bank.length)]);
  }
  //up right
  else if (angle > -3 * Math.PI / 8 && angle < -Math.PI / 8) {
    game.bomb_init(dir8_bank[Math.floor(Math.random()*dir8_bank.length)]);
  }
}

function currentState(socket_id) {
  if (!game.individual_client_objects[socket_id]) return {};
  const state = {
    players: game.individual_client_objects[socket_id].players,
    objects: game.individual_client_objects[socket_id].objects,
    time: Date.now(),
    bombs: game.bomb,
    top: game.top_scores
  }
  return state;
}

setInterval(function () {
  if (num_users) {
    // console.time("update");
    game.update();
    // console.timeEnd("update");
    // console.time("Send Socket");
    let sockets = io.sockets.sockets;
    for (let id in sockets) {
      let socket = sockets[id];
      let update = currentState(socket.id);
      if (game.individual_client_objects[socket.id]) {
        // console.log("Players: ", Object.keys(update.players).length,
        //   "Objects: ", Object.keys(update.objects).length);
        io.to(socket.id).emit('state', update);
      }
    }
  }
}, 1000/120);