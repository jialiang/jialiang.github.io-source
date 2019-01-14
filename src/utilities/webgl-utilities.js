module.exports = (function() {
  function createVertexBuffer(gl, count, radius, special) {
    var vertexbuffer = gl.createBuffer();
    var vertices;

    if (special === undefined || special === null || special === "particles") {
      vertices = new Float32Array(count * 2);

      for (var i = 0; i < count; i++) {
        var a = (i / count) * Math.PI * 2;

        vertices[i * 2 + 0] = Math.cos(a) * radius;
        vertices[i * 2 + 1] = Math.sin(a) * radius;

        if (special === "particles") vertices[i * 2 + 1] *= util.vw(100) / util.vh(20);
      }
    }

    if (special === "bullet") {
      vertices = new Float32Array(count + 4);

      vertices[0] = -radius;
      vertices[1] = -radius;

      vertices[2] = radius;
      vertices[3] = -radius;

      for (var i = 0; i < count / 2; i++) {
        var a = (i / count) * Math.PI * 2;

        vertices[i * 2 + 4] = Math.cos(a) * radius;
        vertices[i * 2 + 5] = Math.sin(a) * radius;
      }
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexbuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    return vertexbuffer;
  }

  function createColorBuffer(gl, rgb, alpha, count) {
    var colorBuffer = gl.createBuffer();
    var colors = new Float32Array(count * 4);

    for (var i = 0; i < count; i++) {
      colors[i * 4 + 0] = rgb[0];
      colors[i * 4 + 1] = rgb[1];
      colors[i * 4 + 2] = rgb[2];
      colors[i * 4 + 3] = alpha;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

    return colorBuffer;
  }

  function createProgram(gl, vShader, fShader) {
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(vertexShader, util.id(vShader).innerHTML);
    gl.shaderSource(fragmentShader, util.id(fShader).innerHTML);

    gl.compileShader(vertexShader);
    gl.compileShader(fragmentShader);

    var program = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    program.positionAttribute = gl.getAttribLocation(program, "aVertexPosition");
    program.colorAttribute = gl.getAttribLocation(program, "aVertexColor");

    gl.enableVertexAttribArray(program.positionAttribute);
    gl.enableVertexAttribArray(program.colorAttribute);

    program.mvMatrix = gl.getUniformLocation(program, "uMVMatrix");

    if (fShader === "game-f-shader") {
      program.expand = gl.getUniformLocation(program, "expand");
      program.center = gl.getUniformLocation(program, "center");
      program.radius = gl.getUniformLocation(program, "radius");
      program.windowHeight = gl.getUniformLocation(program, "windowHeight");
    }

    return program;
  }

  function rotateZ(m, angle, mode) {
    var c = Math.cos(angle);
    var s = Math.sin(angle);

    if (mode === 2) s *= util.vh(20) / util.vw(100);

    var mv0 = m[0],
      mv4 = m[4],
      mv8 = m[8];

    m[0] = c * m[0] - s * m[1];
    m[4] = c * m[4] - s * m[5];
    m[8] = c * m[8] - s * m[9];
    m[1] = c * m[1] + s * mv0;
    m[5] = c * m[5] + s * mv4;
    m[9] = c * m[9] + s * mv8;

    return m;
  }

  return {
    createVertexBuffer: createVertexBuffer,
    createColorBuffer: createColorBuffer,
    createProgram: createProgram,
    rotateZ: rotateZ
  };
})();
