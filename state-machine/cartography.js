


var mqtt = require("mqtt");

var client = mqtt.connect("mqtt://localhost");

var flag = 0;

var bump = 0;

var pDistance = 0;

var turnAngle = -45;

var messageGlobal=null;

function convertToRadian(degrees) {
    var pi = Math.PI;
    return degrees * (pi / 180);
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

setInterval(function () {
    flag = 0;
}, 1500);





var StateMachine = require('javascript-state-machine');
var mqtt = require("mqtt");
var strategyNumber = 1;

var machineEtat = new StateMachine({
    init: 'pause',
    transitions:
        [

            { name: 'datas', from: 'pause', to: 'datas' },
            { name: 'angle', from: 'pause', to: 'angle' },
            { name: 'distance', from: 'pause', to: 'distance' },
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

                if (BumpsAndWheelDrops != undefined && BumpsAndWheelDrops > 0 && flag == 0) {
                    //client.publish("/roomba/getDistance");

                    if (BumpsAndWheelDrops == 1) {
                        client.publish("/roomba/turn", JSON.stringify(-turnAngle));
                        //angle-=turnAngle;
                    }
                    if (BumpsAndWheelDrops == 2) {
                        client.publish("/roomba/turn", JSON.stringify(turnAngle));
                        //angle+=turnAngle;
                    }
                    if (BumpsAndWheelDrops == 3) {
                        client.publish("/roomba/turn", JSON.stringify(100));
                        //angle+=100;
                    }

                    bump = 1;
                    flag = 1;
                }
            },
            onEnterAngle: function () {
                angle = JSON.parse(messageGlobal);
                
            },
            onEnterDistance: function () {
                let retrivedDistance = JSON.parse(messageGlobal);

                let distance = retrivedDistance - pDistance;
                var point = new Point();

                point.x = pointN_1.x + distance * Math.cos(convertToRadian(angle));
                point.y = pointN_1.y + distance * Math.sin(convertToRadian(angle));

                let toSend = "{\"x\":" + point.x / 10 + ", \"y\":" + point.y / 10 + ", \"bump\": " + bump + ", \"angle\":" + angle + "}";
                bump = 0;
                //console.log(toSend);
                //console.log(toSend);
                client.publish("/roomba/points", toSend);

                angle %= 360;
                //console.log("Distance: ", retrivedDistance - pDistance);
                pDistance = retrivedDistance;

                pointN_1 = point;
                client.publish("/roomba/driveDirect", JSON.stringify([100, 100]));

            }

        }

})

client.on("message", function choixStrategy(topic,message){
    if (topic == "/roomba/strategy") {
        strategyNumber = JSON.parse(message);
        }
        switch (strategyNumber) {
            case 1: 
                bumpAndTurn(topic, message);
                break;
            case 0:
                resetRoomba(topic,message);
                break;
        }
    });
            

client.on("connect", function () {
    console.log("MQTT Ok");
    client.subscribe("/roomba/datas");
    client.subscribe("/roomba/distance");
    client.subscribe("/roomba/angle");
    client.subscribe("/roomba/reset");
    client.publish("/roomba/driveDirect", JSON.stringify([100, 100]));

    //client.publish("/roomba/sendCommand", JSON.stringify([132,145,1,44,1,44,158,5,137,0,127,0,1,157,0,90,137,0,0,0,0,148,1,19]));
    setInterval(function () {
        client.publish("/roomba/getDistance");
        client.publish("/roomba/getPhoneAngle");
    }, 200);

});


function resetRoomba(topicReset, messageReset){
    messageGlobal = null;
    distance = 0;
    pDistance = 0;
    client.publish("/roomba/reset");

}

function bumpAndTurn(topicLocal, messageLocal){
    if (topicLocal == "/roomba/angle") {
        //console.log("angle1");
        messageGlobal = messageLocal;
        machineEtat.angle();
        machineEtat.goto("pause");
    }
    if (topicLocal == "/roomba/datas") {
        //console.log("datas");
        messageGlobal = messageLocal;
        machineEtat.datas();
        machineEtat.goto("pause");
    }
    if (topicLocal == "/roomba/distance") {

        messageGlobal = messageLocal;
        machineEtat.distance();
        machineEtat.goto("pause");
        //console.log(JSON.parse(message));
    }
}