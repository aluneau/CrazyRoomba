const SerialPort = require('serialport');
const EventEmitter = require('events');
const CircularBuffer = require('cyclic-buffer').default;
const Readline = SerialPort.parsers.Readline;
const parser = new Readline("\n");
const Packet = require("./sensors.js");
const Data = require("./data.js");

var fs = require('fs');


//Return a random between min and max
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}



class Robot extends EventEmitter{
	constructor(portName){
		super();
		var that = this;
        this.client = null;
        this.emitInterval = null;
        this._buffer = new CircularBuffer(1024);

        this.portName = portName;


        //Configuration of serialPort
        this.port = new SerialPort(this.portName, {
           baudRate: 57600,
           dataBits: 8,
           parity: 'none',
           stopBits: 1,
           rtscts: false,
           xon: false,
           xoff: false,
           xany: false,
        });

        //Assoc array wich contains fresh data from the robot. (syncrhonised in real time!)
        this.datas = new Map();


        this.port.on('open', function() {
           console.log("Port opened");
           that.emit("connected");


        });

        //When serial communication return an error i.e when the robot is not connected
        this.port.on("error", function(){
            console.log("No robot connexion.... fakeRobot mode");

            //Read the file fakeData.json contains a set of fakeData
            var fakeData = JSON.parse(fs.readFileSync('./fakeData.json', 'utf8'));

            //Send a fake data every 50ms
            setInterval(function(){
                that.emit("data", fakeData[getRandomInt(0, fakeData.length)]);
            }, 50);
        })

        //When a data is retrived correct and serialised
        this.on('data', function(data){
            if(data != undefined){
              //We update the assoc array
              if(data.packet.name == "Distance"){
                //console.log("distance", data.data);
                if(this.datas.get("Distance") == undefined){
                    this.datas.set("Distance", 0);
                }
                if(data.data < 60000){                    
                    this.datas.set(data.packet.name, this.datas.get("Distance") + data.data);
                }
              }else{
                this.datas.set(data.packet.name, data.data);
              }
            }
        }.bind(this));


        //On reception of brute data from the robot. (Hexa buffer)
        this.port.on('data', this._serialDataParser.bind(this));

        //When data is checked and is ok
        this.on("dataSerialised", function(data){
            //lauch the parsing function
            this._processSensorData(data);
        }.bind(this));

        //this.on("errordata", data => console.log("error: " + data) );

        //Init the socketIo emission of datas every 50ms (default value);
        this.changeInterval(50);


        //When the app is killed we take care of closing the serial port
      //   process.on('SIGINT', function() {
      //     console.log("Caught interrupt signal");
      //     that.port.flush(function(){
      //      that.port.close(function(){
      //        process.exit();
      //    });
      //  });

      //});


    }


    //Main function to send data to the robot.
    _sendCommand (buffer){
      this.port.write(buffer);
      this.port.flush();
    }

    //Change the interval of emission to client
    changeInterval(interval){
        if(this.emitInterval != null){
            clearInterval(this.emitInterval);
        }

        //Every "interval" time emit datas to the client
        this.emitInterval = setInterval(function(){
            let JSONArray = [];

            for (let [key, value] of this.datas){
                if (key =="BumpsAndWheelDrops" && value >0){
                    this.client.publish('/roomba/bump', JSON.stringify(value));
                }
                JSONArray.push({name: key, value: value});
            }
            if(this.client != null){
                this.emit('datas', JSONArray);
                this.client.publish('/roomba/datas', JSON.stringify(JSONArray));
            }
        }.bind(this), interval);
    }


    //Init mqtt connection
    connect(client){
        this.client = client;
        this.client.on('connect', function(socket){
            //Client is connected
            console.log('Mqtt ok!');
            this.client.publish("/roomba/connected", "");
            this.client.subscribe("/roomba/sendCommand");
            this.client.subscribe("/roomba/changeEmitionInterval");
            this.client.subscribe("/roomba/turn");
            this.client.subscribe("/roomba/getDistance");
            this.client.subscribe("/roomba/driveDirect");
            this.client.subscribe("/roomba/reset");
        }.bind(this));


        this.client.on("message", function(topic, message){
            if(topic == "/roomba/sendCommand"){
                //We pass the command to the robot
                this._sendCommand(JSON.parse(message));
            }

            if(topic == "/roomba/turn"){
                this.turnAngle(JSON.parse(message));
            }

            if(topic == "/roomba/changeEmitionInterval"){
                this.changeEmitInterval(JSON.parse(message));                    
            }

            if(topic == "/roomba/getDistance"){
                this.getDistance();
            }

            if(topic == "/roomba/reset"){
                this.stop();
                this.datas.set("Distance", 0);
            }

            if(topic == "/roomba/driveDirect"){
                let temp = JSON.parse(message);
                this.fullMode();
                setTimeout(function(){
                    this.driveDirect(temp[0], temp[1]);                    
                }.bind(this), 50);
            }

            if(topic == "/roomba/streamSensors"){
                let temp = JSON.parse(message);
                this.streamSensors(temp);
            }

            if(topic == "/roomba/streamAllSensors"){
                this.streamAllSensors();
            }
        }.bind(this));

    }



    //Get data from the robot and check if they are correct
    _serialDataParser(data) {
        this._buffer.put(data);
        var oldBufferSize = 0;
        while(this._buffer.size() > 0 && oldBufferSize !== this._buffer.size()) {
            oldBufferSize = this._buffer.size();
            let index = 0;
            while(index < this._buffer.size() && 19 !== this._buffer[index]) {
                ++index;
            }
            if(0 < index) {
                let unparsableData = this._buffer.get(index);
                //this.port.emit('data', unparsableData);
            }

            if(this._buffer.size() > 2 && this._buffer.size() >= this._buffer[1] + 3) {
                let streamSize = this._buffer[1] + 3;
                //debug('buffer size', this._buffer.remaining(), '; splice size:', streamSize);
                let sensorData = this._buffer.get(streamSize);
                let checksum = 0;
                for(let i = 0; i < sensorData[1]+3; ++i) {
                    checksum += sensorData[i];
                }
                checksum %= 256;
                if(0 === checksum) {
                    this.emit('dataSerialised', sensorData);
                } else {
                    this.emit('errordata', sensorData, checksum);
                }
            } else {
                break;
            }
        }
}

    //Parse the corrects datas in to a json object
    _processSensorData(dataStream) {
        //console.log('valid stream ; size :',dataStream[1]);
        //console.log('Data Stream:', dataStream);
        dataStream = [...dataStream];
        var streamCode = dataStream.shift(); // 19
        var streamDataSize = dataStream.shift();
        var processed = 0;
        while(processed < streamDataSize) {
            let packetId = dataStream.shift();
            if(Robot.sensorPackets[packetId]) {
                let dataSize = Robot.sensorPackets[packetId].getDataSize();
                let data = dataStream.splice(0, dataSize);
                // if(packetId == 19){

                //   console.log("distance: ", data);
                // }
                let packet = new Data(Robot.sensorPackets[packetId], data);
                this.emit('data', packet.toJSON());
                //console.log('New packet:', packet.toString());
                processed += dataSize + 1;
            } else {
                console.log('Data Stream Error: packet id', packetId, 'does not exist');
                this.emit('packetNotFound', packetId);
                break;
            }
        }
    }


    /**
     *
     */
    passiveMode() {
        this._sendCommand([128]);
    }
    /**
     *
     */
    safeMode() {
        this._sendCommand([128,131]);
    }
    /**
     *
     */
    fullMode() {
        this._sendCommand([128,132]);
    }
    /**
     *
     */
    sing(notes) {
        var song = [];//new Array(notes.length * 2 + 3);
        song.push(140, 0, notes.length);
        for(let note of notes) {
            song.push(note[0], note[1]);
        }
        this._sendCommand(song);
        this._sendCommand([141,0]);
    }
    /**
     *
     */
    drive(velocity, radius, direct = false) {
        if(direct) { this.driveDirect(velocity, radius); }
        velocity = parseInt(velocity);
        radius = parseInt(radius);
        this._sendCommand([137, (velocity >> 8) & 255, velocity & 255, (radius >> 8) & 255, radius & 255]);
    }
    /**
     *
     */
    driveDirect(left, right) {
        left = parseInt(left);
        right = parseInt(right);
        this._sendCommand([145, (left >> 8) & 255, left & 255, (right >> 8) & 255, right & 255]);
    }
    /**
     *
     */
    stop() {
        this.driveDirect(0,0);
        this.startDemo('abort');
    }
    /**
     *
     */
    startDemo(number) {
        if('string' === typeof number) { number = Robot.demos[number] || Robot.demos['abort']; }
        this._sendCommand([136, number]);
    }
    setLED(number, color, intensity) {
        if('string' === typeof number) { number = Robot.leds[number]; }
        this._sendCommand([139, number, color, intensity]);
    }
    setDigitalOutputPort(value) {
        this._digitalOutpoutPort = value;
        this._sendCommand([147, value]);
    }
    setDigitalOutputPin(pin, state) {
        this.setDigitalOutputPort(this._digitalOutputPort | ((state ? 1 : 0) << pin));
    }
    getDigitalOutputPort() {
        return this._digitalOutputPort;
    }
    getDigitalOutputState(pin) {
        return this._digitalOutputPort & (1 << pin) ? true : false;
    }
    setPWMLowSideDrivers(driver1, driver2, driver3) {
        this._setCommand([144, driver1, driver2, driver3]);
    }
    /*requestSensor(id) {
        this._sendCommand([142, id]);
    }
    requestSensors(ids) {
        this._sendCommand([149, ids.length, ...ids]);
    }
    requestAllSensors() {
        var ids = [7,8,9,10,11,12,13,14,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42];
        this.requestSensors(ids);
    }*/

    getDistance(){
        //console.log("getDistance");
        this.pauseStreaming();
        this.streamSensors([19]);

        setTimeout(function(){
            //console.log(this.datas.get("Distance"));
                setTimeout(function(){
                    if(this.datas.get("Distance")!=undefined){          
                        this.client.publish("/roomba/distance", JSON.parse(this.datas.get("Distance"))+"");    
                        //this.datas.set("Distance", 0);
                    }         
                }.bind(this), 30);
            this.streamSensors([7]);
        }.bind(this), 10);
    }


    turnAngle(angle){
        if(angle>=0){
            this.turnAngleLeft(angle);
        }else{
            this.turnAngleRight(angle);
        }
    }
    turnAngleLeft(angle){
        this.fullMode();
        setTimeout(function(){
            this._sendCommand([137,0,255,0,1,157,0,angle, 137, 0, 0, 0, 0]);            
        }.bind(this), 50)
    }
    

    turnAngleRight(angle){
        this.fullMode();
        setTimeout(function(){
            this._sendCommand([137,0,255,255,255,157,(angle >> 8) & 255, angle, 137, 0, 0, 0, 0]);            
        }.bind(this), 50)
    }

    driveAndStop(){
        this.fullMode();
        setTimeout(function(){
            this._sendCommand([152,31,150,0,137,1,44,128,0,158,5,137, 0, 0, 0, 0,148,2,19,13,137,0,255,0,1,157,0,45, 137, 0, 0, 0, 0]);            
        }.bind(this), 50)
    }

    streamSensors(ids) {
        this._sendCommand([148, ids.length, ...ids]);
    }
    streamAllSensors() {
        var ids = Object.keys(Robot.sensorPackets);
        var _ids = [];

        for (let i = 0; i < ids.length; i++){
            if(ids[i] != 19 && ids[i] != 20){
                _ids.push(ids[i]);
            }
        }

        this.streamSensors(_ids);
    }
    pauseStreaming() {
        this._sendCommand([150, 0]);
    }
    resumeStreaming() {
        this._sendCommand([150, 1]);
    }
    wait(time) {
        this._sendCommand([155, time]);
    }
    waitDistance(distance) {
        this._sendCommand([156, (distance << 8) & 255, distance & 255]);
    }
    waitAngle(angle) {
        this._sendCommand([157, (angle << 8) & 255, angle & 255]);
    }
    waitEvent(event) {
        if('string' === typeof event) { event = Robot.events[event]; }
        this._sendCommand([158, event]);
    }

}

Robot.demos = {
    'abort': 255,
    'cover': 0,
    'cover-and-dock': 1,
    'spot-cover': 2,
    'mouse': 3,
    'drive-figure-eight': 4,
    'wimp': 5,
    'home': 6,
    'tag': 7,
    'pachelbel': 8,
    'banjo': 9
};

Robot.leds = {
    'advance': 8,
    'play': 2
};



Robot.events = {
    'wheel-drop': 1,
    'front-wheel-drop': 2,
    'left-wheel-drop': 3,
    'right-wheel-drop': 4,
    'bump': 5,
    'left-bump': 6,
    'right-bump': 7,
    'virtual-wall': 8,
    'wall': 9,
    'cliff': 10,
    'left-cliff': 11,
    'front-left-cliff': 12,
    'front-right-cliff': 13,
    'right-cliff': 14,
    'home-base': 15,
    'advance-button': 16,
    'play-button': 17,
    'digital-output-0': 18,
    'digital-output-1': 19,
    'digital-output-2': 20,
    'digital-output-3': 21,
    'passive': 22,
};

Robot.sensorPackets = {
    7: new Packet(7, 'BumpsAndWheelDrops', 1, [0, 31]),
    8: new Packet(8, 'Wall', 1, [0, 1]),
    9: new Packet(9, 'CliffLeft', 1, [0, 1]),
    10: new Packet(10, 'CliffFrontLeft', 1, [0, 1]),
    11: new Packet(11, 'CliffFrontRight', 1, [0, 1]),
    12: new Packet(12, 'CliffRight', 1, [0, 1]),
    13: new Packet(13, 'VirtualWall', 1, [0, 1]),
    14: new Packet(14, 'Overcurrents', 1, [0, 31]),
    17: new Packet(17, 'IRByte', 1, [0, 255]),
    18: new Packet(18, 'Buttons', 1, [0, 15]),
    19: new Packet(19, 'Distance', 2, [-32768, 32767], 'mm'),
    20: new Packet(20, 'Angle', 2, [-32768, 32767], 'mm'),
    21: new Packet(21, 'ChargingState', 1, [0, 5]),
    22: new Packet(22, 'Voltage', 2, [0, 65535], 'mV'),
    23: new Packet(23, 'Current', 2, [-32768, 32767], 'mA'),
    24: new Packet(24, 'BatteryTemperature', 1, [-128, 127], '°C'),
    25: new Packet(25, 'BatteryCharge', 2, [0, 65535], 'mAh'),
    26: new Packet(26, 'BatteryCapacity', 2, [0, 65535], 'mAh'),
    27: new Packet(27, 'WallSignal', 2, [0, 4095]),
    28: new Packet(28, 'CliffLeftSignal', 2, [0, 4095]),
    29: new Packet(29, 'CliffFrontLeftSignal', 2, [0, 4095]),
    30: new Packet(30, 'CliffFrontRightSignal', 2, [0, 4095]),
    31: new Packet(31, 'CliffRightSignal', 2, [0, 4095]),
    32: new Packet(32, 'UserDigitalInputs', 1, [0, 31]),
    33: new Packet(33, 'UserAnalogInputs', 2, [0, 1023]),
    34: new Packet(34, 'ChargingSourcesAvailable', 1, [0, 3]),
    35: new Packet(35, 'OIMode', 1, [0, 3]),
    36: new Packet(36, 'SongNumber', 1, [0, 15]),
    37: new Packet(37, 'SongPlaying', 1, [0, 1]),
    38: new Packet(38, 'NumberOfStreamPackets', 1, [0, 42]),
    39: new Packet(39, 'Velocity', 2, [-500, 500], 'mm/s'),
    40: new Packet(40, 'Radius', 2, [-32768, 32767], 'mm'),
    41: new Packet(41, 'RightVelocity', 2, [-500, 500], 'mm/s'),
    42: new Packet(42, 'LeftVelocity', 2, [-500, 500], 'mm/s')
};


module.exports = Robot;
