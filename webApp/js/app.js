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

roomba.on("data", function(data){
	console.log(data);
});
