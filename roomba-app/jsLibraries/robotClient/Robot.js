class Robot extends EventEmitter{
	constructor(mqttBroker){
		super();
        this.dataBinding = null;

        //Initialise socket.io
        console.log('Init mqtt connection');
		this.client = mqtt.connect('ws://' + mqttBroker + '/mqtt');

        this.client.on("connect", function(connack){
            this.client.subscribe("/roomba/datas");
            this.emit("connected");
        }.bind(this));

        this.client.on("reconnect", function(){
            console.log("reconnect");
        });
        
        //When receive datas from server
        this.client.on('message', function(topic, message){
            //redirect datas to the object
            if(topic == "/roomba/datas"){
                this.emit("datas", JSON.parse(message));   
                if(this.dataBinding != null){
                    this.dataBinding.emit("datas", JSON.parse(message));
                }             
            }


        }.bind(this));

	}

    changeInterval(newInterval){
        this.client.publish("/roomba/changeEmitionInterval", JSON.stringify(newInterval));
    }

    bind(dataBinding){
        this.dataBinding = dataBinding;
        dataBinding.roomba = this;
        dataBinding.emit("binded");
    }

	_sendCommand (buffer){
        this.client.publish("/roomba/sendCommand", JSON.stringify(buffer));
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
    getDistance(){
        this.pauseStreaming();
        this.streamSensors([19]);
        setTimeout(function(){
            this.streamAllSensors();
        }.bind(this), 50);
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

