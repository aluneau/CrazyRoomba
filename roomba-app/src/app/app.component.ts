import { Component } from '@angular/core';
declare var Robot: any;
import { HostListener } from '@angular/core';

@Component({
  selector: 'roomba-app',
  templateUrl: "./app.component.html"
}) 

export class AppComponent  { 
  datas: Array<Object> = [];
  robot:any;
  powerMotorRight: number;
  powerMotorLeft: number;
  maxSpeed = 400;

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
        this.robot.streamAllSensors();

    }.bind(this));

    //On data update
    this.robot.on("datas", function(datas:any){
        //Update the model
        this.datas = datas;
    }.bind(this));
  }
}
