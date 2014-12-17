var UniCube = (function(){

  var hammerEl
    , cubeContainer     = $('.cube-window')
    , cube              = $('.cube')
    , options           = {
        dragLockToAxis:     true,
        preventDefault:     true
      }
    , state             = {
        x: 0,
        y: 0
      }
    ;

  function init() {
    cubeContainer
      .hammer(options)
      .bind('dragleft dragright dragup dragdown', function(e){
        console.log(e.gesture.deltaX);
        var newX = Math.floor(state.x + e.gesture.deltaX);
        var newY = Math.floor(state.y + e.gesture.deltaY);

        switch(e.type) {
          case 'dragright':
          case 'dragleft':
            cube.css({
              transform: 'rotateY('+ newX +'deg)'
            });
            break;
          case 'dragup':
          case 'dragdown':
            cube.css({
              transform: 'rotateX('+ newY +'deg)'
            });
            break;
        }
      });
  }

  function handleDrag(e) {
    console.log(e.gesture.deltaX);
    switch(e.type) {
      case 'dragright':
        cube.css({
          transform: 'rotateY(-'+ Math.floor(e.gesture.deltaX) +')'
        });
        break;
      case 'dragleft':
        cube.css({
          transform: 'rotateY('+ Math.floor(e.gesture.deltaX) +')'
        });
        break;
    }
  }

  init();

  return {
    init: init
  }

})();