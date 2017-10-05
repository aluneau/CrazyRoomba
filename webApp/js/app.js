var app = angular.module('CrazyRoomba', []);

app.directive('shortcut', function() {
  return {
    restrict: 'E',
    replace: true,
    scope: true,
    link:    function postLink(scope, iElement, iAttrs){
      jQuery(document).on('keypress', function(e){
         scope.$apply(scope.keyPressed(e));
       });
      jQuery(document).on('keyup', function(e){
        scope.$apply(scope.keyUp(e));
      })
    }
  };
});

app.controller('RoombaController', function($scope){
    this.md = 0;
    this.md = 0;
    this.speed = 400;
    this.roomba = new Robot();

    $scope.keyPressed = function(e) {
        console.log("keyPressed");
        $scope.keyCode = e.which;
        if($scope.keyCode==122){
            this.md = this.speed;
            this.mg = this.speed;
        }
        if($scope.keyCode==113){
            this.md = this.speed;
            this.mg = -this.speed;
        }
        if($scope.keyCode==100){
            this.md = -this.speed;
            this.mg = this.speed;
        }
        if($scope.keyCode==115){
            this.md = -this.speed;
            this.mg = -this.speed;
        }
        this.roomba.fullMode();
        this.roomba.driveDirect(this.md, this.mg);
        if($scope.keyCode==101){
            this.roomba.startDemo(1);
        }
        if($scope.keyCode==109){
            this.roomba.startDemo(9);
        }
        if($scope.keyCode==112){
            this.roomba.startDemo(8);
        }
    }.bind(this);

    $scope.keyUp = function(e) {
        console.log("keyUp");
        $scope.keyCode = e.wich;
        this.md = 0;
        this.mg = 0;
        this.roomba.stop();
    }.bind(this);



    this.roomba.on("connected", function(){
        console.log("Connecté");

        console.log("connected");
        this.roomba.safeMode();
        this.roomba.streamAllSensors();
        // roomba.fullMode();
        // roomba.driveDirect(128,128);

        // setTimeout(function(){
        //  roomba.driveDirect(-128,-128);
        //  setTimeout(function(){
        //      roomba.driveDirect(0,0);
        //  },2000);
        // }, 2000);

        //this.roomba.bind(arrayListener);

    }.bind(this));

    this.roomba.on("datas", function(datas){
        this.datas = datas;
        $scope.$apply();
        //console.log(this.datas);
        //console.log(JSON.stringify(this.datas));
    }.bind(this));

});