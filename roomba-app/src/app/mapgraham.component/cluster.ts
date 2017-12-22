import { Point } from './point';
import { Graham } from './graham';

declare var clusterMaker : any;
declare var grahamScan : any;

export class Cluster{

    pointsClusters = [];
    clusters: any;
    nb_clusters = 2;
    ctx:any;

    constructor(){

    }

    ngAfterViewInit(){

    }

    /*
    Réalise un nombre défini dans la variable "nb_clusters" de clusters sur les points contenus dans le tableau de points "pointsClusters" 
    Cette fonction doit normalement être insérée dans un bouton afin de lancer le graham des différents clusters
    L'utilisateur doit définir le nombre de clusters qu'il souhaite
    */
    updateClusters(){
        clusterMaker.k(this.nb_clusters);
        clusterMaker.iterations(750);
        clusterMaker.data(this.ArraytoCluster(this.pointsClusters)); 
        this.clusters = clusterMaker.clusters();
        for(var i=0; i<this.nb_clusters; i++){ 
          var boundaryPoints = grahamScan(this.clusters[i].points); 
          this.linkPoints(this.ArrayofarrayToArrayofpoints(boundaryPoints));
        }
      }

    ArraytoCluster(t = []){
        var result = [];
        for(let i=0; i<t.length; i++){
          result.push([t[i].x, t[i].y]);
        }
        return result;
    }

    ArrayofarrayToArrayofpoints(t:any){
        var result =[];
        for(var i=0; i<t.length; i++){
            result.push(new Point(t[i][0], t[i][1]));
        }
        return result;
    }

    linkPoints(t=[]){
        var n = 0;
        for(var i=0; i<t.length-1; i++){
          this.ctx.beginPath();
          this.ctx.strokeStyle = "yellow";
          this.ctx.lineWidth= 1;
          this.ctx.moveTo(t[i].x, t[i].y);
          this.ctx.lineTo(t[i+1].x, t[i+1].y);
          this.ctx.stroke();  
          n=i+1;
        }
        this.ctx.moveTo(t[n].x, t[n].y);
        this.ctx.lineTo(t[0].x, t[0].y);
        this.ctx.stroke();  
      }
    

}