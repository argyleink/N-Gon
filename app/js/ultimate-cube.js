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
      .bind('dragleft dragright dragup dragdown dragend', handleDrag);
  }

  function handleDrag(e) {
    console.log(e.gesture);
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
      case 'dragend':
        // todo: round here to nearest 90deg
        // set the state vars to that new value
        state.x = newX;
        state.y = newY;
        // send current coords to drag event to forcefeed a nice animation, acting as a from value
        handleDragEnd(e, newX, newY);
        break;
    }
  }

  function handleDragEnd(e, x, y) {
    // todo: values below in deg, should be state.x and state.y
    switch(e.gesture.direction) {
      case 'left':
        snapTo({
          rotateY: ['-90deg', x],
          rotateX: '0deg' // todo: figure out how to manage rotations so x doesnt go sideways
        });
        break;
      case 'right':
        snapTo({
          rotateY: ['90deg', x],
          rotateX: '0deg'
        });
        break;
      case 'up':
        snapTo({ rotateX: ['-90deg', y] });
        break;
      case 'down':
        snapTo({ rotateX: ['90deg', y] });
        break;
    }
  }

  function snapTo(options) {
    cube.velocity(options, {
      duration: 500,
      easing: 'spring'
    });
  }

  init();

  return {
    init: init
  }

})();