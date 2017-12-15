import { Point } from './point';

export class Graham {

    tab = [];

    constructor(tab) {
        console.log("class graham");
        this.tab = tab;
        this.calculAngle(this.trouverPivot(this.tab), this.tab);
        this.triTabPoints(this.tab);
        console.log(tab);
        //this.fonctionGraham(this.triTabPoints(this.tab));
    }

    trouverPivot(t = []) {
        var pivot = new Point(0, 0, 0);
        for (var i = 0; i < t.length; i++) {
            if (t[i].y > pivot.y) {
                pivot.x = t[i].x;
                pivot.y = t[i].y;
            }
        }
        console.log(pivot);
        return pivot;
    }

    calculAngle(pivot: any, t = []) {
        for (var i = 0; i < t.length; i++) {
            if (t[i].x <= 0) {
                t[i].angle = 180 - Math.atan2(pivot.y - t[i].y, pivot.x - t[i].x) * 180 / Math.PI;
            }
            else {
                t[i].angle = Math.atan2(pivot.y - t[i].y, t[i].x - pivot.x) * 180 / Math.PI;
            }
            console.log(t[i].angle);
        }
    }

    triTabPoints(t = []) {
        for (var j = 0; j < t.length; j++) {
            for (var i = 0; i < t.length - 1; i++) {
                var tempa, tempx, tempy, temp: any;
                if (t[i].angle > t[i + 1].angle) {
                    temp = t[i];
                    t[i] = t[i + 1];
                    t[i + 1] = temp;
                }
            }
        }
        console.log(t);
        return t;
    }

    fonctionGraham(ctx, t = []) {
        var pduitVect: any;
        var n: number = t.length;
        ctx.beginPath();
        for (var i = 0; i < t.length - 2; i++) {
            pduitVect = (t[i + 1].x - t[i].x) * (t[i + 2].y - t[i].y) - (t[i + 1].y - t[i].y) * (t[i + 2].x - t[i].x);
            console.log(pduitVect);
            if (pduitVect >= 0) {
                ctx.beginPath();
                //a cet endroit la il faut vérifier en plus qu'il n'a pas intercepté un des chemin du robot
                ctx.strokeStyle = "black";
                ctx.moveTo(t[i].x, t[i].y);
                ctx.lineTo(t[i + 2].x, t[i + 2].y);
                ctx.stroke();
                t.splice(i + 1, 1);
            }
            else if (pduitVect < 0) {
                ctx.beginPath();
                ctx.strokeStyle = "blue";
                ctx.moveTo(t[i].x, t[i].y);
                ctx.lineTo(t[i + 1].x, t[i + 1].y);
                ctx.stroke();
            }
            else {
                console.log("error");
            }
            n = i;
        }

        ctx.beginPath();
        ctx.strokeStyle = "green";
        //ctx.moveTo(t[n+1].x, t[n+1].y);
        //ctx.lineTo(this.tab[n+2].x, this.tab[n+2].y);
        //ctx.stroke();
        //ctx.strokeStyle = "green";
        ctx.moveTo(this.tab[n + 2].x, this.tab[n + 2].y);
        ctx.lineTo(t[0].x, t[0].y);
        ctx.stroke();
    }


}