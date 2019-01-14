function Particles(startPaused) {
  var pause = startPaused || false;

  this.pause = function() {
    pause = true;
  };
  this.isPaused = function() {
    return pause;
  };

  if (windowHeight > windowWidth || (windowHeight <= windowWidth && /Mobi/.test(navigator.userAgent))) {
    this.play = function() {
      pause = false;
    };
    return;
  }

  var canvas = util.id("particles");
  var gl =
    canvas.getContext("webgl", {
      antialias: true,
      powerPreference: "high-performance",
      failIfMajorPerformanceCaveat: true
    }) || canvas.getContext("experimental-webgl");

  if (!gl) {
    this.play = function() {
      pause = false;
    };
    return;
  }

  canvas.width = util.vw(100);
  canvas.height = util.vh(20);

  var ratio = canvas.width / canvas.height;

  var program = glu.createProgram(gl, "v-shader", "f-shader");

  var vertexBuffer = {};
  var colorBuffer = {};

  var Shape = {
    type: ["triangle", "square", "circle"],
    mode: [gl.TRIANGLES, gl.TRIANGLE_FAN, gl.TRIANGLE_FAN],
    sides: [3, 4, 32],
    color: [[1, 1, 0], [0, 1, 1], [0.5, 1, 0]],
    size: [canvas.height * 0.175, canvas.height * 0.175, canvas.height * 0.13125],
    rawSize: [0.175, 0.175, 0.13125],
    array: [],
    count: canvas.width * 0.05
  };

  for (var i = 0; i < Shape.type.length; i++) {
    vertexBuffer[Shape.type[i]] = glu.createVertexBuffer(
      gl,
      Shape.sides[i],
      Shape.size[i] / canvas.width,
      "particles"
    );
    colorBuffer[Shape.type[i]] = glu.createColorBuffer(gl, Shape.color[i], 1, Shape.sides[i]);

    Shape.array.push([]);

    for (var j = 0; j < Shape.count / Shape.type.length; j++) {
      Shape.array[i].push({
        speed: ((Math.random() * 1.5 + 1.5) / canvas.width) * 4,
        rotation: Math.random() * Math.PI * 2,
        x: ((Math.random() * canvas.width - canvas.width) / canvas.width) * 2 - 1,
        y: 0.5 - ((Math.random() * (canvas.height / 2 - Shape.size[i] * 2) + Shape.size[i]) / canvas.width) * 2 * ratio
      });
    }
  }

  colorBuffer.black = glu.createColorBuffer(gl, [0.5, 0.5, 0.5], 1, 32);

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0, 0, 0, 0);

  var mvMatrix, s;

  if (!pause) requestAnimationFrame(draw);

  function draw() {
    for (var i = 0; i < Shape.type.length; i++) {
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer[Shape.type[i]]);
      gl.vertexAttribPointer(program.positionAttribute, 2, gl.FLOAT, false, 0, 0);

      for (var j = 0; j < Shape.array[i].length; j++) {
        s = Shape.array[i][j];

        mvMatrix = [
          1,
          0,
          0,
          0,
          0,
          1,
          0,
          0,
          0,
          0,
          1,
          0,
          s.x,
          s.y + Math.sin(s.x * Math.PI) * Shape.rawSize[i] * 4,
          0,
          1
        ];

        glu.rotateZ(mvMatrix, s.rotation, 2);

        gl.uniformMatrix4fv(program.mvMatrix, false, mvMatrix);

        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer.black);
        gl.vertexAttribPointer(program.colorAttribute, 4, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.LINE_LOOP, 0, Shape.sides[i]);

        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer[Shape.type[i]]);
        gl.vertexAttribPointer(program.colorAttribute, 4, gl.FLOAT, false, 0, 0);
        gl.drawArrays(Shape.mode[i], 0, Shape.sides[i]);

        s.rotation = s.rotation > 6.283 ? 0 : s.rotation + 0.07;

        s.x = s.x > 1 ? -1 : s.x + s.speed;
      }
    }

    if (pause) {
      gl.clear(gl.COLOR_BUFFER_BIT);
    } else {
      requestAnimationFrame(function() {
        requestAnimationFrame(draw);
      });
    }
  }

  this.play = function() {
    pause = false;
    requestAnimationFrame(draw);
  };
}

module.exports = Particles;
