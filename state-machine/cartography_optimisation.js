


var mqtt = require("mqtt");
var StateMachine = require('javascript-state-machine');

var client = mqtt.connect("mqtt://localhost");

var flag = false;
var bump = false;

var pDistance = 0;
var distance = 0;
var angle = 0;

const turnAngle = (-45);
const divisionEnRadian = ((Math.PI) / 180);


var strategyNumber = 0;

var messageGlobal=null;


/*function convertToRadian(degrees) {
    return degrees * divisionEnRadian;
}*/

class Point {
    constructor() {
        this.x = 0;
        this.y = 0;
    }
}

var pointN_1 = new Point();



setInterval(function () {
    flag = false;
}, 1500);


var machineEtat = new StateMachine({
    init: 'pause',
    transitions:
        [

            { name: 'datas', from: 'pause', to: 'datas' },
            { name: 'angle', from: 'pause', to: 'angle' },
            { name: 'distance', from: 'pause', to: 'distance' },
            { name: 'pause', from: '*', to: 'pause'},
            { name: 'goto', from: '*', to: function(state){return state;} }


        ],
    methods:
        {
            onEnterPause: function () { },

            onEnterDatas: function (/* /*message/**/) {
//console.log("onenterdatas");
                let datas = JSON.parse(messageGlobal);
                let BumpsAndWheelDrops = null;
                for (let i = 0; i < datas.length; i++) {
                    if (datas[i].name == "BumpsAndWheelDrops") {
                        BumpsAndWheelDrops = datas[i].value;
                    }
                }
k
                if (BumpsAndWheelDrops != undefined && BumpsAndWheelDrops > 0 && flag == false) {
                    let angleChoisi = 0;
                    switch(BumpsAndWheelDrops){
                        case 1 : angleChoisi = ((-1)*turnAngle); break;
                        case 2 : angleChoisi = turnAngle; break;
                        case 3 : angleChoisi = 100; break;
                    }
                    client.publish("/roomba/turn", JSON.stringify(angleChoisi));

                    bump = true;
                    flag = true;
                }
            },
            onEnterAngle: function () {
                angle = (JSON.parse(messageGlobal)) * divisionEnRadian;  
            },
            onEnterDistance: function () {
                let retrivedDistance = JSON.parse(messageGlobal);
                let distance = retrivedDistance - pDistance;

                var point = new Point();

                point.x = pointN_1.x + distance * Math.cos(angle);
                point.y = pointN_1.y + distance * Math.sin(angle);

                let toSend = "{\"x\":" + point.x / 10 + ", \"y\":" + point.y / 10 + ", \"bump\": " + bump + ", \"angle\":" + angle + "}";
                bump = false;
                //console.log(toSend);
                client.publish("/roomba/points", toSend);

                angle %= 360;
                pDistance = retrivedDistance;

                pointN_1 = point;
                client.publish("/roomba/driveDirect", JSON.stringify([100, 100]));

            }

        }

})

client.on("message", function choixStrategy(topic,message){
    if (topic == "/roomba/strategy") {
        strategyNumber = JSON.parse(message);
        console.log(strategyNumber );        
    }
    switch (strategyNumber) {
        case 1:
            bumpAndTurn(topic, message);
            break;
        case 0:
            resetRoomba(topic, message);
            break;
    }

    if(topic == "/roomba/reset"){
        resetRoomba(topic, message);
    }
    });
            

client.on("connect", function () {
    console.log("MQTT Ok");
    client.subscribe("/roomba/datas");
    client.subscribe("/roomba/distance");
    client.subscribe("/roomba/angle");
    client.subscribe("/roomba/reset");
    client.subscribe("/roomba/strategy");
    //client.publish("/roomba/driveDirect", JSON.stringify([100, 100]));

    //client.publish("/roomba/sendCommand", JSON.stringify([132,145,1,44,1,44,158,5,137,0,127,0,1,157,0,90,137,0,0,0,0,148,1,19]));
    setInterval(function () {
        client.publish("/roomba/getDistance");
        client.publish("/roomba/getPhoneAngle");
    }, 200);

});


function resetRoomba(topicReset, messageReset){
    client.publish("/roomba/driveDirect", JSON.stringify([0,0]));
    messageGlobal = null;
    distance = 0;
    pDistance = 0;
}

function bumpAndTurn(topicLocal, messageLocal){
    messageGlobal = messageLocal;
    switch(topicLocal){
        case "/roomba/angle": machineEtat.angle(); break;
        case "/roomba/datas": machineEtat.datas(); break;
        case "/roomba/distance": machineEtat.distance(); break;
    }
    machineEtat.pause();
}