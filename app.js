var Robot = require("./Robot.js");


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
	console.log(data);
});