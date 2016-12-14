function setup() {
  var sgf = player.getScenegraphFactory();
  var curtain = sgf.createMovieClipInstance('curtain');

  var stage = player.getStage();

  stage.addChild(curtain);
  curtain.stop();


  const btn = document.querySelector('.next');
  btn.addEventListener('click', function() {
    next();
  });


  curtain.addEventListener(flwebgl.events.Event.ENTER_FRAME, function() {
    if (curtain.getCurrentFrame() > 15) {
      curtain.stop();
    }
  });
}


function next() {
  console.log('next');
}
