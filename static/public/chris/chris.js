main();


function main() {
  createPlayer({
    assets: {
      content: 'assets/1-cover.json',
      atlas: [
        'assets/1-cover_atlas',
        'assets/1-cover_atlas2'
      ]
    }
  }).then(function(player) {
    scaleStage(player);

    player.ready(function() {
      player.play();
      setup(player);
    })
  });
}


function setup(player) {
  var sgf = player.getScenegraphFactory();
  var curtain = sgf.createMovieClipInstance('curtain');

  var stage = player.getStage();

  stage.addChild(curtain);
  curtain.stop();


  var btn = document.querySelector('.next');
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


function createPlayer(options) {
  return loadAssets(options.assets).then(function(assets) {
    return new Promise(function(resolve) {
      var container = document.querySelector('.stage');
      var canvas = document.createElement('canvas');
      container.append(canvas);

      var player = new flwebgl.Player();
      initPlayer(canvas, player, assets);
      resolve(player);
    });
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


function initPlayer(canvas, player, assets) {
  player.canvas = canvas;

  var textures = assets.atlas.map(function(item) {
    return new flwebgl.TextureAtlas(item.json, item.image);
  });

  var defer = new Promise(function(resolve, reject) {
    var result = player.init(canvas, assets.content, textures, function() {
      if (result === flwebgl.Player.S_OK) {
        resolve();
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

  player.ready = defer.then.bind(defer);
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
