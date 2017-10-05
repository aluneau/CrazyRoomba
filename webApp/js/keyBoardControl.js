var md = 0; //moteur droit
var mg = 0; //moteur Gauche
var ma = 0;
var step = 5;

var speed = 500;

var keyPressed = false;

function update(){
  var mdDiv = document.getElementById("md");
  var mgDiv = document.getElementById("mg");

  mdDiv.innerHTML = "Md: " + md;
  mgDiv.innerHTML = "Mg: " + mg;

  roomba.fullMode();
  roomba.driveDirect(md,mg);
}

keyboardJS.bind('z', function(e){
  if(keyPressed == false){
    keyPressed = true;
    mg=speed;
    md=speed;
    update();
  }

}, function(e){
  keyPressed = false;
});

keyboardJS.bind('d', function(e){               //tourner à droite
    if(keyPressed == false){
      keyPressed = true;
      mg=speed;
      md=-speed;
      update();
    }
  
}, function(e){
  keyPressed = false;
});

keyboardJS.bind('q', function(e){
    if(keyPressed == false){
      keyPressed = true;
      mg=-speed;
      md=speed;
      update();
    }
},function(e){
  keyPressed = false;
});

keyboardJS.bind('s', function(e){
    if(keyPressed == false){
      keyPressed = true;
      mg=-speed;
      md=-speed;
      update();
    }
},function(e){
  keyPressed = false;
});

setInterval(function(){
  if(!keyPressed){
    mg=0;
    md=0;
    update();

  }
}, 10);
