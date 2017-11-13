var mqtt = require("mqtt");

var client = mqtt.connect("mqtt://localhost");

var flag = 0;

function convertToRadian(degrees){
    var pi = Math.PI;
    return degrees * (pi/180);
}


class Point {
    constructor() {
        this.x = 0;
        this.y = 0;
    }
}

var pointN_1 = new Point();

var angle = 0;
var distance = 0;

setInterval(function(){
    flag = 0;
}, 4000);



client.on("connect", function(){
    console.log("MQTT Ok");
    client.subscribe("/roomba/datas");
    client.subscribe("/roomba/distance");

    // setInterval(function(){
    //     client.publish("/roomba/getDistance");

    // }, 5000);
    
});

client.on("message", function(topic, message){
    if(topic == "/roomba/datas"){
        let datas = JSON.parse(message);
        let BumpsAndWheelDrops = null;
        for (let i = 0; i < datas.length; i++){
            if(datas[i].name == "BumpsAndWheelDrops"){
                BumpsAndWheelDrops = datas[i].value;
            }
        }

        if(BumpsAndWheelDrops != undefined &&  BumpsAndWheelDrops>0 && flag == 0){
            console.log("Flag 1");
            client.publish("/roomba/getDistance");            
            
            angle+=45;

            flag = 1;
        }
        // else if(BumpsAndWheelDrops != null && BumpsAndWheelDrops == 0 && flag == 1){
        //     flag = 0;
        // }

        //console.log("BumpsAndWheelDrops", BumpsAndWheelDrops);
    }
    if(topic == "/roomba/distance"){
        client.publish("/roomba/turn", "80");    
        console.log("flag5");    
        let retrivedDistance = JSON.parse(message);
        
        var point = new Point();
        point.x = pointN_1.x + retrivedDistance;
        point.y = pointN_1.y + retrivedDistance;

        angle%=360;
        console.log("Distance: ", retrivedDistance);
        console.log(point.x, point.y);
        pointN_1 = point;
        
        //console.log(JSON.parse(message));
    }
});