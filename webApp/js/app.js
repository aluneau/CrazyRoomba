var app = angular.module('CrazyRoomba', []);



//Directive for the gestion of shortcuts
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
    //Motor speed
    this.md = 0;
    this.md = 0;

    //MaxSpeed
    this.speed = 400;

    //Init roomba instance. The connection to socket.io is implicit
    this.roomba = new Robot();

    //Retreive keyPress event and perform different actions
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


    //Reteive keyUp event
    $scope.keyUp = function(e) {
        console.log("keyUp");
        $scope.keyCode = e.wich;
        this.md = 0;
        this.mg = 0;
        this.roomba.stop();
    }.bind(this);



    //On connection to the server
    this.roomba.on("connected", function(){
        console.log("connected");
        //We put roomba in safemode
        this.roomba.safeMode();
        //And ask him to stream all sensors
        this.roomba.streamAllSensors();

    }.bind(this));


    //On data update
    this.roomba.on("datas", function(datas){
        //Update the model
        this.datas = datas;

        //force update the view
        $scope.$apply();
    }.bind(this));

});