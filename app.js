var Robot = require("./Robot.js");
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);



//Roomba
roomba = new Robot("/dev/cu.usbserial-A700eXK6");



//Creatio du serveur web
app.use(express.static('webApp'));

io.on('connection', function(socket){
  console.log('A client is connected!');
  io.emit("connected");
  socket.on("command", function(buffer){
    roomba._sendCommand(buffer);
  })
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});



roomba.on("connected", function(){
    console.log("Roomba connecté");
})

roomba.on('data', function(data){
    io.emit('data', data);
    //console.log(JSON.stringify(data));
    //console.log(',');
});

