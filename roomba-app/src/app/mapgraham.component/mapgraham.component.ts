import { Component } from '@angular/core';
import { ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RetreiveConfig } from '../retreiveConfig';
import { Point} from "../point";
declare var mqtt:any;
declare var grahamScan: any;


@Component({
  templateUrl: './mapgraham.component.html',
  styleUrls: ['./mapgraham.component.scss']
})
export class GrahamMapComponent {
  title = 'app';
  articles;
  client:any;
  context:CanvasRenderingContext2D;
  retreiveConfig:RetreiveConfig;
  pointsBump:Array<Point> = [];
  pointsNoBump:Array<Point> = [];
  config:any;
  boundaryPoints:any;
  @ViewChild("myCanvas") myCanvas;
  
  constructor(private http: HttpClient) {
    this.retreiveConfig = new RetreiveConfig(http);
    this.retreiveConfig.getConfig().then(function(data){
        let config:any = data; 
        this.client = mqtt.connect('ws://' + config.mqttBroker + '/mqtt');
        this.client.on("connect", function(connack){
            console.log("Connecté");
            this.client.subscribe("/roomba/points");
        }.bind(this));

        this.client.on("message", function(topic, message){
            if(topic == "/roomba/points"){
                let point = JSON.parse(message);
                if(point.bump){
                  this.updateGraham();
                  this.pointsBump.push(new Point(point.x, point.y, point.angle));
                }else{
                  this.pointsNoBump.push(new Point(point.x, point.y, point.angle));
                }
                this.drawBackground();
                this.drawAllPoints();
                this.drawRobot(point.x, point.y, point.angle);
                if(this.boundaryPoints.length>0){
                  this.linkPoints(this.ArrayofarrayToArrayofpoints(this.boundaryPoints));
                }
              }
        }.bind(this));
    }.bind(this));

  }
  
  ngAfterViewInit() {
    let canvas = this.myCanvas.nativeElement;    
    this.context = canvas.getContext("2d");
    var points = this.ArrayofpointsToArrayofarray(this.pointsBump);
    this.boundaryPoints = grahamScan(points);
    this.drawBackground();
  }

  // Fonction qui permet de convertir un tableau d'objets de type Point en un tableau contenant dans un tableau les coordonnées des points
  ArrayofpointsToArrayofarray(t = []) {
    var result = [];
    for (var i = 0; i < t.length; i++) {
      result.push([t[i].x, t[i].y]);
    }
    return result;
  }

  // Fonction qui permet de convertir un tableau contenant dans un tableau les coordonnées des points en un tableau d'objets de type Point
  ArrayofarrayToArrayofpoints(t: any) {
    var result = [];
    for (var i = 0; i < t.length; i++) {
      result.push(new Point(t[i][0], t[i][1], 0));
    }
    return result;
  }

  // Relie les différents points du tableau entré en paramètre
  linkPoints(t = []) {
    var ctx = this.context;
    let offsetX = ctx.canvas.width / 2;
    let offsetY = ctx.canvas.height / 2;
    var n = 0;
    for (var i = 0; i < t.length - 1; i++) {
      if(t[i].x != undefined && t[i].y != undefined){
        this.context.beginPath();
        this.context.strokeStyle = "yellow";
        this.context.lineWidth = 2  ;
        this.context.moveTo(t[i].x + offsetX, t[i].y + offsetY);
        this.context.lineTo(t[i + 1].x + offsetX, t[i + 1].y + offsetY);
        this.context.stroke();
        n = i + 1;
      }
    }
    this.context.moveTo(t[n].x + offsetX, t[n].y + offsetY);
    this.context.lineTo(t[0].x + offsetX, t[0].y + offsetY);
    this.context.stroke();
    
  }

  updateGraham(){
    //Graham
    var points = this.ArrayofpointsToArrayofarray(this.pointsBump);
    this.boundaryPoints = grahamScan(points);
    if(this.boundaryPoints.length > 0){
      this.linkPoints(this.ArrayofarrayToArrayofpoints(this.boundaryPoints));
    }
  }

  drawBackground(){
    let ctx = this.context;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    for (var x = 0.5; x < ctx.canvas.width; x += 10) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, ctx.canvas.height);
    }

    for (var y = 0.5; y < ctx.canvas.height; y += 10) {
      ctx.moveTo(0, y);
      ctx.lineTo(ctx.canvas.width, y);
    }

    ctx.strokeStyle = "#eee";
    ctx.stroke();


  }
  drawRobot(x:number, y:number, angle:number){
    var v = [ [ 0, -12 ], [ -6, 6 ], [ 6, 6 ] ];    
    var ctx = this.context;

    //ctx.lineWidth = 2;

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
        ctx.fillStyle = "blue";
        ctx.fillRect(x + ctx.canvas.width / 2, y + ctx.canvas.height / 2, 5, 5);

    }else{
        ctx.fillStyle = "black";
        ctx.fillRect(x + ctx.canvas.width / 2, y + ctx.canvas.height / 2, 3, 3);

    }
  }
}
