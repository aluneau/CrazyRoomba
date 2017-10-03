var Robot = require("./Robot.js");
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);




//Creatio du serveur web
app.use(express.static('webApp'));

io.on('connection', function(socket){
  console.log('a user connected');
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});




//Roomba
roomba = new Robot("/dev/cu.usbserial-A700eXK6");

roomba.on("connected", function(){
	console.log("connected");
	roomba.fullMode();
    roomba.streamAllSensors();
    roomba.fullMode();
    roomba.driveDirect(128,128);
    setTimeout(function(){
    	roomba.driveDirect(-128,-128);
    	setTimeout(function(){
    		roomba.driveDirect(0,0);
    	},2000);
    }, 2000);
})

roomba.on('data', function(data){
    io.emit('data', data);
    //console.log(JSON.stringify(data));
    //console.log(',');
});

