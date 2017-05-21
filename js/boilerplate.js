function initializeWebGL(canvas) {
    // Getting WebGL context the right way
    var gl = null;
    try {
        gl = canvas[0].getContext("experimental-webgl");
        if (!gl) {
            gl = canvas[0].getContext("webgl");
        }
    } catch (error) {
        // NO-OP
    }
    if (!gl) {
        alert("Could not get WebGL context!");
        throw new Error("Could not get WebGL context!");
    }
    return gl;
}

function createShader(gl, shaderScriptId) {
    var shaderScript = $("#" + shaderScriptId);
    var shaderSource = shaderScript[0].text;
    var shaderType = null;
    if (shaderScript[0].type == "x-shader/x-vertex") {
        shaderType = gl.VERTEX_SHADER;
    } else if (shaderScript[0].type == "x-shader/x-fragment") {
        shaderType = gl.FRAGMENT_SHADER;
    } else {
        throw new Error("Invalid shader type: " + shaderScript[0].type)
    }
    var shader = gl.createShader(shaderType);
    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        var infoLog = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error("An error occurred compiling the shader: " + infoLog);
    } else {
        return shader;
    }
}

function createGlslProgram(gl, vertexShaderId, fragmentShaderId) {
    var program = gl.createProgram();
    gl.attachShader(program, createShader(gl, vertexShaderId));
    gl.attachShader(program, createShader(gl, fragmentShaderId));
    gl.linkProgram(program);
    gl.validateProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        var infoLog = gl.getProgramInfoLog(program);
        gl.deleteProgram(program);
        throw new Error("An error occurred linking the program: " + infoLog);
    } else {
        return program;
    }
}

var cubeData = {
  vertices: [
    -0.5, -0.5, -0.5,
    -0.5, -0.5,  0.5,
    -0.5,  0.5, -0.5,
    -0.5,  0.5,  0.5,
    0.5, -0.5, -0.5,
    0.5, -0.5,  0.5,
    0.5,  0.5, -0.5,
    0.5,  0.5,  0.5,
  ],
  lineIndices: [
    0, 1,
    0, 2,
    0, 4,
    1, 3,
    1, 5,
    2, 3,
    2, 6,
    4, 5,
    4, 6,
    6, 7,
    5, 7,
    3, 7
  ],
  triangleIndices: [
    1, 7, 3,
    1, 5, 7,
    0, 3, 2,
    0, 1, 3,
    5, 6, 7,
    5, 4, 6,
    4, 2, 6,
    4, 0, 2,
    3, 6, 2,
    3, 7, 6,
    0, 5, 1,
    0, 4, 5
  ],
};

function createShape(gl, shader, data, faces) {
    var shape = {};

    shape.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, shape.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.vertices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    shape.lineIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, shape.lineIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data.lineIndices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    shape.triIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, shape.triIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data.triangleIndices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    shape.lineLength = data.lineIndices.length;
    shape.triangleLength = data.triangleIndices.length;

    shape.shader = shader;
    shape.faces = faces;

    return shape;
}

//function drawShape(gl, shape, program, camera, toWorld, faces) {
function drawShape(gl, shape, camera, toWorld, disType, theme) {
    var program = shape.shader;
    var faces = shape.faces;

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LESS);
    gl.depthMask(gl.FALSE);
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, shape.vertexBuffer);

    var positionLocation = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 4 * 3, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    gl.uniformMatrix4fv(gl.getUniformLocation(program, "projection"), false, camera.projection);
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "toWorld"), false, toWorld);
    var toCam = mat4.create();
    mat4.invert(toCam, camera.toWorld);
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "toCam"), false, toCam);

    var waveformLocation = gl.getUniformLocation(program, "waveform");
    gl.uniform1f(waveformLocation, disType[0]);

    var frequencyLocation = gl.getUniformLocation(program, "spectrum");
    gl.uniform1f(frequencyLocation, disType[1]);

    var themeLocation = gl.getUniformLocation(program, "theme");
    gl.uniform1i(themeLocation, theme);

    if (faces) {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, shape.triIndexBuffer);
        gl.drawElements(gl.TRIANGLES, shape.triangleLength, gl.UNSIGNED_SHORT, 0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    } else {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, shape.lineIndexBuffer);
        gl.drawElements(gl.LINES, shape.lineLength, gl.UNSIGNED_SHORT, 0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    }

    gl.useProgram(null);
    gl.depthMask(gl.TRUE);
    gl.disable(gl.DEPTH_TEST);
}

function drawBackground(program, time, bpm, theme) {
    var vertexData = [
        -1.0, -1.0, 0.99,  // Lower left
        1.0, -1.0, 0.99,  // Lower right
        1.0,  1.0, 0.99,  // Top right
        -1.0,  1.0, 0.99,  // Top left
    ];
    var vertexArray = new Float32Array(vertexData);
    var vertexBuffer = gl.createBuffer();

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LESS);
    gl.depthMask(gl.FALSE);
    gl.useProgram(program);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexArray, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    var indexData = [0, 1, 2, 0, 2, 3];
    var indexArray = new Uint16Array(indexData);
    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexArray, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    var vertPositionLocation = gl.getAttribLocation(program, "vert_position");
    gl.enableVertexAttribArray(vertPositionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.vertexAttribPointer(vertPositionLocation, 3, gl.FLOAT, false, 4*3, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    var timeLocation = gl.getUniformLocation(program, "time");
    gl.uniform1f(timeLocation, time);

    var bpmLocation = gl.getUniformLocation(program, "bpm");
    gl.uniform1f(bpmLocation, bpm);

    var themeLocation = gl.getUniformLocation(program, "theme");
    gl.uniform1i(themeLocation, theme);

    var canvas = document.getElementById("webglCanvas");
    var resolutionLocation = gl.getUniformLocation(program, "resolution");
    gl.uniform2f(resolutionLocation, canvas.clientWidth, canvas.clientHeight);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    gl.useProgram(null);
    gl.depthMask(gl.FALSE);
    gl.disable(gl.DEPTH_TEST);
}
