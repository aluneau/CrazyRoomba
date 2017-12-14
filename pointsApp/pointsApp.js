var mqtt = require("mqtt");

var client = mqtt.connect("mqtt://localhost");

var flag = 0;

var bump = 0;

var pDistance = 0;

var turnAngle = -45;

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
}, 1500);



client.on("connect", function(){
    console.log("MQTT Ok");
    client.subscribe("/roomba/datas");
    client.subscribe("/roomba/distance");
    client.subscribe("/roomba/angle");
    client.publish("/roomba/driveDirect", JSON.stringify([100, 100]));
    
    //client.publish("/roomba/sendCommand", JSON.stringify([132,145,1,44,1,44,158,5,137,0,127,0,1,157,0,90,137,0,0,0,0,148,1,19]));
    setInterval(function(){
        client.publish("/roomba/getDistance");
        client.publish("/roomba/getPhoneAngle");
    }, 200);
    
});

client.on("message", function(topic, message){
    if(topic == "/roomba/angle"){
        angle = JSON.parse(message);
    }
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
            //client.publish("/roomba/getDistance");

            if(BumpsAndWheelDrops == 1){
                client.publish("/roomba/turn", JSON.stringify(-turnAngle));    
                //angle-=turnAngle;
            }
            if(BumpsAndWheelDrops == 2){
                client.publish("/roomba/turn", JSON.stringify(turnAngle));    
                //angle+=turnAngle;
            }
            if(BumpsAndWheelDrops == 3){
                client.publish("/roomba/turn", JSON.stringify(100));    
                //angle+=100;
            }

            bump = 1;
            flag = 1;
        }
        // else if(BumpsAndWheelDrops != null && BumpsAndWheelDrops == 0 && flag == 1){
        //     flag = 0;
        // }

        //console.log("BumpsAndWheelDrops", BumpsAndWheelDrops);
    }
    if(topic == "/roomba/distance"){
        let retrivedDistance = JSON.parse(message);

        let distance = retrivedDistance - pDistance;
        var point = new Point();

        point.x = pointN_1.x + distance*Math.cos(convertToRadian(angle)) ;
        point.y = pointN_1.y + distance*Math.sin(convertToRadian(angle));

        let toSend = "{\"x\":" + point.x/10 + ", \"y\":" + point.y/10 + ", \"bump\": "  + bump + ", \"angle\":" + angle + "}";
        bump = 0;
        
        //console.log(toSend);
        client.publish("/roomba/points", toSend);

        angle%=360;
        //console.log("Distance: ", retrivedDistance - pDistance);
        pDistance = retrivedDistance;

        pointN_1 = point;
        client.publish("/roomba/driveDirect", JSON.stringify([100, 100]));
        
        //console.log(JSON.parse(message));
    }
});