import { Component } from '@angular/core';
import { ViewChild } from '@angular/core';
declare var mqtt:any;

class Point{
  x:number;
  y:number;

  constructor(x: number, y: number){
    this.x = x;
    this.y = y;
  }
} 

@Component({
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent {
  title = 'app';
  articles;
  client:any;
  context:CanvasRenderingContext2D;
  
  pointsBump:Array<Point> = [];
  pointsNoBump:Array<Point> = [];

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
            if(point.bump){
              this.pointsBump.push(new Point(point.x, point.y));
            }else{
              this.pointsNoBump.push(new Point(point.x, point.y));
            }
            this.drawAllPoints();
          }
    }.bind(this));
  }
  
  ngAfterViewInit() {
    let canvas = this.myCanvas.nativeElement;    
    this.context = canvas.getContext("2d");    
  }

  drawAllPoints(){
    var ctx = this.context;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    for (let e of this.pointsNoBump){
      this.drawPoint(e.x, e.y, 0);
    }

    for (let e of this.pointsBump){
      this.drawPoint(e.x, e.y, 1);
    }

  }

  drawPoint(x: number, y: number, bump: number){
    var ctx = this.context;
    if(bump){
        ctx.fillStyle = "red";
    }else{
        ctx.fillStyle = "black";
    }
    ctx.fillRect( x + ctx.canvas.width/2,  y +ctx.canvas.height/2, 5, 5);
  }
}
