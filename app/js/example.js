nGon.init($('#demo'), {
  // init with data
  data: [
    '<h1>First</h1>',
    [
      '<div class="poly"><h1>Top</h1></div>',
      '<div class="poly"><h1>Second:Middle</h1></div>',
      '<div class="poly"><h1>Bottom</h1></div>'
    ],
    '<img src="https://placekitten.com/g/600/600">',
    '<h1>Fourth</h1>',
    [
      '<div class="poly"><img src="https://placekitten.com/g/500/500"></div>',
      '<div class="poly"><img src="https://placekitten.com/g/800/800"></div>',
      '<div class="poly"><img src="https://placekitten.com/g/700/700"></div>'
    ],
    '<h1>Sixth</h1>'
  ]
});

// append more data later
nGon.append('<h1>Appended</h1>');

// listen for events
nGon.flipEnd(function(dir, faces){ 
  // console.log(dir, faces); 
});