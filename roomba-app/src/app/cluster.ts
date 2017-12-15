import { Point } from './point';
import { Graham } from './graham';

declare var clusterMaker: any;

export class Cluster {

    tab = [];
    tabClusters = [];

    constructor(tab) {
        this.tab = tab;
        //number of clusters, defaults to undefined
        clusterMaker.k(4);
        //number of iterations (higher number gives more time to converge), defaults to 1000
        clusterMaker.iterations(750);
        //data from which to identify clusters, defaults to []
        clusterMaker.data(this.ArraytoCluster(tab));

        var clusters = clusterMaker.clusters();

        console.log(clusters);

    }

    /*grahamCluster(ctx, clusters){
        for(var i=0; i<clusters.length; i++){
            this.tabClusters = this.ClustertoArray(clusters, i);
            var graham = new Graham(this.tabClusters);
            graham.fonctionGraham(ctx, this.tabClusters);
        }
    }*/

    ArraytoCluster(t = []) {
        var result = [];
        for (let i = 0; i < t.length; i++) {
            result.push([t[i].x, t[i].y]);
        }
        return result;
    }

    ClustertoArray(clusters: any, indice: any) {
        var result = [];
        for (var i = 0; i < clusters[indice].points.length; i++) {
            result.push(new Point(clusters[indice].points[i][0], clusters[indice].points[i][1], 0));
        }
        return result;
    }


}