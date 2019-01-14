module.exports = function() {
  var alreadyPaused = particles.isPaused();

  particles.pause();

  var canvas = util.id("touhou");
  var gl = canvas.getContext("webgl", { antialias: true, powerPreference: "high-performance" }) || canvas.getContext("experimental-webgl");

  canvas.width = util.vmin(90);
  canvas.height = util.vmin(90);

  var scoreDisplay = util.id("game-score");
  var reisen = util.id("reisen-sprite");
  var koishi = util.id("koishi-sprite");
  var heart = util.id("heart-container");
  var background = util.id("game-background");
  var heartStream = util.id("heart-stream");

  fastdom.mutate(function() {
    heartStream.style.cssText = "";
    background.style.cssText = "";

    reisen.style.cssText = "visibility: visible";
    koishi.style.cssText = "visibility: visible";
    heart.style.cssText = "visibility: visible";

    scoreDisplay.textContent = "0";
  });

  if (gameAudio) {
    var bonusBgm = util.id("bonus-bgm");
    var music = util.id("game-music");

    if (!bonusBgm.paused) bonusBgm.pause();

    music.volume = 0.67;
    music.play();
    music.loop = true;
  }

  var program = glu.createProgram(gl, "game-v-shader", "game-f-shader");

  var vertexBuffer = {};
  var colorBuffer = {};

  var Shape = {
    size: (canvas.height * 0.04 * 3) / 4,
    normalArray: [],
    bossArray: [],
    count: canvas.height * 0.05
  };

  var Game = {
    bossCenter: [47.5, 6.25],
    bossHitbox: {},
    bossDirection: Math.random() >= 0.5 ? "left" : "right",
    playerCenter: [47.5, 85],
    playerHitbox: {},
    normalBulletSpeed: canvas.height * 0.0085,
    bossBulletSpeed: canvas.height * 0.0043
  };

  Game.bossHitbox = {
    x: util.vmin(Game.bossCenter[0]),
    y: util.vmin(Game.bossCenter[1])
  };

  Game.playerHitbox = {
    x: util.vmin(Game.playerCenter[0]),
    y: util.vmin(Game.playerCenter[1])
  };

  for (var i = 0; i < Shape.count; i++) {
    Shape.normalArray.push({
      x: Math.random() * (canvas.width - Shape.size * 2) + Shape.size,
      y: Math.random() * canvas.height - canvas.height * 2
    });
  }

  for (var i = 0; i < 2; i++) {
    Shape.bossArray.push([]);

    for (var j = 0; j < Shape.count; j++) {
      var rotation = ((((Shape.count - j - 1) / Shape.count) * 360 + 270) * Math.PI) / 180;

      Shape.bossArray[i].push({
        x: util.vmin(Game.bossCenter[0] * 0.95),
        y: util.vmin(Game.bossCenter[1]),
        rMatrix: glu.rotateZ([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], rotation, 1)
      });
    }
  }

  vertexBuffer.circle = glu.createVertexBuffer(gl, 32, Shape.size / canvas.width, null);
  vertexBuffer.bullet = glu.createVertexBuffer(gl, 32, Shape.size / canvas.width, "bullet");

  colorBuffer.red = glu.createColorBuffer(gl, [1, 0, 0], 1, 32);
  colorBuffer.orange = glu.createColorBuffer(gl, [1, 0.5, 0], 1, 32);
  colorBuffer.green = glu.createColorBuffer(gl, [0, 1, 0], 1, 32);
  colorBuffer.yellow = glu.createColorBuffer(gl, [1, 1, 0], 1, 32);

  gl.uniform1f(program.expand, 0.15);
  gl.uniform1f(program.radius, Shape.size / 2);
  gl.uniform1f(program.windowHeight, canvas.height);

  gl.viewport(0, 0, canvas.height, canvas.height);
  gl.clearColor(0, 0, 0, 0);

  var p, s, x, y, i, j, a, mvMatrix, currentMousePosition;
  var tick = 0;
  var scoreValue = 0;
  var isDragging = false;
  var gameover = false;
  var vmin01 = util.vmin(1);

  fastdom.mutate(function() {
    koishi.style.transform = "translate3d(" + Game.playerCenter[0] * vmin01 + "px," + Game.playerCenter[1] * vmin01 + "px,0)";
    koishi.style.webkitTransform = "translate3d(" + Game.playerCenter[0] * vmin01 + "px," + Game.playerCenter[1] * vmin01 + "px,0)";

    reisen.style.transform = "translate3d(" + Game.bossCenter[0] * vmin01 + "px," + Game.bossCenter[1] * vmin01 + "px,0)";
    reisen.style.webkitTransform = "translate3d(" + Game.bossCenter[0] * vmin01 + "px," + Game.bossCenter[1] * vmin01 + "px,0)";

    heart.style.transform = "translate3d(" + Game.playerCenter[0] * vmin01 + "px, " + Game.playerCenter[1] * vmin01 + "px, 0)";
    heart.style.webkitTransform = "translate3d(" + Game.playerCenter[0] * vmin01 + "px, " + Game.playerCenter[1] * vmin01 + "px, 0)";
  });

  koishi.onmousedown = koishiMouseDown;

  koishi.ontouchstart = function(e) {
    koishiMouseDown(e.touches[0]);
  };

  koishi.ontouchend = function(e) {
    koishiMouseDown(e.touches[0]);
  };

  util.id("game-container").onmousemove = gameContainerMousemove;

  util.id("game-container").ontouchmove = function(e) {
    e.preventDefault();

    gameContainerMousemove(e.touches[0]);
  };

  requestAnimationFrame(draw);

  function koishiMouseDown(e) {
    if (gameover) return;

    if (isDragging) {
      isDragging = false;
    } else {
      currentMousePosition = [e.clientX, e.clientY];
      isDragging = true;
    }
  }

  function gameContainerMousemove(e) {
    if (!isDragging) return;

    Game.playerCenter[0] -= ((currentMousePosition[0] - e.clientX) / util.vmin(100)) * 100;
    Game.playerCenter[1] -= ((currentMousePosition[1] - e.clientY) / util.vmin(100)) * 100;

    currentMousePosition[0] = e.clientX;
    currentMousePosition[1] = e.clientY;

    fastdom.mutate(function() {
      koishi.style.transform = "translate3d(" + Game.playerCenter[0] * vmin01 + "px, " + Game.playerCenter[1] * vmin01 + "px, 0)";
      heart.style.transform = "translate3d(" + Game.playerCenter[0] * vmin01 + "px, " + Game.playerCenter[1] * vmin01 + "px, 0)";

      koishi.style.webkitTransform = "translate3d(" + Game.playerCenter[0] * vmin01 + "px, " + Game.playerCenter[1] * vmin01 + "px, 0)";
      heart.style.webkitTransform = "translate3d(" + Game.playerCenter[0] * vmin01 + "px, " + Game.playerCenter[1] * vmin01 + "px, 0)";
    });
  }

  function draw() {
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer.circle);
    gl.vertexAttribPointer(program.positionAttribute, 2, gl.FLOAT, false, 0, 0);

    if (tick >= 4 * 60) {
      if (Game.bossCenter[0] >= 92.44) Game.bossDirection = "right";
      if (Game.bossCenter[0] <= 2.56) Game.bossDirection = "left";

      Game.bossCenter[0] += Game.bossDirection === "left" ? 0.5 : -0.5;

      fastdom.mutate(function() {
        reisen.style.transform = "translate3d(" + Game.bossCenter[0] * vmin01 + "px, " + Game.bossCenter[1] * vmin01 + "px, 0)";
        reisen.style.webkitTransform = "translate3d(" + Game.bossCenter[0] * vmin01 + "px, " + Game.bossCenter[1] * vmin01 + "px, 0)";
      });
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer.green);
    gl.vertexAttribPointer(program.colorAttribute, 4, gl.FLOAT, false, 0, 0);

    p = Game.playerHitbox;
    p.x = util.vmin(Game.playerCenter[0] * 0.95);
    p.y = util.vmin(Game.playerCenter[1] * 0.95);

    x = -1 + (p.x / canvas.width) * 2;
    y = 1 - (p.y / canvas.height) * 2;

    gl.uniformMatrix4fv(program.mvMatrix, false, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, 0, 1]);
    gl.uniform2fv(program.center, [p.x, p.y]);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 32);

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer.red);
    gl.vertexAttribPointer(program.colorAttribute, 4, gl.FLOAT, false, 0, 0);

    for (i = 0; i < Shape.normalArray.length; i++) {
      s = Shape.normalArray[i];
      x = -1 + (s.x / canvas.width) * 2;
      y = 1 - (s.y / canvas.height) * 2;

      if (!gameover && util.isDistanceSmallerThanValue(p.x, p.y, s.x, s.y, Shape.size)) gameover = true;

      gl.uniformMatrix4fv(program.mvMatrix, false, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, 0, 1]);
      gl.uniform2fv(program.center, [s.x, s.y]);
      gl.drawArrays(gl.TRIANGLE_FAN, 0, 32);

      if (s.y >= canvas.height + Shape.size) {
        s.y = -Shape.size;
        s.x = Math.random() * (canvas.width - Shape.size * 2) + Shape.size;
      } else {
        s.y += Game.normalBulletSpeed;
      }
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer.bullet);
    gl.vertexAttribPointer(program.positionAttribute, 2, gl.FLOAT, false, 0, 0);

    for (i = 0; i < Shape.bossArray.length; i++) {
      if (i === 1 && tick < 1.5 * 60) continue;

      if (i === 0) gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer.yellow);
      if (i === 1) gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer.orange);

      gl.vertexAttribPointer(program.colorAttribute, 4, gl.FLOAT, false, 0, 0);

      for (j = 0; j < Shape.bossArray[i].length; j++) {
        s = Shape.bossArray[i][j];
        x = -1 + (s.x / canvas.width) * 2;
        y = 1 - (s.y / canvas.height) * 2;

        if (!gameover && util.isDistanceSmallerThanValue(p.x, p.y, s.x, s.y, Shape.size)) gameover = true;

        mvMatrix = s.rMatrix;
        mvMatrix[12] = x;
        mvMatrix[13] = y;

        gl.uniformMatrix4fv(program.mvMatrix, false, mvMatrix);
        gl.uniform2fv(program.center, [s.x, s.y]);

        gl.drawArrays(gl.TRIANGLE_FAN, 0, 18);

        a = (j / Shape.bossArray[i].length) * Math.PI * 2;

        s.x += Math.cos(a) * Game.bossBulletSpeed;
        s.y += Math.sin(a) * Game.bossBulletSpeed;

        if (tick >= 8 * 60) {
          s.x = util.vmin(Game.bossCenter[0] * 0.95);
          s.y = util.vmin(Game.bossCenter[1]);
        }
      }
    }

    if (tick >= 8 * 60) tick = 0;

    tick++;

    if (Math.abs(Game.playerCenter[0] - Game.bossCenter[0]) <= 2.5) {
      scoreValue += 100;

      if (scoreValue % 1000 === 0) {
        fastdom.mutate(function() {
          scoreDisplay.textContent = "Score: " + (scoreValue - (scoreValue % 1000)) / 1000 + "k+";
        });
      }

      if (reisen.className === "") {
        fastdom.mutate(function() {
          reisen.className = "blink";
        });
      }
    } else if (reisen.className === "blink") {
      fastdom.mutate(function() {
        reisen.className = "";
      });
    }

    if (gameover) {
      isDragging = false;

      if (music) music.pause();

      koishi.ontouchstart = null;
      koishi.ontouchend = null;

      util.id("game-container").onmousemove = null;
      util.id("game-container").ontouchmove = null;

      fastdom.mutate(function() {
        background.style.animationPlayState = "paused";
        heartStream.style.animationPlayState = "paused";

        util.q("#game-controls > p").style.opacity = "1";
        util.q("#game-controls > p").innerHTML = "FINAL SCORE<br>" + scoreValue;

        util.id("game-controls").style.visibility = "visible";

        reisen.className = "";

        if (scoreValue >= 50000) {
          util.q("#work .unlock").innerHTML =
            'Link: <a href="senbonzakura/index.html" title="Thousand Cherry Blossoms" target="_blank" rel="noopener">Thousand Cherry Blossoms</a>';
        }
      });

      if (!alreadyPaused) particles.play();
    } else {
      requestAnimationFrame(draw);
    }
  }
};
