import { Component } from '@angular/core';
declare var Robot: any;
import { HostListener } from '@angular/core';

@Component({
  selector: 'roomba-app',
  templateUrl: "./sensors.component.html"
}) 

export class SensorsComponent  { 
  datas: Array<Object> = [];
  robot:any;
  powerMotorRight: number;
  powerMotorLeft: number;
  maxSpeed = 200;

  @HostListener('document:keypress', ['$event'])
  handleKeyPressed(event: KeyboardEvent) {
    let keyPressed = event.key;
    if(keyPressed == "z"){
      this.powerMotorRight = this.maxSpeed;
      this.powerMotorLeft = this.maxSpeed;
    }
    if(keyPressed == "s"){
      this.powerMotorRight = -this.maxSpeed;
      this.powerMotorLeft = -this.maxSpeed;
    }
    if(keyPressed == "d"){
      this.powerMotorLeft = this.maxSpeed;
      this.powerMotorRight = -this.maxSpeed;
    }
    if(keyPressed == "q"){
      this.powerMotorLeft = -this.maxSpeed;
      this.powerMotorRight = this.maxSpeed;
    }

    this.robot.fullMode();
    this.robot.driveDirect(this.powerMotorRight, this.powerMotorLeft);
    console.log("KeyPressed: " + keyPressed);
  }

  @HostListener('document:keyup', ['$event'])
  handleKeyUp(event: KeyboardEvent) {
    let keyUp = event.key;
    this.powerMotorLeft = 0;
    this.powerMotorRight = 0;
    this.robot.stop();
    console.log("KeyUp: " + keyUp);
  }



  constructor(){
    let testData = {
      name: "test",
      value: "255"
    };
    this.datas.push(testData);

    this.robot = new Robot();

    //On connection to the server
    this.robot.on("connected", function(){
        console.log("connected");
        //We put roomba in safemode
        this.robot.safeMode();
        //And ask him to stream all sensors
        this.robot.streamSensors([7]);
        //this.robot.changeInterval(50);
        this.robot.fullMode();
        this.robot.driveDirect(200,200);


        // setTimeout(function(){
        //   this.robot.fullMode();
        //   this.robot._sendCommand([137,0,127,0,1,157,0,87, 137, 0, 0, 0, 0]);
        //   console.log("test");
        // }.bind(this), 1000);

        // setInterval(function(){
        //   this.robot.getDistance();
        //   console.log("distance refresh");
        // }.bind(this), 10000);
      }.bind(this));

    //On data update
    this.robot.on("datas", function(datas:any){
        //Update the model
        this.datas = datas;
    }.bind(this));
  }
}
