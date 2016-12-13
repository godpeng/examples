function setup() {
  var sgf = player.getScenegraphFactory();
  var curtain = sgf.createMovieClipInstance('curtain');
  var start = sgf.createMovieClipInstance('start');

  var stage = player.getStage();

  stage.addChild(start);
  stage.addChild(curtain);

  curtain.stop();
  start.setVisible(false);
  start.stop();

  const enter = document.querySelector('.enter');
  enter.addEventListener('click', function() {
    start.setVisible(true);
    start.play();
  });


  var flag = false;
  start.addEventListener(flwebgl.events.Event.EXIT_FRAME, function() {
    if (!flag && start.getCurrentFrame() === start.getTotalFrames()) {
      flag = true;
      start.stop();
      curtain.play();
    }
  });

  curtain.addEventListener(flwebgl.events.Event.ENTER_FRAME, function() {
    if (curtain.getCurrentFrame() > 15) {
      curtain.stop();
    }
  });
}

