$('#wires').on('click', function(e){
  $('#demo').toggleClass('wires');
});

var appendCount = 1;
$('#append').on('click', function(e){
  nGon.append('<h1>Appended #'+ appendCount +'</h1>');
  appendCount++;
});