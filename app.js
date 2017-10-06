var Robot = require("./Robot.js");
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);


//Roomba
roomba = new Robot("/dev/cu.usbserial-A700eXK6");
roomba.connect(io);


//Creatio du serveur web
app.use(express.static(__dirname  + '/webApp'));


http.listen(3000, function(){
  console.log('listening on *:3000');
});



roomba.on("connected", function(){
    console.log("Roomba connecté");
})


