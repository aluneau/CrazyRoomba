import { Component } from '@angular/core';
import { ViewChild } from '@angular/core';
declare var mqtt:any;

class Point{
  x:number;
  y:number;
  angle:number;

  constructor(x: number, y: number, angle:number){
    this.x = x;
    this.y = y;
    this.angle = angle;
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
    this.client = mqtt.connect('ws://localhost:8083/mqtt');
    this.client.on("connect", function(connack){
        console.log("Connecté");
        this.client.subscribe("/roomba/points");
    }.bind(this));

    this.client.on("message", function(topic, message){
        if(topic == "/roomba/points"){
            let point = JSON.parse(message);
            if(point.bump){
              this.pointsBump.push(new Point(point.x, point.y, point.angle));
            }else{
              this.pointsNoBump.push(new Point(point.x, point.y, point.angle));
            }
            this.drawAllPoints();
            this.drawRobot(point.x, point.y, point.angle);
          }
    }.bind(this));
  }
  
  ngAfterViewInit() {
    let canvas = this.myCanvas.nativeElement;    
    this.context = canvas.getContext("2d");    
  }

  drawRobot(x:number, y:number, angle:number){
    var v = [ [ 0, -12 ], [ -6, 6 ], [ 6, 6 ] ];    
    var ctx = this.context;
    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    ctx.restore();
    ctx.save();
    ctx.translate(x+ctx.canvas.width/2,y+ctx.canvas.height/2);
    ctx.rotate(angle * Math.PI/180 + Math.PI/2);
    ctx.fillStyle = "rgba(255, 0, 0, 1)";
    ctx.beginPath();
    ctx.moveTo(v[0][0],v[0][1]);
    ctx.lineTo(v[1][0],v[1][1]);
    ctx.lineTo(v[2][0],v[2][1]);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
    ctx.restore();
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
