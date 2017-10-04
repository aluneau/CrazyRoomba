var roomba = new Robot();
var arrayListener = new ArrayListener();


roomba.on("connected", function(){
	console.log("Connecté");

	console.log("connected");
	roomba.fullMode();
    roomba.streamSensors([7]);
    // roomba.fullMode();
    // roomba.driveDirect(128,128);

    // setTimeout(function(){
    // 	roomba.driveDirect(-128,-128);
    // 	setTimeout(function(){
    // 		roomba.driveDirect(0,0);
    // 	},2000);
    // }, 2000);

    roomba.bind(arrayListener);

});

roomba.on("data", function(data){
	//console.log(data);
});
