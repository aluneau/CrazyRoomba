var Robot = require("./Robot.js");
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

//Initialize roomba connection
roomba = new Robot("/dev/ttyUSB0");
//Pass the io connection to the roomba
roomba.connect(io);

//Use webApp as the client application directory
app.use(express.static(__dirname  + '/roomba-app/dist'));
//Serve classic jsLibraries
app.use('/libraries', express.static(__dirname + '/roomba-app/jsLibraries'));
//Serve img
app.use('/img', express.static(__dirname + '/roomba-app/img'));


//Starting express and socket.io on the port 3000
http.listen(3000, function(){
  console.log('listening on *:3000');
});


//Roomba connection event
roomba.on("connected", function(){
    console.log("Roomba connecté");
})
