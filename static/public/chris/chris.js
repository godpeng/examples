main();


var nextHandler = null;


function main() {
  createPlayer({
    name: 'cover',
    assets: {
      content: 'assets/1-cover.json',
      atlas: [
        'assets/1-cover_atlas',
        'assets/1-cover_atlas2'
      ]
    }
  }).then(setupCover);


  var btn = document.querySelector('.next');
  btn.addEventListener('click', function() {
    nextHandler && nextHandler();
    nextHandler = null;
  }, false);
}


function setupCover(player) {
  player.play();

  var sgf = player.getScenegraphFactory();
  var curtain = sgf.createMovieClipInstance('curtain');

  var stage = player.getStage();
  stage.addChild(curtain);
  curtain.stop();

  curtain.addEventListener(flwebgl.events.Event.ENTER_FRAME, function() {
    if (curtain.getCurrentFrame() > 15) {
      curtain.stop();
    }
  });


  var startPlayerDefer = createPlayer({
    name: 'start',
    assets: {
      content: 'assets/2-start.json',
      atlas: [
        'assets/2-start_atlas',
        'assets/2-start_atlas2'
      ]
    },
  });

  startPlayerDefer.then(function(startPlayer) {
    setupStart(startPlayer);
    nextHandler = function() {
      const container = player.canvas.parentNode;
      container.style.display = 'none'
      startPlayer.getStage().play();
    }
  });
}


function setupStart(player) {
  player.play();

  var sgf = player.getScenegraphFactory();
  var curtain = sgf.createMovieClipInstance('curtain');

  var stage = player.getStage();
  stage.addChild(curtain);
  curtain.stop();

  curtain.addEventListener(flwebgl.events.Event.ENTER_FRAME, function() {
    if (curtain.getCurrentFrame() > 15) {
      curtain.stop();
    }
  });

  var flag = false;
  stage.addEventListener(flwebgl.events.Event.EXIT_FRAME, function() {
    if (!flag && stage.getCurrentFrame() === stage.getTotalFrames()) {
      flag = true;
      curtain.play();
    }
  });

  // 不知道为什么一定要等一下才能stop
  setTimeout(function() {
    stage.gotoAndStop(1);
  }, 0)
}


function createPlayer(options) {
  return loadAssets(options.assets).then(function(assets) {
    var player = new flwebgl.Player();

    var container = document.querySelector('.scene.' + options.name);
    var canvas = document.createElement('canvas');
    container.appendChild(canvas);
    player.canvas = canvas;

    return initPlayer(player, assets);
  })
}


function loadAssets(opts) {
  var list = opts.atlas.map(function(name) {
    return ajax({ url: name + '.json' });
  });

  list.unshift(ajax({ url: opts.content }));
  return Promise.all(list).then(function(results) {
    var content = results.shift();
    var atlas = results.map(function(json, index) {
      var image = opts.atlas[index] + '.png';
      return { json: json, image: image };
    });
    return { content: content, atlas: atlas };
  });
}


function initPlayer(player, assets) {
  var textures = assets.atlas.map(function(item) {
    return new flwebgl.TextureAtlas(item.json, item.image);
  });

  return new Promise(function(resolve, reject) {
    var result = player.init(player.canvas, assets.content, textures, function() {
      if (result === flwebgl.Player.S_OK) {
        scaleStage(player);
        resolve(player);
      } else {
        reject(new Error(result));
      }
    });

    if (result === flwebgl.Player.E_CONTEXT_CREATION_FAILED) {
      reject(new Error('context creation failed'));
    } else if (result === flwebgl.Player.E_REQUIRED_EXTENSION_NOT_PRESENT) {
      reject(new Error('required extension not present'));
    }
  });
}


function ajax(params) {
  return new Promise(function(resolve) {
    var req = new XMLHttpRequest();
    req.onreadystatechange = function() {
      if (req.readyState === 4 && req.status === 200) {
        resolve(JSON.parse(req.responseText));
      }
    };
    req.open('GET', params.url, true);
    req.send();
  });
}


function scaleStage(player) {
  //Resize the canvas and reset the viewport
  var canvas = player.canvas;

  var w = player.getStageWidth();
  var h = player.getStageHeight();
  canvas.width = w;
  canvas.height = h;
  player.setViewport(new flwebgl.geom.Rect(0, 0, w, h));

  var stage = player.getStage();

  stage.addEventListener(flwebgl.events.Event.REMOVED, function(evt){
    if( evt && evt.getTarget() && evt.getTarget().getName() === "___camera___instance" )
      stage.setLocalTransform(new flwebgl.geom.Matrix());
  });
  stage.addEventListener(flwebgl.events.Event.ENTER_FRAME, function(evt) {
    var cameraInstance = stage.getChildAt(0);
    if(cameraInstance && cameraInstance.getName() === "___camera___instance") {
      var mat = cameraInstance.getLocalTransform();
      var bounds = cameraInstance.getBounds();
      var stageCenterX = Math.round(bounds.width)/2;
      var stageCenterY = Math.round(bounds.height)/2;
      var inverseMat = mat.invert();
      inverseMat.translate(stageCenterX, stageCenterY);
      stage.setLocalTransform(inverseMat);
      stage.setLocalColorTransform(cameraInstance.getLocalColorTransform());
    }
  });
}
