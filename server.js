var Robot = require("./Robot.js");
var express = require('express');
var app = express();
var http = require('http').Server(app);
var fs = require('fs');
//var io = require('socket.io')(http);
var mqtt = require('mqtt');


//Read config file
var config = JSON.parse(fs.readFileSync(__dirname + '/config/config.json', 'utf8'));

//Initialize roomba connection
roomba = new Robot(config.robotSerial);

//Pass the mqtt connection to the roomba
var client = mqtt.connect('mqtt://' + config.mqttBroker.split(":")[0]);

roomba.connect(client);



//Serve classic jsLibraries
app.use('/libraries', express.static(__dirname + '/roomba-app/jsLibraries'));
//Serve img
app.use('/img', express.static(__dirname + '/roomba-app/img'));
//Use webApp as the client application directory
app.use("/", express.static(__dirname  + '/roomba-app/dist'));
//Use node_modules
app.use("/style.css", express.static(__dirname + "/roomba-app/style.css"));

app.use('/config', express.static(__dirname + '/config'));

app.get('/launchPointsApp', function (req, res) {
  console.log("Lancer");
  res.send('hello world');
});

app.use("/node_modules", express.static(__dirname + "/roomba-app/node_modules"));
//Always redirect to "/" in order to use angular routes
app.use("*", express.static(__dirname  + '/roomba-app/dist'));




//Starting express and socket.io on the port 3000
http.listen(3000, function(){
  console.log('listening on *:3000');
});


//Roomba connection event
roomba.on("connected", function(){
    console.log("Roomba connecté");

})
