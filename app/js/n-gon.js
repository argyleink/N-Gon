var nGon = (function(){

  // SETUP AND OPTIONS
  var cube                      // holds reference to cube/window
    , cubeContainer             // element that cube is built into
    , data
    , flipEndCallbacks  = []
    , options           = {
        dragLockToAxis:       true,
        preventDefault:       true,
        dragBlockHorizontal:  true,
        dragBlockVertical:    true
      }
      // will hold state information and a ref to the node
    , faces             = {
        middle: {},
        right:  {},
        left:   {}
      }
      // will be used like this: rotations[direction][facePosition]
    , rotations         = {
        left:   { left: -180, middle: -90, right: 0 },
        right:  { left: 0,    middle: 90,  right: 180 }
      }
      // will be used like this: stacks[direction][facePosition]
    , stacks            = {
        left:   { left: 0, middle: 1, right: 2 },
        right:  { left: 2, middle: 1, right: 0 }
      }
      // utility object to store various values needing to be tracked through interaction
    , util              = {
        middle: 1,
        right:  2,
        left:   0,
        currentDataIndex:     0,
        lastKnownDirection:   null,
        preventHorizontalPan: false,
        snapping:             false,
        moved:                false,
        overPanThreshold:     false
      }
    ;

  // BEGIN N-GON LOGIC
  function init(el, content) {
    // stash selector
    if      (typeof(el) === 'string') cubeContainer = $('#' + el);
    else if (typeof(el) === 'object') cubeContainer = el;

    // create cube perspective viewport window
    cube = $('<div class="cube-window"></div>');
    // append cube to container specified
    cubeContainer.append(cube);

    data = content;

    // create faces from an array of html
    create();
    // tune in for events
    listen();
  }

  function create() {
    // really only need first 2 faces on create
    createFace(util.middle, data[0]);
    createFace(util.right, data[1]);
  }

  function createFace(side, data) {
    // hack 3rd face position for now
    if (data && data.length === 3)
      data[2] = $(data[2]).css('transform', 'rotateX(-180deg) translateZ('+ cubeContainer.outerWidth() +'px)')[0].outerHTML

    // create the face, set the data
    var newFace = $('<section class="face">').css({
      transformOrigin: 'center center -' + (cubeContainer.outerWidth() / 2) + 'px'
    }).html(data);

    // depending on the side being created, set some styles and positions
    // TODO: do this in a loop and use some better config vars like rotations and stacks do
    switch (side) {
      case util.middle:
        // set some state defaults
        faces.middle.node = newFace;
        faces.middle.x = 0;
        faces.middle.y = 0;

        newFace.css({
          transform: 'rotateY('+ faces.left.x +'deg)',
          zIndex: 2
        });
        break;

      case util.left:
        faces.left.node = newFace;
        faces.left.x = -90;
        faces.left.y = 0;

        newFace.css({
          transform: 'rotateY('+ faces.left.x +'deg)',
          zIndex: 0
        });
        break;

      case util.right:
        faces.right.node = newFace;
        faces.right.x = 90;
        faces.right.y = 0;

        newFace.css({
          transform: 'rotateY('+ faces.right.x +'deg)',
          zIndex: 1
        });
        break;
    }

    // pop it into the page
    cube.append(newFace);
  }

  function appendFace(html) {
    if      (typeof(html) === 'string') data.push(html);
    else if (typeof(html) === 'object') data.push(html.outerHTML);

    // check to see if this is new data and were at the end of the data already
    if (!data[util.currentDataIndex + 2]) {
      // now we create a face, since it's now next in line
      createFace(util.right, data[util.currentDataIndex + 1]);
    }
  }

  function listen() {
    // 1 event for maximum perf
    cube
      .hammer(options)
      .bind('dragleft dragright dragup dragdown dragend', handleDrag);

    document.addEventListener('keydown', handleKeyPress);
  }

  function unlisten() {
    cube.unbind('dragleft dragright dragup dragdown dragend', handleDrag);
    document.removeEventListener('keydown', handleKeyPress);
  }

  function handleKeyPress(e) {
    switch(e.keyCode) {
      case 38: flip('up');    break;
      case 40: flip('down');  break;
      case 37: flip('right'); break;
      case 39: flip('left');  break;
    }
  }

  function handleDrag(e) {
    // if user just released and animation is snapping, prevent new dragging
    if (util.snapping) return;

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
    // REASONS TO STOP DRAGGING
    // set a max touch pan amount, 10 degrees past threshold
    if (Math.abs(e.gesture.deltaX) > 100) {
      util.overPanThreshold = true;
      return;
    }
    else util.overPanThreshold = false;
    // dont let user scroll before the first element
    if (util.currentDataIndex === 0 && e.gesture.direction === 'right') return;
    // dont let user scroll before the last element
    if (util.currentDataIndex === data.length - 1 && e.gesture.direction === 'left') return;
    // prevent horizontal pan while already having vertically panned
    if (util.preventHorizontalPan) return;

    for (var face in faces) {
      // for each face
      if (!faces.hasOwnProperty(face)) continue;

      // DRAG LOGIC
      var side    = faces[face]
        , faceEl  = side.node
        , newX    = Math.round(side.x + e.gesture.deltaX);

      // if 3 faces arent being animated, ignore the missing face
      if (!faceEl) continue;

      // apply new x position
      faceEl.css({
        transform: 'rotateY('+ newX +'deg)',
        zIndex: determineStackOrderFromX(newX)
      });
    }
  }

  function handleVerticalDrag(e) {
    // prevent drag if there are not vertical poly's to scroll to
    if (typeof(data[util.currentDataIndex]) === 'string') return;

    var newY = Math.round(faces.middle.y + e.gesture.deltaY);

    // set a max touch pan amount
    if (newY < -10 || newY > 190) return;

    // hide the 2 side faces to maintain the illusion
    toggleSideFaces(true);

    faces.middle.node.css({
      transform: 'rotateX('+ newY +'deg)'
    });
  }

  function handleDragEnd(e) {
    util.lastKnownDirection = e.gesture.direction;

    // REASONS TO NOT SNAP
    if (util.snapping) return;
    if (util.currentDataIndex === 0 && e.gesture.direction === 'right') return;
    if (util.currentDataIndex === data.length - 1 && e.gesture.direction === 'left') return;

    // drag ended, but which direction did it come from? Switch it!
    switch(e.gesture.direction) {
      case 'left':
      case 'right':
        if (util.preventHorizontalPan) return;
        // we need to iterate and snap animate all 3 faces
        for (var face in faces) {
          if (!faces.hasOwnProperty(face)) continue;

          // SNAP LOGIC
          var side                    = faces[face]
            , faceEl                  = side.node
            , over                    = Math.abs(e.gesture.deltaX) > 135
            , dX                      = over ? setDeltaMax(e.gesture.deltaX) : e.gesture.deltaX
            , newX                    = Math.round(side.x + dX)
            , snapX                   = nearestMultiple(newX, 90)
            , listenToCompleteEvent   = face === 'middle' ? true : false;

          util.moved = snapX !== side.x;

          if (!faceEl) continue;

          // we're snapping, so round to nearest 90 and stash in the side state 
          side.x  = snapX;

          // controlled snapping, since we maxed the user out at a threshold
          if (util.overPanThreshold)
            newX = newX > 0 ? newX + 10 : newX - 10
          
          snapTo(faceEl, {
            rotateY: [side.x, newX]
          }, listenToCompleteEvent);
        }
        break;

      case 'up':
      case 'down':
        // prevent drag if there are not vertical poly's to scroll to
        if (typeof(data[util.currentDataIndex]) === 'string') return;

        // up and down only control 1 face, the middle one
        var newY = Math.round(faces.middle.y + e.gesture.deltaY);
        var snapY = nearestMultiple(newY, 90);

        util.moved = snapY !== faces.middle.y;

        faces.middle.y = snapY;

        // if we're not panned to the center poly, prevent horizontal drag
        util.preventHorizontalPan = (faces.middle.y !== 0);

        snapTo(faces.middle.node, {
          rotateX: [faces.middle.y, newY]
        }, true);
        break;
    }
  }

  function snapTo(el, options, completeListen) {
    util.snapping = true;

    // non-physics easing (for perf testing differences?)
    el.velocity(options, {
      duration: 500,
      easing:   'easeOutExpo',
      complete: completeListen ? snapComplete : null
    });

    // physics easing
    // el.velocity(options, {
    //   duration: 450, // 700
    //   easing:   [200, 20], // easeOutExpo
    //   complete: completeListen ? snapComplete : null
    // });
  }

  function snapComplete(e) {
    // goal here is to manage cube content after animation and interactions have settled
    // this snap complete is only fired if the cube moved to a new position, and only fires once
    // that means incrementing our position in the data array
    // swapping out a face
    // swapping in a face
    // and updating the faces object with the new positions

    // snapping done, set the var so other events will fire again
    util.snapping = false;

    // if we didnt move, then done run the below logic that will create new side faces
    if (!util.moved) return;

    switch(util.lastKnownDirection) {
      case 'left':
        // increment data index, we moved forward
        util.currentDataIndex++;

        util.currentDataIndex > 1 && faces.left.node.remove();
        // old middle face is now left face
        faces.left.node = faces.middle.node;
        faces.left.x = -90;
        faces.left.y = 0;

        faces.middle.node = faces.right.node;
        faces.middle.x = 0;
        faces.middle.y = 0;

        // add a new face, intended for the right face
        // but not if we're at the end of the data
        if (!data[util.currentDataIndex + 1]) {
          // edge case, could have right and middle faces the same, if we dont set to null
          faces.right.node = null;
          break;
        }

        createFace(util.right, data[util.currentDataIndex + 1]);
        break;

      case 'right':
        util.currentDataIndex--;

        faces.right.node && faces.right.node.remove();
        faces.right.node = faces.middle.node;
        faces.right.x = 90;
        faces.right.y = 0;

        faces.middle.node = faces.left.node;
        faces.middle.x = 0;
        faces.middle.y = 0;


        if (!data[util.currentDataIndex - 1]) {
          // edge case, could have left and middle faces the same, if we dont set to null
          faces.left.node = null;
          break;
        }

        createFace(util.left, data[util.currentDataIndex - 1]);
        break;

      case 'up':
      case 'down':
        // hide 2 sides while swiping vertically
        toggleSideFaces();
        break;
    }

    // iterate over each callback (if any) and call that shit
    for (var callback in flipEndCallbacks)
      flipEndCallbacks[callback](util.lastKnownDirection, faces);
  }

  function flip(direction) {
    // set a default direction for flipping
    if      (!direction)                direction = 'left';
    // correct any other verbiage
    else if (direction === 'forward')   direction = 'left';
    else if (direction === 'backward')  direction = 'right';

    // REASONS TO PREVENT FLIP
    // if user just released and animation is snapping, prevent flipping
    if (util.snapping) return;
    // would flip and not having any faces to show for it
    if (direction === 'up' && typeof(data[util.currentDataIndex]) === 'string') return;
    if (direction === 'down' && typeof(data[util.currentDataIndex]) === 'string') return;
    // would flip past beginning or end horizontally
    if (util.currentDataIndex === 0 && direction === 'right') return;
    if (util.currentDataIndex === data.length - 1 && direction === 'left') return;
    // would flip past beginning or end vertically
    if (faces.middle.y === -90 && direction === 'up') return;
    if (faces.middle.y === 90 && direction === 'down') return;
    // dont want to allow flipping horizontally if use has flipped vertically
    if (util.preventHorizontalPan && direction === 'right') return;
    if (util.preventHorizontalPan && direction === 'left') return;

    // set direction, helps with the snap complete function that cleans up after settling to a new location
    util.lastKnownDirection = direction;
    util.moved = true;

    // LEFT & RIGHT FLIP
    if (direction === 'left' || direction === 'right') {
      // for each face, determine direction and apply the new proper position
      for (var face in faces) {
        if (!faces.hasOwnProperty(face)) continue;

        var side    = faces[face]
          , faceEl  = side.node;

        if (!faceEl) continue;

        // set zindex prior to rotation, it's so fast people shouldnt notice the bad layering for the first 50%
        faceEl.css('z-index', stacks[direction][face]);

        // snapTo the new rotation position
        snapTo(faceEl, {
          rotateY: [rotations[direction][face], side.x]
        }, face === 'middle' ? true : false);
      }
    }
    // UP AND DOWN
    else if (direction === 'up' || direction === 'down') {
      // hide sides while vertically animating
      toggleSideFaces(true);

      // stash old y pos for forcefed animation
      var oldY = faces.middle.y;

      // bump current position
      if (direction === 'up')   faces.middle.y += -90;
      if (direction === 'down') faces.middle.y += 90;

      // if we're not panned to the center poly, prevent horizontal drag
      util.preventHorizontalPan = (faces.middle.y !== 0);

      // snap to a new vertical rotation
      snapTo(faces.middle.node, {
        rotateX: [faces.middle.y, oldY]
      }, true);
    }
  }

  function flipEnd(fn) {
    flipEndCallbacks.push(fn);
  }

  function toggleSideFaces(hide) {
    if (hide) {
      // dont keep hiding if already hidden
      if (faces.left.node && faces.left.node.css('visibility') === 'hidden') return;
      // if checks are because we may hit the end or the beginning, skip css if node isnt there
      faces.left.node && faces.left.node.css('visibility', 'hidden');
      faces.right.node && faces.right.node.css('visibility', 'hidden');
    } else {
      faces.left.node && faces.left.node.css('visibility', '');
      faces.right.node && faces.right.node.css('visibility', '');
    }
  }

  function setDeltaMax(d) {
    if (d < -135) d = Math.max(d, -90);
    if (d > 135)  d = Math.min(d, 90);
    return d;
  }

  function determineStackOrderFromX(posX) {
    if      (posX >= -45 && posX <= 45)   return 2;
    else if (posX <= -45 && posX >= -90)  return 1;
    else if (posX >= 45 && posX <= 90)    return 1;
    else if (posX > 90 || posX < -90)     return 0;
  }

  function destroy() {
    unlisten();
    cube.remove();

    // set state vars back to originalvalues
    faces.middle = {};
    faces.left = {};
    faces.right = {};
    util.currentDataIndex = 0;
    util.lastKnownDirection = null;
    util.preventHorizontalPan = false;
    util.overPanThreshold = false;
    flipEndCallbacks = [];
  }

  function getFaces() {
    return faces;
  }

  // UTILITIES
  function nearestMultiple(i, j) {
    return Math.round(i/ j) * j;
  }

  // API
  return {
    init:     init
  , destroy:  destroy
  , flip:     flip
  , append:   appendFace
  , flipEnd:  flipEnd
  , getFaces: getFaces
  }

})();