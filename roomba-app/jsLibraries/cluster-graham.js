clusterMaker = {

    data: getterSetter([], function (arrayOfArrays) {
        var n = arrayOfArrays[0].length;
        return (arrayOfArrays.map(function (array) {
            return array.length == n;
        }).reduce(function (boolA, boolB) { return (boolA & boolB) }, true));
    }),

    clusters: function () {
        var pointsAndCentroids = kmeans(this.data(), { k: this.k(), iterations: this.iterations() });
        var points = pointsAndCentroids.points;
        var centroids = pointsAndCentroids.centroids;

        return centroids.map(function (centroid) {
            return {
                centroid: centroid.location(),
                points: points.filter(function (point) { return point.label() == centroid.label() }).map(function (point) { return point.location() }),
            };
        });
    },

    k: getterSetter(undefined, function (value) { return ((value % 1 == 0) & (value > 0)) }),

    iterations: getterSetter(Math.pow(10, 3), function (value) { return ((value % 1 == 0) & (value > 0)) }),

};

function kmeans(data, config) {
    // default k
    var k = config.k || Math.round(Math.sqrt(data.length / 2));
    var iterations = config.iterations;

    // initialize point objects with data
    var points = data.map(function (vector) { return new Point(vector) });

    // intialize centroids randomly
    var centroids = [];
    for (var i = 0; i < k; i++) {
        centroids.push(new Centroid(points[i % points.length].location(), i));
    };

    // update labels and centroid locations until convergence
    for (var iter = 0; iter < iterations; iter++) {
        points.forEach(function (point) { point.updateLabel(centroids) });
        centroids.forEach(function (centroid) { centroid.updateLocation(points) });
    };

    // return points and centroids
    return {
        points: points,
        centroids: centroids
    };

};

// objects
function Point(location) {
    var self = this;
    this.location = getterSetter(location);
    this.label = getterSetter();
    this.updateLabel = function (centroids) {
        var distancesSquared = centroids.map(function (centroid) {
            return sumOfSquareDiffs(self.location(), centroid.location());
        });
        self.label(mindex(distancesSquared));
    };
};

function Centroid(initialLocation, label) {
    var self = this;
    this.location = getterSetter(initialLocation);
    this.label = getterSetter(label);
    this.updateLocation = function (points) {
        var pointsWithThisCentroid = points.filter(function (point) { return point.label() == self.label() });
        if (pointsWithThisCentroid.length > 0) self.location(averageLocation(pointsWithThisCentroid));
    };
};

// convenience functions
function getterSetter(initialValue, validator) {
    var thingToGetSet = initialValue;
    var isValid = validator || function (val) { return true };
    return function (newValue) {
        if (typeof newValue === 'undefined') return thingToGetSet;
        if (isValid(newValue)) thingToGetSet = newValue;
    };
};

function sumOfSquareDiffs(oneVector, anotherVector) {
    var squareDiffs = oneVector.map(function (component, i) {
        return Math.pow(component - anotherVector[i], 2);
    });
    return squareDiffs.reduce(function (a, b) { return a + b }, 0);
};

function mindex(array) {
    var min = array.reduce(function (a, b) {
        return Math.min(a, b);
    });
    return array.indexOf(min);
};

function sumVectors(a, b) {
    return a.map(function (val, i) { return val + b[i] });
};

function averageLocation(points) {
    var zeroVector = points[0].location().map(function () { return 0 });
    var locations = points.map(function (point) { return point.location() });
    var vectorSum = locations.reduce(function (a, b) { return sumVectors(a, b) }, zeroVector);
    return vectorSum.map(function (val) { return val / points.length });
};

grahamScan = function (points) {

    if (points.length < 3) {
        return points;
    }

    var minimum = function (Q) {
        // Find minimum y point (in case of tie select leftmost)         
        // Sort by y coordinate to ease the left most finding
        Q.sort(function (a, b) {
            return a[1] - b[1];
        });

        var y_min = 1000000;
        var smallest = 0;
        for (var i = 0; i < Q.length; ++i) {
            var p = Q[i];
            if (p[1] < y_min) {
                y_min = p[1];
                smallest = i;
            }
            else if (p[1] == y_min) { // Select left most 
                if (Q[i - 1][0] > p[0]) {
                    smallest = i;
                }
            }
        }
        return smallest;
    }

    var distance = function (a, b) {
        return (b[0] - a[0]) * (b[0] - a[0]) + (b[1] - a[1]) * (b[1] - a[1]);
    }

    var filter_equal_angles = function (p0, Q) {
        // => If two points have same polar angle remove the closet to p0
        // Distance can be calculated with vector length...
        for (var i = 1; i < Q.length; i++) {
            if (Q[i - 1].polar == Q[i].polar) {
                var d1 = distance(p0, Q[i - 1]);
                var d2 = distance(p0, Q[i]);
                if (d2 < d1) {
                    Q.splice(i, 1);
                } else {
                    Q.splice(i - 1, 1);
                }
            }
        }
    }

    var cartesian_angle = function (x, y) {
        if (x > 0 && y > 0)
            return Math.atan(y / x);
        else if (x < 0 && y > 0)
            return Math.atan(-x / y) + Math.PI / 2;
        else if (x < 0 && y < 0)
            return Math.atan(y / x) + Math.PI;
        else if (x > 0 && y < 0)
            return Math.atan(-x / y) + Math.PI / 2 + Math.PI;
        else if (x == 0 && y > 0)
            return Math.PI / 2;
        else if (x < 0 && y == 0)
            return Math.PI;
        else if (x == 0 && y < 0)
            return Math.PI / 2 + Math.PI;
        else return 0;
    }

    var calculate_angle = function (p1, p2) {
        return cartesian_angle(p2[0] - p1[0], p2[1] - p1[1])
    }

    var calculate_polar_angles = function (p0, Q) {
        for (var i = 0; i < Q.length; i++) {
            Q[i].polar = calculate_angle(p0, Q[i]);
        }
    }

    // Three points are a counter-clockwise turn 
    // if ccw > 0, clockwise if ccw < 0, and collinear if ccw = 0 
    var ccw = function (p1, p2, p3) {
        return (p2[0] - p1[0]) * (p3[1] - p1[1]) - (p2[1] - p1[1]) * (p3[0] - p1[0]);
    }

    // Find minimum point 
    var Q = points.slice(); // Make copy 
    var minIndex = minimum(Q);
    var p0 = Q[minIndex];
    Q.splice(minIndex, 1); // Remove p0 from Q

    // Sort by polar angle to p0              
    calculate_polar_angles(p0, Q);
    Q.sort(function (a, b) {
        return a.polar - b.polar;
    });

    // Remove all with same polar angle but the farthest. 
    filter_equal_angles(p0, Q);

    // Graham scan 
    var S = [];
    S.push(p0);
    S.push(Q[0]);
    S.push(Q[1]);
    for (var i = 2; i < Q.length; ++i) {
        var pi = Q[i];
        while (ccw(S[S.length - 2], S[S.length - 1], pi) <= 0) {
            S.pop();
        }
        S.push(pi);
    }

    return S;
}
