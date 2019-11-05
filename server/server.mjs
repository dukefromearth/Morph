// Dependencies.
/*jshint esversion: 6 */
import express from 'express';
import http from 'http';
import path from 'path';
import socketIO from 'socket.io';




var app = express();
var server = http.Server(app);
var io = socketIO(server);

var refresh_rate = 1000/60;
var port_num = 5000;

app.set('port', port_num);
app.use('/static', express.static('../client/static'));

// Routing
app.get('/', function(request, response) {

});

server.listen(port_num, function() {
  console.log(`Running as ${environment} environment`);
  console.log('Starting server on port', port_num);
});

io.on('connection', function(socket) {

  socket.on('new player', function() {
    game.new_player(socket.id);
  });
  
  socket.on('disconnect', function() {
    game.delete_player(socket.id);
  });

  socket.on('movement', function(data) {
    game.update_player_pos(socket.id,data);
  });

  socket.on('shoot-bullet', function(){
    game.new_bullet(socket.id);
  });


setInterval(function() {

}, refresh_rate);

export default app = {
  server, io
}
