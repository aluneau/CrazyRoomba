# CrazyRoomba

## Basic installation:
`git clone https://github.com/bloudman/CrazyRoomba.git && cd CrazyRoobma && npm install`

## Base server code
```js
var Robot = require("./Robot.js");
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);


//Initialize roomba connection
roomba = new Robot("!YOUR COMMUNCIATION PORT!");
//Pass the io connection to the roomba
roomba.connect(io);

//Use webApp as the client application directory
app.use(express.static(__dirname  + '/webApp'));

//Starting express and socket.io on the port 3000
http.listen(3000, function(){
  console.log('listening on *:3000');
});


//Roomba connection event
roomba.on("connected", function(){
    console.log("Roomba connecté");
})



```
This simple code starts a robot instance and connects it to socket.io


## What the principle of the library

This library will allow you to speak with roomba from the server side or from the client side with almost exactly the same code.
It is based on socket.io.

### Client base code:

This code will connect you to the robot, stream all sensors, put it in fullMode and will make it move.

```js
var roomba = new Robot();

roomba.on("connected", function(){
	console.log("Connecté");

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


});

roomba.on("datas", function(datas){
	console.log(datas);
});
```

### Difference between client side and server side

The only difference between server and client side is the synchronization of datas.
To avoid socket.io surcharge datas are send from the server to the client only every <b>50ms</b> by default.
You can change this from the client or from the server side using this command:
```js
roomba.changeInterval(interval in ms)
```

## What can you ask to the robot?

With this library you can ask pretty much everything. Here is the method list available from the client side or from the server side:

#### `_sendCommand(buffer)`
Send a buffer command to the robot
***
#### `passiveMode()`
Put roomba in passiveMode
***
#### `safeMode()`
Put roomba in safeMode
***
#### `fullMode()`
Put roomba in fullMode
***
#### `sing(notes)`
***
#### `drive(velocity, radius, direct=false)`
***
#### `driveDirect(leftMotor, rightMotor)`
***
#### `stop()`
Stop roomba's motors and the demo
#### `startDemo(number)`
***
#### `setLED(number, color, intensity)`
***
#### `setDigitalOuputPort(value)`
***
#### `setDigitalOutputPin(pin, state)`
***
#### `getDigitalOutputPort()`
***
#### `getDigitalOutputState(pin)`
***
#### `setPWLLowSideDrivers(driver1, driver2, driver3)`
***
#### `streamSensors(ids)`
Ask roomba to stream you sensors
***
#### `streamAllSensors()`
Ask roomba to stream you all of his sensors
***
#### `pauseStreaming()`
Pause the streaming
***
#### `resumeStreaming()`
Resume streaming after pause
***
#### `wait(time)`
***
#### `waitDistance(distance)`
***
#### `waitAngle(angle)`
***
#### `waitEvent(event)`
***

## Sensors we can use:
<table>
	<tr>
	<th>SensorName</th>
	<th>ID</th>
	<th>Unit</th>
	</tr>
	<tr><td>BumpsAndWheelDrops</td> <td>7</td> <td></td> </tr>
	<tr><td>CliffLeft</td> <td>8</td> <td></td> </tr>
	<tr><td>CliffFrontLeft</td> <td>10</td> <td></td> </tr>
	<tr><td>CliffFrontRight</td> <td>11</td> <td></td> </tr>
	<tr><td>CliffRight</td> <td>12</td> <td></td> </tr>
	<tr><td>VirtualWall</td> <td>13</td> <td></td> </tr>
	<tr><td>Overcurrents</td> <td>14</td> <td></td> </tr>
	<tr><td>IRByte</td> <td>17</td> <td></td></tr>
	<tr><td>Buttons</td> <td>18</td> <td></td></tr>
	<tr><td>Distance</td> <td>19</td> <td>mm</td></tr>
	<tr><td>Angle</td> <td>20</td> <td>mm</td></tr>
	<tr><td>ChargingState</td> <td>21</td> <td></td></tr>
	<tr><td>Voltage</td> <td>22</td> <td></td> </tr>
	<tr><td>Current</td> <td>23</td> <td></td> </tr>
	<tr><td>BatteryTemperature</td><td>24</td> <td></td></tr>
	<tr><td>BatteryCharge</td><td>25</td><td></td></tr>
	<tr><td>BatteryCapacity</td><td>26</td><td></td></tr>
	<tr><td>WallSignal</td><td>27</td><td></td></tr>
	<tr><td>CliffLeftSignal</td><td>28</td><td></td></tr>
	<tr><td>CliffFrontLeftSignal</td><td>29</td><td></td></tr>
	<tr><td>CliffFrontRightSignal</td><td>30</td><td></td></tr>
	<tr><td>CliffRightSignal</td><td>31</td><td></td></tr>
	<tr><td>UserDigitalInputs</td><td>32</td><td></td></tr>
	<tr><td>UserAnalogInputs</td><td>33</td><td></td></tr>
	<tr><td>ChargingSourcesAvailable</td><td>34</td><td></td></tr>
	<tr><td>OIMode</td><td>35</td><td></td></tr>
	<tr><td>SongNumber</td><td>36</td><td></td></tr>
	<tr><td>SongPlaying</td><td>37</td><td></td></tr>
	<tr><td>NumberOfStreamPackets</td><td>38</td><td></td></tr>
	<tr><td>Velocity</td><td>39</td><td></td></tr>
	<tr><td>Radius</td><td>40</td><td></td></tr>
	<tr><td>RightVelocity</td><td>41</td><td></td></tr>
	<tr><td>LeftVelocity</td><td>42</td><td></td></tr>
</table>

## Events from the robot:
These events are not library ones but events to emit via waitEvent(event).

<table>
	<tr><th>EventName</th><th>Id</th></tr>
	<tr><td>wheel-drop</td><td>1</td></tr>
	<tr><td>front-wheel-drop</td><td>2</td></tr>
	<tr><td>left-wheel-drop</td><td>3</td></tr>
	<tr><td>right-wheel-drop</td><td>4</td></tr>
	<tr><td>bump</td><td>5</td></tr>
	<tr><td>left-bump</td><td>6</td></tr>
	<tr><td>right-bump</td><td>7</td></tr>
	<tr><td>virtual-wall</td><td>8</td></tr>
	<tr><td>wall</td><td>9</td></tr>
	<tr><td>cliff</td><td>10</td></tr>
	<tr><td>left-cliff</td><td>11</td></tr>
	<tr><td>front-left-cliff</td><td>12</tr><tr>
	<tr><td>front-right-cliff</td><td>13</td></tr>
	<tr><td>right-cliff</td><td>14</td></tr>
	<tr><td>home-base</td><td>15</td></tr>
	<tr><td>advance-button</td><td>16</td></tr>
	<tr><td>play-button</td><td>17</td></tr>
	<tr><td>digital-output-0</td><td>18</td></tr>
	<tr><td>digital-output-1</td><td>19</td></tr>
	<tr><td>digital-output-2</td><td>20</td></tr>
	<tr><td>digital-output-3</td><td>21</td></tr>
	<tr><td>passive</td><td>22</td></tr>
</table>

## Differents demos:
<table>
	<tr><th>DemoName</th><th>Id</th></tr>
	<tr><td>abort</td><td>255</td></tr>
	<tr><td>cover</td><td>0</td></tr>
	<tr><td>cover-and-dock</td><td>1</td></tr>
	<tr><td>spot-cover</td><td>2</td></tr>
	<tr><td>mouse</td><td>3</td></tr>
	<tr><td>drive-figure-eight</td><td>4</tr>
	<tr><td>wimp</td><td>5</td></tr>
	<tr><td>home</td><td>6</td></tr>
	<tr><td>tag</td><td>7</td></tr>
	<tr><td>pachelbel</td><td>8</td></tr>
	<tr><td>banjo</td><td>9</td></tr>
</table>

## Events from the library
The library is based on EventEmitter (client side and server side). So you can track an event like this:

```js
roomba.on('event', function(data){
	console.log(data);
});
```
### Client and server side:
#### `connected`
This event is send when the robot is connected
***
#### `datas`
Retrieve the array of asked sensors every 50ms (by default see changeEmission interval to change default settings)
***
### Server side only
#### `data`
Single sensor data
***
#### `errordata`
The checksum of data receive is not correct
***
#### `packetNotFound`
The received data does not correspond to any sensor of the list... we drop the data because it is an incorrect one.




## What happens when the robot is not correctly connected?
When the robot is not correctly connected the server will run in "FakeRobot mode". It will send to the client fake data for debugging purposes.

## What's in the webApp folder?
There is a simple angularjs 1.6 app which allow you to show every sensors in HTML table and control it with your keyboard. (using zqzd)



