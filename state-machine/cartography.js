/* Zone de declaration des variables */

var mqtt, client, flag, bump, pDistance, turnAngle, messageGlobal, angle, distance,
  previousPoint, point, StateMachine, strategyNumber, machineEtat;

/* Fin de la zone de declaration */

/* Zone d'initialisation des variables */
mqtt = require('mqtt');
client = mqtt.connect('mqtt://localhost');
StateMachine = require('javascript-state-machine');

flag = false;
bump = false;

pDistance = 0;
turnAngle = (-45);
messageGlobal = null;
angle = 0;
distance = 0;
strategyNumber = 0;

class Point {
  constructor () {
    this.x = 0;
    this.y = 0;
  }
}

previousPoint = new Point();
point = new Point();

/* Fin de la zone d'initialisation des variables */

/* Zone de declaration et d'initialisation de la machine d'etat */

machineEtat = new StateMachine({
  init: 'pause',
  transitions:
  [

            { name: 'datas', from: 'pause', to: 'datas' },
            { name: 'angle', from: 'pause', to: 'angle' },
            { name: 'distance', from: 'pause', to: 'distance' },
            { name: 'pause', from: '*', to: 'pause' },
            { name: 'goto', from: '*', to: function (state) { return state; } }

  ],
  methods:
  {
    onEnterPause: function () { },

    onEnterDatas: function (/* /*message/**/) {
// console.log("onenterdatas");
      let datas, BumpsAndWheelDrops;

      datas = JSON.parse(messageGlobal);
      BumpsAndWheelDrops = null;

      for (let i = 0; i < datas.length; i++) {
        if (datas[i].name === 'BumpsAndWheelDrops') {
          BumpsAndWheelDrops = datas[i].value;
        }
      }

      if (BumpsAndWheelDrops !== undefined && BumpsAndWheelDrops > 0 && flag === false) {
        let angleDefault = 0;

        switch (BumpsAndWheelDrops) {
          case 1: angleDefault = ((-1) * turnAngle); break;
          case 2: angleDefault = turnAngle; break;
          case 3: angleDefault = 100; break;
        }
        client.publish('/roomba/turn', JSON.stringify(angleDefault));

        bump = true;
        flag = true;
      }
    },
    onEnterAngle: function () {
      angle = JSON.parse(messageGlobal);
    },
    onEnterDistance: function () {
      let retrivedDistance, toSend;

      retrivedDistance = JSON.parse(messageGlobal);
      distance = retrivedDistance - pDistance;

      point.x = previousPoint.x + distance * Math.cos(convertToRadian(angle));
      point.y = previousPoint.y + distance * Math.sin(convertToRadian(angle));

      toSend = '{"x":' + point.x / 10 + ', "y":' + point.y / 10 + ', "bump": ' + bump + ', "angle":' + angle + '}';
      client.publish('/roomba/points', toSend);

      angle = angle % 360;
      pDistance = retrivedDistance;
      previousPoint = point;

      bump = false;

      client.publish('/roomba/driveDirect', JSON.stringify([100, 100]));
    }
  }
});

/* Fin de la zone de la declaration et d'initialisation de la machine d'etat */

setInterval(function () {
  flag = false;
}, 1500);

function convertToRadian (degrees) {
  let pi = Math.PI;
  return degrees * (pi / 180);
}

client.on('message', function choixStrategy (topic, message) {
  if (topic === '/roomba/strategy') {
    strategyNumber = JSON.parse(message);
    console.log(strategyNumber);
  }
  switch (strategyNumber) {
    case 1: bumpAndTurn(topic, message); break;
    case 0: resetRoomba(); break;
  }

  /* if (topic === '/roomba/reset') {
    resetRoomba();
  } */
});

client.on('connect', function () {
  console.log('MQTT Ok');
  client.subscribe('/roomba/datas');
  client.subscribe('/roomba/distance');
  client.subscribe('/roomba/angle');
  client.subscribe('/roomba/reset');
  client.subscribe('/roomba/strategy');
    // client.publish("/roomba/driveDirect", JSON.stringify([100, 100]));

    // client.publish("/roomba/sendCommand", JSON.stringify([132,145,1,44,1,44,158,5,137,0,127,0,1,157,0,90,137,0,0,0,0,148,1,19]));
  setInterval(function () {
    client.publish('/roomba/getDistance');
    client.publish('/roomba/getPhoneAngle');
  }, 200);
});

function resetRoomba () {
  client.publish('/roomba/driveDirect', JSON.stringify([0, 0]));
  messageGlobal = null;
  distance = 0;
  pDistance = 0;
}

function bumpAndTurn (topicLocal, messageLocal) {
  messageGlobal = messageLocal;
  switch (topicLocal) {
    case '/roomba/angle': machineEtat.angle(); break;
    case '/roomba/datas': machineEtat.datas(); break;
    case '/roomba/distance': machineEtat.distance(); break;
  }
  machineEtat.pause();
}
