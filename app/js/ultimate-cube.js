var UltimateCube = (function(){

  // SETUP AND OPTIONS
  var hammerEl
    , cubeContainer     = $('#ultimate-cube')
    , options           = {
        dragLockToAxis:     true,
        preventDefault:     true
      }
    , faces             = {
        // will hold state information and a ref to the node
        middle: {},
        right:  {},
        left:   {}
      }
    , util              = {
        middle: 1,
        right:  2,
        left:   0,
        currentDataIndex:   0,
        lastKnownDirection: null
      }
    ;

  // test fake data
  var data = [
    '<h1>First</h1>',
    '<h1>Second</h1>',
    '<h1>Third</h1>',
    '<h1>Fourth</h1>',
    '<h1>Fifth</h1>',
    '<h1>Sixth</h1>'
  ]

  // BEGIN ULTIMATE CUBE LOGIC
  function init() {
    // create faces from an array of html
    create();
    listen();
  }

  function create() {
    // really only need first 2 faces on create
    createFace(util.middle, data[0]);
    createFace(util.right, data[1]);
  }

  function createFace(side, data) {
    // create the face, set the data
    var newFace = $('<section class="face">').css({
      transformOrigin: 'center center -' + (cubeContainer.width() / 2) + 'px'
    }).html(data);

    // depending on the side being created, set some styles and positions
    switch (side) {
      case util.middle:
        // set some state defaults
        faces.middle.node = newFace;
        faces.middle.x = 0;
        faces.middle.y = 0;
        break;

      case util.left:
        faces.left.node = newFace;
        faces.left.x = -90;
        faces.left.y = 0;

        newFace.css({
          transform: 'rotateY('+ faces.left.x +'deg)'
        });
        break;

      case util.right:
        faces.right.node = newFace;
        faces.right.x = 90;
        faces.right.y = 0;

        newFace.css({
          transform: 'rotateY('+ faces.right.x +'deg)'
        });
        break;
    }

    // pop it into the page
    cubeContainer.append(newFace);
  }

  function listen() {
    // 1 event for maximum perf
    cubeContainer
      .hammer(options)
      .bind('dragleft dragright dragup dragdown dragend', handleDrag);
  }

  function handleDrag(e) {
    console.log(e.gesture);

    // pass the event on to their respective handlers
    switch(e.type) {
      case 'dragright':
      case 'dragleft':
        handleHorizontalDrag(e);
        break;
      case 'dragup':
      case 'dragdown':
        handleVerticalDrag(e);
        break;
      case 'dragend':
        handleDragEnd(e);
        break;
    }
  }

  function handleHorizontalDrag(e) {
    for (var face in faces) {
      if (!faces.hasOwnProperty(face)) continue;
      // for each face
      var side    = faces[face]
        , faceEl  = side.node
        , newX    = Math.round(side.x + e.gesture.deltaX);

      // if 3 faces arent being animated, ignore the missing face
      if (!faceEl) continue;

      // apply new x position
      faceEl.css({
        transform: 'rotateY('+ newX +'deg)'
      });
    }
  }

  function handleVerticalDrag(e) {
    faces.middle.node.css({
      transform: 'rotateX('+ Math.round(faces.middle.y + e.gesture.deltaY) +'deg)'
    });
  }

  function handleDragEnd(e) {
    util.lastKnownDirection = e.gesture.direction;

    // drag ended, but which direction did it come from? Switch it!
    switch(e.gesture.direction) {
      case 'left':
      case 'right':
        // we need to iterate and snap animate all 3 faces
        for (var face in faces) {
          if (!faces.hasOwnProperty(face)) continue;

          var side    = faces[face]
            , faceEl  = side.node
            , newX    = Math.round(side.x + e.gesture.deltaX)
            , snapX   = nearestMultiple(newX, 90)
            , moved   = snapX !== side.x; // did we actually move

          if (!faceEl) continue;

          // we're snapping, so round to nearest 90 and stash in the side state 
          side.x  = snapX;

          snapTo(faceEl, {
            rotateY: [side.x, newX]
          }, face === 'middle' && moved ? true : false);
        }
        break;

      case 'up':
      case 'down':
        // up and down only control 1 face, the middle one
        var newY = Math.round(faces.middle.y + e.gesture.deltaY);
        faces.middle.y = nearestMultiple(newY, 90);

        snapTo(faces.middle.node, {
          rotateX: [faces.middle.y, newY]
        });
        break;
    }
  }

  function snapTo(el, options, completeListen) {
    el.velocity(options, {
      duration: 500,
      easing:   'spring',
      complete: completeListen ? snapComplete : null
    });
  }

  function snapComplete(e) {
    // goal here is to manage cube content after animation and interactions have settled
    // this snap complete is only fired if the cube moved to a new position, and only fires once
    // that means incrementing our position in the data array
    // swapping out a face
    // swapping in a face
    // and updating the faces object with the new positions

    switch(util.lastKnownDirection) {
      case 'left':
        // increment data index, we moved forward
        util.currentDataIndex++;

        if (faces.left.node) faces.left.node.remove();
        // old middle face is now left face
        faces.left.node = faces.middle.node;
        faces.left.x = -90;
        faces.left.y = 0;

        faces.middle.node = faces.right.node;
        faces.middle.x = 0;
        faces.middle.y = 0;

        // add a new face, intended for the right face
        createFace(util.right, data[util.currentDataIndex + 1]);
        break;

      case 'right':
        util.currentDataIndex--;

        if (faces.right.node) faces.right.node.remove();
        faces.right.node = faces.middle.node;
        faces.right.x = 90;
        faces.right.y = 0;

        faces.middle.node = faces.left.node;
        faces.middle.x = 0;
        faces.middle.y = 0;

        createFace(util.left, data[util.currentDataIndex - 1]);
        break;
    }
  }

  // UTILITIES
  function nearestMultiple(i, j) {
    return Math.round(i/ j) * j;
  }

  // API
  return {
    init: init
  }

})();