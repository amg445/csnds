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
function drawShape(gl, shape, camera, toWorld, color) {
    var program = shape.shader;
    var faces = shape.faces;

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LESS);
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

    var colorLocation = gl.getUniformLocation(program, "color");
    gl.uniform3fv(colorLocation, color);

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
    gl.disable(gl.DEPTH_TEST);
}
