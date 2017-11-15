import { Component } from '@angular/core';
import { ViewChild } from '@angular/core';
declare var mqtt:any;

@Component({
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent {
  title = 'app';
  articles;
  client:any;
  context:CanvasRenderingContext2D;
  
  @ViewChild("myCanvas") myCanvas;
  
  constructor() {
    this.client = mqtt.connect('ws://127.0.0.1:8083/mqtt');
    this.client.on("connect", function(connack){
        console.log("Connecté");
        this.client.subscribe("/roomba/points");
    }.bind(this));

    this.client.on("message", function(topic, message){
        if(topic == "/roomba/points"){
            let point = JSON.parse(message);
            console.log("J'ai reçu un point !! ", JSON.parse(message));

            this.drawPoint(point.x, point.y);
        }
    }.bind(this));
  }
  
  ngAfterViewInit() {
    let canvas = this.myCanvas.nativeElement;    
    this.context = canvas.getContext("2d");    
  }

  drawPoint(x: number, y: number){
    var ctx = this.context;
    ctx.fillStyle = "FF0000";
    ctx.fillRect( x + ctx.canvas.width/2,  y +ctx.canvas.height/2, 5, 5);
  }
}
