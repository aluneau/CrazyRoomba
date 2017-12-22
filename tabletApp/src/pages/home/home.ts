import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { DeviceOrientation, DeviceOrientationCompassHeading } from '@ionic-native/device-orientation';
import { NativeAudio } from '@ionic-native/native-audio';
import { ViewChild } from '@angular/core';


declare var mqtt:any;


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  heading:Number;
  client:any;
  emotion:Number;


  constructor(public navCtrl: NavController, private deviceOrientation: DeviceOrientation, private nativeAudio: NativeAudio) {
    this.nativeAudio.preloadSimple('bump', 'assets/sounds/r2d2.ogg').then(function(){
      console.log("Sound ok");
    }, function(err){
      console.log("Sound NoK");
      console.log(err);
    });
    this.emotion=0;
    setInterval(function(){
      this.emotion=0;
    }.bind(this), 2000);

    this.client = mqtt.connect("ws://192.168.1.100:8083/mqtt"); 

    this.client.on("connect", function(){
      console.log("Connecté");
      this.client.publish("/roomba/phoneConnected", "HELLO");
      this.client.subscribe("/roomba/getPhoneAngle");
      this.client.subscribe("/roomba/bump");
    }.bind(this));
    this.client.on('message', function (topic, message) {
      if(topic == "/roomba/getPhoneAngle"){
        console.log("OK");
        this.client.publish("/roomba/angle", JSON.stringify(this.heading));
      }
      if(topic == "/roomba/bump"){
        if(this.emotion==0){
          this.nativeAudio.play('bump', () => console.log('uniqueId1 is done playing'));
        }
        this.emotion = 1;
      }
    }.bind(this));
    

    this.heading = 100;
    // Get the device current compass heading
    this.deviceOrientation.getCurrentHeading().then(
      (data: DeviceOrientationCompassHeading) => this.heading = data.trueHeading,
      (error: any) => console.log(error)
    );

    // Watch the device compass heading change
    var subscription = this.deviceOrientation.watchHeading().subscribe(
      (data: DeviceOrientationCompassHeading) => this.heading=data.trueHeading,
    );
  }

  ngAfterViewInit() {

  }


  toInt(myInt){
    let zeroFilled = (new Array(3).join('0') + Math.floor(myInt)).substr(-3).substr(-3)
    return zeroFilled;
  }
}
