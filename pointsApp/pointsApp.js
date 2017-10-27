var mqtt = require("mqtt");

var client = mqtt.connect("mqtt://localhost");

var flag = 0;


setInterval(function(){
    flag = 0;
}, 3000);

client.on("connect", function(){
    console.log("MQTT Ok");
    client.subscribe("/roomba/datas");
    client.subscribe("/roomba/distance");
    
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

        if(BumpsAndWheelDrops != undefined && BumpsAndWheelDrops>0 && flag == 0){
            client.publish("/roomba/getDistance");            
            client.publish("/roomba/turn", "45");
            flag = 1;
        }

        //console.log("BumpsAndWheelDrops", BumpsAndWheelDrops);
    }
    if(topic == "/roomba/distance"){
        console.log(JSON.parse(message));
    }
});