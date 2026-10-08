/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./PotatoEngine/src/Camera.js"
/*!************************************!*\
  !*** ./PotatoEngine/src/Camera.js ***!
  \************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ Camera)\n/* harmony export */ });\n/* harmony import */ var _transformations__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./transformations */ \"./PotatoEngine/src/transformations.js\");\n\n\nclass Camera {\n  constructor(\n    aspect,\n    x = 0,\n    y = 0,\n    z = -6,\n    fov = Math.PI / 4,\n    zNear = 0.1,\n    zFar = 100,\n    orthoSize = 2.5,\n  ) {\n    this.x = x;\n    this.y = y;\n    this.z = z;\n\n    this.fov = fov;\n    this.aspect = aspect;\n    this.zNear = zNear;\n    this.zFar = zFar;\n    this.orthoSize = orthoSize;\n\n    this.projection = this.createPerspectiveProjection();\n  }\n\n  createPerspectiveProjection() {\n    return (0,_transformations__WEBPACK_IMPORTED_MODULE_0__.perspective)(this.fov, this.aspect, this.zNear, this.zFar);\n  }\n\n  createOrthographicProjection() {\n    return (0,_transformations__WEBPACK_IMPORTED_MODULE_0__.matMul)(\n      (0,_transformations__WEBPACK_IMPORTED_MODULE_0__.box2Cube)(\n        -this.orthoSize * this.aspect,\n        this.orthoSize * this.aspect,\n        -this.orthoSize,\n        this.orthoSize,\n        this.zNear,\n        this.zFar,\n      ),\n      flipZ(),\n    );\n  }\n\n  usePerspective() {\n    this.projection = this.createPerspectiveProjection();\n  }\n\n  useOrthographic() {\n    this.projection = this.createOrthographicProjection();\n  }\n\n  resize(aspect) {\n    this.aspect = aspect;\n    this.projection = this.createOrthographicProjection();\n  }\n\n  move(x, y, z) {\n    this.x += x;\n    this.y += y;\n    this.z += z;\n  }\n\n  getViewMatrix() {\n    return (0,_transformations__WEBPACK_IMPORTED_MODULE_0__.mat4Translate)((0,_transformations__WEBPACK_IMPORTED_MODULE_0__.mat4Identity)(), [this.x, this.y, this.z]);\n  }\n\n  getProjectionMatrix() {\n    return this.projection;\n  }\n}\n\n\n//# sourceURL=webpack://unm-cs-512-obj/./PotatoEngine/src/Camera.js?\n}");

/***/ },

/***/ "./PotatoEngine/src/Scene.js"
/*!***********************************!*\
  !*** ./PotatoEngine/src/Scene.js ***!
  \***********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ Scene)\n/* harmony export */ });\n/* harmony import */ var _Camera__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Camera */ \"./PotatoEngine/src/Camera.js\");\n/* harmony import */ var _objects__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./objects */ \"./PotatoEngine/src/objects/index.js\");\n/* harmony import */ var _objects_SceneObject__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./objects/SceneObject */ \"./PotatoEngine/src/objects/SceneObject.js\");\n/* harmony import */ var _Shader__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Shader */ \"./PotatoEngine/src/Shader.js\");\n/* harmony import */ var _ShaderProgram__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./ShaderProgram */ \"./PotatoEngine/src/ShaderProgram.js\");\n/* harmony import */ var _transformations__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./transformations */ \"./PotatoEngine/src/transformations.js\");\n\n\n\n\n\n\n\nclass Scene {\n  constructor(canvasID) {\n    this.canvas = document.getElementById(canvasID);\n    this.gl = this.canvas.getContext(\"webgl2\");\n\n    if (!this.gl) {\n      alert(\"WebGL2 not supported\");\n    }\n\n    // TODO replace objects & shaders with maps. will probably want lights too\n    this.objects = new Map();\n    this.renderList = new Map();\n    this.lights = new Map();\n    this.shaders = new Map();\n    this.background = (0,_objects__WEBPACK_IMPORTED_MODULE_1__.rgba)(64, 112, 255, 1);\n\n    // start time and time elapsed\n    this.startTime = Date.now();\n    this.time = 0;\n\n    // use to check if we actually need to switch shaders...\n    this.activeProgram = undefined;\n    // Map<string, ShaderProgram>\n    this.programs = new Map();\n\n    this.rotationX = 0;\n    this.rotationY = 0;\n\n    // corrected aspect, should keep things looking 1:1\n    this.camera = new _Camera__WEBPACK_IMPORTED_MODULE_0__[\"default\"](this.canvas.width / this.canvas.height);\n\n    // object rotation\n    this.rotationX;\n    this.rotationY;\n\n    // bind this to the renderer so we dont have context issues\n    this.render = this.render.bind(this);\n  }\n\n  /**\n   * Load our shaders and setup\n   */\n  async loadShaders() {\n    await Promise.all(\n      [...this.shaders].map(([key, shader]) => shader.loadRemote()),\n    );\n\n    this.shaders.forEach((shader) => {\n      shader.create(this.gl);\n    });\n  }\n\n  /**\n   * create the shaders and combined gl shader program\n   *\n   * @param {*} vertexShader\n   * @param {*} fragmentShader\n   * @returns\n   */\n  createProgram(vertexShader, fragmentShader) {\n    const program = this.gl.createProgram();\n\n    this.gl.attachShader(program, vertexShader.shader);\n    this.gl.attachShader(program, fragmentShader.shader);\n    this.gl.linkProgram(program);\n\n    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {\n      this.gl.deleteProgram(program);\n      throw new Error(\n        `Failed to link shader program: ${this.gl.getProgramInfoLog(program)}`,\n      );\n    }\n\n    return program;\n  }\n\n  /**\n   * Add a shader to the scene\n   * @param {Shader} shader\n   */\n  addShader(shader) {\n    this.shaders.set(shader.label, shader);\n  }\n\n  /**\n   * Get a shader by its label\n   * @param {*} label\n   * @returns\n   */\n  getShader(label) {\n    // TODO should I shove shaders in a map?\n    const shader = this.shaders.get(label);\n\n    if (!shader) {\n      throw new Error(`Shader \"${label}\" was not found`);\n    }\n\n    return shader;\n  }\n\n  /**\n   * Create a new program\n   * @param {*} label\n   * @param {*} vertexShaderLabel\n   * @param {*} fragmentShaderLabel\n   * @returns\n   */\n  addProgram(label, vertexShaderLabel, fragmentShaderLabel) {\n    const vertexShader = this.getShader(vertexShaderLabel);\n    const fragmentShader = this.getShader(fragmentShaderLabel);\n\n    if (!vertexShader.shader || !fragmentShader.shader) {\n      throw new Error(\n        `Shaders for program \"${label}\" must be compiled before creating the program`,\n      );\n    }\n\n    const program = this.createProgram(vertexShader, fragmentShader);\n    const shaderProgram = new _ShaderProgram__WEBPACK_IMPORTED_MODULE_4__[\"default\"](label, program, this.gl);\n\n    this.programs.set(label, shaderProgram);\n\n    return shaderProgram;\n  }\n\n  /**\n   * Get a program by its label\n   * @param {string} label\n   * @returns\n   */\n  getProgram(label) {\n    const shaderProgram = this.programs.get(label);\n\n    if (!shaderProgram) {\n      throw new Error(`Shader program \"${label}\" was not found`);\n    }\n\n    return shaderProgram;\n  }\n\n  /**\n   * Initialize the buffers for every SceneObject\n   */\n  initBuffers() {\n    this.objects.forEach((obj) => {\n      obj.loadBuffers(this.gl);\n    });\n  }\n\n  /**\n   * Add an object to the scene\n   *\n   * - need an additional call to SceneObject.loadBuffers\n   *   when adding, not sure if that is something\n   *   that should live in here though. Added for now\n   * @param {SceneObject} obj the object to add\n   * @param {string} programLabel the label for the shader program to use with this object\n   * @param {boolean} [child=false] if the object is a child, if so is not added to scenes render list, the parent renders it\n   */\n  addObject(obj, programLabel = obj.programLabel, child = false) {\n    if (!programLabel) {\n      throw new Error(\n        `Object \"${obj.label ?? \"unknown\"}\" does not have a shader program`,\n      );\n    }\n\n    obj.programLabel = programLabel;\n    if(!child){\n      this.renderList.set(obj.label, obj);\n    }\n    this.objects.set(obj.label, obj);\n    obj.loadBuffers(this.gl);\n\n    // TODO make setuniforms standard\n    if (!!obj.setUniforms) {\n      obj.setUniforms(this);\n    }\n  }\n\n  /**\n   * Get an object by its lable\n   *\n   * TODO: should really update the objects colleciton to a map instead of a list\n   * @param {string} label\n   */\n  getObject(label) {\n    return this.objects.get(label);\n  }\n\n  /**\n   * TODO probably some unbinding or something?\n   * @param {*} label\n   */\n  removeObject(label) {\n    this.objects.delete(label);\n    this.renderList.delete(label);\n  }\n\n  /**\n   * Set the scene rotation.\n   *\n   * NOTE this is not camera rotation,\n   *      it is full rotation of the objects in the scene\n   * @param {*} x\n   * @param {*} y\n   */\n  setRotation(x, y) {\n    this.rotationX = x;\n    this.rotationY = y;\n  }\n\n  /**\n   * Update the state of the scene\n   * @param {*} dt timestep in seconds\n   */\n  update(dt) {\n    this.renderList.forEach((obj) => {\n      obj.update(dt, this);\n    });\n  }\n\n  /**\n   * Render the scene\n   */\n  render() {\n    const nextTime = Date.now() - this.startTime;\n\n    const dt = nextTime - this.time;\n    this.update(dt / 1000);\n\n    this.time = nextTime;\n\n    // delta time since start in ms\n\n    if (!this.gl) {\n      console.error(\"Scene has no WebGL context\");\n      return;\n    }\n\n    this.gl.enable(this.gl.DEPTH_TEST);\n    this.gl.clearColor(...this.background);\n    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);\n\n    // rotation matrices\n    const cx = Math.cos(this.rotationY);\n    const sx = Math.sin(this.rotationY);\n    const cy = Math.cos(this.rotationX);\n    const sy = Math.sin(this.rotationX);\n    const rotX = [1, 0, 0, 0, 0, cy, sy, 0, 0, -sy, cy, 0, 0, 0, 0, 1];\n    const rotY = [cx, 0, -sx, 0, 0, 1, 0, 0, sx, 0, cx, 0, 0, 0, 0, 1];\n\n    let sceneRotation = (0,_transformations__WEBPACK_IMPORTED_MODULE_5__.multiplyMat4)(rotY, rotX);\n\n    // NOTE isn't doing this math in js slow?\n    // init model-view matrix as identity matrix\n    let modelViewMatrix = this.camera.getViewMatrix();\n    // get projection from camera\n    const projectionMatrix = this.camera.getProjectionMatrix();\n    // init model transformation matrix as identity matrix\n    let modelTransformationMatrix = (0,_transformations__WEBPACK_IMPORTED_MODULE_5__.mat4Identity)();\n    // object rotation\n    modelTransformationMatrix = (0,_transformations__WEBPACK_IMPORTED_MODULE_5__.multiplyMat4)(\n      modelTransformationMatrix,\n      sceneRotation,\n    );\n\n    let i =0;\n    for (const [_, obj] of this.renderList) {\n      const shaderProgram = this.getProgram(obj.programLabel);\n      if (obj.programLabel != this.activeProgram) {\n        shaderProgram.use(this.gl);\n      }\n\n      // we only need to update these guys on the first loop iteration or on switch\n      if (i == 0 || obj.programLabel != this.activeProgram) {\n        // set time in seconds\n        if (shaderProgram.timeLoc !== null) {\n          this.gl.uniform1f(shaderProgram.timeLoc, this.time / 1000);\n        }\n\n        if (shaderProgram.uPM !== null) {\n          this.gl.uniformMatrix4fv(shaderProgram.uPM, false, projectionMatrix);\n        }\n        if (shaderProgram.uMVM !== null) {\n          this.gl.uniformMatrix4fv(shaderProgram.uMVM, false, modelViewMatrix);\n        }\n        if (shaderProgram.uMTM !== null) {\n          this.gl.uniformMatrix4fv(\n            shaderProgram.uMTM,\n            false,\n            modelTransformationMatrix,\n          );\n        }\n      }\n\n      // obj.bindBuffers(this.gl, shaderProgram.posLoc, shaderProgram.colorLoc);\n      obj.draw(this.gl);\n\n\n      i++;\n    }\n  }\n}\n\n\n//# sourceURL=webpack://unm-cs-512-obj/./PotatoEngine/src/Scene.js?\n}");

/***/ },

/***/ "./PotatoEngine/src/Shader.js"
/*!************************************!*\
  !*** ./PotatoEngine/src/Shader.js ***!
  \************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ Shader)\n/* harmony export */ });\nclass Shader {\n  constructor(label, type, source, source_url) {\n    this.label = label;\n    this.type = type\n    this.source = source;\n    this.source_url = source_url;\n\n\n    this.shader = undefined;\n\n    this.loadRemote = this.loadRemote.bind(this)\n    this.create = this.create.bind(this)\n  }\n\n  /**\n   * Initialize the shader wth webgl\n   * @param {*} gl the webgl2 context from canvas\n   * @param {*} type the type of shader\n   * @param {*} source the shader source\n   * @returns\n   */\n  create(gl) {\n    let shader = gl.createShader(this.type);\n    gl.shaderSource(shader, this.source);\n    gl.compileShader(shader);\n\n    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {\n      throw new Error(gl.getShaderInfoLog(shader));\n    }\n    this.shader = shader;\n  }\n\n  /**\n   * Load a shader from a remote source (file)\n   * @param {*} url shader url to load from\n   * @returns the text of the shader file\n   */\n  async loadRemote() {\n    if(!this.source_url){\n        console.error(this.name + \":\\tNo source_url found\")\n        return\n    }\n\n    const response = await fetch(this.source_url);\n\n    if (!response.ok) {\n      throw new Error(\n        `Failed to load ${this.source_url}: ${response.status} ${response.statusText}`,\n      );\n    }\n\n    this.source = await response.text();\n  }\n}\n\n\n//# sourceURL=webpack://unm-cs-512-obj/./PotatoEngine/src/Shader.js?\n}");

/***/ },

/***/ "./PotatoEngine/src/ShaderProgram.js"
/*!*******************************************!*\
  !*** ./PotatoEngine/src/ShaderProgram.js ***!
  \*******************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ ShaderProgram)\n/* harmony export */ });\n/**\n * Simple wrapper representation of a shader program\n */\nclass ShaderProgram {\n  constructor(label, program, gl) {\n    this.label = label;\n    this.program = program;\n\n    // NOTE: we are assuming here that all of our shaders will use these\n    //       values if we do this here, may need extensions for other custom shaders\n    this.posLoc = gl.getAttribLocation(program, \"aPosition\");\n    this.colorLoc = gl.getAttribLocation(program, \"aColor\");\n\n    this.timeLoc = gl.getUniformLocation(program, \"uTime\");\n    this.uMVM = gl.getUniformLocation(program, \"uModelViewMatrix\");\n    this.uPM = gl.getUniformLocation(program, \"uProjectionMatrix\");\n    this.uMTM = gl.getUniformLocation(program, \"uModelTransformationMatrix\");\n  }\n\n  use(gl) {\n    if (!this.program) {\n      console.warn(\"Cannot render before initializing the shader program\");\n      return;\n    }\n    gl.useProgram(this.program);\n  }\n}\n\n\n//# sourceURL=webpack://unm-cs-512-obj/./PotatoEngine/src/ShaderProgram.js?\n}");

/***/ },

/***/ "./PotatoEngine/src/controls/basic.js"
/*!********************************************!*\
  !*** ./PotatoEngine/src/controls/basic.js ***!
  \********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__),\n/* harmony export */   setupKeyboardControls: () => (/* binding */ setupKeyboardControls),\n/* harmony export */   setupMouseControls: () => (/* binding */ setupMouseControls)\n/* harmony export */ });\n/**\n * Basic controls for movement based on the provided source from HW3\n */\n\n/**\n * INitalize mouse interactions with the canvas\n * - basically drag calculations let us rotate the scene\n *\n * @param {*} canvas The canvas element\n */\nfunction setupMouseControls(scene) {\n  const canvas = scene.canvas;\n  // Mouse and keyboard interactions\n  let mouseDown = false,\n    lastX,\n    lastY;\n\n  canvas.addEventListener(\"mousedown\", (e) => {\n    mouseDown = true;\n    lastX = e.clientX;\n    lastY = e.clientY;\n  });\n  canvas.addEventListener(\"mouseup\", () => (mouseDown = false));\n  canvas.addEventListener(\"mouseleave\", () => (mouseDown = false));\n  canvas.addEventListener(\"mousemove\", (e) => {\n    if (!mouseDown) return;\n    let dx = e.clientX - lastX;\n    let dy = e.clientY - lastY;\n\n    scene.rotationY += dx * 0.01;\n    scene.rotationX += dy * 0.01;\n\n    lastX = e.clientX;\n    lastY = e.clientY;\n  });\n}\n\n/**\n * Initalize keyboard controls\n * - w & s to move z\n * - arrows to move x & y\n */\nfunction setupKeyboardControls(scene) {\n  document.addEventListener(\"keydown\", (e) => {\n    const step = 0.2;\n\n    switch (e.key) {\n      case \"ArrowUp\":\n        scene.camera.move(0, -step, 0);\n        break;\n\n      case \"ArrowDown\":\n        scene.camera.move(0, step, 0);\n        break;\n\n      case \"ArrowLeft\":\n        scene.camera.move(step, 0, 0);\n        break;\n\n      case \"ArrowRight\":\n        scene.camera.move(-step, 0, 0);\n        break;\n\n      case \"w\":\n        scene.camera.move(0, 0, step);\n        break;\n\n      case \"s\":\n        scene.camera.move(0, 0, -step);\n        break;\n    }\n  });\n}\n\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({\n  setupKeyboardControls,\n  setupMouseControls,\n});\n\n\n//# sourceURL=webpack://unm-cs-512-obj/./PotatoEngine/src/controls/basic.js?\n}");

/***/ },

/***/ "./PotatoEngine/src/controls/index.js"
/*!********************************************!*\
  !*** ./PotatoEngine/src/controls/index.js ***!
  \********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var _basic__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./basic */ \"./PotatoEngine/src/controls/basic.js\");\n\n\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({\n  BasicControls: _basic__WEBPACK_IMPORTED_MODULE_0__,\n});\n\n\n//# sourceURL=webpack://unm-cs-512-obj/./PotatoEngine/src/controls/index.js?\n}");

/***/ },

/***/ "./PotatoEngine/src/index.js"
/*!***********************************!*\
  !*** ./PotatoEngine/src/index.js ***!
  \***********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   Camera: () => (/* reexport safe */ _Camera_js__WEBPACK_IMPORTED_MODULE_2__[\"default\"]),\n/* harmony export */   Controls: () => (/* reexport safe */ _controls__WEBPACK_IMPORTED_MODULE_4__[\"default\"]),\n/* harmony export */   Scene: () => (/* reexport safe */ _Scene_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"]),\n/* harmony export */   Shader: () => (/* reexport safe */ _Shader_js__WEBPACK_IMPORTED_MODULE_1__[\"default\"]),\n/* harmony export */   ShaderProgram: () => (/* reexport safe */ _ShaderProgram_js__WEBPACK_IMPORTED_MODULE_3__[\"default\"]),\n/* harmony export */   objects: () => (/* reexport module object */ _objects__WEBPACK_IMPORTED_MODULE_5__)\n/* harmony export */ });\n/* harmony import */ var _Scene_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Scene.js */ \"./PotatoEngine/src/Scene.js\");\n/* harmony import */ var _Shader_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Shader.js */ \"./PotatoEngine/src/Shader.js\");\n/* harmony import */ var _Camera_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Camera.js */ \"./PotatoEngine/src/Camera.js\");\n/* harmony import */ var _ShaderProgram_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./ShaderProgram.js */ \"./PotatoEngine/src/ShaderProgram.js\");\n/* harmony import */ var _controls__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./controls */ \"./PotatoEngine/src/controls/index.js\");\n/* harmony import */ var _objects__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./objects */ \"./PotatoEngine/src/objects/index.js\");\n\n\n\n\n\n\n\n\n//# sourceURL=webpack://unm-cs-512-obj/./PotatoEngine/src/index.js?\n}");

/***/ },

/***/ "./PotatoEngine/src/objects/FloatingObject.js"
/*!****************************************************!*\
  !*** ./PotatoEngine/src/objects/FloatingObject.js ***!
  \****************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ FloatingObject)\n/* harmony export */ });\n/* harmony import */ var _PhysicsObject__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./PhysicsObject */ \"./PotatoEngine/src/objects/PhysicsObject.js\");\n\n\n/**\n * Literally just a object floating on water, that behaves just like physics object\n * Might just combine being \"floaty\" on the normal physics object later\n *\n * Floating calculations are very lazy but good enough for now.\n */\nclass FloatingObject extends _PhysicsObject__WEBPACK_IMPORTED_MODULE_0__[\"default\"] {\n  /**\n   * Create a floating physics object\n   * @param {*} label \n   * @param {*} vertices \n   * @param {*} colors \n   * @param {*} indices \n   * @param {*} parent \n   * @param {*} position \n   * @param {*} rotation \n   * @param {*} velocity \n   * @param {*} rotVelocity \n   * @param {*} gravity \n   * @param {*} hitboxRadius \n   * @param {*} collidable \n   * @param {*} onCollision \n   * @param {Number} buoyancy m/s^2 acceleration we should get up if below water\n   * @param {Number} waterFriction percent of x,z speed kept if in water (0-1)\n   * @param {Function} waterFunction function given position & time return water y-level\n   */\n  constructor(\n    label,\n    vertices,\n    colors,\n    indices,\n    parent = undefined,\n    position,\n    rotation,\n    velocity = [0, 0, 0, 0],\n    rotVelocity = [0, 0, 0, 0],\n    gravity = 9.81,\n    hitboxRadius = 0,\n    collidable = true,\n    onCollision = undefined,\n    buoyancy = 15,\n    waterFriction = 0.99,\n    waterFunction = undefined,\n  ) {\n    super(\n    label,\n    vertices,\n    colors,\n    indices,\n    parent,\n    position,\n    rotation,\n    velocity,\n    rotVelocity,\n    gravity,\n    hitboxRadius,\n    collidable,\n    onCollision,\n    );\n\n    // function to get the height of water given a position\n    this.waterFunction = waterFunction;\n    this.buoyancy = buoyancy;\n    this.waterFriction = waterFriction;\n\n    this.snappedToWater = false;\n  }\n\n  update(dt, scene) {\n    // physics object does an update of the position according to velocity\n    // so maybe we jst update the velocity for next tick if we find we are below\n    // the water at the calculated point\n    super.update(dt, scene);\n\n    // return height of water at given point & time (s)\n    const waterY = this.waterFunction(this.position, scene.time / 1000);\n\n    // if close enough to water surface \n    // & slow enough, zero out gravity and set snappedToWater=true\n    if (Math.abs(this.velocity[1]) < 0.01 && Math.abs(waterY - this.position[1]) < 0.01){\n        this.snappedToWater = true;\n        this.gravity = 0;\n    }\n\n    if (this.snappedToWater) {\n      this.position[1] = waterY;\n    } else {\n      // assume we float up to the center position for now\n      if (this.position[1] < waterY) {\n        this.velocity[1] += this.buoyancy * dt;\n      }\n    }\n\n    // if snapped to or below or touching water, \n    // apply water \"friction\" for x,z velocity\n    if (\n      this.snappedToWater ||\n      this.position[1] < waterY ||\n      this.position[1] - waterY < this.hitboxRadius\n    ) {\n      // again another big simplification but should look meh\n      const damper = Math.pow(this.waterFriction, dt * 1000/30)\n      this.velocity[0] *= damper;\n      this.velocity[1] *= damper;\n      this.velocity[2] *= damper;\n      this.rotVelocity[0] *= damper;\n      this.rotVelocity[1] *= damper;\n      this.rotVelocity[2] *= damper;\n    }\n  }\n}\n\n\n//# sourceURL=webpack://unm-cs-512-obj/./PotatoEngine/src/objects/FloatingObject.js?\n}");

/***/ },

/***/ "./PotatoEngine/src/objects/PhysicsObject.js"
/*!***************************************************!*\
  !*** ./PotatoEngine/src/objects/PhysicsObject.js ***!
  \***************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ PhysicsObject)\n/* harmony export */ });\n/* harmony import */ var _ShaderProgram__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../ShaderProgram */ \"./PotatoEngine/src/ShaderProgram.js\");\n/* harmony import */ var _vec4__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../vec4 */ \"./PotatoEngine/src/vec4.js\");\n/* harmony import */ var _SceneObject__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./SceneObject */ \"./PotatoEngine/src/objects/SceneObject.js\");\n\n\n\n\nclass PhysicsObject extends _SceneObject__WEBPACK_IMPORTED_MODULE_2__[\"default\"] {\n  /**\n   *\n   * @param {*} label\n   * @param {*} vertices\n   * @param {*} colors\n   * @param {*} indices\n   * @param {*} parent\n   * @param {*} position\n   * @param {*} rotation\n   * @param {*} velocity\n   * @param {*} rotVelocity\n   * @param {*} gravity\n   * @param {*} hitboxRadius\n   * @param {*} collidable\n   * @param {*} onCollision\n   */\n  constructor(\n    label,\n    vertices,\n    colors,\n    indices,\n    parent = undefined,\n    position,\n    rotation,\n    velocity = [0, 0, 0, 0],\n    rotVelocity = [0, 0, 0, 0],\n    gravity = 9.81,\n    hitboxRadius = 0,\n    collidable = true,\n    onCollision = undefined,\n  ) {\n    super(label, vertices, colors, indices, parent);\n\n    this.velocity = velocity;\n    this.rotVelocity = rotVelocity;\n    this.gravity = gravity;\n\n    this.position = position;\n    this.rotation = rotation;\n\n    this.hitboxRadius = hitboxRadius;\n    this.collidable = collidable;\n    this.onCollision = onCollision;\n    // TODO: calculate center of mass?\n  }\n\n  update(dt, scene) {\n    // console.log(\"updating physics object: \", this.label, this.position, dt)\n    super.update(dt, scene);\n\n    // update the position & rotation & apply gravity\n    this.position = (0,_vec4__WEBPACK_IMPORTED_MODULE_1__.sumVec4)(this.position, (0,_vec4__WEBPACK_IMPORTED_MODULE_1__.scaleVec4)(this.velocity, dt));\n    this.rotation = (0,_vec4__WEBPACK_IMPORTED_MODULE_1__.sumVec4)(this.rotation, (0,_vec4__WEBPACK_IMPORTED_MODULE_1__.scaleVec4)(this.rotVelocity, dt));\n    this.velocity[1] -= this.gravity * dt;\n\n    // collisions, only do if collidable and has an oncollision\n    // NOTE: for now we do big dummy collision with hitbox spheres at the positions\n    //       of the objects, which we assume will be at the center of the object\n    if (this.collidable && !!this.onCollision) {\n      // NOTE: if we collide we should tell the other\n      // object about it so it doesnt have to redo calculation\n      // NOTE: in a thoughtful simulator we would not do collisions\n      // per object, but once per scene so things dont need to\n      // be recalculated... but I'm being lazy rn.\n      for (const [_, testobj] of scene.objects) {\n        // if not physics object or not collidable physics\n        if (!testobj.collidable || testobj.label == this.label) {\n          continue;\n        }\n\n        // if the hitboxRadiuses are close enough\n        if (\n          (0,_vec4__WEBPACK_IMPORTED_MODULE_1__.vec4distance)(testobj.position, this.position) <\n          this.hitboxRadius + testobj.hitboxRadius\n        ) {\n          this.onCollision(this, testobj);\n        }\n      }\n    }\n  }\n\n  /**\n   * Draw a physics object onto the canvas\n   * additionally binds position and rotation matrices\n   *\n   * @param {*} gl the webgl2 context from canvas\n   */\n  draw(gl) {\n    super.draw(gl);\n  }\n}\n\n\n//# sourceURL=webpack://unm-cs-512-obj/./PotatoEngine/src/objects/PhysicsObject.js?\n}");

/***/ },

/***/ "./PotatoEngine/src/objects/SceneObject.js"
/*!*************************************************!*\
  !*** ./PotatoEngine/src/objects/SceneObject.js ***!
  \*************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ SceneObject)\n/* harmony export */ });\n/* harmony import */ var _transformations__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../transformations */ \"./PotatoEngine/src/transformations.js\");\n/**\n * Wrapper class to make animation and such simple.\n *\n * We will want this to hold\n * - vertices\n * - colors\n * - indices\n * (maybe multiples of the above)\n *\n * Later add for hierarchical models:\n * - children\n * - parent\n * - transformation matrix previously used?\n */\n\n\n\nclass SceneObject {\n  constructor(label, vertices, colors, indices, parent = undefined) {\n    this.label = label;\n\n    // basic input from model generation\n    this.vertices = vertices;\n    this.colors = colors;\n    this.indices = indices;\n\n    // TODO parent and children for hierarchy later\n    this.parent = parent;\n    this.children = [];\n\n    // transformation matrix to track?\n    this.M = undefined;\n\n    // vertex buffer, colors buffer, indices buffer\n    this.vbo = undefined;\n    this.nbo = undefined;\n    this.ibo = undefined;\n\n    // attach update function here, such as an explosion growing\n    this.updateCB = undefined;\n\n    this.position = [0, 0, 0];\n    this.rotation = [0, 0, 0];\n    this.scale = [1, 1, 1];\n\n    // attached in scene\n    this.programLabel;\n  }\n\n  /**\n   * Load the vertices, colors, indices into the buffers\n   *\n   * @param {*} gl the webgl2 context from canvas\n   */\n  loadBuffers(gl) {\n    if (!(this.vertices instanceof Float32Array)) {\n      throw new Error(\"vertices must be a Float32Array\");\n    }\n\n    if (!(this.colors instanceof Float32Array)) {\n      throw new Error(\"colors must be a Float32Array\");\n    }\n\n    if (!(this.indices instanceof Uint16Array)) {\n      throw new Error(\"indices must be a Uint16Array\");\n    }\n\n    this.vbo = gl.createBuffer();\n    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);\n    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);\n\n    this.nbo = gl.createBuffer();\n    gl.bindBuffer(gl.ARRAY_BUFFER, this.nbo);\n    gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW);\n\n    this.ibo = gl.createBuffer();\n    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);\n    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);\n  }\n\n  /**\n   * Bind and setup buffers\n   *\n   * @param {*} gl the webgl2 context from canvas\n   */\n  bindBuffers(gl) {\n    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);\n    gl.enableVertexAttribArray(this.posLoc);\n    gl.vertexAttribPointer(this.posLoc, 4, gl.FLOAT, false, 0, 0);\n\n    gl.bindBuffer(gl.ARRAY_BUFFER, this.nbo);\n    gl.enableVertexAttribArray(this.colorLoc);\n    gl.vertexAttribPointer(this.colorLoc, 4, gl.FLOAT, false, 0, 0);\n    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);\n  }\n\n  /**\n   * Set object specific uniforms.\n   * In this case positon and rotation\n   *\n   * @param {Scene} scene the scene the object is in\n   */\n  setUniforms(scene) {\n    const shader = scene.getProgram(this.programLabel);\n    this.uPosLoc = scene.gl.getUniformLocation(shader.program, \"uPosition\");\n    this.uRotLoc = scene.gl.getUniformLocation(shader.program, \"uRotation\");\n    this.uScaleLoc = scene.gl.getUniformLocation(shader.program, \"uScale\");\n    this.uWorldLoc = scene.gl.getUniformLocation(\n      shader.program,\n      \"uWorldTransformationMatrix\",\n    );\n\n    this.posLoc = scene.gl.getAttribLocation(shader.program, \"aPosition\");\n    this.colorLoc = scene.gl.getAttribLocation(shader.program, \"aColor\");\n  }\n\n  /**\n   * Add a child to the children list\n   *\n   * @param {*} obj the object to add\n   */\n  addChild(obj) {\n    this.children.push(obj);\n    obj.parent = this;\n  }\n\n  /**\n   * Remove a child from the children list\n   *\n   * TODO do we need special handling for if child deletes itself?\n   * hmm the children should proabbly be a map too\n   * \n   * @param {*} label the label of the object to remove\n   */\n  removeChild(label) {\n    this.children = this.children.filter((c) => c.label != label);\n  }\n\n  /**\n   * Draw an object onto the canvas\n   *\n   * @param {*} gl the webgl2 context from canvas\n   */\n  draw(gl) {\n    this.bindBuffers(gl)\n\n    gl.uniform3f(\n      this.uPosLoc,\n      this.position[0],\n      this.position[1],\n      this.position[2],\n    );\n    gl.uniform3f(\n      this.uRotLoc,\n      this.rotation[0],\n      this.rotation[1],\n      this.rotation[2],\n    );\n    gl.uniform3f(this.uScaleLoc, this.scale[0], this.scale[1], this.scale[2]);\n\n    // if parent exists try to pass over its transformation matrix\n    const parentM = !!this.parent?.M ? this.parent.M : (0,_transformations__WEBPACK_IMPORTED_MODULE_0__.mat4Identity)();\n    gl.uniformMatrix4fv(this.uWorldLoc, false, parentM);\n\n    // draw the object by the index order\n    gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);\n    for (const child of this.children) {\n      child.draw(gl);\n    }\n  }\n\n  // attach this to the callback passed so we can reference the object\n  setUpdateCB(cb) {\n    this.updateCB = cb;\n    this.updateCB = this.updateCB.bind(this);\n  }\n\n  /**\n   * Update the transformation matrix that represents the world for children\n   * components\n   */\n  updateWorldMatrix() {\n    let M = this.parent ? this.parent.M : (0,_transformations__WEBPACK_IMPORTED_MODULE_0__.mat4Identity)();\n\n    // apply transformss one by one to calc world\n    // for the children of this component\n    M = (0,_transformations__WEBPACK_IMPORTED_MODULE_0__.mat4Translate)(M, this.position);\n    M = (0,_transformations__WEBPACK_IMPORTED_MODULE_0__.mat4RotateZ)(M, this.rotation[2]);\n    M = (0,_transformations__WEBPACK_IMPORTED_MODULE_0__.mat4RotateY)(M, this.rotation[1]);\n    M = (0,_transformations__WEBPACK_IMPORTED_MODULE_0__.mat4RotateX)(M, this.rotation[0]);\n    M = (0,_transformations__WEBPACK_IMPORTED_MODULE_0__.mat4Scale)(M, this.scale);\n\n    this.M = M;\n  }\n\n  /**\n   * Update the object based on time change and\n   * the updateCB function if set\n   * @param {*} dt\n   * @param {*} scene\n   */\n  update(dt, scene) {\n    if (!!this.updateCB) {\n      this.updateCB(dt, scene);\n    }\n\n    this.updateWorldMatrix();\n\n    for (const child of this.children) {\n      child.update(dt, scene);\n    }\n  }\n}\n\n\n//# sourceURL=webpack://unm-cs-512-obj/./PotatoEngine/src/objects/SceneObject.js?\n}");

/***/ },

/***/ "./PotatoEngine/src/objects/compositions.js"
/*!**************************************************!*\
  !*** ./PotatoEngine/src/objects/compositions.js ***!
  \**************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   combine: () => (/* binding */ combine),\n/* harmony export */   combineParts: () => (/* binding */ combineParts),\n/* harmony export */   generateBarrel: () => (/* binding */ generateBarrel),\n/* harmony export */   generateBomb: () => (/* binding */ generateBomb),\n/* harmony export */   generateCannon: () => (/* binding */ generateCannon),\n/* harmony export */   generateWheel: () => (/* binding */ generateWheel)\n/* harmony export */ });\n/* harmony import */ var _transformations__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../transformations */ \"./PotatoEngine/src/transformations.js\");\n/* harmony import */ var _helpers__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./helpers */ \"./PotatoEngine/src/objects/helpers.js\");\n/* harmony import */ var _primitives__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./primitives */ \"./PotatoEngine/src/objects/primitives.js\");\n// TODO generate shapes from a composition of primitives\n\n// raft\n// bunch of cylinders horizontally as body\n// rectangular prisms perpendicular to body logs as bindings?\n// one cylinder mast\n// one cylinder or prism crossbar\n// rectangular prism sail\n\n\n\n\n\n/**\n * Combine vert & ind lists together\n */\nfunction combineParts(verts, inds, colors = undefined) {\n  const resultVerts = [];\n  const resultInds = [];\n  const resultColors = [];\n\n  for (let i = 0; i < verts.length; i++) {\n    resultInds.push(...inds[i].map((ind) => ind + resultVerts.length / 4));\n    resultVerts.push(...verts[i]);\n    if (!!colors) {\n      // if the prim already had color array we should use it\n      if (!!colors[i] && Array.isArray(colors[i]) && colors[i].length > 4) {\n        resultColors.push(...colors[i]);\n        continue;\n      }\n      resultColors.push(\n        ...(0,_primitives__WEBPACK_IMPORTED_MODULE_2__.generateFillerColors)(verts[i].length / 4, colors[i]),\n      );\n    }\n  }\n\n  return [resultVerts, resultInds, resultColors];\n}\n\n/**\n * Higher level of combine, take the primitive dicts so can be cleaner\n *\n * if colors or colors[i] is undefined try to use color in prim[i]\n *\n * @param {*} prims list of primitives to combine\n * @param {*} colors colors to use for each primitive\n */\nfunction combine(prims, colors) {\n  const verts = [];\n  const inds = [];\n  const cols = [];\n\n  for (let i = 0; i < prims.length; i++) {\n    verts.push(prims[i].vertices);\n    inds.push(prims[i].indices);\n    cols.push(!colors || !colors[i] ? prims[i].colors : colors[i]);\n  }\n\n  const [v, i, c] = combineParts(verts, inds, cols);\n\n  return {\n    indices: i,\n    vertices: v,\n    colors: c,\n    vertexCount: v.length / 4,\n  };\n}\n\n/**\n * Generate a Parametric (kinda) Barrel\n * one cylinder as main body\n *  - the barrel body should be low to get the\n *    look of individual staves for free\n * 4 cylinders for the binding rings\n *\n * @param {*} segments\n * @param {*} r\n * @param {*} h\n * @param {*} x_c\n * @param {*} y_c\n * @param {*} z_c\n * @param {*} bulge\n * @returns\n */\nfunction generateBarrel(\n  segments,\n  r,\n  h,\n  x_c,\n  y_c,\n  z_c,\n  bulge = 0.4,\n  staves = 10,\n) {\n  let body = (0,_primitives__WEBPACK_IMPORTED_MODULE_2__.generateCylinder)(\n    staves,\n    r,\n    h,\n    x_c,\n    y_c,\n    z_c,\n    bulge,\n    true,\n    segments,\n  );\n  body.colors = (0,_primitives__WEBPACK_IMPORTED_MODULE_2__.generateFillerColors)(\n    body.vertexCount,\n    (0,_helpers__WEBPACK_IMPORTED_MODULE_1__.rgba)(150, 111, 51, 1),\n    true,\n  );\n\n  const bracePositions = [-0.449, -0.2, 0.2, 0.449];\n\n  for (let i = 0; i < bracePositions.length; i++) {\n    const brace_z = z_c + bracePositions[i] * h;\n    const brace_r_angle = Math.PI * (bracePositions[i] + 0.5);\n\n    const brace = (0,_primitives__WEBPACK_IMPORTED_MODULE_2__.generateCylinder)(\n      staves,\n      r + r * (bulge + 0.07) * Math.sin(brace_r_angle),\n      0.1 * h,\n      x_c,\n      y_c,\n      brace_z,\n      0,\n      true,\n      2,\n    );\n\n    body = combine([body, brace], [undefined, (0,_helpers__WEBPACK_IMPORTED_MODULE_1__.rgba)(51, 51, 51, 1)]);\n  }\n\n  return body;\n}\n\n/**\n * Generate a spoked wheel\n * @param {*} segments\n * @param {*} R\n * @param {*} r\n * @param {*} spokeCount\n * @param {*} x_c\n * @param {*} y_c\n * @param {*} z_c\n * @returns\n */\nfunction generateWheel(segments, R, r, spokeCount, x_c, y_c, z_c) {\n  const rim = (0,_primitives__WEBPACK_IMPORTED_MODULE_2__.generateTorus)(segments, R, r, x_c, y_c, z_c);\n\n  let spokes = {\n    vertices: [],\n    indices: [],\n  };\n\n  for (let i = 0; i < spokeCount; i++) {\n    // TODO wtf is goin on here with the transformations\n    // why does setting z_c make the cylinders fly in every direction\n    let spoketmp = (0,_primitives__WEBPACK_IMPORTED_MODULE_2__.generateCylinder)(\n      segments,\n      r / 2,\n      R * 2,\n      -z_c,\n      y_c,\n      0, //z_c\n      0,\n      false,\n      2,\n    );\n\n    // rotate the spoke\n    const id = (0,_transformations__WEBPACK_IMPORTED_MODULE_0__.mat4Identity)();\n    const ry = (0,_transformations__WEBPACK_IMPORTED_MODULE_0__.mat4RotateY)(id, Math.PI / 2);\n    const rx = (0,_transformations__WEBPACK_IMPORTED_MODULE_0__.mat4RotateX)(id, (Math.PI * i) / spokeCount);\n\n    const M = (0,_transformations__WEBPACK_IMPORTED_MODULE_0__.matMul)(ry, rx);\n    spoketmp = (0,_transformations__WEBPACK_IMPORTED_MODULE_0__.transformPrimitive)(spoketmp, M);\n\n    spokes = combine([spokes, spoketmp]);\n  }\n\n  const wheel = combine([rim, spokes]);\n  return wheel;\n}\n\n/**\n * Generate a cannon object\n */\nfunction generateCannon(barrelLength = 3) {\n  // generate all the individual parts\n  const shaft = (0,_primitives__WEBPACK_IMPORTED_MODULE_2__.generateCylinder)(\n    20,\n    1,\n    barrelLength,\n    0,\n    0,\n    -barrelLength / 2,\n    0,\n    true,\n    2,\n  );\n  const end = (0,_primitives__WEBPACK_IMPORTED_MODULE_2__.generateSphere)(20, 1, 0, 0, 0);\n  let fuseHolder = (0,_primitives__WEBPACK_IMPORTED_MODULE_2__.generateCylinder)(16, 0.2, 0.2);\n  let fuse = (0,_primitives__WEBPACK_IMPORTED_MODULE_2__.generateCylinder)(10, 0.1, 0.4);\n  let axel = (0,_primitives__WEBPACK_IMPORTED_MODULE_2__.generateCylinder)(16, 0.15, 2.5);\n  const wheel1 = generateWheel(40, 1.15, 0.15, 4, 0, 0, -1.15);\n  const wheel2 = generateWheel(40, 1.15, 0.15, 4, 0, 0, 1.15);\n\n  let wheels = combine([wheel1, wheel2]);\n\n  // transformations to place the parts\n  const id = (0,_transformations__WEBPACK_IMPORTED_MODULE_0__.mat4Identity)();\n  const wheelRot = (0,_transformations__WEBPACK_IMPORTED_MODULE_0__.mat4RotateY)(id, Math.PI / 2);\n\n  const fuseRot = (0,_transformations__WEBPACK_IMPORTED_MODULE_0__.mat4RotateX)(id, Math.PI / 2);\n  const fuseTrans = (0,_transformations__WEBPACK_IMPORTED_MODULE_0__.mat4Translate)(id, [0, 1, 0]);\n  const fuseM = (0,_transformations__WEBPACK_IMPORTED_MODULE_0__.matMul)(fuseTrans, fuseRot);\n\n  fuse = (0,_transformations__WEBPACK_IMPORTED_MODULE_0__.transformPrimitive)(fuse, fuseM);\n  fuseHolder = (0,_transformations__WEBPACK_IMPORTED_MODULE_0__.transformPrimitive)(fuseHolder, fuseM);\n  wheels = (0,_transformations__WEBPACK_IMPORTED_MODULE_0__.transformPrimitive)(wheels, wheelRot);\n  axel = (0,_transformations__WEBPACK_IMPORTED_MODULE_0__.transformPrimitive)(axel, wheelRot);\n\n  // combine the things all together now\n  const cannon = combine(\n    [shaft, end, axel, fuse, fuseHolder, wheels],\n    [\n      (0,_helpers__WEBPACK_IMPORTED_MODULE_1__.rgba)(34, 34, 34, 1),\n      (0,_helpers__WEBPACK_IMPORTED_MODULE_1__.rgba)(34, 34, 34, 1),\n      (0,_helpers__WEBPACK_IMPORTED_MODULE_1__.rgba)(34, 34, 34, 1),\n      (0,_helpers__WEBPACK_IMPORTED_MODULE_1__.rgba)(150, 111, 51, 1),\n      (0,_helpers__WEBPACK_IMPORTED_MODULE_1__.rgba)(124, 124, 124, 1),\n      (0,_helpers__WEBPACK_IMPORTED_MODULE_1__.rgba)(150, 111, 51, 1),\n    ],\n  );\n\n  return cannon;\n}\n\n/**\n * Generate a simple bomb\n * @returns\n */\nfunction generateBomb(r) {\n  const body = (0,_primitives__WEBPACK_IMPORTED_MODULE_2__.generateSphere)(20, r, 0, 0, 0);\n  let fuseHolder = (0,_primitives__WEBPACK_IMPORTED_MODULE_2__.generateCylinder)(16, r / 5, r / 5);\n  let fuse = (0,_primitives__WEBPACK_IMPORTED_MODULE_2__.generateCylinder)(10, r / 10, r / 2.5);\n\n  // transformations to place the parts\n  const id = (0,_transformations__WEBPACK_IMPORTED_MODULE_0__.mat4Identity)();\n\n  const fuseRot = (0,_transformations__WEBPACK_IMPORTED_MODULE_0__.mat4RotateX)(id, Math.PI / 2);\n  const fuseTrans = (0,_transformations__WEBPACK_IMPORTED_MODULE_0__.mat4Translate)(id, [0, r, 0]);\n  const fuseM = (0,_transformations__WEBPACK_IMPORTED_MODULE_0__.matMul)(fuseTrans, fuseRot);\n\n  fuse = (0,_transformations__WEBPACK_IMPORTED_MODULE_0__.transformPrimitive)(fuse, fuseM);\n  fuseHolder = (0,_transformations__WEBPACK_IMPORTED_MODULE_0__.transformPrimitive)(fuseHolder, fuseM);\n\n  // combine the things all together now\n  const bomb = combine(\n    [body, fuse, fuseHolder],\n    [(0,_helpers__WEBPACK_IMPORTED_MODULE_1__.rgba)(34, 34, 34, 1), (0,_helpers__WEBPACK_IMPORTED_MODULE_1__.rgba)(150, 111, 51, 1), (0,_helpers__WEBPACK_IMPORTED_MODULE_1__.rgba)(124, 124, 124, 1)],\n  );\n\n  return bomb;\n}\n\n\n//# sourceURL=webpack://unm-cs-512-obj/./PotatoEngine/src/objects/compositions.js?\n}");

/***/ },

/***/ "./PotatoEngine/src/objects/helpers.js"
/*!*********************************************!*\
  !*** ./PotatoEngine/src/objects/helpers.js ***!
  \*********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   calculateCenterOfMass: () => (/* binding */ calculateCenterOfMass),\n/* harmony export */   generateBarrelObject: () => (/* binding */ generateBarrelObject),\n/* harmony export */   generateBombObject: () => (/* binding */ generateBombObject),\n/* harmony export */   generateCannonObject: () => (/* binding */ generateCannonObject),\n/* harmony export */   generateConeObject: () => (/* binding */ generateConeObject),\n/* harmony export */   generateCylinderObject: () => (/* binding */ generateCylinderObject),\n/* harmony export */   generateGridObject: () => (/* binding */ generateGridObject),\n/* harmony export */   generateNGonPrismObject: () => (/* binding */ generateNGonPrismObject),\n/* harmony export */   generateSphereObject: () => (/* binding */ generateSphereObject),\n/* harmony export */   hex: () => (/* binding */ hex),\n/* harmony export */   makeSceneObjectGenerator: () => (/* binding */ makeSceneObjectGenerator),\n/* harmony export */   rgba: () => (/* binding */ rgba)\n/* harmony export */ });\n/* harmony import */ var _SceneObject__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./SceneObject */ \"./PotatoEngine/src/objects/SceneObject.js\");\n/* harmony import */ var _compositions__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./compositions */ \"./PotatoEngine/src/objects/compositions.js\");\n/* harmony import */ var _primitives__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./primitives */ \"./PotatoEngine/src/objects/primitives.js\");\n\n\n\n\n\n\n/**\n * Quick helper to translate rbga to webgl rgba\n *\n * ie 0-255 => 0-1\n *\n * @param {Number} r\n * @param {Number} g\n * @param {Number} b\n * @param {Number} a\n * @returns\n */\nconst rgba = (r, g, b, a) => [\n  r / 255,\n  g / 255,\n  b / 255,\n  a == undefined ? 1 : a,\n];\n\nconst hex = (hexcode) => {\n  // TODO\n  return [0,0,0,0]\n}\n\n/**\n * Helper function that turns a primitive\n * generator into a SceneObject generator\n * @param {function} generatePrimitive\n * @returns {SceneObject}\n */\nfunction makeSceneObjectGenerator(generatePrimitive) {\n  return function genericSceneObjectGenerator(objectName, color = undefined) {\n    const { vertices, indices, vertexCount, colors } = generatePrimitive(\n      ...[...arguments].slice(2),\n    );\n    const fillerColors =\n      colors == undefined\n        ? (0,_primitives__WEBPACK_IMPORTED_MODULE_2__.generateFillerColors)(vertexCount, color, true)\n        : colors;\n\n    return new _SceneObject__WEBPACK_IMPORTED_MODULE_0__[\"default\"](\n      objectName,\n      new Float32Array(vertices),\n      new Float32Array(fillerColors),\n      new Uint16Array(indices),\n    );\n  };\n}\n\n\n/**\n * Generate a cannon object\n * \n * TODO cannon is more complicated since it has parts\n *      unless we make the whole things one part\n * @param {*} name the name of the object\n * @param {*} color the color the object should have\n */\nconst generateCannonObject = makeSceneObjectGenerator(_compositions__WEBPACK_IMPORTED_MODULE_1__.generateCannon);\n\n\n/**\n * Generate a bomb object\n * \n * @param {*} name the name of the object\n * @param {*} color the color the object should have\n */\nconst generateBombObject = makeSceneObjectGenerator(_compositions__WEBPACK_IMPORTED_MODULE_1__.generateBomb);\n\n\n/**\n * Generate a Parametric (kinda) Barrel\n * one cylinder as main body\n *  - the barrel body should be low to get the\n *    look of individual staves for free\n * 4 cylinders for the binding rings\n *\n * @param {*} name the name of the object\n * @param {*} color the color the object should have\n * @param {*} segments how many z-axis divisions there are\n * @param {*} r the radius of the base of the barrel\n * @param {*} h the height of the barrel\n * @param {*} x_c x coord of the center of the cylinder\n * @param {*} y_c y coord of the center of the cylinder\n * @param {*} z_c z coord of the center of the cylinder\n * @param {*} bulge the amount of bulge the barrel has\n * @returns\n */\nconst generateBarrelObject = makeSceneObjectGenerator(_compositions__WEBPACK_IMPORTED_MODULE_1__.generateBarrel);\n\n/**\n * Generate a cone\n * @param {*} name the name of the object\n * @param {*} color the color the object should have\n * @param {*} segments how many divisions there are\n * @param {*} r the radius of the base of the cone\n * @param {*} h the height of the cone\n * @param {*} x_c x coord of the center of the cylinder\n * @param {*} y_c y coord of the center of the cylinder\n * @param {*} z_c z coord of the center of the cylinder\n * @param {*} solid if the bottom of the cone should be closed\n * @returns\n */\nconst generateConeObject = makeSceneObjectGenerator(_primitives__WEBPACK_IMPORTED_MODULE_2__.generateCone);\n\n/**\n * Generate a sphere object\n * @param {*} segments how many divisions there are\n * @param {*} r the radius of the sphere\n * @param {*} x_c x coord of the center of the cylinder\n * @param {*} y_c y coord of the center of the cylinder\n * @param {*} z_c z coord of the center of the cylinder\n * @returns\n */\nconst generateSphereObject = makeSceneObjectGenerator(_primitives__WEBPACK_IMPORTED_MODULE_2__.generateSphere);\n\n/**\n * Generate a \"Cylinder\" object\n * @param {*} name the name of the object\n * @param {*} color the color the object should have\n * @param {*} segments how many divisions there are\n * @param {*} r radius of the cylinder\n * @param {*} h height of the cylinder\n * @param {*} x_c x coord of the center of the cylinder\n * @param {*} y_c y coord of the center of the cylinder\n * @param {*} z_c z coord of the center of the cylinder\n * @param {*} bulge amount of \"bulge\" the cylinder should have\n * @param {*} solid if false, do not close the ends of the cylinder\n * @param {*} segments_h, how many divisions there are along the z axis\n * @returns\n */\nconst generateCylinderObject =\n  makeSceneObjectGenerator(_primitives__WEBPACK_IMPORTED_MODULE_2__.generateCylinder);\n\n/**\n * Generate a square grid centered on the origin\n * @param {*} name the name of the object\n * @param {*} color the color the object should have\n * @param {*} segments\n * @param {*} size\n * @param {*} x_c x coord of the center of the cylinder\n * @param {*} y_c y coord of the center of the cylinder\n * @param {*} z_c z coord of the center of the cylinder\n */\nconst generateGridObject = makeSceneObjectGenerator(_primitives__WEBPACK_IMPORTED_MODULE_2__.generateGrid);\n\n/**\n * Generate a n-gon prism\n * @param {*} name the name of the object\n * @param {*} color the color the object should have\n * @param {*} n the amount of sides on the n-gon\n * @param {*} r the radius of the circle the n-gon can be inscribed in\n * @param {*} h the hight of the prism\n * @param {*} x_c x coord of the center of the cylinder\n * @param {*} y_c y coord of the center of the cylinder\n * @param {*} z_c z coord of the center of the cylinder\n * @returns\n */\nconst generateNGonPrismObject =\n  makeSceneObjectGenerator(_primitives__WEBPACK_IMPORTED_MODULE_2__.generateNGonPrism);\n\n/**\n * Calculate the center of mass of an object given its vertices\n * @param {*} vertices \n */\nfunction calculateCenterOfMass(vertices){\n  // TODO\n}\n\n//# sourceURL=webpack://unm-cs-512-obj/./PotatoEngine/src/objects/helpers.js?\n}");

/***/ },

/***/ "./PotatoEngine/src/objects/index.js"
/*!*******************************************!*\
  !*** ./PotatoEngine/src/objects/index.js ***!
  \*******************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   FloatingObject: () => (/* reexport safe */ _FloatingObject_js__WEBPACK_IMPORTED_MODULE_6__[\"default\"]),\n/* harmony export */   PhysicsObject: () => (/* reexport safe */ _PhysicsObject_js__WEBPACK_IMPORTED_MODULE_5__[\"default\"]),\n/* harmony export */   SceneObject: () => (/* reexport safe */ _SceneObject_js__WEBPACK_IMPORTED_MODULE_4__[\"default\"]),\n/* harmony export */   cacheOBJ: () => (/* reexport safe */ _objLoader_js__WEBPACK_IMPORTED_MODULE_3__.cacheOBJ),\n/* harmony export */   calculateCenterOfMass: () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_0__.calculateCenterOfMass),\n/* harmony export */   combine: () => (/* reexport safe */ _compositions_js__WEBPACK_IMPORTED_MODULE_2__.combine),\n/* harmony export */   combineParts: () => (/* reexport safe */ _compositions_js__WEBPACK_IMPORTED_MODULE_2__.combineParts),\n/* harmony export */   generateBarrel: () => (/* reexport safe */ _compositions_js__WEBPACK_IMPORTED_MODULE_2__.generateBarrel),\n/* harmony export */   generateBarrelObject: () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_0__.generateBarrelObject),\n/* harmony export */   generateBomb: () => (/* reexport safe */ _compositions_js__WEBPACK_IMPORTED_MODULE_2__.generateBomb),\n/* harmony export */   generateBombObject: () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_0__.generateBombObject),\n/* harmony export */   generateCannon: () => (/* reexport safe */ _compositions_js__WEBPACK_IMPORTED_MODULE_2__.generateCannon),\n/* harmony export */   generateCannonObject: () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_0__.generateCannonObject),\n/* harmony export */   generateCone: () => (/* reexport safe */ _primitives_js__WEBPACK_IMPORTED_MODULE_1__.generateCone),\n/* harmony export */   generateConeObject: () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_0__.generateConeObject),\n/* harmony export */   generateCube: () => (/* reexport safe */ _primitives_js__WEBPACK_IMPORTED_MODULE_1__.generateCube),\n/* harmony export */   generateCylinder: () => (/* reexport safe */ _primitives_js__WEBPACK_IMPORTED_MODULE_1__.generateCylinder),\n/* harmony export */   generateCylinderObject: () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_0__.generateCylinderObject),\n/* harmony export */   generateFillerColors: () => (/* reexport safe */ _primitives_js__WEBPACK_IMPORTED_MODULE_1__.generateFillerColors),\n/* harmony export */   generateGrid: () => (/* reexport safe */ _primitives_js__WEBPACK_IMPORTED_MODULE_1__.generateGrid),\n/* harmony export */   generateGridObject: () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_0__.generateGridObject),\n/* harmony export */   generateNGonPrism: () => (/* reexport safe */ _primitives_js__WEBPACK_IMPORTED_MODULE_1__.generateNGonPrism),\n/* harmony export */   generateNGonPrismObject: () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_0__.generateNGonPrismObject),\n/* harmony export */   generateOBJObject: () => (/* reexport safe */ _objLoader_js__WEBPACK_IMPORTED_MODULE_3__.generateOBJObject),\n/* harmony export */   generateSphere: () => (/* reexport safe */ _primitives_js__WEBPACK_IMPORTED_MODULE_1__.generateSphere),\n/* harmony export */   generateSphereObject: () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_0__.generateSphereObject),\n/* harmony export */   generateTorus: () => (/* reexport safe */ _primitives_js__WEBPACK_IMPORTED_MODULE_1__.generateTorus),\n/* harmony export */   generateWheel: () => (/* reexport safe */ _compositions_js__WEBPACK_IMPORTED_MODULE_2__.generateWheel),\n/* harmony export */   hex: () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_0__.hex),\n/* harmony export */   loadOBJ: () => (/* reexport safe */ _objLoader_js__WEBPACK_IMPORTED_MODULE_3__.loadOBJ),\n/* harmony export */   makeSceneObjectGenerator: () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_0__.makeSceneObjectGenerator),\n/* harmony export */   rgba: () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_0__.rgba)\n/* harmony export */ });\n/* harmony import */ var _helpers_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./helpers.js */ \"./PotatoEngine/src/objects/helpers.js\");\n/* harmony import */ var _primitives_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./primitives.js */ \"./PotatoEngine/src/objects/primitives.js\");\n/* harmony import */ var _compositions_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./compositions.js */ \"./PotatoEngine/src/objects/compositions.js\");\n/* harmony import */ var _objLoader_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./objLoader.js */ \"./PotatoEngine/src/objects/objLoader.js\");\n/* harmony import */ var _SceneObject_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./SceneObject.js */ \"./PotatoEngine/src/objects/SceneObject.js\");\n/* harmony import */ var _PhysicsObject_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./PhysicsObject.js */ \"./PotatoEngine/src/objects/PhysicsObject.js\");\n/* harmony import */ var _FloatingObject_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./FloatingObject.js */ \"./PotatoEngine/src/objects/FloatingObject.js\");\n\n\n\n\n\n\n\n\n\n//# sourceURL=webpack://unm-cs-512-obj/./PotatoEngine/src/objects/index.js?\n}");

/***/ },

/***/ "./PotatoEngine/src/objects/objLoader.js"
/*!***********************************************!*\
  !*** ./PotatoEngine/src/objects/objLoader.js ***!
  \***********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   cacheOBJ: () => (/* binding */ cacheOBJ),\n/* harmony export */   generateOBJObject: () => (/* binding */ generateOBJObject),\n/* harmony export */   loadOBJ: () => (/* binding */ loadOBJ)\n/* harmony export */ });\n/* harmony import */ var _helpers__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./helpers */ \"./PotatoEngine/src/objects/helpers.js\");\n// todo load obj file? should be fairly doable\n// https://en.wikipedia.org/wiki/Wavefront_.obj_file\n\n\n\n// TODO probably do something more reasonable than this\nconst LOADED_OBJECTS = {};\n\nconst toNum = (x) => parseFloat(x);\n\nasync function cacheOBJ(url, id) {\n  const response = await fetch(url);\n  const text = await response.text();\n\n  const vertices = [];\n  const normals = [];\n  const indices = [];\n\n  const lines = text.split(\"\\n\");\n  for (let i = 0; i < lines.length; i++) {\n    const line = lines[i];\n\n    // split on whitespace\n    const data = line.trim().split(/\\s+/);\n    const type = data[0];\n\n    switch (type) {\n      case \"v\":\n        vertices.push(...data.slice(1, 4).map(toNum), 0);\n        break;\n\n      case \"vn\":\n        normals.push(...data.slice(1, 4).map(toNum));\n        break;\n\n      case \"f\":\n        // assume faces are already triangulated\n        const faceVerts = data.slice(1);\n        for (let j = 0; j < faceVerts.length; j++) {\n          const [positionIdx, _, normalIdx] = faceVerts[j].split(\"/\").map(toNum);\n          indices.push(positionIdx - 1);\n        }\n        break;\n    }\n  }\n\n\n  // slap into loaded objects so we dont need to reload them ever\n  // would make sense to have the scene handle these tbh\n  LOADED_OBJECTS[id] = {\n    vertices: vertices,\n    indices: indices,\n    vertexCount: vertices.length / 3,\n    indexCount: indices.length,\n  };\n}\n\nfunction loadOBJ(id) {\n  return LOADED_OBJECTS[id];\n}\n\n/**\n * Load a cached obj file into a scene object\n * @param {*} name\n * @param {*} color\n * @param {*} id id of the cached object file\n */\nconst generateOBJObject = (0,_helpers__WEBPACK_IMPORTED_MODULE_0__.makeSceneObjectGenerator)(loadOBJ);\n\n\n//# sourceURL=webpack://unm-cs-512-obj/./PotatoEngine/src/objects/objLoader.js?\n}");

/***/ },

/***/ "./PotatoEngine/src/objects/primitives.js"
/*!************************************************!*\
  !*** ./PotatoEngine/src/objects/primitives.js ***!
  \************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   generateCone: () => (/* binding */ generateCone),\n/* harmony export */   generateCube: () => (/* binding */ generateCube),\n/* harmony export */   generateCylinder: () => (/* binding */ generateCylinder),\n/* harmony export */   generateFillerColors: () => (/* binding */ generateFillerColors),\n/* harmony export */   generateGrid: () => (/* binding */ generateGrid),\n/* harmony export */   generateNGonPrism: () => (/* binding */ generateNGonPrism),\n/* harmony export */   generateSphere: () => (/* binding */ generateSphere),\n/* harmony export */   generateTorus: () => (/* binding */ generateTorus)\n/* harmony export */ });\nfunction generateCube() {\n  // cube\n  const positions = [\n    -1,\n    -1,\n    -1, // 0\n    1,\n    -1,\n    -1, // 1\n    1,\n    1,\n    -1, // 2\n    -1,\n    1,\n    -1, // 3\n    -1,\n    -1,\n    1, // 4\n    1,\n    -1,\n    1, // 5\n    1,\n    1,\n    1, // 6\n    -1,\n    1,\n    1, // 7\n  ];\n\n  const colors = [\n    1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1,\n  ];\n\n  // faces\n  const indices = [\n    // Front\n    4, 5, 6, 4, 6, 7,\n    // Back\n    1, 0, 3, 1, 3, 2,\n    // Top\n    3, 7, 6, 3, 6, 2,\n    // Bottom\n    0, 1, 5, 0, 5, 4,\n    // Right\n    1, 2, 6, 1, 6, 5,\n    // Left\n    0, 4, 7, 0, 7, 3,\n  ];\n\n  return { vertices: positions, colors, indices };\n}\n\n/**\n * Generate a sphere\n * @param {*} segments how many divisions there are\n * @param {*} r the radius of the sphere\n * @param {*} x_c x coord of the center of the cylinder\n * @param {*} y_c y coord of the center of the cylinder\n * @param {*} z_c z coord of the center of the cylinder\n * @returns\n */\nfunction generateSphere(segments, r, x_c = 0, y_c = 0, z_c = 0) {\n  const vertices = [];\n  const indices = [];\n\n  for (let v = 0; v <= segments; v++) {\n    const vRad = (Math.PI * v) / segments;\n\n    const vertZ = z_c + r * Math.cos(vRad);\n    for (let u = 0; u <= segments; u++) {\n      const uRad = (2 * Math.PI * u) / segments;\n\n      const vertX = x_c + r * Math.sin(vRad) * Math.sin(uRad);\n      const vertY = y_c + r * Math.sin(vRad) * Math.cos(uRad);\n\n      vertices.push(vertX, vertY, vertZ, 1);\n    }\n  }\n\n  for (let v = 0; v < segments; v++) {\n    for (let u = 0; u < segments; u++) {\n      const i_0 = v * (segments + 1) + u;\n      const i_1 = i_0 + 1;\n      const i_2 = i_0 + segments + 1;\n      const i_3 = i_2 + 1;\n\n      // push the two triangle faces\n      indices.push(i_0, i_2, i_1, i_1, i_2, i_3);\n    }\n  }\n\n  // package it for the buffers\n  return {\n    vertices: vertices,\n    indices: indices,\n    vertexCount: vertices.length / 4,\n    indexCount: indices.length,\n  };\n}\n\n/**\n * Generate a cone\n * @param {*} segments how many divisions there are\n * @param {*} r the radius of the base of the cone\n * @param {*} h the hright of the cone\n * @param {*} x_c x coord of the center of the cylinder\n * @param {*} y_c y coord of the center of the cylinder\n * @param {*} z_c z coord of the center of the cylinder\n * @param {*} solid if the bottom of the cone should be closed\n * @returns\n */\nfunction generateCone(segments, r, h, x_c, y_c, z_c, solid = true) {\n  const vertices = [];\n  const indices = [];\n\n  for (let v = 0; v <= segments; v++) {\n    const vFrac = v / segments;\n\n    const vertZ = z_c + vFrac * h;\n    for (let u = 0; u <= segments; u++) {\n      const uRad = (2 * Math.PI * u) / segments;\n\n      const vertX = x_c + r * (1 - vFrac) * Math.cos(uRad);\n      const vertY = y_c + r * (1 - vFrac) * Math.sin(uRad);\n\n      vertices.push(vertX, vertY, vertZ, 1);\n    }\n  }\n\n  for (let v = 0; v < segments; v++) {\n    for (let u = 0; u < segments; u++) {\n      const i_0 = v * (segments + 1) + u;\n      const i_1 = i_0 + 1;\n      const i_2 = i_0 + segments + 1;\n      const i_3 = i_2 + 1;\n\n      // push the two triangle faces\n      indices.push(i_0, i_2, i_1, i_1, i_2, i_3);\n    }\n  }\n\n  if (solid) {\n    const bottomCenterIndex = vertices.length / 4;\n\n    vertices.push(x_c, y_c, z_c, 1);\n\n    for (let u = 0; u < segments; u++) {\n      const current = u;\n      const next = u + 1;\n\n      indices.push(bottomCenterIndex, next, current);\n    }\n  }\n\n  // package it for the buffers\n  return {\n    vertices: vertices,\n    indices: indices,\n    vertexCount: vertices.length / 4,\n    indexCount: indices.length,\n  };\n}\n\n/**\n * Generate a n-gon prism\n * @param {*} n the amount of sides on the n-gon\n * @param {*} r the radius of the circle the n-gon can be inscribed in\n * @param {*} h the hight of the prism\n * @param {*} x_c x coord of the center of the cylinder\n * @param {*} y_c y coord of the center of the cylinder\n * @param {*} z_c z coord of the center of the cylinder\n * @returns\n */\nfunction generateNGonPrism(n, r, h, x_c, y_c, z_c) {\n  return generateCylinder(n, r, h, x_c, y_c, z_c, 0, true, 2);\n}\n\n/**\n * Generate a \"Cylinder\"\n *\n * @param {*} segments how many divisions there are\n * @param {*} r radius of the cylinder\n * @param {*} h height of the cylinder\n * @param {*} x_c x coord of the center of the cylinder\n * @param {*} y_c y coord of the center of the cylinder\n * @param {*} z_c z coord of the center of the cylinder\n * @param {*} bulge amount of \"bulge\" the cylinder should have\n * @param {*} solid if false, do not close the ends of the cylinder\n * @param {*} segments_h default 2 how many divisions there are along the z axis\n * @returns\n */\nfunction generateCylinder(\n  segments,\n  r,\n  h,\n  x_c = 0,\n  y_c = 0,\n  z_c = 0,\n  bulge = 0,\n  solid = true,\n  segments_h = 2,\n) {\n  const vertices = [];\n  const indices = [];\n\n  segments_h = segments_h == undefined ? segments : segments_h;\n\n  for (let v = 0; v <= segments_h; v++) {\n    const vFrac = v / segments_h;\n\n    const vertZ = z_c - h / 2 + vFrac * h;\n    for (let u = 0; u <= segments; u++) {\n      const uRad = (2 * Math.PI * u) / segments;\n\n      const bulgeAmt = 1 + bulge * Math.sin(vFrac * Math.PI);\n\n      const vertX = x_c + r * bulgeAmt * Math.cos(uRad);\n      const vertY = y_c + r * bulgeAmt * Math.sin(uRad);\n\n      vertices.push(vertX, vertY, vertZ, 1);\n    }\n  }\n\n  for (let v = 0; v < segments_h; v++) {\n    for (let u = 0; u < segments; u++) {\n      const i_0 = v * (segments + 1) + u;\n      const i_1 = i_0 + 1;\n      const i_2 = i_0 + segments + 1;\n      const i_3 = i_2 + 1;\n\n      // push the two triangle faces\n      indices.push(i_0, i_2, i_1, i_1, i_2, i_3);\n    }\n  }\n\n  if (solid) {\n    const bottomCenterIndex = vertices.length / 4;\n\n    vertices.push(x_c, y_c, z_c - h / 2, 1);\n\n    for (let u = 0; u < segments; u++) {\n      const current = u;\n      const next = u + 1;\n\n      indices.push(bottomCenterIndex, next, current);\n    }\n\n    const topCenterIndex = vertices.length / 4;\n    vertices.push(x_c, y_c, z_c + h / 2, 1);\n\n    const topStart = segments_h * (segments + 1);\n\n    for (let u = 0; u < segments; u++) {\n      const current = topStart + u;\n      const next = current + 1;\n\n      indices.push(topCenterIndex, current, next);\n    }\n  }\n\n  // package it for the buffers\n  return {\n    vertices: vertices,\n    indices: indices,\n    vertexCount: vertices.length / 4,\n    indexCount: indices.length,\n  };\n}\n\n/**\n * Generate a torus\n * \n * \n * Torus/Donut\n  x = (R + r cos v)cos u\n  y = (R + r cos v)sin u\n  z = r sin v\n * @param {*} segments how many divisions there are\n * @param {*} r the radius of the sphere\n * @param {*} x_c x coord of the center of the torus\n * @param {*} y_c y coord of the center of the torus\n * @param {*} z_c z coord of the center of the torus\n * @returns\n */\nfunction generateTorus(segments, R, r, x_c, y_c, z_c) {\n  const vertices = [];\n  const indices = [];\n\n  for (let v = 0; v <= segments; v++) {\n    const vRad = (2 * Math.PI * v) / segments;\n\n    const vertZ = z_c + r * Math.sin(vRad);\n    for (let u = 0; u <= segments; u++) {\n      const uRad = (2 * Math.PI * u) / segments;\n\n      const vertX = x_c + (R + r * Math.cos(vRad)) * Math.cos(uRad);\n      const vertY = y_c + (R + r * Math.cos(vRad)) * Math.sin(uRad);\n\n      vertices.push(vertX, vertY, vertZ, 1);\n    }\n  }\n\n  for (let v = 0; v < segments; v++) {\n    for (let u = 0; u < segments; u++) {\n      const i_0 = v * (segments + 1) + u;\n      const i_1 = i_0 + 1;\n      const i_2 = i_0 + segments + 1;\n      const i_3 = i_2 + 1;\n\n      // push the two triangle faces\n      indices.push(i_0, i_2, i_1, i_1, i_2, i_3);\n    }\n  }\n\n  // package it for the buffers\n  return {\n    vertices: vertices,\n    indices: indices,\n    vertexCount: vertices.length / 4,\n    indexCount: indices.length,\n  };\n}\n\n/**\n * Generate a square grid centered on the origin\n * @param {*} segments\n * @param {*} size\n * @param {*} x_c x coord of the center of the cylinder\n * @param {*} y_c y coord of the center of the cylinder\n * @param {*} z_c z coord of the center of the cylinder\n */\nfunction generateGrid(segments, size, x_c = 0, y_c = 0, z_c = 0) {\n  const vertices = [];\n  const indices = [];\n\n  // iterate over depth\n  for (let z = 0; z <= segments; z++) {\n    const vertZ = (z / segments - 0.5) * size + z_c;\n    // iterate side to side\n    for (let x = 0; x <= segments; x++) {\n      const vertX = (x / segments - 0.5) * size + x_c;\n      vertices.push(vertX, y_c, vertZ, 1);\n    }\n  }\n\n  // create face indices\n  for (let z = 0; z < segments; z++) {\n    for (let x = 0; x < segments; x++) {\n      const i_0 = z * (segments + 1) + x;\n      // shift relative to first point to select the other nearby points\n      const i_1 = i_0 + 1;\n      // shift all the way to the next row of points\n      const i_2 = i_0 + segments + 1;\n      const i_3 = i_2 + 1;\n\n      // push the two triangle faces\n      indices.push(i_0, i_2, i_1, i_1, i_2, i_3);\n    }\n  }\n\n  // package it for the buffers\n  return {\n    vertices: new Float32Array(vertices),\n    indices: new Uint16Array(indices),\n    vertexCount: vertices.length / 4,\n    indexCount: indices.length,\n  };\n}\n\n/**\n * Generate a filler color array for an object\n * @param {*} vertCount\n * @param {*} color\n * @param {*} alpha\n * @returns number array of colors\n */\nfunction generateFillerColors(\n  vertCount,\n  color = undefined,\n  alpha = true,\n) {\n  const colors = [];\n\n  for (let i = 0; i < vertCount; i++) {\n    if (color != undefined) {\n      colors.push(...color);\n      continue;\n    }\n\n    // if no color defined just make a random one.\n    colors.push(Math.random(), Math.random(), Math.random());\n    if (alpha) {\n      colors.push(1);\n    }\n  }\n\n  return colors;\n}\n\n\n//# sourceURL=webpack://unm-cs-512-obj/./PotatoEngine/src/objects/primitives.js?\n}");

/***/ },

/***/ "./PotatoEngine/src/transformations.js"
/*!*********************************************!*\
  !*** ./PotatoEngine/src/transformations.js ***!
  \*********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   box2Cube: () => (/* binding */ box2Cube),\n/* harmony export */   flipZ: () => (/* binding */ flipZ),\n/* harmony export */   frustum: () => (/* binding */ frustum),\n/* harmony export */   frustum2Box: () => (/* binding */ frustum2Box),\n/* harmony export */   mat4Identity: () => (/* binding */ mat4Identity),\n/* harmony export */   mat4RotateX: () => (/* binding */ mat4RotateX),\n/* harmony export */   mat4RotateY: () => (/* binding */ mat4RotateY),\n/* harmony export */   mat4RotateZ: () => (/* binding */ mat4RotateZ),\n/* harmony export */   mat4Scale: () => (/* binding */ mat4Scale),\n/* harmony export */   mat4Translate: () => (/* binding */ mat4Translate),\n/* harmony export */   matMul: () => (/* binding */ matMul),\n/* harmony export */   multiplyMat4: () => (/* binding */ multiplyMat4),\n/* harmony export */   ortho: () => (/* binding */ ortho),\n/* harmony export */   perspective: () => (/* binding */ perspective),\n/* harmony export */   transformPrimitive: () => (/* binding */ transformPrimitive),\n/* harmony export */   transformVertices: () => (/* binding */ transformVertices)\n/* harmony export */ });\n// The perspective matrix is built as a product of three factors:\r\n//\r\n//     M_per = M_orth * P * F\r\n//\r\n//   M_orth: Normalization from box to cube [l,r][b,t][n,f] -> [-1,1]^3\r\n//   P: Perspective warping, from frustum to box\r\n//   F: z-axis flip.\r\n\r\n// Warpping the frustum into the box [l,r][b,t][n,f]\r\n//   [ n  0   0    0  ]\r\n//   [ 0  n   0    0  ]\r\n//   [ 0  0  f+n  -fn ]\r\n//   [ 0  0   1    0  ]\r\nfunction frustum2Box(near, far) {\r\n  return new Float32Array([\r\n    near,\r\n    0,\r\n    0,\r\n    0,\r\n    0,\r\n    near,\r\n    0,\r\n    0,\r\n    0,\r\n    0,\r\n    far + near,\r\n    1,\r\n    0,\r\n    0,\r\n    -far * near,\r\n    0,\r\n  ]);\r\n}\r\n\r\n// mapping box [l,r][b,t][n,f] onto the normalized cube [-1,1]^3.\r\n//   [ 2/(r-l)    0        0      -(r+l)/(r-l) ]\r\n//   [    0    2/(t-b)     0      -(t+b)/(t-b) ]\r\n//   [    0       0     2/(f-n)   -(f+n)/(f-n) ]\r\n//   [    0       0        0            1      ]\r\nfunction box2Cube(left, right, bottom, top, near, far) {\r\n  const rl = 1 / (right - left),\r\n    tb = 1 / (top - bottom),\r\n    fn = 1 / (far - near);\r\n  return new Float32Array([\r\n    2 * rl,\r\n    0,\r\n    0,\r\n    0,\r\n    0,\r\n    2 * tb,\r\n    0,\r\n    0,\r\n    0,\r\n    0,\r\n    2 * fn,\r\n    0,\r\n    -(right + left) * rl,\r\n    -(top + bottom) * tb,\r\n    -(far + near) * fn,\r\n    1,\r\n  ]);\r\n}\r\n\r\n//Camera Looks down -z, near/far passed as positive distances into the\r\n//+z-forward convention P and M_orth are written in\r\nfunction flipZ() {\r\n  return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1]);\r\n}\r\n\r\n// Matrix multiplication\r\nfunction multiplyMat4(a, b) {\r\n  let r = new Float32Array(16);\r\n  for (let i = 0; i < 4; i++)\r\n    for (let j = 0; j < 4; j++) {\r\n      let sum = 0;\r\n      for (let k = 0; k < 4; k++) {\r\n        sum += a[k * 4 + i] * b[j * 4 + k];\r\n      }\r\n      r[j * 4 + i] = sum;\r\n    }\r\n  return r;\r\n}\r\n\r\n// Multiply matrices left to right, e.g. matMul(A, B, C) is A * B * C.\r\n// JavaScript has no operator overloading, GLSL does overload `*` for mat4\r\nfunction matMul(...matrices) {\r\n  return matrices.reduce(multiplyMat4);\r\n}\r\n\r\n// General perspective frustum\r\nfunction frustum(left, right, bottom, top, near, far) {\r\n  const M_orth = box2Cube(left, right, bottom, top, near, far);\r\n  const P = frustum2Box(near, far);\r\n  const F = flipZ();\r\n  return matMul(M_orth, P, F); // M_per = M_orth * Perspective Warping * FlipZ\r\n}\r\n\r\n// Symmetric frustum from vertical field of view. fov in radians.\r\nfunction perspective(fov, aspect, near, far) {\r\n  const top = near * Math.tan(fov / 2);\r\n  const right = top * aspect;\r\n  return frustum(-right, right, -top, top, near, far);\r\n}\r\n\r\n// Orthographic matrix\r\nfunction ortho(left, right, bottom, top, near, far) {\r\n  const lr = 1 / (left - right),\r\n    bt = 1 / (bottom - top),\r\n    nf = 1 / (near - far);\r\n  return new Float32Array([\r\n    -2 * lr,\r\n    0,\r\n    0,\r\n    0,\r\n    0,\r\n    -2 * bt,\r\n    0,\r\n    0,\r\n    0,\r\n    0,\r\n    2 * nf,\r\n    0,\r\n    (left + right) * lr,\r\n    (top + bottom) * bt,\r\n    (far + near) * nf,\r\n    1,\r\n  ]);\r\n}\r\n\r\n// Identity matrix\r\nfunction mat4Identity() {\r\n  return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);\r\n}\r\n\r\n// Matrix translation\r\nfunction mat4Translate(matrix, translation) {\r\n  const result = new Float32Array(matrix);\r\n  result[12] =\r\n    matrix[0] * translation[0] +\r\n    matrix[4] * translation[1] +\r\n    matrix[8] * translation[2] +\r\n    matrix[12];\r\n  result[13] =\r\n    matrix[1] * translation[0] +\r\n    matrix[5] * translation[1] +\r\n    matrix[9] * translation[2] +\r\n    matrix[13];\r\n  result[14] =\r\n    matrix[2] * translation[0] +\r\n    matrix[6] * translation[1] +\r\n    matrix[10] * translation[2] +\r\n    matrix[14];\r\n  result[15] =\r\n    matrix[3] * translation[0] +\r\n    matrix[7] * translation[1] +\r\n    matrix[11] * translation[2] +\r\n    matrix[15];\r\n  return result;\r\n}\r\n\r\n// Matrix rotation around X axis\r\nfunction mat4RotateX(matrix, angle) {\r\n  const c = Math.cos(angle);\r\n  const s = Math.sin(angle);\r\n  const result = new Float32Array(matrix);\r\n\r\n  const mv1 = matrix[4],\r\n    mv5 = matrix[5],\r\n    mv9 = matrix[6],\r\n    mv13 = matrix[7];\r\n  const mv2 = matrix[8],\r\n    mv6 = matrix[9],\r\n    mv10 = matrix[10],\r\n    mv14 = matrix[11];\r\n\r\n  result[4] = mv1 * c + mv2 * s;\r\n  result[5] = mv5 * c + mv6 * s;\r\n  result[6] = mv9 * c + mv10 * s;\r\n  result[7] = mv13 * c + mv14 * s;\r\n  result[8] = mv2 * c - mv1 * s;\r\n  result[9] = mv6 * c - mv5 * s;\r\n  result[10] = mv10 * c - mv9 * s;\r\n  result[11] = mv14 * c - mv13 * s;\r\n\r\n  return result;\r\n}\r\n\r\n// Matrix rotation around Y axis\r\nfunction mat4RotateY(matrix, angle) {\r\n  const c = Math.cos(angle);\r\n  const s = Math.sin(angle);\r\n  const result = new Float32Array(matrix);\r\n\r\n  const mv0 = matrix[0],\r\n    mv4 = matrix[1],\r\n    mv8 = matrix[2],\r\n    mv12 = matrix[3];\r\n  const mv2 = matrix[8],\r\n    mv6 = matrix[9],\r\n    mv10 = matrix[10],\r\n    mv14 = matrix[11];\r\n\r\n  result[0] = mv0 * c - mv2 * s;\r\n  result[1] = mv4 * c - mv6 * s;\r\n  result[2] = mv8 * c - mv10 * s;\r\n  result[3] = mv12 * c - mv14 * s;\r\n  result[8] = mv0 * s + mv2 * c;\r\n  result[9] = mv4 * s + mv6 * c;\r\n  result[10] = mv8 * s + mv10 * c;\r\n  result[11] = mv12 * s + mv14 * c;\r\n\r\n  return result;\r\n}\r\n\r\n// Matrix rotation around Z axis\r\n// did I mess this up? doesnt seem quite right\r\nfunction mat4RotateZ(matrix, angle) {\r\n  const c = Math.cos(angle);\r\n  const s = Math.sin(angle);\r\n  const result = new Float32Array(matrix);\r\n\r\n  const mv0 = matrix[0],\r\n    mv1 = matrix[1],\r\n    mv2 = matrix[2],\r\n    mv3 = matrix[3];\r\n\r\n  const mv4 = matrix[4],\r\n    mv5 = matrix[5],\r\n    mv6 = matrix[6],\r\n    mv7 = matrix[7];\r\n\r\n  result[0] = mv0 * c + mv4 * s;\r\n  result[1] = mv1 * c + mv5 * s;\r\n  result[2] = mv2 * c + mv6 * s;\r\n  result[3] = mv3 * c + mv7 * s;\r\n\r\n  result[4] = mv4 * c - mv0 * s;\r\n  result[5] = mv5 * c - mv1 * s;\r\n  result[6] = mv6 * c - mv2 * s;\r\n  result[7] = mv7 * c - mv3 * s;\r\n\r\n  return result;\r\n}\r\n\r\n/**\r\n * Matrix scaling\r\n * @param {*} matrix\r\n * @param {*} scale\r\n * @returns\r\n */\r\nfunction mat4Scale(matrix, scale) {\r\n  const [sx, sy, sz] = scale;\r\n\r\n  const result = new Float32Array(matrix);\r\n\r\n  for (let i = 0; i < 4; i++) {\r\n    result[i] *= sx;\r\n    result[4 + i] *= sy;\r\n    result[8 + i] *= sz;\r\n  }\r\n\r\n  return result;\r\n}\r\n\r\n/**\r\n * Apply a transformation matrix to a array of vertices\r\n *\r\n * @param {Array(Number)} vertices\r\n * @param {Float32Array} matrix\r\n * @returns\r\n */\r\nfunction transformVertices(vertices, matrix) {\r\n  const transformed = Array(vertices.length);\r\n\r\n  for (let i = 0; i < vertices.length; i += 4) {\r\n    const x = vertices[i];\r\n    const y = vertices[i + 1];\r\n    const z = vertices[i + 2];\r\n    const w = vertices[i + 3];\r\n\r\n    transformed[i] =\r\n      matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12] * w;\r\n\r\n    transformed[i + 1] =\r\n      matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13] * w;\r\n\r\n    transformed[i + 2] =\r\n      matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14] * w;\r\n\r\n    transformed[i + 3] =\r\n      matrix[3] * x + matrix[7] * y + matrix[11] * z + matrix[15] * w;\r\n  }\r\n\r\n  return transformed;\r\n}\r\n\r\nfunction transformPrimitive(prim, matrix) {\r\n  const vertsTransformed = transformVertices(prim.vertices, matrix);\r\n  prim.vertices = vertsTransformed;\r\n  return prim;\r\n}\r\n\r\n// [optional] Helper function converting math format row-major matrices into a flat column-major array.\r\n// export function mat4FromRows(m00, m01, m02, m03,\r\n//                       m10, m11, m12, m13,\r\n//                       m20, m21, m22, m23,\r\n//                       m30, m31, m32, m33) {\r\n//     return new Float32Array([\r\n//         m00, m10, m20, m30,   // column 0\r\n//         m01, m11, m21, m31,   // column 1\r\n//         m02, m12, m22, m32,   // column 2\r\n//         m03, m13, m23, m33    // column 3\r\n//     ]);\r\n// }\r\n\n\n//# sourceURL=webpack://unm-cs-512-obj/./PotatoEngine/src/transformations.js?\n}");

/***/ },

/***/ "./PotatoEngine/src/vec4.js"
/*!**********************************!*\
  !*** ./PotatoEngine/src/vec4.js ***!
  \**********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   scaleVec4: () => (/* binding */ scaleVec4),\n/* harmony export */   sumVec: () => (/* binding */ sumVec),\n/* harmony export */   sumVec4: () => (/* binding */ sumVec4),\n/* harmony export */   vec4distance: () => (/* binding */ vec4distance)\n/* harmony export */ });\n/**\n * Scale a vector a by constant c\n * @param {*} a\n * @param {*} c\n * @returns\n */\nfunction scaleVec4(a, c) {\n  return [a[0] * c, a[1] * c, a[2] * c, a[3] * c];\n}\n\n/**\n * Add two vectors a and b together\n * @param {*} a\n * @param {*} b\n * @returns\n */\nfunction sumVec4(a, b) {\n  return [a[0] + b[0], a[1] + b[1], a[2] + b[2], a[3] + b[3]];\n}\n\n/**\n * Sum a list of vectors together\n * @param  {...any} vecs\n * @returns\n */\nfunction sumVec(...vecs) {\n  return vecs.reduce(sumVec4);\n}\n\n/**\n * Calculate the distance between two vec4s\n * @param {*} a\n * @param {*} b\n */\nfunction vec4distance(a, b) {\n  return Math.sqrt(\n    Math.pow(b[0] - a[0], 2) +\n      Math.pow(b[1] - a[1], 2) +\n      Math.pow(b[2] - a[2], 2),\n  );\n}\n\n\n//# sourceURL=webpack://unm-cs-512-obj/./PotatoEngine/src/vec4.js?\n}");

/***/ },

/***/ "./node_modules/ansi-html-community/index.js"
/*!***************************************************!*\
  !*** ./node_modules/ansi-html-community/index.js ***!
  \***************************************************/
(module) {

"use strict";
eval("{\n\nmodule.exports = ansiHTML\n\n// Reference to https://github.com/sindresorhus/ansi-regex\nvar _regANSI = /(?:(?:\\u001b\\[)|\\u009b)(?:(?:[0-9]{1,3})?(?:(?:;[0-9]{0,3})*)?[A-M|f-m])|\\u001b[A-M]/\n\nvar _defColors = {\n  reset: ['fff', '000'], // [FOREGROUD_COLOR, BACKGROUND_COLOR]\n  black: '000',\n  red: 'ff0000',\n  green: '209805',\n  yellow: 'e8bf03',\n  blue: '0000ff',\n  magenta: 'ff00ff',\n  cyan: '00ffee',\n  lightgrey: 'f0f0f0',\n  darkgrey: '888'\n}\nvar _styles = {\n  30: 'black',\n  31: 'red',\n  32: 'green',\n  33: 'yellow',\n  34: 'blue',\n  35: 'magenta',\n  36: 'cyan',\n  37: 'lightgrey'\n}\nvar _openTags = {\n  '1': 'font-weight:bold', // bold\n  '2': 'opacity:0.5', // dim\n  '3': '<i>', // italic\n  '4': '<u>', // underscore\n  '8': 'display:none', // hidden\n  '9': '<del>' // delete\n}\nvar _closeTags = {\n  '23': '</i>', // reset italic\n  '24': '</u>', // reset underscore\n  '29': '</del>' // reset delete\n}\n\n;[0, 21, 22, 27, 28, 39, 49].forEach(function (n) {\n  _closeTags[n] = '</span>'\n})\n\n/**\n * Converts text with ANSI color codes to HTML markup.\n * @param {String} text\n * @returns {*}\n */\nfunction ansiHTML (text) {\n  // Returns the text if the string has no ANSI escape code.\n  if (!_regANSI.test(text)) {\n    return text\n  }\n\n  // Cache opened sequence.\n  var ansiCodes = []\n  // Replace with markup.\n  var ret = text.replace(/\\033\\[(\\d+)m/g, function (match, seq) {\n    var ot = _openTags[seq]\n    if (ot) {\n      // If current sequence has been opened, close it.\n      if (!!~ansiCodes.indexOf(seq)) { // eslint-disable-line no-extra-boolean-cast\n        ansiCodes.pop()\n        return '</span>'\n      }\n      // Open tag.\n      ansiCodes.push(seq)\n      return ot[0] === '<' ? ot : '<span style=\"' + ot + ';\">'\n    }\n\n    var ct = _closeTags[seq]\n    if (ct) {\n      // Pop sequence\n      ansiCodes.pop()\n      return ct\n    }\n    return ''\n  })\n\n  // Make sure tags are closed.\n  var l = ansiCodes.length\n  ;(l > 0) && (ret += Array(l + 1).join('</span>'))\n\n  return ret\n}\n\n/**\n * Customize colors.\n * @param {Object} colors reference to _defColors\n */\nansiHTML.setColors = function (colors) {\n  if (typeof colors !== 'object') {\n    throw new Error('`colors` parameter must be an Object.')\n  }\n\n  var _finalColors = {}\n  for (var key in _defColors) {\n    var hex = colors.hasOwnProperty(key) ? colors[key] : null\n    if (!hex) {\n      _finalColors[key] = _defColors[key]\n      continue\n    }\n    if ('reset' === key) {\n      if (typeof hex === 'string') {\n        hex = [hex]\n      }\n      if (!Array.isArray(hex) || hex.length === 0 || hex.some(function (h) {\n        return typeof h !== 'string'\n      })) {\n        throw new Error('The value of `' + key + '` property must be an Array and each item could only be a hex string, e.g.: FF0000')\n      }\n      var defHexColor = _defColors[key]\n      if (!hex[0]) {\n        hex[0] = defHexColor[0]\n      }\n      if (hex.length === 1 || !hex[1]) {\n        hex = [hex[0]]\n        hex.push(defHexColor[1])\n      }\n\n      hex = hex.slice(0, 2)\n    } else if (typeof hex !== 'string') {\n      throw new Error('The value of `' + key + '` property must be a hex string, e.g.: FF0000')\n    }\n    _finalColors[key] = hex\n  }\n  _setTags(_finalColors)\n}\n\n/**\n * Reset colors.\n */\nansiHTML.reset = function () {\n  _setTags(_defColors)\n}\n\n/**\n * Expose tags, including open and close.\n * @type {Object}\n */\nansiHTML.tags = {}\n\nif (Object.defineProperty) {\n  Object.defineProperty(ansiHTML.tags, 'open', {\n    get: function () { return _openTags }\n  })\n  Object.defineProperty(ansiHTML.tags, 'close', {\n    get: function () { return _closeTags }\n  })\n} else {\n  ansiHTML.tags.open = _openTags\n  ansiHTML.tags.close = _closeTags\n}\n\nfunction _setTags (colors) {\n  // reset all\n  _openTags['0'] = 'font-weight:normal;opacity:1;color:#' + colors.reset[0] + ';background:#' + colors.reset[1]\n  // inverse\n  _openTags['7'] = 'color:#' + colors.reset[1] + ';background:#' + colors.reset[0]\n  // dark grey\n  _openTags['90'] = 'color:#' + colors.darkgrey\n\n  for (var code in _styles) {\n    var color = _styles[code]\n    var oriColor = colors[color] || '000'\n    _openTags[code] = 'color:#' + oriColor\n    code = parseInt(code)\n    _openTags[(code + 10).toString()] = 'background:#' + oriColor\n  }\n}\n\nansiHTML.reset()\n\n\n//# sourceURL=webpack://unm-cs-512-obj/./node_modules/ansi-html-community/index.js?\n}");

/***/ },

/***/ "./node_modules/events/events.js"
/*!***************************************!*\
  !*** ./node_modules/events/events.js ***!
  \***************************************/
(module) {

"use strict";
eval("{// Copyright Joyent, Inc. and other Node contributors.\n//\n// Permission is hereby granted, free of charge, to any person obtaining a\n// copy of this software and associated documentation files (the\n// \"Software\"), to deal in the Software without restriction, including\n// without limitation the rights to use, copy, modify, merge, publish,\n// distribute, sublicense, and/or sell copies of the Software, and to permit\n// persons to whom the Software is furnished to do so, subject to the\n// following conditions:\n//\n// The above copyright notice and this permission notice shall be included\n// in all copies or substantial portions of the Software.\n//\n// THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS\n// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF\n// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN\n// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,\n// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR\n// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE\n// USE OR OTHER DEALINGS IN THE SOFTWARE.\n\n\n\nvar R = typeof Reflect === 'object' ? Reflect : null\nvar ReflectApply = R && typeof R.apply === 'function'\n  ? R.apply\n  : function ReflectApply(target, receiver, args) {\n    return Function.prototype.apply.call(target, receiver, args);\n  }\n\nvar ReflectOwnKeys\nif (R && typeof R.ownKeys === 'function') {\n  ReflectOwnKeys = R.ownKeys\n} else if (Object.getOwnPropertySymbols) {\n  ReflectOwnKeys = function ReflectOwnKeys(target) {\n    return Object.getOwnPropertyNames(target)\n      .concat(Object.getOwnPropertySymbols(target));\n  };\n} else {\n  ReflectOwnKeys = function ReflectOwnKeys(target) {\n    return Object.getOwnPropertyNames(target);\n  };\n}\n\nfunction ProcessEmitWarning(warning) {\n  if (console && console.warn) console.warn(warning);\n}\n\nvar NumberIsNaN = Number.isNaN || function NumberIsNaN(value) {\n  return value !== value;\n}\n\nfunction EventEmitter() {\n  EventEmitter.init.call(this);\n}\nmodule.exports = EventEmitter;\nmodule.exports.once = once;\n\n// Backwards-compat with node 0.10.x\nEventEmitter.EventEmitter = EventEmitter;\n\nEventEmitter.prototype._events = undefined;\nEventEmitter.prototype._eventsCount = 0;\nEventEmitter.prototype._maxListeners = undefined;\n\n// By default EventEmitters will print a warning if more than 10 listeners are\n// added to it. This is a useful default which helps finding memory leaks.\nvar defaultMaxListeners = 10;\n\nfunction checkListener(listener) {\n  if (typeof listener !== 'function') {\n    throw new TypeError('The \"listener\" argument must be of type Function. Received type ' + typeof listener);\n  }\n}\n\nObject.defineProperty(EventEmitter, 'defaultMaxListeners', {\n  enumerable: true,\n  get: function() {\n    return defaultMaxListeners;\n  },\n  set: function(arg) {\n    if (typeof arg !== 'number' || arg < 0 || NumberIsNaN(arg)) {\n      throw new RangeError('The value of \"defaultMaxListeners\" is out of range. It must be a non-negative number. Received ' + arg + '.');\n    }\n    defaultMaxListeners = arg;\n  }\n});\n\nEventEmitter.init = function() {\n\n  if (this._events === undefined ||\n      this._events === Object.getPrototypeOf(this)._events) {\n    this._events = Object.create(null);\n    this._eventsCount = 0;\n  }\n\n  this._maxListeners = this._maxListeners || undefined;\n};\n\n// Obviously not all Emitters should be limited to 10. This function allows\n// that to be increased. Set to zero for unlimited.\nEventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {\n  if (typeof n !== 'number' || n < 0 || NumberIsNaN(n)) {\n    throw new RangeError('The value of \"n\" is out of range. It must be a non-negative number. Received ' + n + '.');\n  }\n  this._maxListeners = n;\n  return this;\n};\n\nfunction _getMaxListeners(that) {\n  if (that._maxListeners === undefined)\n    return EventEmitter.defaultMaxListeners;\n  return that._maxListeners;\n}\n\nEventEmitter.prototype.getMaxListeners = function getMaxListeners() {\n  return _getMaxListeners(this);\n};\n\nEventEmitter.prototype.emit = function emit(type) {\n  var args = [];\n  for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);\n  var doError = (type === 'error');\n\n  var events = this._events;\n  if (events !== undefined)\n    doError = (doError && events.error === undefined);\n  else if (!doError)\n    return false;\n\n  // If there is no 'error' event listener then throw.\n  if (doError) {\n    var er;\n    if (args.length > 0)\n      er = args[0];\n    if (er instanceof Error) {\n      // Note: The comments on the `throw` lines are intentional, they show\n      // up in Node's output if this results in an unhandled exception.\n      throw er; // Unhandled 'error' event\n    }\n    // At least give some kind of context to the user\n    var err = new Error('Unhandled error.' + (er ? ' (' + er.message + ')' : ''));\n    err.context = er;\n    throw err; // Unhandled 'error' event\n  }\n\n  var handler = events[type];\n\n  if (handler === undefined)\n    return false;\n\n  if (typeof handler === 'function') {\n    ReflectApply(handler, this, args);\n  } else {\n    var len = handler.length;\n    var listeners = arrayClone(handler, len);\n    for (var i = 0; i < len; ++i)\n      ReflectApply(listeners[i], this, args);\n  }\n\n  return true;\n};\n\nfunction _addListener(target, type, listener, prepend) {\n  var m;\n  var events;\n  var existing;\n\n  checkListener(listener);\n\n  events = target._events;\n  if (events === undefined) {\n    events = target._events = Object.create(null);\n    target._eventsCount = 0;\n  } else {\n    // To avoid recursion in the case that type === \"newListener\"! Before\n    // adding it to the listeners, first emit \"newListener\".\n    if (events.newListener !== undefined) {\n      target.emit('newListener', type,\n                  listener.listener ? listener.listener : listener);\n\n      // Re-assign `events` because a newListener handler could have caused the\n      // this._events to be assigned to a new object\n      events = target._events;\n    }\n    existing = events[type];\n  }\n\n  if (existing === undefined) {\n    // Optimize the case of one listener. Don't need the extra array object.\n    existing = events[type] = listener;\n    ++target._eventsCount;\n  } else {\n    if (typeof existing === 'function') {\n      // Adding the second element, need to change to array.\n      existing = events[type] =\n        prepend ? [listener, existing] : [existing, listener];\n      // If we've already got an array, just append.\n    } else if (prepend) {\n      existing.unshift(listener);\n    } else {\n      existing.push(listener);\n    }\n\n    // Check for listener leak\n    m = _getMaxListeners(target);\n    if (m > 0 && existing.length > m && !existing.warned) {\n      existing.warned = true;\n      // No error code for this since it is a Warning\n      // eslint-disable-next-line no-restricted-syntax\n      var w = new Error('Possible EventEmitter memory leak detected. ' +\n                          existing.length + ' ' + String(type) + ' listeners ' +\n                          'added. Use emitter.setMaxListeners() to ' +\n                          'increase limit');\n      w.name = 'MaxListenersExceededWarning';\n      w.emitter = target;\n      w.type = type;\n      w.count = existing.length;\n      ProcessEmitWarning(w);\n    }\n  }\n\n  return target;\n}\n\nEventEmitter.prototype.addListener = function addListener(type, listener) {\n  return _addListener(this, type, listener, false);\n};\n\nEventEmitter.prototype.on = EventEmitter.prototype.addListener;\n\nEventEmitter.prototype.prependListener =\n    function prependListener(type, listener) {\n      return _addListener(this, type, listener, true);\n    };\n\nfunction onceWrapper() {\n  if (!this.fired) {\n    this.target.removeListener(this.type, this.wrapFn);\n    this.fired = true;\n    if (arguments.length === 0)\n      return this.listener.call(this.target);\n    return this.listener.apply(this.target, arguments);\n  }\n}\n\nfunction _onceWrap(target, type, listener) {\n  var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };\n  var wrapped = onceWrapper.bind(state);\n  wrapped.listener = listener;\n  state.wrapFn = wrapped;\n  return wrapped;\n}\n\nEventEmitter.prototype.once = function once(type, listener) {\n  checkListener(listener);\n  this.on(type, _onceWrap(this, type, listener));\n  return this;\n};\n\nEventEmitter.prototype.prependOnceListener =\n    function prependOnceListener(type, listener) {\n      checkListener(listener);\n      this.prependListener(type, _onceWrap(this, type, listener));\n      return this;\n    };\n\n// Emits a 'removeListener' event if and only if the listener was removed.\nEventEmitter.prototype.removeListener =\n    function removeListener(type, listener) {\n      var list, events, position, i, originalListener;\n\n      checkListener(listener);\n\n      events = this._events;\n      if (events === undefined)\n        return this;\n\n      list = events[type];\n      if (list === undefined)\n        return this;\n\n      if (list === listener || list.listener === listener) {\n        if (--this._eventsCount === 0)\n          this._events = Object.create(null);\n        else {\n          delete events[type];\n          if (events.removeListener)\n            this.emit('removeListener', type, list.listener || listener);\n        }\n      } else if (typeof list !== 'function') {\n        position = -1;\n\n        for (i = list.length - 1; i >= 0; i--) {\n          if (list[i] === listener || list[i].listener === listener) {\n            originalListener = list[i].listener;\n            position = i;\n            break;\n          }\n        }\n\n        if (position < 0)\n          return this;\n\n        if (position === 0)\n          list.shift();\n        else {\n          spliceOne(list, position);\n        }\n\n        if (list.length === 1)\n          events[type] = list[0];\n\n        if (events.removeListener !== undefined)\n          this.emit('removeListener', type, originalListener || listener);\n      }\n\n      return this;\n    };\n\nEventEmitter.prototype.off = EventEmitter.prototype.removeListener;\n\nEventEmitter.prototype.removeAllListeners =\n    function removeAllListeners(type) {\n      var listeners, events, i;\n\n      events = this._events;\n      if (events === undefined)\n        return this;\n\n      // not listening for removeListener, no need to emit\n      if (events.removeListener === undefined) {\n        if (arguments.length === 0) {\n          this._events = Object.create(null);\n          this._eventsCount = 0;\n        } else if (events[type] !== undefined) {\n          if (--this._eventsCount === 0)\n            this._events = Object.create(null);\n          else\n            delete events[type];\n        }\n        return this;\n      }\n\n      // emit removeListener for all listeners on all events\n      if (arguments.length === 0) {\n        var keys = Object.keys(events);\n        var key;\n        for (i = 0; i < keys.length; ++i) {\n          key = keys[i];\n          if (key === 'removeListener') continue;\n          this.removeAllListeners(key);\n        }\n        this.removeAllListeners('removeListener');\n        this._events = Object.create(null);\n        this._eventsCount = 0;\n        return this;\n      }\n\n      listeners = events[type];\n\n      if (typeof listeners === 'function') {\n        this.removeListener(type, listeners);\n      } else if (listeners !== undefined) {\n        // LIFO order\n        for (i = listeners.length - 1; i >= 0; i--) {\n          this.removeListener(type, listeners[i]);\n        }\n      }\n\n      return this;\n    };\n\nfunction _listeners(target, type, unwrap) {\n  var events = target._events;\n\n  if (events === undefined)\n    return [];\n\n  var evlistener = events[type];\n  if (evlistener === undefined)\n    return [];\n\n  if (typeof evlistener === 'function')\n    return unwrap ? [evlistener.listener || evlistener] : [evlistener];\n\n  return unwrap ?\n    unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);\n}\n\nEventEmitter.prototype.listeners = function listeners(type) {\n  return _listeners(this, type, true);\n};\n\nEventEmitter.prototype.rawListeners = function rawListeners(type) {\n  return _listeners(this, type, false);\n};\n\nEventEmitter.listenerCount = function(emitter, type) {\n  if (typeof emitter.listenerCount === 'function') {\n    return emitter.listenerCount(type);\n  } else {\n    return listenerCount.call(emitter, type);\n  }\n};\n\nEventEmitter.prototype.listenerCount = listenerCount;\nfunction listenerCount(type) {\n  var events = this._events;\n\n  if (events !== undefined) {\n    var evlistener = events[type];\n\n    if (typeof evlistener === 'function') {\n      return 1;\n    } else if (evlistener !== undefined) {\n      return evlistener.length;\n    }\n  }\n\n  return 0;\n}\n\nEventEmitter.prototype.eventNames = function eventNames() {\n  return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];\n};\n\nfunction arrayClone(arr, n) {\n  var copy = new Array(n);\n  for (var i = 0; i < n; ++i)\n    copy[i] = arr[i];\n  return copy;\n}\n\nfunction spliceOne(list, index) {\n  for (; index + 1 < list.length; index++)\n    list[index] = list[index + 1];\n  list.pop();\n}\n\nfunction unwrapListeners(arr) {\n  var ret = new Array(arr.length);\n  for (var i = 0; i < ret.length; ++i) {\n    ret[i] = arr[i].listener || arr[i];\n  }\n  return ret;\n}\n\nfunction once(emitter, name) {\n  return new Promise(function (resolve, reject) {\n    function errorListener(err) {\n      emitter.removeListener(name, resolver);\n      reject(err);\n    }\n\n    function resolver() {\n      if (typeof emitter.removeListener === 'function') {\n        emitter.removeListener('error', errorListener);\n      }\n      resolve([].slice.call(arguments));\n    };\n\n    eventTargetAgnosticAddListener(emitter, name, resolver, { once: true });\n    if (name !== 'error') {\n      addErrorHandlerIfEventEmitter(emitter, errorListener, { once: true });\n    }\n  });\n}\n\nfunction addErrorHandlerIfEventEmitter(emitter, handler, flags) {\n  if (typeof emitter.on === 'function') {\n    eventTargetAgnosticAddListener(emitter, 'error', handler, flags);\n  }\n}\n\nfunction eventTargetAgnosticAddListener(emitter, name, listener, flags) {\n  if (typeof emitter.on === 'function') {\n    if (flags.once) {\n      emitter.once(name, listener);\n    } else {\n      emitter.on(name, listener);\n    }\n  } else if (typeof emitter.addEventListener === 'function') {\n    // EventTarget does not have `error` event semantics like Node\n    // EventEmitters, we do not listen for `error` events here.\n    emitter.addEventListener(name, function wrapListener(arg) {\n      // IE does not have builtin `{ once: true }` support so we\n      // have to do it manually.\n      if (flags.once) {\n        emitter.removeEventListener(name, wrapListener);\n      }\n      listener(arg);\n    });\n  } else {\n    throw new TypeError('The \"emitter\" argument must be of type EventEmitter. Received type ' + typeof emitter);\n  }\n}\n\n\n//# sourceURL=webpack://unm-cs-512-obj/./node_modules/events/events.js?\n}");

/***/ },

/***/ "./node_modules/webpack/hot/dev-server.js"
/*!************************************************!*\
  !*** ./node_modules/webpack/hot/dev-server.js ***!
  \************************************************/
(module, __unused_webpack_exports, __webpack_require__) {

eval("{/*\n\tMIT License http://www.opensource.org/licenses/mit-license.php\n\tAuthor Tobias Koppers @sokra\n*/\n/* globals __webpack_hash__ */\n// Universal regular-HMR client (web + Node): runs `module.hot.check` whenever a\n// `webpackHotUpdate` signal arrives on ./emitter (pushed by the dev-server).\nif (true) {\n\t/** @type {undefined|string} */\n\tvar lastHash;\n\tvar upToDate = function upToDate() {\n\t\treturn /** @type {string} */ (lastHash).indexOf(__webpack_require__.h()) >= 0;\n\t};\n\tvar log = __webpack_require__(/*! ./log */ \"./node_modules/webpack/hot/log.js\");\n\tvar check = function check() {\n\t\tmodule.hot\n\t\t\t.check(true)\n\t\t\t.then(function (updatedModules) {\n\t\t\t\tif (!updatedModules) {\n\t\t\t\t\tlog(\n\t\t\t\t\t\t\"warning\",\n\t\t\t\t\t\t\"[HMR] Cannot find update. \" +\n\t\t\t\t\t\t\t(typeof window !== \"undefined\"\n\t\t\t\t\t\t\t\t? \"Need to do a full reload!\"\n\t\t\t\t\t\t\t\t: \"Please reload manually!\")\n\t\t\t\t\t);\n\t\t\t\t\tlog(\n\t\t\t\t\t\t\"warning\",\n\t\t\t\t\t\t\"[HMR] (Probably because of restarting the webpack-dev-server)\"\n\t\t\t\t\t);\n\t\t\t\t\tif (typeof window !== \"undefined\") {\n\t\t\t\t\t\twindow.location.reload();\n\t\t\t\t\t}\n\t\t\t\t\treturn;\n\t\t\t\t}\n\n\t\t\t\tif (!upToDate()) {\n\t\t\t\t\tcheck();\n\t\t\t\t}\n\n\t\t\t\t__webpack_require__(/*! ./log-apply-result */ \"./node_modules/webpack/hot/log-apply-result.js\")(updatedModules, updatedModules);\n\n\t\t\t\tif (upToDate()) {\n\t\t\t\t\tlog(\"info\", \"[HMR] App is up to date.\");\n\t\t\t\t}\n\t\t\t})\n\t\t\t.catch(function (err) {\n\t\t\t\tvar status = module.hot.status();\n\t\t\t\tif ([\"abort\", \"fail\"].indexOf(status) >= 0) {\n\t\t\t\t\tlog(\n\t\t\t\t\t\t\"warning\",\n\t\t\t\t\t\t\"[HMR] Cannot apply update. \" +\n\t\t\t\t\t\t\t(typeof window !== \"undefined\"\n\t\t\t\t\t\t\t\t? \"Need to do a full reload!\"\n\t\t\t\t\t\t\t\t: \"Please reload manually!\")\n\t\t\t\t\t);\n\t\t\t\t\tlog(\"warning\", \"[HMR] \" + log.formatError(err));\n\t\t\t\t\tif (typeof window !== \"undefined\") {\n\t\t\t\t\t\twindow.location.reload();\n\t\t\t\t\t}\n\t\t\t\t} else {\n\t\t\t\t\tlog(\"warning\", \"[HMR] Update failed: \" + log.formatError(err));\n\t\t\t\t}\n\t\t\t});\n\t};\n\t/** @type {EventTarget | NodeJS.EventEmitter} */\n\tvar hotEmitter = __webpack_require__(/*! ./emitter */ \"./node_modules/webpack/hot/emitter.js\");\n\t/**\n\t * @param {CustomEvent<{ currentHash: string }>} event event or hash\n\t */\n\tvar handler = function (event) {\n\t\tlastHash = typeof event === \"string\" ? event : event.detail.currentHash;\n\t\tif (!upToDate() && module.hot.status() === \"idle\") {\n\t\t\tlog(\"info\", \"[HMR] Checking for updates on the server...\");\n\t\t\tcheck();\n\t\t}\n\t};\n\n\tif (typeof EventTarget !== \"undefined\" && hotEmitter instanceof EventTarget) {\n\t\thotEmitter.addEventListener(\n\t\t\t\"webpackHotUpdate\",\n\t\t\t/** @type {EventListener} */\n\t\t\t(handler)\n\t\t);\n\t} else {\n\t\thotEmitter.on(\"webpackHotUpdate\", handler);\n\t}\n\n\tlog(\"info\", \"[HMR] Waiting for update signal from WDS...\");\n} else // removed by dead control flow\n{}\n\n\n//# sourceURL=webpack://unm-cs-512-obj/./node_modules/webpack/hot/dev-server.js?\n}");

/***/ },

/***/ "./node_modules/webpack/hot/emitter.js"
/*!*********************************************!*\
  !*** ./node_modules/webpack/hot/emitter.js ***!
  \*********************************************/
(module, __unused_webpack_exports, __webpack_require__) {

eval("{var EventEmitter = __webpack_require__(/*! events */ \"./node_modules/events/events.js\");\nmodule.exports = new EventEmitter();\n\n\n//# sourceURL=webpack://unm-cs-512-obj/./node_modules/webpack/hot/emitter.js?\n}");

/***/ },

/***/ "./node_modules/webpack/hot/log-apply-result.js"
/*!******************************************************!*\
  !*** ./node_modules/webpack/hot/log-apply-result.js ***!
  \******************************************************/
(module, __unused_webpack_exports, __webpack_require__) {

eval("{/*\n\tMIT License http://www.opensource.org/licenses/mit-license.php\n\tAuthor Tobias Koppers @sokra\n*/\n\n/**\n * @param {(string | number)[]} updatedModules updated modules\n * @param {(string | number)[] | null} renewedModules renewed modules\n */\nmodule.exports = function (updatedModules, renewedModules) {\n\tvar unacceptedModules = updatedModules.filter(function (moduleId) {\n\t\treturn renewedModules && renewedModules.indexOf(moduleId) < 0;\n\t});\n\tvar log = __webpack_require__(/*! ./log */ \"./node_modules/webpack/hot/log.js\");\n\n\tif (unacceptedModules.length > 0) {\n\t\tlog(\n\t\t\t\"warning\",\n\t\t\t\"[HMR] The following modules couldn't be hot updated: (They would need a full reload!)\"\n\t\t);\n\t\tunacceptedModules.forEach(function (moduleId) {\n\t\t\tlog(\"warning\", \"[HMR]  - \" + moduleId);\n\t\t});\n\t}\n\n\tif (!renewedModules || renewedModules.length === 0) {\n\t\tlog(\"info\", \"[HMR] Nothing hot updated.\");\n\t} else {\n\t\tlog(\"info\", \"[HMR] Updated modules:\");\n\t\trenewedModules.forEach(function (moduleId) {\n\t\t\tif (typeof moduleId === \"string\" && moduleId.indexOf(\"!\") !== -1) {\n\t\t\t\tvar parts = moduleId.split(\"!\");\n\t\t\t\tlog.groupCollapsed(\"info\", \"[HMR]  - \" + parts.pop());\n\t\t\t\tlog(\"info\", \"[HMR]  - \" + moduleId);\n\t\t\t\tlog.groupEnd(\"info\");\n\t\t\t} else {\n\t\t\t\tlog(\"info\", \"[HMR]  - \" + moduleId);\n\t\t\t}\n\t\t});\n\t\tvar numberIds = renewedModules.every(function (moduleId) {\n\t\t\treturn typeof moduleId === \"number\";\n\t\t});\n\t\tif (numberIds)\n\t\t\tlog(\n\t\t\t\t\"info\",\n\t\t\t\t'[HMR] Consider using the optimization.moduleIds: \"named\" for module names.'\n\t\t\t);\n\t}\n};\n\n\n//# sourceURL=webpack://unm-cs-512-obj/./node_modules/webpack/hot/log-apply-result.js?\n}");

/***/ },

/***/ "./node_modules/webpack/hot/log.js"
/*!*****************************************!*\
  !*** ./node_modules/webpack/hot/log.js ***!
  \*****************************************/
(module) {

eval("{/** @typedef {\"info\" | \"warning\" | \"error\"} LogLevel */\n\n/** @type {LogLevel} */\nvar logLevel = \"info\";\n\nfunction dummy() {}\n\n/**\n * @param {LogLevel} level log level\n * @returns {boolean} true, if should log\n */\nfunction shouldLog(level) {\n\tvar shouldLog =\n\t\t(logLevel === \"info\" && level === \"info\") ||\n\t\t([\"info\", \"warning\"].indexOf(logLevel) >= 0 && level === \"warning\") ||\n\t\t([\"info\", \"warning\", \"error\"].indexOf(logLevel) >= 0 && level === \"error\");\n\treturn shouldLog;\n}\n\n/**\n * @param {(msg?: string) => void} logFn log function\n * @returns {(level: LogLevel, msg?: string) => void} function that logs when log level is sufficient\n */\nfunction logGroup(logFn) {\n\treturn function (level, msg) {\n\t\tif (shouldLog(level)) {\n\t\t\tlogFn(msg);\n\t\t}\n\t};\n}\n\n/**\n * @param {LogLevel} level log level\n * @param {string|Error} msg message\n */\nmodule.exports = function (level, msg) {\n\tif (shouldLog(level)) {\n\t\tif (level === \"info\") {\n\t\t\tconsole.log(msg);\n\t\t} else if (level === \"warning\") {\n\t\t\tconsole.warn(msg);\n\t\t} else if (level === \"error\") {\n\t\t\tconsole.error(msg);\n\t\t}\n\t}\n};\n\n/**\n * @param {Error} err error\n * @returns {string} formatted error\n */\nmodule.exports.formatError = function (err) {\n\tvar message = err.message;\n\tvar stack = err.stack;\n\tif (!stack) {\n\t\treturn message;\n\t} else if (stack.indexOf(message) < 0) {\n\t\treturn message + \"\\n\" + stack;\n\t}\n\treturn stack;\n};\n\nvar group = console.group || dummy;\nvar groupCollapsed = console.groupCollapsed || dummy;\nvar groupEnd = console.groupEnd || dummy;\n\nmodule.exports.group = logGroup(group);\n\nmodule.exports.groupCollapsed = logGroup(groupCollapsed);\n\nmodule.exports.groupEnd = logGroup(groupEnd);\n\n/**\n * @param {LogLevel} level log level\n */\nmodule.exports.setLogLevel = function (level) {\n\tlogLevel = level;\n};\n\n\n//# sourceURL=webpack://unm-cs-512-obj/./node_modules/webpack/hot/log.js?\n}");

/***/ },

/***/ "./src/index.js"
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var PotatoEngine__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! PotatoEngine */ \"./PotatoEngine/src/index.js\");\n\nconst loader = document.getElementById(\"loader-wrapper\");\n\n// try to plug in new scene abstraction\nconst scene = new PotatoEngine__WEBPACK_IMPORTED_MODULE_0__.Scene(\"glcanvas\");\nscene.background = [0, 0, 0, 1];\n\nscene.camera.move(0, 0, -2);\n\nscene.addShader(\n  new PotatoEngine__WEBPACK_IMPORTED_MODULE_0__.Shader(\n    \"basicVertex\",\n    scene.gl.VERTEX_SHADER,\n    \"\",\n    \"./PotatoEngine/src/shaders/vertex.vert\",\n  ),\n);\n\nscene.addShader(\n  new PotatoEngine__WEBPACK_IMPORTED_MODULE_0__.Shader(\n    \"basicFragment\",\n    scene.gl.FRAGMENT_SHADER,\n    \"\",\n    \"./PotatoEngine/src/shaders/fragment.frag\",\n  ),\n);\n\n/**\n * Initalize all the objects in the starting scene\n * - 10 random barrels\n * - cannon\n * - pillar canon sits on\n * - water\n */\nfunction initSceneObjects() {\n  const teapot = PotatoEngine__WEBPACK_IMPORTED_MODULE_0__.objects.generateOBJObject(\"teapot\", undefined, \"teapot\");\n  teapot.position[1] = -1.5\n  scene.addObject(teapot, \"basic\");\n}\n\n/**\n * Main init function\n * - load the scene shaders\n * - init all objects\n * - initialize buffers\n * - attach keyboard, mouse, input listeners\n * - start animation loop\n */\nasync function main() {\n  await PotatoEngine__WEBPACK_IMPORTED_MODULE_0__.objects.cacheOBJ(\"./public/utah_teapot.obj\", \"teapot\");\n  await scene.loadShaders();\n  loader.className = \"\"\n  scene.addProgram(\"basic\", \"basicVertex\", \"basicFragment\");\n\n  initSceneObjects();\n  scene.initBuffers();\n\n  PotatoEngine__WEBPACK_IMPORTED_MODULE_0__.Controls.BasicControls.setupMouseControls(scene);\n  PotatoEngine__WEBPACK_IMPORTED_MODULE_0__.Controls.BasicControls.setupKeyboardControls(scene);\n\n  setInterval(() => {\n\n    scene.rotationX += Math.PI / 180 ;\n    scene.rotationY += Math.PI / 180 ;\n    scene.render();\n  }, 30);\n}\n\nmain();\n\n\n//# sourceURL=webpack://unm-cs-512-obj/./src/index.js?\n}");

/***/ },

/***/ "./node_modules/webpack-dev-server/client/clients/WebSocketClient.js"
/*!***************************************************************************!*\
  !*** ./node_modules/webpack-dev-server/client/clients/WebSocketClient.js ***!
  \***************************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ WebSocketClient)\n/* harmony export */ });\n/* harmony import */ var _utils_log_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/log.js */ \"./node_modules/webpack-dev-server/client/utils/log.js\");\nfunction _typeof(o) { \"@babel/helpers - typeof\"; return _typeof = \"function\" == typeof Symbol && \"symbol\" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && \"function\" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? \"symbol\" : typeof o; }, _typeof(o); }\nfunction _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError(\"Cannot call a class as a function\"); }\nfunction _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, \"value\" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }\nfunction _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, \"prototype\", { writable: !1 }), e; }\nfunction _toPropertyKey(t) { var i = _toPrimitive(t, \"string\"); return \"symbol\" == _typeof(i) ? i : i + \"\"; }\nfunction _toPrimitive(t, r) { if (\"object\" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || \"default\"); if (\"object\" != _typeof(i)) return i; throw new TypeError(\"@@toPrimitive must return a primitive value.\"); } return (\"string\" === r ? String : Number)(t); }\n;\n\n/** @typedef {import(\"../index.js\").EXPECTED_ANY} EXPECTED_ANY */\n\n/**\n * @implements {CommunicationClient}\n */\nvar WebSocketClient = /*#__PURE__*/function () {\n  /**\n   * @param {string} url url to connect\n   */\n  function WebSocketClient(url) {\n    _classCallCheck(this, WebSocketClient);\n    this.client = new WebSocket(url);\n    this.client.onerror = function (error) {\n      _utils_log_js__WEBPACK_IMPORTED_MODULE_0__.log.error(error);\n    };\n  }\n\n  /**\n   * @param {(...args: EXPECTED_ANY[]) => void} fn function\n   */\n  return _createClass(WebSocketClient, [{\n    key: \"onOpen\",\n    value: function onOpen(fn) {\n      this.client.onopen = fn;\n    }\n\n    /**\n     * @param {(...args: EXPECTED_ANY[]) => void} fn function\n     */\n  }, {\n    key: \"onClose\",\n    value: function onClose(fn) {\n      this.client.onclose = fn;\n    }\n\n    // call f with the message string as the first argument\n    /**\n     * @param {(...args: EXPECTED_ANY[]) => void} fn function\n     */\n  }, {\n    key: \"onMessage\",\n    value: function onMessage(fn) {\n      this.client.onmessage = function (err) {\n        fn(err.data);\n      };\n    }\n  }]);\n}();\n\n\n//# sourceURL=webpack://unm-cs-512-obj/./node_modules/webpack-dev-server/client/clients/WebSocketClient.js?\n}");

/***/ },

/***/ "./node_modules/webpack-dev-server/client/index.js?protocol=ws%3A&hostname=0.0.0.0&port=8080&pathname=%2Fws&logging=info&overlay=true&reconnect=10&hot=true&live-reload=true"
/*!***********************************************************************************************************************************************************************************!*\
  !*** ./node_modules/webpack-dev-server/client/index.js?protocol=ws%3A&hostname=0.0.0.0&port=8080&pathname=%2Fws&logging=info&overlay=true&reconnect=10&hot=true&live-reload=true ***!
  \***********************************************************************************************************************************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
eval("{var __resourceQuery = \"?protocol=ws%3A&hostname=0.0.0.0&port=8080&pathname=%2Fws&logging=info&overlay=true&reconnect=10&hot=true&live-reload=true\";\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   createSocketURL: () => (/* binding */ createSocketURL),\n/* harmony export */   getCurrentScriptSource: () => (/* binding */ getCurrentScriptSource),\n/* harmony export */   parseURL: () => (/* binding */ parseURL)\n/* harmony export */ });\n/* harmony import */ var webpack_hot_emitter_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! webpack/hot/emitter.js */ \"./node_modules/webpack/hot/emitter.js\");\n/* harmony import */ var webpack_hot_log_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! webpack/hot/log.js */ \"./node_modules/webpack/hot/log.js\");\n/* harmony import */ var _overlay_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./overlay.js */ \"./node_modules/webpack-dev-server/client/overlay.js\");\n/* harmony import */ var _progress_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./progress.js */ \"./node_modules/webpack-dev-server/client/progress.js\");\n/* harmony import */ var _socket_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./socket.js */ \"./node_modules/webpack-dev-server/client/socket.js\");\n/* harmony import */ var _utils_log_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./utils/log.js */ \"./node_modules/webpack-dev-server/client/utils/log.js\");\n/* harmony import */ var _utils_sendMessage_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./utils/sendMessage.js */ \"./node_modules/webpack-dev-server/client/utils/sendMessage.js\");\nfunction ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }\nfunction _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }\nfunction _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }\nfunction _toPropertyKey(t) { var i = _toPrimitive(t, \"string\"); return \"symbol\" == _typeof(i) ? i : i + \"\"; }\nfunction _toPrimitive(t, r) { if (\"object\" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || \"default\"); if (\"object\" != _typeof(i)) return i; throw new TypeError(\"@@toPrimitive must return a primitive value.\"); } return (\"string\" === r ? String : Number)(t); }\nfunction _typeof(o) { \"@babel/helpers - typeof\"; return _typeof = \"function\" == typeof Symbol && \"symbol\" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && \"function\" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? \"symbol\" : typeof o; }, _typeof(o); }\n/* global __resourceQuery, __webpack_hash__ */\n// @ts-expect-error\n;\n// @ts-expect-error\n\n\n\n\n\n\n\n// eslint-disable-next-line jsdoc/reject-any-type\n/** @typedef {any} EXPECTED_ANY */\n\n/**\n * @typedef {object} RawOverlayOptions\n * @property {string=} warnings warnings\n * @property {string=} errors errors\n * @property {string=} runtimeErrors runtime errors\n * @property {string=} trustedTypesPolicyName trusted types policy name\n */\n\n/**\n * @typedef {object} OverlayOptions\n * @property {(boolean | ((error: Error) => boolean))=} warnings warnings\n * @property {(boolean | ((error: Error) => boolean))=} errors errors\n * @property {(boolean | ((error: Error) => boolean))=} runtimeErrors runtime errors\n * @property {string=} trustedTypesPolicyName trusted types policy name\n */\n\n/** @typedef {false | true | \"none\" | \"error\" | \"warn\" | \"info\" | \"log\" | \"verbose\"} LogLevel */\n\n/**\n * @typedef {object} Options\n * @property {boolean} hot true when hot enabled, otherwise false\n * @property {boolean} liveReload true when live reload enabled, otherwise false\n * @property {boolean} progress true when need to show progress, otherwise false\n * @property {boolean | OverlayOptions} overlay overlay options\n * @property {LogLevel=} logging logging level\n * @property {number=} reconnect count of allowed reconnection\n */\n\n/**\n * @typedef {object} Status\n * @property {boolean} isUnloading true when unloaded, otherwise false\n * @property {string} currentHash current hash\n * @property {string=} previousHash previous hash\n */\n\n/**\n * @param {boolean | RawOverlayOptions | OverlayOptions} overlayOptions overlay options\n */\nvar decodeOverlayOptions = function decodeOverlayOptions(overlayOptions) {\n  if (_typeof(overlayOptions) === \"object\") {\n    var requiredOptions = [\"warnings\", \"errors\", \"runtimeErrors\"];\n    for (var i = 0; i < requiredOptions.length; i++) {\n      var property = /** @type {keyof Omit<RawOverlayOptions, \"trustedTypesPolicyName\">} */\n      requiredOptions[i];\n      if (typeof overlayOptions[property] === \"string\") {\n        var overlayFilterFunctionString = decodeURIComponent(overlayOptions[property]);\n\n        /** @type {OverlayOptions} */\n        overlayOptions[property] = /** @type {(error: Error) => boolean} */\n        // eslint-disable-next-line no-new-func\n        new Function(\"message\", \"var callback = \".concat(overlayFilterFunctionString, \"\\n        return callback(message)\"));\n      }\n    }\n  }\n};\n\n/**\n * @type {Status}\n */\nvar status = {\n  isUnloading: false,\n  currentHash: __webpack_require__.h()\n};\n\n/**\n * @returns {string} current script source\n */\nvar getCurrentScriptSource = function getCurrentScriptSource() {\n  // `document.currentScript` is the most accurate way to find the current script,\n  // but is not supported in all browsers.\n  if (document.currentScript) {\n    return /** @type {string} */document.currentScript.getAttribute(\"src\");\n  }\n\n  // Fallback to getting all scripts running in the document.\n  var scriptElements = document.scripts || [];\n  var scriptElementsWithSrc = Array.prototype.filter.call(scriptElements, function (element) {\n    return element.getAttribute(\"src\");\n  });\n  if (scriptElementsWithSrc.length > 0) {\n    var currentScript = scriptElementsWithSrc[scriptElementsWithSrc.length - 1];\n    return currentScript.getAttribute(\"src\");\n  }\n\n  // Fail as there was no script to use.\n  throw new Error(\"[webpack-dev-server] Failed to get current script source.\");\n};\n\n/** @typedef {{ hot?: string, [\"live-reload\"]?: string, progress?: string, reconnect?: string, logging?: LogLevel, overlay?: string, fromCurrentScript?: boolean }} AdditionalParsedURL */\n/** @typedef {Partial<URL> & AdditionalParsedURL} ParsedURL */\n\n/**\n * @param {string} resourceQuery resource query\n * @returns {ParsedURL} parsed URL\n */\nvar parseURL = function parseURL(resourceQuery) {\n  /** @type {ParsedURL} */\n  var result = {};\n  if (typeof resourceQuery === \"string\" && resourceQuery !== \"\") {\n    var searchParams = resourceQuery.slice(1).split(\"&\");\n    for (var i = 0; i < searchParams.length; i++) {\n      var pair = searchParams[i].split(\"=\");\n\n      /** @type {EXPECTED_ANY} */\n      result[pair[0]] = decodeURIComponent(pair[1]);\n    }\n  } else {\n    // Else, get the url from the <script> this file was called with.\n    var scriptSource = getCurrentScriptSource();\n    var scriptSourceURL;\n    try {\n      // The placeholder `baseURL` with `window.location.href`,\n      // is to allow parsing of path-relative or protocol-relative URLs,\n      // and will have no effect if `scriptSource` is a fully valid URL.\n      scriptSourceURL = new URL(scriptSource, self.location.href);\n    } catch (_err) {\n      // URL parsing failed, do nothing.\n      // We will still proceed to see if we can recover using `resourceQuery`\n    }\n    if (scriptSourceURL) {\n      result = scriptSourceURL;\n      result.fromCurrentScript = true;\n    }\n  }\n  return result;\n};\nvar parsedResourceQuery = parseURL(__resourceQuery);\n\n/** @typedef {{ [\"Hot Module Replacement\"]: boolean, [\"Live Reloading\"]: boolean, Progress: boolean, Overlay: boolean }} Features */\n\n/** @type {Features} */\nvar enabledFeatures = {\n  \"Hot Module Replacement\": false,\n  \"Live Reloading\": false,\n  Progress: false,\n  Overlay: false\n};\n\n/** @type {Options} */\nvar options = {\n  hot: false,\n  liveReload: false,\n  progress: false,\n  overlay: false\n};\nif (parsedResourceQuery.hot === \"true\") {\n  options.hot = true;\n  enabledFeatures[\"Hot Module Replacement\"] = true;\n}\nif (parsedResourceQuery[\"live-reload\"] === \"true\") {\n  options.liveReload = true;\n  enabledFeatures[\"Live Reloading\"] = true;\n}\nif (parsedResourceQuery.progress === \"true\") {\n  options.progress = true;\n  enabledFeatures.Progress = true;\n}\nif (parsedResourceQuery.overlay) {\n  try {\n    options.overlay = JSON.parse(parsedResourceQuery.overlay);\n  } catch (err) {\n    _utils_log_js__WEBPACK_IMPORTED_MODULE_5__.log.error(\"Error parsing overlay options from resource query:\", err);\n  }\n\n  // Fill in default \"true\" params for partially-specified objects.\n  if (_typeof(options.overlay) === \"object\") {\n    options.overlay = _objectSpread({\n      errors: true,\n      warnings: true,\n      runtimeErrors: true\n    }, options.overlay);\n    decodeOverlayOptions(options.overlay);\n  }\n  enabledFeatures.Overlay = options.overlay !== false;\n}\nif (parsedResourceQuery.logging) {\n  options.logging = parsedResourceQuery.logging;\n}\nif (typeof parsedResourceQuery.reconnect !== \"undefined\") {\n  options.reconnect = Number(parsedResourceQuery.reconnect);\n}\n\n/**\n * @param {false | true | \"none\" | \"error\" | \"warn\" | \"info\" | \"log\" | \"verbose\"} level level\n */\nvar setAllLogLevel = function setAllLogLevel(level) {\n  // This is needed because the HMR logger operate separately from dev server logger\n  webpack_hot_log_js__WEBPACK_IMPORTED_MODULE_1__.setLogLevel(level === \"verbose\" || level === \"log\" ? \"info\" : level);\n  (0,_utils_log_js__WEBPACK_IMPORTED_MODULE_5__.setLogLevel)(level);\n};\nif (options.logging) {\n  setAllLogLevel(options.logging);\n}\n\n/**\n * @param {Features} features features\n */\nvar logEnabledFeatures = function logEnabledFeatures(features) {\n  var listEnabledFeatures = Object.keys(features);\n  if (!features || listEnabledFeatures.length === 0) {\n    return;\n  }\n  var logString = \"Server started:\";\n\n  // Server started: Hot Module Replacement enabled, Live Reloading enabled, Overlay disabled.\n  for (var i = 0; i < listEnabledFeatures.length; i++) {\n    var key = /** @type {keyof Features} */listEnabledFeatures[i];\n    logString += \" \".concat(key, \" \").concat(features[key] ? \"enabled\" : \"disabled\", \",\");\n  }\n  // replace last comma with a period\n  logString = logString.slice(0, -1).concat(\".\");\n  _utils_log_js__WEBPACK_IMPORTED_MODULE_5__.log.info(logString);\n};\nlogEnabledFeatures(enabledFeatures);\nself.addEventListener(\"beforeunload\", function () {\n  status.isUnloading = true;\n});\nvar overlay = typeof window !== \"undefined\" ? (0,_overlay_js__WEBPACK_IMPORTED_MODULE_2__.createOverlay)(_typeof(options.overlay) === \"object\" ? {\n  trustedTypesPolicyName: options.overlay.trustedTypesPolicyName,\n  catchRuntimeError: options.overlay.runtimeErrors\n} : {\n  trustedTypesPolicyName: false,\n  catchRuntimeError: options.overlay\n}) : {\n  send: function send() {}\n};\n\n/**\n * @param {Options} options options\n * @param {Status} currentStatus current status\n */\nvar reloadApp = function reloadApp(_ref, currentStatus) {\n  var hot = _ref.hot,\n    liveReload = _ref.liveReload;\n  if (currentStatus.isUnloading) {\n    return;\n  }\n  var currentHash = currentStatus.currentHash,\n    previousHash = currentStatus.previousHash;\n  var isInitial = currentHash.indexOf(/** @type {string} */previousHash) >= 0;\n  if (isInitial) {\n    return;\n  }\n\n  /**\n   * @param {Window} rootWindow root window\n   * @param {number} intervalId interval id\n   */\n  function applyReload(rootWindow, intervalId) {\n    clearInterval(intervalId);\n    _utils_log_js__WEBPACK_IMPORTED_MODULE_5__.log.info(\"App updated. Reloading...\");\n    rootWindow.location.reload();\n  }\n  var search = self.location.search.toLowerCase();\n  var allowToHot = search.indexOf(\"webpack-dev-server-hot=false\") === -1;\n  var allowToLiveReload = search.indexOf(\"webpack-dev-server-live-reload=false\") === -1;\n  if (hot && allowToHot) {\n    _utils_log_js__WEBPACK_IMPORTED_MODULE_5__.log.info(\"App hot update...\");\n    if (typeof EventTarget !== \"undefined\" && webpack_hot_emitter_js__WEBPACK_IMPORTED_MODULE_0__ instanceof EventTarget) {\n      var event = new CustomEvent(\"webpackHotUpdate\", {\n        detail: {\n          currentHash: currentStatus.currentHash\n        },\n        bubbles: true,\n        cancelable: false\n      });\n      webpack_hot_emitter_js__WEBPACK_IMPORTED_MODULE_0__.dispatchEvent(event);\n    } else {\n      webpack_hot_emitter_js__WEBPACK_IMPORTED_MODULE_0__.emit(\"webpackHotUpdate\", currentStatus.currentHash);\n    }\n    if (typeof self !== \"undefined\" && self.window) {\n      // broadcast update to window\n      self.postMessage(\"webpackHotUpdate\".concat(currentStatus.currentHash), \"*\");\n    }\n  }\n  // allow refreshing the page only if liveReload isn't disabled\n  else if (liveReload && allowToLiveReload) {\n    /** @type {Window} */\n    var rootWindow = self;\n\n    // use parent window for reload (in case we're in an iframe with no valid src)\n    var intervalId = self.setInterval(function () {\n      if (rootWindow.location.protocol !== \"about:\") {\n        // reload immediately if protocol is valid\n        applyReload(rootWindow, intervalId);\n      } else {\n        rootWindow = rootWindow.parent;\n        if (rootWindow.parent === rootWindow) {\n          // if parent equals current window we've reached the root which would continue forever, so trigger a reload anyways\n          applyReload(rootWindow, intervalId);\n        }\n      }\n    });\n  }\n};\nvar ansiRegex = new RegExp([\"[\\\\u001B\\\\u009B][[\\\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\\\d\\\\/#&.:=?%@~_]+)*|[a-zA-Z\\\\d]+(?:;[-a-zA-Z\\\\d\\\\/#&.:=?%@~_]*)*)?\\\\u0007)\", \"(?:(?:\\\\d{1,4}(?:;\\\\d{0,4})*)?[\\\\dA-PR-TZcf-nq-uy=><~]))\"].join(\"|\"), \"g\");\n\n/**\n * Strip [ANSI escape codes](https://en.wikipedia.org/wiki/ANSI_escape_code) from a string.\n * Adapted from code originally released by Sindre Sorhus\n * Licensed the MIT License\n * @param {string} string string\n * @returns {string} string without ansi\n */\nvar stripAnsi = function stripAnsi(string) {\n  if (typeof string !== \"string\") {\n    throw new TypeError(\"Expected a `string`, got `\".concat(_typeof(string), \"`\"));\n  }\n  return string.replace(ansiRegex, \"\");\n};\nvar onSocketMessage = {\n  hot: function hot() {\n    if (parsedResourceQuery.hot === \"false\") {\n      return;\n    }\n    options.hot = true;\n  },\n  liveReload: function liveReload() {\n    if (parsedResourceQuery[\"live-reload\"] === \"false\") {\n      return;\n    }\n    options.liveReload = true;\n  },\n  invalid: function invalid() {\n    _utils_log_js__WEBPACK_IMPORTED_MODULE_5__.log.info(\"App updated. Recompiling...\");\n\n    // Fixes #1042. overlay doesn't clear if errors are fixed but warnings remain.\n    if (options.overlay) {\n      overlay.send({\n        type: \"DISMISS\"\n      });\n    }\n    ;(0,_utils_sendMessage_js__WEBPACK_IMPORTED_MODULE_6__[\"default\"])(\"Invalid\");\n  },\n  /**\n   * @param {string} hash hash\n   */\n  hash: function hash(_hash) {\n    status.previousHash = status.currentHash;\n    status.currentHash = _hash;\n  },\n  logging: setAllLogLevel,\n  /**\n   * @param {boolean} value overlay value\n   */\n  overlay: function overlay(value) {\n    if (typeof document === \"undefined\") {\n      return;\n    }\n    options.overlay = value;\n    decodeOverlayOptions(options.overlay);\n  },\n  /**\n   * @param {number} value reconnect value\n   */\n  reconnect: function reconnect(value) {\n    if (parsedResourceQuery.reconnect === \"false\") {\n      return;\n    }\n    options.reconnect = value;\n  },\n  /**\n   * @param {boolean} value progress value\n   */\n  progress: function progress(value) {\n    options.progress = value;\n  },\n  /**\n   * @param {{ pluginName?: string, percent: string, msg: string }} data date with progress\n   */\n  \"progress-update\": function progressUpdate(data) {\n    if (options.progress) {\n      _utils_log_js__WEBPACK_IMPORTED_MODULE_5__.log.info(\"\".concat(data.pluginName ? \"[\".concat(data.pluginName, \"] \") : \"\").concat(data.percent, \"% - \").concat(data.msg, \".\"));\n    }\n    if ((0,_progress_js__WEBPACK_IMPORTED_MODULE_3__.isProgressSupported)() && typeof options.progress === \"string\") {\n      var progress = document.querySelector(\"wds-progress\");\n      if (!progress) {\n        (0,_progress_js__WEBPACK_IMPORTED_MODULE_3__.defineProgressElement)();\n        progress = document.createElement(\"wds-progress\");\n        document.body.appendChild(progress);\n      }\n      progress.setAttribute(\"progress\", data.percent);\n      progress.setAttribute(\"type\", options.progress);\n    }\n    ;(0,_utils_sendMessage_js__WEBPACK_IMPORTED_MODULE_6__[\"default\"])(\"Progress\", data);\n  },\n  \"still-ok\": function stillOk() {\n    _utils_log_js__WEBPACK_IMPORTED_MODULE_5__.log.info(\"Nothing changed.\");\n    if (options.overlay) {\n      overlay.send({\n        type: \"DISMISS\"\n      });\n    }\n    ;(0,_utils_sendMessage_js__WEBPACK_IMPORTED_MODULE_6__[\"default\"])(\"StillOk\");\n  },\n  ok: function ok() {\n    (0,_utils_sendMessage_js__WEBPACK_IMPORTED_MODULE_6__[\"default\"])(\"Ok\");\n    if (options.overlay) {\n      overlay.send({\n        type: \"DISMISS\"\n      });\n    }\n    reloadApp(options, status);\n  },\n  /**\n   * @param {string} file changed file\n   */\n  \"static-changed\": function staticChanged(file) {\n    _utils_log_js__WEBPACK_IMPORTED_MODULE_5__.log.info(\"\".concat(file ? \"\\\"\".concat(file, \"\\\"\") : \"Content\", \" from static directory was changed. Reloading...\"));\n    self.location.reload();\n  },\n  /**\n   * @param {Error[]} warnings warnings\n   * @param {{ preventReloading: boolean }=} params extra params\n   */\n  warnings: function warnings(_warnings, params) {\n    _utils_log_js__WEBPACK_IMPORTED_MODULE_5__.log.warn(\"Warnings while compiling.\");\n    var printableWarnings = _warnings.map(function (error) {\n      var _formatProblem = (0,_overlay_js__WEBPACK_IMPORTED_MODULE_2__.formatProblem)(\"warning\", error),\n        header = _formatProblem.header,\n        body = _formatProblem.body;\n      return \"\".concat(header, \"\\n\").concat(stripAnsi(body));\n    });\n    (0,_utils_sendMessage_js__WEBPACK_IMPORTED_MODULE_6__[\"default\"])(\"Warnings\", printableWarnings);\n    for (var i = 0; i < printableWarnings.length; i++) {\n      _utils_log_js__WEBPACK_IMPORTED_MODULE_5__.log.warn(printableWarnings[i]);\n    }\n    var overlayWarningsSetting = typeof options.overlay === \"boolean\" ? options.overlay : options.overlay && options.overlay.warnings;\n    if (overlayWarningsSetting) {\n      var warningsToDisplay = typeof overlayWarningsSetting === \"function\" ? _warnings.filter(overlayWarningsSetting) : _warnings;\n      if (warningsToDisplay.length) {\n        overlay.send({\n          type: \"BUILD_ERROR\",\n          level: \"warning\",\n          messages: _warnings\n        });\n      }\n    }\n    if (params && params.preventReloading) {\n      return;\n    }\n    reloadApp(options, status);\n  },\n  /**\n   * @param {Error[]} errors errors\n   */\n  errors: function errors(_errors) {\n    _utils_log_js__WEBPACK_IMPORTED_MODULE_5__.log.error(\"Errors while compiling. Reload prevented.\");\n    var printableErrors = _errors.map(function (error) {\n      var _formatProblem2 = (0,_overlay_js__WEBPACK_IMPORTED_MODULE_2__.formatProblem)(\"error\", error),\n        header = _formatProblem2.header,\n        body = _formatProblem2.body;\n      return \"\".concat(header, \"\\n\").concat(stripAnsi(body));\n    });\n    (0,_utils_sendMessage_js__WEBPACK_IMPORTED_MODULE_6__[\"default\"])(\"Errors\", printableErrors);\n    for (var i = 0; i < printableErrors.length; i++) {\n      _utils_log_js__WEBPACK_IMPORTED_MODULE_5__.log.error(printableErrors[i]);\n    }\n    var overlayErrorsSettings = typeof options.overlay === \"boolean\" ? options.overlay : options.overlay && options.overlay.errors;\n    if (overlayErrorsSettings) {\n      var errorsToDisplay = typeof overlayErrorsSettings === \"function\" ? _errors.filter(overlayErrorsSettings) : _errors;\n      if (errorsToDisplay.length) {\n        overlay.send({\n          type: \"BUILD_ERROR\",\n          level: \"error\",\n          messages: _errors\n        });\n      }\n    }\n  },\n  /**\n   * @param {Error} error error\n   */\n  error: function error(_error) {\n    _utils_log_js__WEBPACK_IMPORTED_MODULE_5__.log.error(_error);\n  },\n  close: function close() {\n    _utils_log_js__WEBPACK_IMPORTED_MODULE_5__.log.info(\"Disconnected!\");\n    if (options.overlay) {\n      overlay.send({\n        type: \"DISMISS\"\n      });\n    }\n    ;(0,_utils_sendMessage_js__WEBPACK_IMPORTED_MODULE_6__[\"default\"])(\"Close\");\n  }\n};\n\n/**\n * @param {{ protocol?: string, auth?: string, hostname?: string, port?: string, pathname?: string, search?: string, hash?: string, slashes?: boolean }} objURL object URL\n * @returns {string} formatted url\n */\nvar formatURL = function formatURL(objURL) {\n  var protocol = objURL.protocol || \"\";\n  if (protocol && protocol.slice(-1) !== \":\") {\n    protocol += \":\";\n  }\n  var auth = objURL.auth || \"\";\n  if (auth) {\n    auth = encodeURIComponent(auth);\n    auth = auth.replace(/%3A/i, \":\");\n    auth += \"@\";\n  }\n  var host = \"\";\n  if (objURL.hostname) {\n    host = auth + (objURL.hostname.indexOf(\":\") === -1 ? objURL.hostname : \"[\".concat(objURL.hostname, \"]\"));\n    if (objURL.port) {\n      host += \":\".concat(objURL.port);\n    }\n  }\n  var pathname = objURL.pathname || \"\";\n  if (objURL.slashes) {\n    host = \"//\".concat(host || \"\");\n    if (pathname && pathname.charAt(0) !== \"/\") {\n      pathname = \"/\".concat(pathname);\n    }\n  } else if (!host) {\n    host = \"\";\n  }\n  var search = objURL.search || \"\";\n  if (search && search.charAt(0) !== \"?\") {\n    search = \"?\".concat(search);\n  }\n  var hash = objURL.hash || \"\";\n  if (hash && hash.charAt(0) !== \"#\") {\n    hash = \"#\".concat(hash);\n  }\n  pathname = pathname.replace(/[?#]/g,\n  /**\n   * @param {string} match matched string\n   * @returns {string} encoded URI component\n   */\n  function (match) {\n    return encodeURIComponent(match);\n  });\n  search = search.replace(\"#\", \"%23\");\n  return \"\".concat(protocol).concat(host).concat(pathname).concat(search).concat(hash);\n};\n\n/**\n * @param {ParsedURL} parsedURL parsed URL\n * @returns {string} socket URL\n */\nvar createSocketURL = function createSocketURL(parsedURL) {\n  var hostname = parsedURL.hostname;\n\n  // Node.js module parses it as `::`\n  // `new URL(urlString, [baseURLString])` parses it as '[::]'\n  var isInAddrAny = hostname === \"0.0.0.0\" || hostname === \"::\" || hostname === \"[::]\";\n\n  // why do we need this check?\n  // hostname n/a for file protocol (example, when using electron, ionic)\n  // see: https://github.com/webpack/webpack-dev-server/pull/384\n  if (isInAddrAny && self.location.hostname && self.location.protocol.indexOf(\"http\") === 0) {\n    hostname = self.location.hostname;\n  }\n  var socketURLProtocol = parsedURL.protocol || self.location.protocol;\n\n  // When https is used in the app, secure web sockets are always necessary because the browser doesn't accept non-secure web sockets.\n  if (socketURLProtocol === \"auto:\" || hostname && isInAddrAny && self.location.protocol === \"https:\") {\n    socketURLProtocol = self.location.protocol;\n  }\n  socketURLProtocol = socketURLProtocol.replace(/^(?:http|.+-extension|file)/i, \"ws\");\n  var socketURLAuth = \"\";\n\n  // `new URL(urlString, [baseURLstring])` doesn't have `auth` property\n  // Parse authentication credentials in case we need them\n  if (parsedURL.username) {\n    socketURLAuth = parsedURL.username;\n\n    // Since HTTP basic authentication does not allow empty username,\n    // we only include password if the username is not empty.\n    if (parsedURL.password) {\n      // Result: <username>:<password>\n      socketURLAuth = socketURLAuth.concat(\":\", parsedURL.password);\n    }\n  }\n\n  // In case the host is a raw IPv6 address, it can be enclosed in\n  // the brackets as the brackets are needed in the final URL string.\n  // Need to remove those as url.format blindly adds its own set of brackets\n  // if the host string contains colons. That would lead to non-working\n  // double brackets (e.g. [[::]]) host\n  //\n  // All of these web socket url params are optionally passed in through resourceQuery,\n  // so we need to fall back to the default if they are not provided\n  var socketURLHostname = (hostname || self.location.hostname || \"localhost\").replace(/^\\[(.*)\\]$/, \"$1\");\n  var socketURLPort = parsedURL.port;\n  if (!socketURLPort || socketURLPort === \"0\") {\n    socketURLPort = self.location.port;\n  }\n\n  // If path is provided it'll be passed in via the resourceQuery as a\n  // query param so it has to be parsed out of the querystring in order for the\n  // client to open the socket to the correct location.\n  var socketURLPathname = \"/ws\";\n  if (parsedURL.pathname && !parsedURL.fromCurrentScript) {\n    socketURLPathname = parsedURL.pathname;\n  }\n  return formatURL({\n    protocol: socketURLProtocol,\n    auth: socketURLAuth,\n    hostname: socketURLHostname,\n    port: socketURLPort,\n    pathname: socketURLPathname,\n    slashes: true\n  });\n};\nvar socketURL = createSocketURL(parsedResourceQuery);\n(0,_socket_js__WEBPACK_IMPORTED_MODULE_4__[\"default\"])(socketURL, onSocketMessage, options.reconnect);\n\n\n//# sourceURL=webpack://unm-cs-512-obj/./node_modules/webpack-dev-server/client/index.js?\n}");

/***/ },

/***/ "./node_modules/webpack-dev-server/client/modules/logger/index.js"
/*!************************************************************************!*\
  !*** ./node_modules/webpack-dev-server/client/modules/logger/index.js ***!
  \************************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ __webpack_exports__default)\n/* harmony export */ });\n/******/ var __webpack_modules__ = ({\n\n/***/ \"./node_modules/webpack/lib/logging/Logger.js\":\n/*!****************************************************!*\\\n  !*** ./node_modules/webpack/lib/logging/Logger.js ***!\n  \\****************************************************/\n/***/ (function(module) {\n\n/*\n\tMIT License http://www.opensource.org/licenses/mit-license.php\n\tAuthor Tobias Koppers @sokra\n*/\n\n\n\nfunction _typeof(o) {\n  \"@babel/helpers - typeof\";\n\n  return _typeof = \"function\" == typeof (typeof Symbol !== \"undefined\" ? Symbol : function (i) { return i; }) && \"symbol\" == typeof (typeof Symbol !== \"undefined\" ? Symbol : function (i) { return i; }).iterator ? function (o) {\n    return typeof o;\n  } : function (o) {\n    return o && \"function\" == typeof (typeof Symbol !== \"undefined\" ? Symbol : function (i) { return i; }) && o.constructor === (typeof Symbol !== \"undefined\" ? Symbol : function (i) { return i; }) && o !== (typeof Symbol !== \"undefined\" ? Symbol : function (i) { return i; }).prototype ? \"symbol\" : typeof o;\n  }, _typeof(o);\n}\nfunction _toConsumableArray(r) {\n  return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread();\n}\nfunction _nonIterableSpread() {\n  throw new TypeError(\"Invalid attempt to spread non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.\");\n}\nfunction _unsupportedIterableToArray(r, a) {\n  if (r) {\n    if (\"string\" == typeof r) return _arrayLikeToArray(r, a);\n    var t = {}.toString.call(r).slice(8, -1);\n    return \"Object\" === t && r.constructor && (t = r.constructor.name), \"Map\" === t || \"Set\" === t ? Array.from(r) : \"Arguments\" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;\n  }\n}\nfunction _iterableToArray(r) {\n  if (\"undefined\" != typeof (typeof Symbol !== \"undefined\" ? Symbol : function (i) { return i; }) && null != r[(typeof Symbol !== \"undefined\" ? Symbol : function (i) { return i; }).iterator] || null != r[\"@@iterator\"]) return Array.from(r);\n}\nfunction _arrayWithoutHoles(r) {\n  if (Array.isArray(r)) return _arrayLikeToArray(r);\n}\nfunction _arrayLikeToArray(r, a) {\n  (null == a || a > r.length) && (a = r.length);\n  for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];\n  return n;\n}\nfunction _classCallCheck(a, n) {\n  if (!(a instanceof n)) throw new TypeError(\"Cannot call a class as a function\");\n}\nfunction _defineProperties(e, r) {\n  for (var t = 0; t < r.length; t++) {\n    var o = r[t];\n    o.enumerable = o.enumerable || !1, o.configurable = !0, \"value\" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o);\n  }\n}\nfunction _createClass(e, r, t) {\n  return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, \"prototype\", {\n    writable: !1\n  }), e;\n}\nfunction _toPropertyKey(t) {\n  var i = _toPrimitive(t, \"string\");\n  return \"symbol\" == _typeof(i) ? i : i + \"\";\n}\nfunction _toPrimitive(t, r) {\n  if (\"object\" != _typeof(t) || !t) return t;\n  var e = t[(typeof Symbol !== \"undefined\" ? Symbol : function (i) { return i; }).toPrimitive];\n  if (void 0 !== e) {\n    var i = e.call(t, r || \"default\");\n    if (\"object\" != _typeof(i)) return i;\n    throw new TypeError(\"@@toPrimitive must return a primitive value.\");\n  }\n  return (\"string\" === r ? String : Number)(t);\n}\nvar LogType = Object.freeze({\n  error: (/** @type {\"error\"} */\"error\"),\n  // message, c style arguments\n  warn: (/** @type {\"warn\"} */\"warn\"),\n  // message, c style arguments\n  info: (/** @type {\"info\"} */\"info\"),\n  // message, c style arguments\n  log: (/** @type {\"log\"} */\"log\"),\n  // message, c style arguments\n  debug: (/** @type {\"debug\"} */\"debug\"),\n  // message, c style arguments\n\n  trace: (/** @type {\"trace\"} */\"trace\"),\n  // no arguments\n\n  group: (/** @type {\"group\"} */\"group\"),\n  // [label]\n  groupCollapsed: (/** @type {\"groupCollapsed\"} */\"groupCollapsed\"),\n  // [label]\n  groupEnd: (/** @type {\"groupEnd\"} */\"groupEnd\"),\n  // [label]\n\n  profile: (/** @type {\"profile\"} */\"profile\"),\n  // [profileName]\n  profileEnd: (/** @type {\"profileEnd\"} */\"profileEnd\"),\n  // [profileName]\n\n  time: (/** @type {\"time\"} */\"time\"),\n  // name, time as [seconds, nanoseconds]\n\n  clear: (/** @type {\"clear\"} */\"clear\"),\n  // no arguments\n  status: (/** @type {\"status\"} */\"status\") // message, arguments\n});\nmodule.exports.LogType = LogType;\n\n/** @typedef {typeof LogType[keyof typeof LogType]} LogTypeEnum */\n/** @typedef {Map<string | undefined, [number, number]>} TimersMap */\n\nvar LOG_SYMBOL = (typeof Symbol !== \"undefined\" ? Symbol : function (i) { return i; })(\"webpack logger raw log method\");\nvar TIMERS_SYMBOL = (typeof Symbol !== \"undefined\" ? Symbol : function (i) { return i; })(\"webpack logger times\");\nvar TIMERS_AGGREGATES_SYMBOL = (typeof Symbol !== \"undefined\" ? Symbol : function (i) { return i; })(\"webpack logger aggregated times\");\n\n/** @typedef {EXPECTED_ANY[]} Args */\n/** @typedef {(type: LogTypeEnum, args?: Args) => void} LogFn */\n/** @typedef {(name: string | (() => string)) => WebpackLogger} GetChildLogger */\nvar WebpackLogger = /*#__PURE__*/function () {\n  /**\n   * Creates an instance of WebpackLogger.\n   * @param {LogFn} log log function\n   * @param {GetChildLogger} getChildLogger function to create child logger\n   */\n  function WebpackLogger(log, getChildLogger) {\n    _classCallCheck(this, WebpackLogger);\n    /** @type {LogFn} */\n    this[LOG_SYMBOL] = log;\n    /** @type {GetChildLogger} */\n    this.getChildLogger = getChildLogger;\n  }\n\n  /**\n   * Processes the provided arg.\n   * @param {Args} args args\n   */\n  return _createClass(WebpackLogger, [{\n    key: \"error\",\n    value: function error() {\n      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {\n        args[_key] = arguments[_key];\n      }\n      this[LOG_SYMBOL](LogType.error, args);\n    }\n\n    /**\n     * Processes the provided arg.\n     * @param {Args} args args\n     */\n  }, {\n    key: \"warn\",\n    value: function warn() {\n      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {\n        args[_key2] = arguments[_key2];\n      }\n      this[LOG_SYMBOL](LogType.warn, args);\n    }\n\n    /**\n     * Processes the provided arg.\n     * @param {Args} args args\n     */\n  }, {\n    key: \"info\",\n    value: function info() {\n      for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {\n        args[_key3] = arguments[_key3];\n      }\n      this[LOG_SYMBOL](LogType.info, args);\n    }\n\n    /**\n     * Processes the provided arg.\n     * @param {Args} args args\n     */\n  }, {\n    key: \"log\",\n    value: function log() {\n      for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {\n        args[_key4] = arguments[_key4];\n      }\n      this[LOG_SYMBOL](LogType.log, args);\n    }\n\n    /**\n     * Processes the provided arg.\n     * @param {Args} args args\n     */\n  }, {\n    key: \"debug\",\n    value: function debug() {\n      for (var _len5 = arguments.length, args = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {\n        args[_key5] = arguments[_key5];\n      }\n      this[LOG_SYMBOL](LogType.debug, args);\n    }\n\n    /**\n     * Processes the provided condition.\n     * @param {boolean=} condition condition\n     * @param {Args} args args\n     */\n  }, {\n    key: \"assert\",\n    value: function assert(condition) {\n      if (!condition) {\n        for (var _len6 = arguments.length, args = new Array(_len6 > 1 ? _len6 - 1 : 0), _key6 = 1; _key6 < _len6; _key6++) {\n          args[_key6 - 1] = arguments[_key6];\n        }\n        this[LOG_SYMBOL](LogType.error, args);\n      }\n    }\n  }, {\n    key: \"trace\",\n    value: function trace() {\n      this[LOG_SYMBOL](LogType.trace, [\"Trace\"]);\n    }\n  }, {\n    key: \"clear\",\n    value: function clear() {\n      this[LOG_SYMBOL](LogType.clear);\n    }\n\n    /**\n     * Processes the provided arg.\n     * @param {Args} args args\n     */\n  }, {\n    key: \"status\",\n    value: function status() {\n      for (var _len7 = arguments.length, args = new Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {\n        args[_key7] = arguments[_key7];\n      }\n      this[LOG_SYMBOL](LogType.status, args);\n    }\n\n    /**\n     * Processes the provided arg.\n     * @param {Args} args args\n     */\n  }, {\n    key: \"group\",\n    value: function group() {\n      for (var _len8 = arguments.length, args = new Array(_len8), _key8 = 0; _key8 < _len8; _key8++) {\n        args[_key8] = arguments[_key8];\n      }\n      this[LOG_SYMBOL](LogType.group, args);\n    }\n\n    /**\n     * Processes the provided arg.\n     * @param {Args} args args\n     */\n  }, {\n    key: \"groupCollapsed\",\n    value: function groupCollapsed() {\n      for (var _len9 = arguments.length, args = new Array(_len9), _key9 = 0; _key9 < _len9; _key9++) {\n        args[_key9] = arguments[_key9];\n      }\n      this[LOG_SYMBOL](LogType.groupCollapsed, args);\n    }\n  }, {\n    key: \"groupEnd\",\n    value: function groupEnd() {\n      this[LOG_SYMBOL](LogType.groupEnd);\n    }\n\n    /**\n     * Processes the provided label.\n     * @param {string=} label label\n     */\n  }, {\n    key: \"profile\",\n    value: function profile(label) {\n      this[LOG_SYMBOL](LogType.profile, [label]);\n    }\n\n    /**\n     * Processes the provided label.\n     * @param {string=} label label\n     */\n  }, {\n    key: \"profileEnd\",\n    value: function profileEnd(label) {\n      this[LOG_SYMBOL](LogType.profileEnd, [label]);\n    }\n\n    /**\n     * Processes the provided label.\n     * @param {string} label label\n     */\n  }, {\n    key: \"time\",\n    value: function time(label) {\n      /** @type {TimersMap} */\n      this[TIMERS_SYMBOL] = this[TIMERS_SYMBOL] || new Map();\n      this[TIMERS_SYMBOL].set(label, process.hrtime());\n    }\n\n    /**\n     * Processes the provided label.\n     * @param {string=} label label\n     */\n  }, {\n    key: \"timeLog\",\n    value: function timeLog(label) {\n      var prev = this[TIMERS_SYMBOL] && this[TIMERS_SYMBOL].get(label);\n      if (!prev) {\n        throw new Error(\"No such label '\".concat(label, \"' for WebpackLogger.timeLog()\"));\n      }\n      var time = process.hrtime(prev);\n      this[LOG_SYMBOL](LogType.time, [label].concat(_toConsumableArray(time)));\n    }\n\n    /**\n     * Processes the provided label.\n     * @param {string=} label label\n     */\n  }, {\n    key: \"timeEnd\",\n    value: function timeEnd(label) {\n      var prev = this[TIMERS_SYMBOL] && this[TIMERS_SYMBOL].get(label);\n      if (!prev) {\n        throw new Error(\"No such label '\".concat(label, \"' for WebpackLogger.timeEnd()\"));\n      }\n      var time = process.hrtime(prev);\n      /** @type {TimersMap} */\n      this[TIMERS_SYMBOL].delete(label);\n      this[LOG_SYMBOL](LogType.time, [label].concat(_toConsumableArray(time)));\n    }\n\n    /**\n     * Processes the provided label.\n     * @param {string=} label label\n     */\n  }, {\n    key: \"timeAggregate\",\n    value: function timeAggregate(label) {\n      var prev = this[TIMERS_SYMBOL] && this[TIMERS_SYMBOL].get(label);\n      if (!prev) {\n        throw new Error(\"No such label '\".concat(label, \"' for WebpackLogger.timeAggregate()\"));\n      }\n      var time = process.hrtime(prev);\n      /** @type {TimersMap} */\n      this[TIMERS_SYMBOL].delete(label);\n      /** @type {TimersMap} */\n      this[TIMERS_AGGREGATES_SYMBOL] = this[TIMERS_AGGREGATES_SYMBOL] || new Map();\n      var current = this[TIMERS_AGGREGATES_SYMBOL].get(label);\n      if (current !== undefined) {\n        if (time[1] + current[1] > 1e9) {\n          time[0] += current[0] + 1;\n          time[1] = time[1] - 1e9 + current[1];\n        } else {\n          time[0] += current[0];\n          time[1] += current[1];\n        }\n      }\n      this[TIMERS_AGGREGATES_SYMBOL].set(label, time);\n    }\n\n    /**\n     * Time aggregate end.\n     * @param {string=} label label\n     */\n  }, {\n    key: \"timeAggregateEnd\",\n    value: function timeAggregateEnd(label) {\n      if (this[TIMERS_AGGREGATES_SYMBOL] === undefined) return;\n      var time = this[TIMERS_AGGREGATES_SYMBOL].get(label);\n      if (time === undefined) return;\n      this[TIMERS_AGGREGATES_SYMBOL].delete(label);\n      this[LOG_SYMBOL](LogType.time, [label].concat(_toConsumableArray(time)));\n    }\n  }]);\n}();\nmodule.exports.Logger = WebpackLogger;\n\n/***/ }),\n\n/***/ \"./node_modules/webpack/lib/logging/createConsoleLogger.js\":\n/*!*****************************************************************!*\\\n  !*** ./node_modules/webpack/lib/logging/createConsoleLogger.js ***!\n  \\*****************************************************************/\n/***/ (function(module, __unused_webpack_exports, __nested_webpack_require_12648__) {\n\n/*\n\tMIT License http://www.opensource.org/licenses/mit-license.php\n\tAuthor Tobias Koppers @sokra\n*/\n\n\n\nfunction _slicedToArray(r, e) {\n  return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest();\n}\nfunction _nonIterableRest() {\n  throw new TypeError(\"Invalid attempt to destructure non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.\");\n}\nfunction _iterableToArrayLimit(r, l) {\n  var t = null == r ? null : \"undefined\" != typeof (typeof Symbol !== \"undefined\" ? Symbol : function (i) { return i; }) && r[(typeof Symbol !== \"undefined\" ? Symbol : function (i) { return i; }).iterator] || r[\"@@iterator\"];\n  if (null != t) {\n    var e,\n      n,\n      i,\n      u,\n      a = [],\n      f = !0,\n      o = !1;\n    try {\n      if (i = (t = t.call(r)).next, 0 === l) {\n        if (Object(t) !== t) return;\n        f = !1;\n      } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0);\n    } catch (r) {\n      o = !0, n = r;\n    } finally {\n      try {\n        if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;\n      } finally {\n        if (o) throw n;\n      }\n    }\n    return a;\n  }\n}\nfunction _arrayWithHoles(r) {\n  if (Array.isArray(r)) return r;\n}\nfunction _toConsumableArray(r) {\n  return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread();\n}\nfunction _nonIterableSpread() {\n  throw new TypeError(\"Invalid attempt to spread non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.\");\n}\nfunction _unsupportedIterableToArray(r, a) {\n  if (r) {\n    if (\"string\" == typeof r) return _arrayLikeToArray(r, a);\n    var t = {}.toString.call(r).slice(8, -1);\n    return \"Object\" === t && r.constructor && (t = r.constructor.name), \"Map\" === t || \"Set\" === t ? Array.from(r) : \"Arguments\" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;\n  }\n}\nfunction _iterableToArray(r) {\n  if (\"undefined\" != typeof (typeof Symbol !== \"undefined\" ? Symbol : function (i) { return i; }) && null != r[(typeof Symbol !== \"undefined\" ? Symbol : function (i) { return i; }).iterator] || null != r[\"@@iterator\"]) return Array.from(r);\n}\nfunction _arrayWithoutHoles(r) {\n  if (Array.isArray(r)) return _arrayLikeToArray(r);\n}\nfunction _arrayLikeToArray(r, a) {\n  (null == a || a > r.length) && (a = r.length);\n  for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];\n  return n;\n}\nfunction _typeof(o) {\n  \"@babel/helpers - typeof\";\n\n  return _typeof = \"function\" == typeof (typeof Symbol !== \"undefined\" ? Symbol : function (i) { return i; }) && \"symbol\" == typeof (typeof Symbol !== \"undefined\" ? Symbol : function (i) { return i; }).iterator ? function (o) {\n    return typeof o;\n  } : function (o) {\n    return o && \"function\" == typeof (typeof Symbol !== \"undefined\" ? Symbol : function (i) { return i; }) && o.constructor === (typeof Symbol !== \"undefined\" ? Symbol : function (i) { return i; }) && o !== (typeof Symbol !== \"undefined\" ? Symbol : function (i) { return i; }).prototype ? \"symbol\" : typeof o;\n  }, _typeof(o);\n}\nvar _require = __nested_webpack_require_12648__(/*! ./Logger */ \"./node_modules/webpack/lib/logging/Logger.js\"),\n  LogType = _require.LogType;\n\n/** @typedef {import(\"../../declarations/WebpackOptions\").FilterItemTypes} FilterItemTypes */\n/** @typedef {import(\"../../declarations/WebpackOptions\").FilterTypes} FilterTypes */\n/** @typedef {import(\"./Logger\").LogTypeEnum} LogTypeEnum */\n/** @typedef {import(\"./Logger\").Args} Args */\n\n/** @typedef {(item: string) => boolean} FilterFunction */\n/** @typedef {(value: string, type: LogTypeEnum, args?: Args) => void} LoggingFunction */\n\n/**\n * Defines the logger console type used by this module.\n * @typedef {object} LoggerConsole\n * @property {() => void} clear\n * @property {() => void} trace\n * @property {(...args: Args) => void} info\n * @property {(...args: Args) => void} log\n * @property {(...args: Args) => void} warn\n * @property {(...args: Args) => void} error\n * @property {(...args: Args) => void=} debug\n * @property {(...args: Args) => void=} group\n * @property {(...args: Args) => void=} groupCollapsed\n * @property {(...args: Args) => void=} groupEnd\n * @property {(...args: Args) => void=} status\n * @property {(...args: Args) => void=} profile\n * @property {(...args: Args) => void=} profileEnd\n * @property {(...args: Args) => void=} logTime\n */\n\n/**\n * Defines the logger options type used by this module.\n * @typedef {object} LoggerOptions\n * @property {false | true | \"none\" | \"error\" | \"warn\" | \"info\" | \"log\" | \"verbose\"} level loglevel\n * @property {FilterTypes | boolean} debug filter for debug logging\n * @property {LoggerConsole} console the console to log to\n */\n\n/**\n * Filter to function.\n * @param {FilterItemTypes} item an input item\n * @returns {FilterFunction | undefined} filter function\n */\nvar filterToFunction = function filterToFunction(item) {\n  if (typeof item === \"string\") {\n    var regExp = new RegExp(\"[\\\\\\\\/]\".concat(item.replace(/[-[\\]{}()*+?.\\\\^$|]/g, \"\\\\$&\"), \"([\\\\\\\\/]|$|!|\\\\?)\"));\n    return function (ident) {\n      return regExp.test(ident);\n    };\n  }\n  if (item && _typeof(item) === \"object\" && typeof item.test === \"function\") {\n    return function (ident) {\n      return item.test(ident);\n    };\n  }\n  if (typeof item === \"function\") {\n    return item;\n  }\n  if (typeof item === \"boolean\") {\n    return function () {\n      return item;\n    };\n  }\n};\n\n/**\n * Enumerates the available values.\n * @enum {number}\n */\nvar LogLevel = {\n  none: 6,\n  false: 6,\n  error: 5,\n  warn: 4,\n  info: 3,\n  log: 2,\n  true: 2,\n  verbose: 1\n};\n\n/**\n * Returns logging function.\n * @param {LoggerOptions} options options object\n * @returns {LoggingFunction} logging function\n */\nmodule.exports = function (_ref) {\n  var _ref$level = _ref.level,\n    level = _ref$level === void 0 ? \"info\" : _ref$level,\n    _ref$debug = _ref.debug,\n    debug = _ref$debug === void 0 ? false : _ref$debug,\n    console = _ref.console;\n  var debugFilters = /** @type {FilterFunction[]} */\n\n  typeof debug === \"boolean\" ? [function () {\n    return debug;\n  }] : /** @type {FilterItemTypes[]} */_toConsumableArray(Array.isArray(debug) ? debug : [debug]).map(filterToFunction);\n  var loglevel = LogLevel[\"\".concat(level)] || 0;\n\n  /**\n   * Processes the provided name.\n   * @param {string} name name of the logger\n   * @param {LogTypeEnum} type type of the log entry\n   * @param {Args=} args arguments of the log entry\n   * @returns {void}\n   */\n  var logger = function logger(name, type, args) {\n    /**\n     * Returns labeled args.\n     * @template T\n     * @returns {[string?, ...T[]]} labeled args\n     */\n    var labeledArgs = function labeledArgs() {\n      if (Array.isArray(args)) {\n        if (args.length > 0 && typeof args[0] === \"string\") {\n          return [\"[\".concat(name, \"] \").concat(args[0])].concat(_toConsumableArray(args.slice(1)));\n        }\n        return [\"[\".concat(name, \"]\")].concat(_toConsumableArray(args));\n      }\n      return [];\n    };\n    var debug = debugFilters.some(function (f) {\n      return f(name);\n    });\n    switch (type) {\n      case LogType.debug:\n        if (!debug) return;\n        if (typeof console.debug === \"function\") {\n          console.debug.apply(console, _toConsumableArray(labeledArgs()));\n        } else {\n          console.log.apply(console, _toConsumableArray(labeledArgs()));\n        }\n        break;\n      case LogType.log:\n        if (!debug && loglevel > LogLevel.log) return;\n        console.log.apply(console, _toConsumableArray(labeledArgs()));\n        break;\n      case LogType.info:\n        if (!debug && loglevel > LogLevel.info) return;\n        console.info.apply(console, _toConsumableArray(labeledArgs()));\n        break;\n      case LogType.warn:\n        if (!debug && loglevel > LogLevel.warn) return;\n        console.warn.apply(console, _toConsumableArray(labeledArgs()));\n        break;\n      case LogType.error:\n        if (!debug && loglevel > LogLevel.error) return;\n        console.error.apply(console, _toConsumableArray(labeledArgs()));\n        break;\n      case LogType.trace:\n        if (!debug) return;\n        console.trace();\n        break;\n      case LogType.groupCollapsed:\n        if (!debug && loglevel > LogLevel.log) return;\n        if (!debug && loglevel > LogLevel.verbose) {\n          if (typeof console.groupCollapsed === \"function\") {\n            console.groupCollapsed.apply(console, _toConsumableArray(labeledArgs()));\n          } else {\n            console.log.apply(console, _toConsumableArray(labeledArgs()));\n          }\n          break;\n        }\n      // falls through\n      case LogType.group:\n        if (!debug && loglevel > LogLevel.log) return;\n        if (typeof console.group === \"function\") {\n          console.group.apply(console, _toConsumableArray(labeledArgs()));\n        } else {\n          console.log.apply(console, _toConsumableArray(labeledArgs()));\n        }\n        break;\n      case LogType.groupEnd:\n        if (!debug && loglevel > LogLevel.log) return;\n        if (typeof console.groupEnd === \"function\") {\n          console.groupEnd();\n        }\n        break;\n      case LogType.time:\n        {\n          if (!debug && loglevel > LogLevel.log) return;\n          var _args = _slicedToArray(/** @type {[string, number, number]} */\n            args, 3),\n            label = _args[0],\n            start = _args[1],\n            end = _args[2];\n          var ms = start * 1000 + end / 1000000;\n          var msg = \"[\".concat(name, \"] \").concat(label, \": \").concat(ms, \" ms\");\n          if (typeof console.logTime === \"function\") {\n            console.logTime(msg);\n          } else {\n            console.log(msg);\n          }\n          break;\n        }\n      case LogType.profile:\n        if (typeof console.profile === \"function\") {\n          console.profile.apply(console, _toConsumableArray(labeledArgs()));\n        }\n        break;\n      case LogType.profileEnd:\n        if (typeof console.profileEnd === \"function\") {\n          console.profileEnd.apply(console, _toConsumableArray(labeledArgs()));\n        }\n        break;\n      case LogType.clear:\n        if (!debug && loglevel > LogLevel.log) return;\n        if (typeof console.clear === \"function\") {\n          console.clear();\n        }\n        break;\n      case LogType.status:\n        if (!debug && loglevel > LogLevel.info) return;\n        if (typeof console.status === \"function\") {\n          if (!args || args.length === 0) {\n            console.status();\n          } else {\n            console.status.apply(console, _toConsumableArray(labeledArgs()));\n          }\n        } else if (args && args.length !== 0) {\n          console.info.apply(console, _toConsumableArray(labeledArgs()));\n        }\n        break;\n      default:\n        throw new Error(\"Unexpected LogType \".concat(type));\n    }\n  };\n  return logger;\n};\n\n/***/ }),\n\n/***/ \"./node_modules/webpack/lib/logging/runtime.js\":\n/*!*****************************************************!*\\\n  !*** ./node_modules/webpack/lib/logging/runtime.js ***!\n  \\*****************************************************/\n/***/ (function(module, __unused_webpack_exports, __nested_webpack_require_23935__) {\n\n/*\n\tMIT License http://www.opensource.org/licenses/mit-license.php\n\tAuthor Tobias Koppers @sokra\n*/\n\n\n\nfunction _extends() {\n  return _extends = Object.assign ? Object.assign.bind() : function (n) {\n    for (var e = 1; e < arguments.length; e++) {\n      var t = arguments[e];\n      for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);\n    }\n    return n;\n  }, _extends.apply(null, arguments);\n}\nvar _require = __nested_webpack_require_23935__(/*! tapable */ \"./client-src/modules/logger/tapable.js\"),\n  SyncBailHook = _require.SyncBailHook;\nvar _require2 = __nested_webpack_require_23935__(/*! ./Logger */ \"./node_modules/webpack/lib/logging/Logger.js\"),\n  Logger = _require2.Logger;\nvar createConsoleLogger = __nested_webpack_require_23935__(/*! ./createConsoleLogger */ \"./node_modules/webpack/lib/logging/createConsoleLogger.js\");\n\n/** @type {createConsoleLogger.LoggerOptions} */\nvar currentDefaultLoggerOptions = {\n  level: \"info\",\n  debug: false,\n  console: console\n};\nvar currentDefaultLogger = createConsoleLogger(currentDefaultLoggerOptions);\n\n/**\n * Processes the provided create console logger.logger option.\n * @param {createConsoleLogger.LoggerOptions} options new options, merge with old options\n * @returns {void}\n */\nmodule.exports.configureDefaultLogger = function (options) {\n  _extends(currentDefaultLoggerOptions, options);\n  currentDefaultLogger = createConsoleLogger(currentDefaultLoggerOptions);\n};\n\n/**\n * Returns a logger.\n * @param {string} name name of the logger\n * @returns {Logger} a logger\n */\nmodule.exports.getLogger = function (name) {\n  return new Logger(function (type, args) {\n    if (module.exports.hooks.log.call(name, type, args) === undefined) {\n      currentDefaultLogger(name, type, args);\n    }\n  }, function (childName) {\n    return module.exports.getLogger(\"\".concat(name, \"/\").concat(childName));\n  });\n};\nmodule.exports.hooks = {\n  log: new SyncBailHook([\"origin\", \"type\", \"args\"])\n};\n\n/***/ }),\n\n/***/ \"./client-src/modules/logger/tapable.js\":\n/*!**********************************************!*\\\n  !*** ./client-src/modules/logger/tapable.js ***!\n  \\**********************************************/\n/***/ (function(__unused_webpack___webpack_module__, __nested_webpack_exports__, __nested_webpack_require_26155__) {\n\n__nested_webpack_require_26155__.r(__nested_webpack_exports__);\n/* harmony export */ __nested_webpack_require_26155__.d(__nested_webpack_exports__, {\n/* harmony export */   SyncBailHook: function() { return /* binding */ SyncBailHook; }\n/* harmony export */ });\n/**\n * @returns {SyncBailHook} mocked sync bail hook\n * @constructor\n */\nfunction SyncBailHook() {\n  return {\n    call: function call() {}\n  };\n}\n\n/**\n * Client stub for tapable SyncBailHook\n */\n\n\n/***/ })\n\n/******/ });\n/************************************************************************/\n/******/ // The module cache\n/******/ var __webpack_module_cache__ = {};\n/******/ \n/******/ // The require function\n/******/ function __nested_webpack_require_26821__(moduleId) {\n/******/ \t// Check if module is in cache\n/******/ \tvar cachedModule = __webpack_module_cache__[moduleId];\n/******/ \tif (cachedModule !== undefined) {\n/******/ \t\treturn cachedModule.exports;\n/******/ \t}\n/******/ \t// Create a new module (and put it into the cache)\n/******/ \tvar module = __webpack_module_cache__[moduleId] = {\n/******/ \t\t// no module.id needed\n/******/ \t\t// no module.loaded needed\n/******/ \t\texports: {}\n/******/ \t};\n/******/ \n/******/ \t// Execute the module function\n/******/ \tif (!(moduleId in __webpack_modules__)) {\n/******/ \t\tdelete __webpack_module_cache__[moduleId];\n/******/ \t\tvar e = new Error(\"Cannot find module '\" + moduleId + \"'\");\n/******/ \t\te.code = 'MODULE_NOT_FOUND';\n/******/ \t\tthrow e;\n/******/ \t}\n/******/ \t__webpack_modules__[moduleId](module, module.exports, __nested_webpack_require_26821__);\n/******/ \n/******/ \t// Return the exports of the module\n/******/ \treturn module.exports;\n/******/ }\n/******/ \n/************************************************************************/\n/******/ /* webpack/runtime/define property getters */\n/******/ !function() {\n/******/ \t// define getter/value functions for harmony exports\n/******/ \t__nested_webpack_require_26821__.d = function(exports, definition) {\n/******/ \t\tif(Array.isArray(definition)) {\n/******/ \t\t\tvar i = 0;\n/******/ \t\t\twhile(i < definition.length) {\n/******/ \t\t\t\tvar key = definition[i++];\n/******/ \t\t\t\tvar binding = definition[i++];\n/******/ \t\t\t\tif(!__nested_webpack_require_26821__.o(exports, key)) {\n/******/ \t\t\t\t\tif(binding === 0) {\n/******/ \t\t\t\t\t\tObject.defineProperty(exports, key, { enumerable: true, value: definition[i++] });\n/******/ \t\t\t\t\t} else {\n/******/ \t\t\t\t\t\tObject.defineProperty(exports, key, { enumerable: true, get: binding });\n/******/ \t\t\t\t\t}\n/******/ \t\t\t\t} else if(binding === 0) { i++; }\n/******/ \t\t\t}\n/******/ \t\t} else {\n/******/ \t\t\tfor(var key in definition) {\n/******/ \t\t\t\tif(__nested_webpack_require_26821__.o(definition, key) && !__nested_webpack_require_26821__.o(exports, key)) {\n/******/ \t\t\t\t\tObject.defineProperty(exports, key, { enumerable: true, get: definition[key] });\n/******/ \t\t\t\t}\n/******/ \t\t\t}\n/******/ \t\t}\n/******/ \t};\n/******/ }();\n/******/ \n/******/ /* webpack/runtime/hasOwnProperty shorthand */\n/******/ !function() {\n/******/ \t__nested_webpack_require_26821__.o = function(obj, prop) { return Object.prototype.hasOwnProperty.call(obj, prop); }\n/******/ }();\n/******/ \n/******/ /* webpack/runtime/make namespace object */\n/******/ !function() {\n/******/ \t// define __esModule on exports\n/******/ \t__nested_webpack_require_26821__.r = function(exports) {\n/******/ \t\tif(typeof Symbol !== 'undefined' && Symbol.toStringTag) {\n/******/ \t\t\tObject.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });\n/******/ \t\t}\n/******/ \t\tObject.defineProperty(exports, '__esModule', { value: true });\n/******/ \t};\n/******/ }();\n/******/ \n/************************************************************************/\nvar __nested_webpack_exports__ = {};\n// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.\n!function() {\n/*!********************************************!*\\\n  !*** ./client-src/modules/logger/index.js ***!\n  \\********************************************/\n__nested_webpack_require_26821__.r(__nested_webpack_exports__);\n/* harmony export */ __nested_webpack_require_26821__.d(__nested_webpack_exports__, {\n/* harmony export */   \"default\": function() { return /* reexport default export from named module */ webpack_lib_logging_runtime_js__WEBPACK_IMPORTED_MODULE_0__; }\n/* harmony export */ });\n/* harmony import */ var webpack_lib_logging_runtime_js__WEBPACK_IMPORTED_MODULE_0__ = __nested_webpack_require_26821__(/*! webpack/lib/logging/runtime.js */ \"./node_modules/webpack/lib/logging/runtime.js\");\n// @ts-expect-error\n\n}();\nvar __webpack_exports__default = __nested_webpack_exports__[\"default\"];\n\n\n\n//# sourceURL=webpack://unm-cs-512-obj/./node_modules/webpack-dev-server/client/modules/logger/index.js?\n}");

/***/ },

/***/ "./node_modules/webpack-dev-server/client/overlay.js"
/*!***********************************************************!*\
  !*** ./node_modules/webpack-dev-server/client/overlay.js ***!
  \***********************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   createOverlay: () => (/* binding */ createOverlay),\n/* harmony export */   formatProblem: () => (/* binding */ formatProblem)\n/* harmony export */ });\n/* harmony import */ var ansi_html_community__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ansi-html-community */ \"./node_modules/ansi-html-community/index.js\");\nfunction _typeof(o) { \"@babel/helpers - typeof\"; return _typeof = \"function\" == typeof Symbol && \"symbol\" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && \"function\" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? \"symbol\" : typeof o; }, _typeof(o); }\nfunction ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }\nfunction _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }\nfunction _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }\nfunction _toPropertyKey(t) { var i = _toPrimitive(t, \"string\"); return \"symbol\" == _typeof(i) ? i : i + \"\"; }\nfunction _toPrimitive(t, r) { if (\"object\" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || \"default\"); if (\"object\" != _typeof(i)) return i; throw new TypeError(\"@@toPrimitive must return a primitive value.\"); } return (\"string\" === r ? String : Number)(t); }\n// The error overlay is inspired (and mostly copied) from Create React App (https://github.com/facebookincubator/create-react-app)\n// They, in turn, got inspired by webpack-hot-middleware (https://github.com/glenjamin/webpack-hot-middleware).\n\n;\n\n/** @typedef {import(\"./index.js\").EXPECTED_ANY} EXPECTED_ANY */\n\n/**\n * @type {(input: string, position: number) => number | undefined}\n */\n// @ts-expect-error\nvar getCodePoint = String.prototype.codePointAt ?\n// @ts-expect-error\nfunction (input, position) {\n  return input.codePointAt(position);\n} : function (input, position) {\n  return (input.charCodeAt(position) - 0xd800) * 0x400 + input.charCodeAt(position + 1) - 0xdc00 + 0x10000;\n};\n\n/**\n * @param {string} macroText macro text\n * @param {RegExp} macroRegExp macro reg exp\n * @param {(input: string) => string} macroReplacer macro replacer\n * @returns {string} result\n */\nvar replaceUsingRegExp = function replaceUsingRegExp(macroText, macroRegExp, macroReplacer) {\n  macroRegExp.lastIndex = 0;\n  var replaceMatch = macroRegExp.exec(macroText);\n  var replaceResult;\n  if (replaceMatch) {\n    replaceResult = \"\";\n    var replaceLastIndex = 0;\n    do {\n      if (replaceLastIndex !== replaceMatch.index) {\n        replaceResult += macroText.slice(replaceLastIndex, replaceMatch.index);\n      }\n      var replaceInput = replaceMatch[0];\n      replaceResult += macroReplacer(replaceInput);\n      replaceLastIndex = replaceMatch.index + replaceInput.length;\n    } while (replaceMatch = macroRegExp.exec(macroText));\n    if (replaceLastIndex !== macroText.length) {\n      replaceResult += macroText.slice(replaceLastIndex);\n    }\n  } else {\n    replaceResult = macroText;\n  }\n  return replaceResult;\n};\nvar references = {\n  \"<\": \"&lt;\",\n  \">\": \"&gt;\",\n  '\"': \"&quot;\",\n  \"'\": \"&apos;\",\n  \"&\": \"&amp;\"\n};\n\n/**\n * @param {string} text text\n * @returns {string} encoded text\n */\nfunction encode(text) {\n  if (!text) {\n    return \"\";\n  }\n  return replaceUsingRegExp(text, /[<>'\"&]/g, function (input) {\n    var result = references[(/** @type {keyof typeof references} */input)];\n    if (!result) {\n      var code = input.length > 1 ? getCodePoint(input, 0) : input.charCodeAt(0);\n      result = \"&#\".concat(code, \";\");\n    }\n    return result;\n  });\n}\n\n/**\n * @typedef {object} Context\n * @property {\"warning\" | \"error\"} level level\n * @property {(string | Message)[]} messages messages\n * @property {\"build\" | \"runtime\"} messageSource message source\n */\n\n/** @typedef {{ type: string } & Record<string, EXPECTED_ANY>} Event */\n\n/**\n * @typedef {object} Options\n * @property {{ [state: string]: { on: Record<string, { target: string, actions?: string[] }> } }} states states\n * @property {Context} context context\n * @property {string} initial initial\n */\n\n/**\n * @typedef {object} Implementation\n * @property {{ [actionName: string]: (ctx: Context, event: Event) => Context | void }} actions actions\n */\n\n/**\n * @typedef {{ send: (event: Event) => void }} StateMachine\n */\n\n/**\n * A simplified `createMachine` from `@xstate/fsm` with the following differences:\n * - the returned machine is technically a \"service\". No `interpret(machine).start()` is needed.\n * - the state definition only support `on` and target must be declared with { target: 'nextState', actions: [] } explicitly.\n * - event passed to `send` must be an object with `type` property.\n * - actions implementation will be [assign action](https://xstate.js.org/docs/guides/context.html#assign-action) if you return any value.\n * Do not return anything if you just want to invoke side effect.\n *\n * The goal of this custom function is to avoid installing the entire `'xstate/fsm'` package, while enabling modeling using\n * state machine. You can copy the first parameter into the editor at https://stately.ai/viz to visualize the state machine.\n * @param {Options} options options\n * @param {Implementation} implementation implementation\n * @returns {StateMachine} state machine\n */\nfunction createMachine(_ref, _ref2) {\n  var states = _ref.states,\n    context = _ref.context,\n    initial = _ref.initial;\n  var actions = _ref2.actions;\n  var currentState = initial;\n  var currentContext = context;\n  return {\n    send: function send(event) {\n      var currentStateOn = states[currentState].on;\n      var transitionConfig = currentStateOn && currentStateOn[event.type];\n      if (transitionConfig) {\n        currentState = transitionConfig.target;\n        if (transitionConfig.actions) {\n          transitionConfig.actions.forEach(function (actName) {\n            var actionImpl = actions[actName];\n            var nextContextValue = actionImpl && actionImpl(currentContext, event);\n            if (nextContextValue) {\n              currentContext = _objectSpread(_objectSpread({}, currentContext), nextContextValue);\n            }\n          });\n        }\n      }\n    }\n  };\n}\n\n/**\n * @typedef {object} ShowOverlayData\n * @property {\"warning\" | \"error\"} level level\n * @property {(string | Message)[]} messages messages\n * @property {\"build\" | \"runtime\"} messageSource message source\n */\n\n/**\n * @typedef {object} CreateOverlayMachineOptions\n * @property {(data: ShowOverlayData) => void} showOverlay show overlay\n * @property {() => void} hideOverlay hide overlay\n */\n\n/**\n * @param {CreateOverlayMachineOptions} options options\n * @returns {StateMachine} state machine\n */\nvar createOverlayMachine = function createOverlayMachine(options) {\n  var hideOverlay = options.hideOverlay,\n    showOverlay = options.showOverlay;\n  return createMachine({\n    initial: \"hidden\",\n    context: {\n      level: \"error\",\n      messages: [],\n      messageSource: \"build\"\n    },\n    states: {\n      hidden: {\n        on: {\n          BUILD_ERROR: {\n            target: \"displayBuildError\",\n            actions: [\"setMessages\", \"showOverlay\"]\n          },\n          RUNTIME_ERROR: {\n            target: \"displayRuntimeError\",\n            actions: [\"setMessages\", \"showOverlay\"]\n          }\n        }\n      },\n      displayBuildError: {\n        on: {\n          DISMISS: {\n            target: \"hidden\",\n            actions: [\"dismissMessages\", \"hideOverlay\"]\n          },\n          BUILD_ERROR: {\n            target: \"displayBuildError\",\n            actions: [\"appendMessages\", \"showOverlay\"]\n          }\n        }\n      },\n      displayRuntimeError: {\n        on: {\n          DISMISS: {\n            target: \"hidden\",\n            actions: [\"dismissMessages\", \"hideOverlay\"]\n          },\n          RUNTIME_ERROR: {\n            target: \"displayRuntimeError\",\n            actions: [\"appendMessages\", \"showOverlay\"]\n          },\n          BUILD_ERROR: {\n            target: \"displayBuildError\",\n            actions: [\"setMessages\", \"showOverlay\"]\n          }\n        }\n      }\n    }\n  }, {\n    actions: {\n      dismissMessages: function dismissMessages() {\n        return {\n          messages: [],\n          level: \"error\",\n          messageSource: \"build\"\n        };\n      },\n      appendMessages: function appendMessages(context, event) {\n        return {\n          messages: context.messages.concat(event.messages),\n          level: event.level || context.level,\n          messageSource: event.type === \"RUNTIME_ERROR\" ? \"runtime\" : \"build\"\n        };\n      },\n      setMessages: function setMessages(context, event) {\n        return {\n          messages: event.messages,\n          level: event.level || context.level,\n          messageSource: event.type === \"RUNTIME_ERROR\" ? \"runtime\" : \"build\"\n        };\n      },\n      hideOverlay: hideOverlay,\n      showOverlay: showOverlay\n    }\n  });\n};\n\n/**\n * @param {Error} error error\n * @returns {undefined | string[]} stack\n */\nvar parseErrorToStacks = function parseErrorToStacks(error) {\n  if (!error || !(error instanceof Error)) {\n    throw new Error(\"parseErrorToStacks expects Error object\");\n  }\n  if (typeof error.stack === \"string\") {\n    return error.stack.split(\"\\n\").filter(function (stack) {\n      return stack !== \"Error: \".concat(error.message);\n    });\n  }\n};\n\n/**\n * @callback ErrorCallback\n * @param {ErrorEvent} error\n * @returns {void}\n */\n\n/**\n * @param {ErrorCallback} callback callback\n * @returns {() => void} cleanup\n */\nvar listenToRuntimeError = function listenToRuntimeError(callback) {\n  window.addEventListener(\"error\", callback);\n  return function cleanup() {\n    window.removeEventListener(\"error\", callback);\n  };\n};\n\n/**\n * @callback UnhandledRejectionCallback\n * @param {PromiseRejectionEvent} rejectionEvent\n * @returns {void}\n */\n\n/**\n * @param {UnhandledRejectionCallback} callback callback\n * @returns {() => void} cleanup\n */\nvar listenToUnhandledRejection = function listenToUnhandledRejection(callback) {\n  window.addEventListener(\"unhandledrejection\", callback);\n  return function cleanup() {\n    window.removeEventListener(\"unhandledrejection\", callback);\n  };\n};\n\n// Styles are inspired by `react-error-overlay`\n\nvar msgStyles = {\n  error: {\n    backgroundColor: \"rgba(206, 17, 38, 0.1)\",\n    color: \"#fccfcf\"\n  },\n  warning: {\n    backgroundColor: \"rgba(251, 245, 180, 0.1)\",\n    color: \"#fbf5b4\"\n  }\n};\nvar iframeStyle = {\n  position: \"fixed\",\n  top: \"0px\",\n  left: \"0px\",\n  right: \"0px\",\n  bottom: \"0px\",\n  width: \"100vw\",\n  height: \"100vh\",\n  border: \"none\",\n  \"z-index\": 9999999999\n};\nvar containerStyle = {\n  position: \"fixed\",\n  boxSizing: \"border-box\",\n  left: \"0px\",\n  top: \"0px\",\n  right: \"0px\",\n  bottom: \"0px\",\n  width: \"100vw\",\n  height: \"100vh\",\n  fontSize: \"large\",\n  padding: \"2rem 2rem 4rem 2rem\",\n  lineHeight: \"1.2\",\n  whiteSpace: \"pre-wrap\",\n  overflow: \"auto\",\n  backgroundColor: \"rgba(0, 0, 0, 0.9)\",\n  color: \"white\"\n};\nvar headerStyle = {\n  color: \"#e83b46\",\n  fontSize: \"2em\",\n  whiteSpace: \"pre-wrap\",\n  fontFamily: \"sans-serif\",\n  margin: \"0 2rem 2rem 0\",\n  flex: \"0 0 auto\",\n  maxHeight: \"50%\",\n  overflow: \"auto\"\n};\nvar dismissButtonStyle = {\n  color: \"#ffffff\",\n  lineHeight: \"1rem\",\n  fontSize: \"1.5rem\",\n  padding: \"1rem\",\n  cursor: \"pointer\",\n  position: \"absolute\",\n  right: \"0px\",\n  top: \"0px\",\n  backgroundColor: \"transparent\",\n  border: \"none\"\n};\nvar msgTypeStyle = {\n  color: \"#e83b46\",\n  fontSize: \"1.2em\",\n  marginBottom: \"1rem\",\n  fontFamily: \"sans-serif\"\n};\nvar msgTextStyle = {\n  lineHeight: \"1.5\",\n  fontSize: \"1rem\",\n  fontFamily: \"Menlo, Consolas, monospace\"\n};\n\n// ANSI HTML\n\nvar colors = {\n  reset: [\"transparent\", \"transparent\"],\n  black: \"181818\",\n  red: \"E36049\",\n  green: \"B3CB74\",\n  yellow: \"FFD080\",\n  blue: \"7CAFC2\",\n  magenta: \"7FACCA\",\n  cyan: \"C3C2EF\",\n  lightgrey: \"EBE7E3\",\n  darkgrey: \"6D7891\"\n};\nansi_html_community__WEBPACK_IMPORTED_MODULE_0__.setColors(colors);\n\n/** @typedef {Error & { file?: string, moduleName?: string, moduleIdentifier?: string, loc?: string, message?: string, stack?: string | string[] }} Message */\n\n/**\n * @param {string} type type\n * @param {string | Message} item item\n * @returns {{ header: string, body: string }} formatted problem\n */\nvar formatProblem = function formatProblem(type, item) {\n  var header = type === \"warning\" ? \"WARNING\" : \"ERROR\";\n  var body = \"\";\n  if (typeof item === \"string\") {\n    body += item;\n  } else {\n    var file = item.file || \"\";\n    var moduleName = item.moduleName ? item.moduleName.indexOf(\"!\") !== -1 ? \"\".concat(item.moduleName.replace(/^(\\s|\\S)*!/, \"\"), \" (\").concat(item.moduleName, \")\") : \"\".concat(item.moduleName) : \"\";\n    var loc = item.loc;\n    header += \"\".concat(moduleName || file ? \" in \".concat(moduleName ? \"\".concat(moduleName).concat(file ? \" (\".concat(file, \")\") : \"\") : file).concat(loc ? \" \".concat(loc) : \"\") : \"\");\n    body += item.message || \"\";\n  }\n  if (typeof item !== \"string\" && Array.isArray(item.stack)) {\n    item.stack.forEach(function (stack) {\n      if (typeof stack === \"string\") {\n        body += \"\\r\\n\".concat(stack);\n      }\n    });\n  }\n  return {\n    header: header,\n    body: body\n  };\n};\n\n/**\n * @typedef {object} CreateOverlayOptions\n * @property {(false | string)=} trustedTypesPolicyName trusted types policy name\n * @property {(boolean | ((error: Error) => void))=} catchRuntimeError runtime error catcher\n */\n\n/**\n * @param {CreateOverlayOptions} options options\n * @returns {StateMachine} overlay\n */\nvar createOverlay = function createOverlay(options) {\n  /** @type {HTMLIFrameElement | null | undefined} */\n  var iframeContainerElement;\n  /** @type {HTMLDivElement | null | undefined} */\n  var containerElement;\n  /** @type {HTMLDivElement | null | undefined} */\n  var headerElement;\n  /** @type {((element: HTMLDivElement) => void)[]} */\n  var onLoadQueue = [];\n  /** @type {Omit<TrustedTypePolicy, \"createScript\" | \"createScriptURL\"> | undefined} */\n  var overlayTrustedTypesPolicy;\n\n  /** @typedef {Extract<keyof CSSStyleDeclaration, \"string\">} CSSStyleDeclarationKeys */\n\n  /**\n   * @param {HTMLElement} element element\n   * @param {Partial<CSSStyleDeclaration>} style style\n   */\n  function applyStyle(element, style) {\n    Object.keys(style).forEach(function (prop) {\n      element.style[(/** @type {CSSStyleDeclarationKeys} */prop)] = /** @type {string} */\n      style[(/** @type {CSSStyleDeclarationKeys} */prop)];\n    });\n  }\n\n  /**\n   * @param {string | false | undefined} trustedTypesPolicyName trusted types police name\n   */\n  function createContainer(trustedTypesPolicyName) {\n    // Enable Trusted Types if they are available in the current browser.\n    if (window.trustedTypes) {\n      overlayTrustedTypesPolicy = window.trustedTypes.createPolicy(trustedTypesPolicyName || \"webpack-dev-server#overlay\", {\n        createHTML: function createHTML(value) {\n          return value;\n        }\n      });\n    }\n    iframeContainerElement = document.createElement(\"iframe\");\n    iframeContainerElement.id = \"webpack-dev-server-client-overlay\";\n    iframeContainerElement.src = \"about:blank\";\n    applyStyle(iframeContainerElement, iframeStyle);\n    iframeContainerElement.onload = function () {\n      var contentElement = /** @type {Document} */\n      (/** @type {HTMLIFrameElement} */\n      iframeContainerElement.contentDocument).createElement(\"div\");\n      containerElement = /** @type {Document} */\n      (/** @type {HTMLIFrameElement} */\n      iframeContainerElement.contentDocument).createElement(\"div\");\n      contentElement.id = \"webpack-dev-server-client-overlay-div\";\n      applyStyle(contentElement, containerStyle);\n      headerElement = document.createElement(\"div\");\n      headerElement.innerText = \"Compiled with problems:\";\n      applyStyle(headerElement, headerStyle);\n      var closeButtonElement = document.createElement(\"button\");\n      applyStyle(closeButtonElement, dismissButtonStyle);\n      closeButtonElement.innerText = \"×\";\n      closeButtonElement.ariaLabel = \"Dismiss\";\n      closeButtonElement.addEventListener(\"click\", function () {\n        // eslint-disable-next-line no-use-before-define\n        overlayService.send({\n          type: \"DISMISS\"\n        });\n      });\n      contentElement.appendChild(headerElement);\n      contentElement.appendChild(closeButtonElement);\n      contentElement.appendChild(containerElement);\n\n      /** @type {Document} */\n      (/** @type {HTMLIFrameElement} */\n      iframeContainerElement.contentDocument).body.appendChild(contentElement);\n      onLoadQueue.forEach(function (onLoad) {\n        onLoad(/** @type {HTMLDivElement} */contentElement);\n      });\n      onLoadQueue = [];\n\n      /** @type {HTMLIFrameElement} */\n      iframeContainerElement.onload = null;\n    };\n    document.body.appendChild(iframeContainerElement);\n  }\n\n  /**\n   * @param {(element: HTMLDivElement) => void} callback callback\n   * @param {string | false | undefined} trustedTypesPolicyName trusted types policy name\n   */\n  function ensureOverlayExists(callback, trustedTypesPolicyName) {\n    if (containerElement) {\n      // @ts-expect-error https://github.com/microsoft/TypeScript/issues/30024\n      containerElement.innerHTML = overlayTrustedTypesPolicy ? overlayTrustedTypesPolicy.createHTML(\"\") : \"\";\n      // Everything is ready, call the callback right away.\n      callback(containerElement);\n      return;\n    }\n    onLoadQueue.push(callback);\n    if (iframeContainerElement) {\n      return;\n    }\n    createContainer(trustedTypesPolicyName);\n  }\n\n  // Successful compilation.\n  /**\n   * @returns {void}\n   */\n  function hide() {\n    if (!iframeContainerElement) {\n      return;\n    }\n\n    // Clean up and reset internal state.\n    document.body.removeChild(iframeContainerElement);\n    iframeContainerElement = null;\n    containerElement = null;\n  }\n\n  // Compilation with errors (e.g. syntax error or missing modules).\n  /**\n   * @param {string} type type\n   * @param {(string | Message)[]} messages messages\n   * @param {undefined | false | string} trustedTypesPolicyName trusted types policy name\n   * @param {\"build\" | \"runtime\"} messageSource message source\n   */\n  function show(type, messages, trustedTypesPolicyName, messageSource) {\n    ensureOverlayExists(function () {\n      /** @type {HTMLDivElement} */\n      headerElement.innerText = messageSource === \"runtime\" ? \"Uncaught runtime errors:\" : \"Compiled with problems:\";\n      messages.forEach(function (message) {\n        var entryElement = document.createElement(\"div\");\n        var msgStyle = type === \"warning\" ? msgStyles.warning : msgStyles.error;\n        applyStyle(entryElement, _objectSpread(_objectSpread({}, msgStyle), {}, {\n          padding: \"1rem 1rem 1.5rem 1rem\"\n        }));\n        var typeElement = document.createElement(\"div\");\n        var _formatProblem = formatProblem(type, message),\n          header = _formatProblem.header,\n          body = _formatProblem.body;\n        typeElement.innerText = header;\n        applyStyle(typeElement, msgTypeStyle);\n        if (typeof message !== \"string\" && message.moduleIdentifier) {\n          applyStyle(typeElement, {\n            cursor: \"pointer\"\n          });\n          // element.dataset not supported in IE\n          typeElement.setAttribute(\"data-can-open\", \"true\");\n          typeElement.addEventListener(\"click\", function () {\n            fetch(\"/webpack-dev-server/open-editor?fileName=\".concat(message.moduleIdentifier));\n          });\n        }\n\n        // Make it look similar to our terminal.\n        var text = ansi_html_community__WEBPACK_IMPORTED_MODULE_0__(encode(body));\n        var messageTextNode = document.createElement(\"div\");\n        applyStyle(messageTextNode, msgTextStyle);\n\n        // @ts-expect-error https://github.com/microsoft/TypeScript/issues/30024\n        messageTextNode.innerHTML = overlayTrustedTypesPolicy ? overlayTrustedTypesPolicy.createHTML(text) : text;\n        entryElement.appendChild(typeElement);\n        entryElement.appendChild(messageTextNode);\n\n        /** @type {HTMLDivElement} */\n        containerElement.appendChild(entryElement);\n      });\n    }, trustedTypesPolicyName);\n  }\n\n  /** @type {(event: KeyboardEvent) => void} */\n  var handleEscapeKey;\n\n  /**\n   * @returns {void}\n   */\n\n  var hideOverlayWithEscCleanup = function hideOverlayWithEscCleanup() {\n    window.removeEventListener(\"keydown\", handleEscapeKey);\n    hide();\n  };\n  var overlayService = createOverlayMachine({\n    showOverlay: function showOverlay(_ref3) {\n      var _ref3$level = _ref3.level,\n        level = _ref3$level === void 0 ? \"error\" : _ref3$level,\n        messages = _ref3.messages,\n        messageSource = _ref3.messageSource;\n      return show(level, messages, options.trustedTypesPolicyName, messageSource);\n    },\n    hideOverlay: hideOverlayWithEscCleanup\n  });\n  /**\n   * ESC key press to dismiss the overlay.\n   * @param {KeyboardEvent} event Keydown event\n   */\n  handleEscapeKey = function handleEscapeKey(event) {\n    if (event.key === \"Escape\" || event.key === \"Esc\" || event.keyCode === 27) {\n      overlayService.send({\n        type: \"DISMISS\"\n      });\n    }\n  };\n  window.addEventListener(\"keydown\", handleEscapeKey);\n  if (options.catchRuntimeError) {\n    /**\n     * @param {Error | undefined} error error\n     * @param {string} fallbackMessage fallback message\n     */\n    var handleError = function handleError(error, fallbackMessage) {\n      var errorObject = error instanceof Error ? error : new Error(error || fallbackMessage, {\n        cause: error\n      });\n      var shouldDisplay = typeof options.catchRuntimeError === \"function\" ? options.catchRuntimeError(errorObject) : true;\n      if (shouldDisplay) {\n        overlayService.send({\n          type: \"RUNTIME_ERROR\",\n          messages: [{\n            message: errorObject.message,\n            stack: parseErrorToStacks(errorObject)\n          }]\n        });\n      }\n    };\n    listenToRuntimeError(function (errorEvent) {\n      // error property may be empty in older browser like IE\n      var error = errorEvent.error,\n        message = errorEvent.message;\n      if (!error && !message) {\n        return;\n      }\n\n      // if error stack indicates a React error boundary caught the error, do not show overlay.\n      if (error && error.stack && error.stack.includes(\"invokeGuardedCallbackDev\")) {\n        return;\n      }\n      handleError(error, message);\n    });\n    listenToUnhandledRejection(function (promiseRejectionEvent) {\n      var reason = promiseRejectionEvent.reason;\n      handleError(reason, \"Unknown promise rejection reason\");\n    });\n  }\n  return overlayService;\n};\n\n\n//# sourceURL=webpack://unm-cs-512-obj/./node_modules/webpack-dev-server/client/overlay.js?\n}");

/***/ },

/***/ "./node_modules/webpack-dev-server/client/progress.js"
/*!************************************************************!*\
  !*** ./node_modules/webpack-dev-server/client/progress.js ***!
  \************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   defineProgressElement: () => (/* binding */ defineProgressElement),\n/* harmony export */   isProgressSupported: () => (/* binding */ isProgressSupported)\n/* harmony export */ });\nfunction _typeof(o) { \"@babel/helpers - typeof\"; return _typeof = \"function\" == typeof Symbol && \"symbol\" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && \"function\" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? \"symbol\" : typeof o; }, _typeof(o); }\nfunction _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError(\"Cannot call a class as a function\"); }\nfunction _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, \"value\" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }\nfunction _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, \"prototype\", { writable: !1 }), e; }\nfunction _toPropertyKey(t) { var i = _toPrimitive(t, \"string\"); return \"symbol\" == _typeof(i) ? i : i + \"\"; }\nfunction _toPrimitive(t, r) { if (\"object\" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || \"default\"); if (\"object\" != _typeof(i)) return i; throw new TypeError(\"@@toPrimitive must return a primitive value.\"); } return (\"string\" === r ? String : Number)(t); }\nfunction _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }\nfunction _possibleConstructorReturn(t, e) { if (e && (\"object\" == _typeof(e) || \"function\" == typeof e)) return e; if (void 0 !== e) throw new TypeError(\"Derived constructors may only return object or undefined\"); return _assertThisInitialized(t); }\nfunction _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError(\"this hasn't been initialised - super() hasn't been called\"); return e; }\nfunction _inherits(t, e) { if (\"function\" != typeof e && null !== e) throw new TypeError(\"Super expression must either be null or a function\"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, \"prototype\", { writable: !1 }), e && _setPrototypeOf(t, e); }\nfunction _wrapNativeSuper(t) { var r = \"function\" == typeof Map ? new Map() : void 0; return _wrapNativeSuper = function _wrapNativeSuper(t) { if (null === t || !_isNativeFunction(t)) return t; if (\"function\" != typeof t) throw new TypeError(\"Super expression must either be null or a function\"); if (void 0 !== r) { if (r.has(t)) return r.get(t); r.set(t, Wrapper); } function Wrapper() { return _construct(t, arguments, _getPrototypeOf(this).constructor); } return Wrapper.prototype = Object.create(t.prototype, { constructor: { value: Wrapper, enumerable: !1, writable: !0, configurable: !0 } }), _setPrototypeOf(Wrapper, t); }, _wrapNativeSuper(t); }\nfunction _construct(t, e, r) { if (_isNativeReflectConstruct()) return Reflect.construct.apply(null, arguments); var o = [null]; o.push.apply(o, e); var p = new (t.bind.apply(t, o))(); return r && _setPrototypeOf(p, r.prototype), p; }\nfunction _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }\nfunction _isNativeFunction(t) { try { return -1 !== Function.toString.call(t).indexOf(\"[native code]\"); } catch (n) { return \"function\" == typeof t; } }\nfunction _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }\nfunction _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }\nfunction _classPrivateMethodInitSpec(e, a) { _checkPrivateRedeclaration(e, a), a.add(e); }\nfunction _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError(\"Cannot initialize the same private elements twice on an object\"); }\nfunction _assertClassBrand(e, t, n) { if (\"function\" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError(\"Private element is not present on this object\"); }\n/**\n * @returns {boolean} true when custom elements supported, otherwise false\n */\nfunction isProgressSupported() {\n  return \"customElements\" in self && Boolean(HTMLElement.prototype.attachShadow);\n}\n\n/**\n * @returns {void}\n */\nfunction defineProgressElement() {\n  var _WebpackDevServerProgress;\n  if (customElements.get(\"wds-progress\")) {\n    return;\n  }\n  var _WebpackDevServerProgress_brand = /*#__PURE__*/new WeakSet();\n  var WebpackDevServerProgress = /*#__PURE__*/function (_HTMLElement) {\n    function WebpackDevServerProgress() {\n      var _this;\n      _classCallCheck(this, WebpackDevServerProgress);\n      _this = _callSuper(this, WebpackDevServerProgress);\n      _classPrivateMethodInitSpec(_this, _WebpackDevServerProgress_brand);\n      _this.attachShadow({\n        mode: \"open\"\n      });\n      _this.maxDashOffset = -219.99078369140625;\n      _this.animationTimer = null;\n      return _this;\n    }\n    _inherits(WebpackDevServerProgress, _HTMLElement);\n    return _createClass(WebpackDevServerProgress, [{\n      key: \"connectedCallback\",\n      value: function connectedCallback() {\n        _assertClassBrand(_WebpackDevServerProgress_brand, this, _reset).call(this);\n      }\n    }, {\n      key: \"attributeChangedCallback\",\n      value:\n      /**\n       * @param {string} name name\n       * @param {string} oldValue old value\n       * @param {string} newValue new value\n       */\n      function attributeChangedCallback(name, oldValue, newValue) {\n        if (name === \"progress\") {\n          _assertClassBrand(_WebpackDevServerProgress_brand, this, _update).call(this, Number(newValue));\n        } else if (name === \"type\") {\n          _assertClassBrand(_WebpackDevServerProgress_brand, this, _reset).call(this);\n        }\n      }\n\n      /**\n       * @param {number} percent percent\n       */\n    }], [{\n      key: \"observedAttributes\",\n      get: function get() {\n        return [\"progress\", \"type\"];\n      }\n    }]);\n  }(/*#__PURE__*/_wrapNativeSuper(HTMLElement));\n  _WebpackDevServerProgress = WebpackDevServerProgress;\n  function _reset() {\n    var _this$getAttribute;\n    clearTimeout(this.animationTimer);\n    this.animationTimer = null;\n    var typeAttr = (_this$getAttribute = this.getAttribute(\"type\")) === null || _this$getAttribute === void 0 ? void 0 : _this$getAttribute.toLowerCase();\n    this.type = typeAttr === \"circular\" ? \"circular\" : \"linear\";\n    var innerHTML = this.type === \"circular\" ? _circularTemplate.call(_WebpackDevServerProgress) : _linearTemplate.call(_WebpackDevServerProgress);\n    /** @type {ShadowRoot} */\n    this.shadowRoot.innerHTML = innerHTML;\n    var progressValue = this.getAttribute(\"progress\");\n    this.initialProgress = progressValue ? Number(progressValue) : 0;\n    _assertClassBrand(_WebpackDevServerProgress_brand, this, _update).call(this, this.initialProgress);\n  }\n  function _circularTemplate() {\n    return \"\\n        <style>\\n        :host {\\n            width: 200px;\\n            height: 200px;\\n            position: fixed;\\n            right: 5%;\\n            top: 5%;\\n            pointer-events: none;\\n            transition: opacity .25s ease-in-out;\\n            z-index: 2147483645;\\n        }\\n\\n        circle {\\n            fill: #282d35;\\n        }\\n\\n        path {\\n            fill: rgba(0, 0, 0, 0);\\n            stroke: rgb(186, 223, 172);\\n            stroke-dasharray: 219.99078369140625;\\n            stroke-dashoffset: -219.99078369140625;\\n            stroke-width: 10;\\n            transform: rotate(90deg) translate(0px, -80px);\\n        }\\n\\n        text {\\n            font-family: 'Open Sans', sans-serif;\\n            font-size: 18px;\\n            fill: #ffffff;\\n            dominant-baseline: middle;\\n            text-anchor: middle;\\n        }\\n\\n        tspan#percent-super {\\n            fill: #bdc3c7;\\n            font-size: 0.45em;\\n            baseline-shift: 10%;\\n        }\\n\\n        @keyframes fade {\\n            0% { opacity: 1; transform: scale(1); }\\n            100% { opacity: 0; transform: scale(0); }\\n        }\\n\\n        .disappear {\\n            animation: fade 0.3s;\\n            animation-fill-mode: forwards;\\n            animation-delay: 0.5s;\\n        }\\n\\n        .hidden {\\n            display: none;\\n        }\\n        </style>\\n        <svg id=\\\"progress\\\" class=\\\"hidden noselect\\\" viewBox=\\\"0 0 80 80\\\">\\n        <circle cx=\\\"50%\\\" cy=\\\"50%\\\" r=\\\"35\\\"></circle>\\n        <path d=\\\"M5,40a35,35 0 1,0 70,0a35,35 0 1,0 -70,0\\\"></path>\\n        <text x=\\\"50%\\\" y=\\\"51%\\\">\\n            <tspan id=\\\"percent-value\\\">0</tspan>\\n            <tspan id=\\\"percent-super\\\">%</tspan>\\n        </text>\\n        </svg>\\n      \";\n  }\n  function _linearTemplate() {\n    return \"\\n        <style>\\n        :host {\\n            position: fixed;\\n            top: 0;\\n            left: 0;\\n            pointer-events: none;\\n            height: 4px;\\n            width: 100vw;\\n            z-index: 2147483645;\\n        }\\n\\n        #bar {\\n            width: 0%;\\n            height: 4px;\\n            background-color: rgb(186, 223, 172);\\n        }\\n\\n        @keyframes fade {\\n            0% { opacity: 1; }\\n            100% { opacity: 0; }\\n        }\\n\\n        .disappear {\\n            animation: fade 0.3s;\\n            animation-fill-mode: forwards;\\n            animation-delay: 0.5s;\\n        }\\n\\n        .hidden {\\n            display: none;\\n        }\\n        </style>\\n        <div id=\\\"progress\\\"></div>\\n        \";\n  }\n  function _update(percent) {\n    var shadowRoot = /** @type {ShadowRoot} */this.shadowRoot;\n    var element = /** @type {HTMLElement} */\n    shadowRoot.querySelector(\"#progress\");\n    if (this.type === \"circular\") {\n      var path = /** @type {SVGPathElement} */\n      shadowRoot.querySelector(\"path\");\n      var value = /** @type {HTMLElement} */\n      shadowRoot.querySelector(\"#percent-value\");\n      var offset = (100 - percent) / 100 * this.maxDashOffset;\n      path.style.strokeDashoffset = String(offset);\n      value.textContent = String(percent);\n    } else {\n      element.style.width = \"\".concat(percent, \"%\");\n    }\n    if (percent >= 100) {\n      _assertClassBrand(_WebpackDevServerProgress_brand, this, _hide).call(this);\n    } else if (percent > 0) {\n      _assertClassBrand(_WebpackDevServerProgress_brand, this, _show).call(this);\n    }\n  }\n  function _show() {\n    var shadowRoot = /** @type {ShadowRoot} */this.shadowRoot;\n    var element = /** @type {HTMLElement} */\n    shadowRoot.querySelector(\"#progress\");\n    element.classList.remove(\"hidden\");\n  }\n  function _hide() {\n    var _this2 = this;\n    var shadowRoot = /** @type {ShadowRoot} */this.shadowRoot;\n    var element = /** @type {HTMLElement} */\n    shadowRoot.querySelector(\"#progress\");\n    if (this.type === \"circular\") {\n      element.classList.add(\"disappear\");\n      element.addEventListener(\"animationend\", function () {\n        element.classList.add(\"hidden\");\n        _assertClassBrand(_WebpackDevServerProgress_brand, _this2, _update).call(_this2, 0);\n      }, {\n        once: true\n      });\n    } else if (this.type === \"linear\") {\n      element.classList.add(\"disappear\");\n      this.animationTimer = setTimeout(function () {\n        element.classList.remove(\"disappear\");\n        element.classList.add(\"hidden\");\n        element.style.width = \"0%\";\n        _this2.animationTimer = null;\n      }, 800);\n    }\n  }\n  customElements.define(\"wds-progress\", WebpackDevServerProgress);\n}\n\n//# sourceURL=webpack://unm-cs-512-obj/./node_modules/webpack-dev-server/client/progress.js?\n}");

/***/ },

/***/ "./node_modules/webpack-dev-server/client/socket.js"
/*!**********************************************************!*\
  !*** ./node_modules/webpack-dev-server/client/socket.js ***!
  \**********************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   client: () => (/* binding */ client),\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var _clients_WebSocketClient_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./clients/WebSocketClient.js */ \"./node_modules/webpack-dev-server/client/clients/WebSocketClient.js\");\n/* harmony import */ var _utils_log_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils/log.js */ \"./node_modules/webpack-dev-server/client/utils/log.js\");\n/* provided dependency */ var __webpack_dev_server_client__ = __webpack_require__(/*! ./node_modules/webpack-dev-server/client/clients/WebSocketClient.js */ \"./node_modules/webpack-dev-server/client/clients/WebSocketClient.js\");\n/* global __webpack_dev_server_client__ */\n\n\n\n\n/** @typedef {import(\"./index.js\").EXPECTED_ANY} EXPECTED_ANY */\n/** @typedef {WebSocketClient} */\n\n// this WebsocketClient is here as a default fallback, in case the client is not injected\n/** @type {CommunicationClientConstructor} */\nvar Client = typeof __webpack_dev_server_client__ !== \"undefined\" ? typeof (/** @type {{ default: CommunicationClientConstructor }} */\n__webpack_dev_server_client__.default) !== \"undefined\" ? /** @type {{ default: CommunicationClientConstructor }} */\n__webpack_dev_server_client__.default : (/** @type {CommunicationClientConstructor} */\n__webpack_dev_server_client__) : _clients_WebSocketClient_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"];\nvar retries = 0;\nvar maxRetries = 10;\n\n// Initialized client is exported so external consumers can utilize the same instance\n// It is mutable to enforce singleton\n/** @type {CommunicationClient | null} */\n// eslint-disable-next-line import/no-mutable-exports\nvar client = null;\n\n/** @type {ReturnType<typeof setTimeout> | undefined} */\nvar timeout;\n\n/**\n * @param {string} url url\n * @param {{ [handler: string]: (data?: EXPECTED_ANY, params?: EXPECTED_ANY) => EXPECTED_ANY }} handlers handlers\n * @param {number=} reconnect count of reconnections\n */\nfunction socket(url, handlers, reconnect) {\n  client = new Client(url);\n  client.onOpen(function () {\n    retries = 0;\n    if (timeout) {\n      clearTimeout(timeout);\n    }\n    if (typeof reconnect !== \"undefined\") {\n      maxRetries = reconnect;\n    }\n  });\n  client.onClose(function () {\n    if (retries === 0) {\n      handlers.close();\n    }\n\n    // Try to reconnect.\n    client = null;\n\n    // After 10 retries stop trying, to prevent logspam.\n    if (retries < maxRetries) {\n      // Exponentially increase timeout to reconnect.\n      // Respectfully copied from the package `got`.\n      var retryInMs = 1000 * Math.pow(2, retries) + Math.random() * 100;\n      retries += 1;\n      _utils_log_js__WEBPACK_IMPORTED_MODULE_1__.log.info(\"Trying to reconnect...\");\n      timeout = setTimeout(function () {\n        socket(url, handlers, reconnect);\n      }, retryInMs);\n    }\n  });\n  client.onMessage(\n  /**\n   * @param {EXPECTED_ANY} data data\n   */\n  function (data) {\n    var message = JSON.parse(data);\n    if (handlers[message.type]) {\n      handlers[message.type](message.data, message.params);\n    }\n  });\n}\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (socket);\n\n//# sourceURL=webpack://unm-cs-512-obj/./node_modules/webpack-dev-server/client/socket.js?\n}");

/***/ },

/***/ "./node_modules/webpack-dev-server/client/utils/log.js"
/*!*************************************************************!*\
  !*** ./node_modules/webpack-dev-server/client/utils/log.js ***!
  \*************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   log: () => (/* binding */ log),\n/* harmony export */   setLogLevel: () => (/* binding */ setLogLevel)\n/* harmony export */ });\n/* harmony import */ var _modules_logger_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../modules/logger/index.js */ \"./node_modules/webpack-dev-server/client/modules/logger/index.js\");\n\nvar name = \"webpack-dev-server\";\n// default level is set on the client side, so it does not need\n// to be set by the CLI or API\nvar defaultLevel = \"info\";\n\n// options new options, merge with old options\n/**\n * @param {false | true | \"none\" | \"error\" | \"warn\" | \"info\" | \"log\" | \"verbose\"} level level\n * @returns {void}\n */\nfunction setLogLevel(level) {\n  _modules_logger_index_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"].configureDefaultLogger({\n    level: level\n  });\n}\nsetLogLevel(defaultLevel);\nvar log = _modules_logger_index_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"].getLogger(name);\n\n\n//# sourceURL=webpack://unm-cs-512-obj/./node_modules/webpack-dev-server/client/utils/log.js?\n}");

/***/ },

/***/ "./node_modules/webpack-dev-server/client/utils/sendMessage.js"
/*!*********************************************************************!*\
  !*** ./node_modules/webpack-dev-server/client/utils/sendMessage.js ***!
  \*********************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* global WorkerGlobalScope */\n\n/** @typedef {import(\"../index.js\").EXPECTED_ANY} EXPECTED_ANY */\n\n// Send messages to the outside, so plugins can consume it.\n/**\n * @param {string} type type\n * @param {EXPECTED_ANY=} data data\n */\nfunction sendMsg(type, data) {\n  if (typeof self !== \"undefined\" && (typeof WorkerGlobalScope === \"undefined\" || !(self instanceof WorkerGlobalScope))) {\n    self.postMessage({\n      type: \"webpack\".concat(type),\n      data: data\n    }, \"*\");\n  }\n}\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (sendMsg);\n\n//# sourceURL=webpack://unm-cs-512-obj/./node_modules/webpack-dev-server/client/utils/sendMessage.js?\n}");

/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	const __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		const cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		let module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		const execOptions = { id: moduleId, module: module, factory: __webpack_modules__[moduleId], require: __webpack_require__ };
/******/ 		__webpack_require__.i.forEach(function(handler) { handler(execOptions); });
/******/ 		if (!execOptions.factory) {
/******/ 			delete __webpack_module_cache__[moduleId];
/******/ 			const e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
/******/ 		module = execOptions.module;
/******/ 		execOptions.factory.call(module.exports, module, module.exports, execOptions.require);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = __webpack_module_cache__;
/******/ 	
/******/ 	// expose the module execution interceptor
/******/ 	__webpack_require__.i = [];
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	// define getter/value functions for harmony exports
/******/ 	__webpack_require__.d = (exports, definition) => {
/******/ 		for(var key in definition) {
/******/ 			if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 				Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 			}
/******/ 		}
/******/ 	};
/******/ 	
/******/ 	/* webpack/runtime/get javascript update chunk filename */
/******/ 	// This function allow to reference all chunks
/******/ 	__webpack_require__.hu = (chunkId) => (chunkId + "." + __webpack_require__.h() + ".hot-update.js");
/******/ 	
/******/ 	/* webpack/runtime/get update manifest filename */
/******/ 	__webpack_require__.hmrF = () => ("main." + __webpack_require__.h() + ".hot-update.json");
/******/ 	
/******/ 	/* webpack/runtime/getFullHash */
/******/ 	__webpack_require__.h = () => ("21ad7826ac6e69029f83");
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop));
/******/ 	
/******/ 	/* webpack/runtime/load script */
/******/ 	(() => {
/******/ 		const inProgress = {};
/******/ 		const dataWebpackPrefix = "unm-cs-512-obj:";
/******/ 		// loadScript function to load a script via script tag
/******/ 		__webpack_require__.l = (url, done, key, chunkId) => {
/******/ 			if(inProgress[url]) { inProgress[url].push(done); return; }
/******/ 			let script, needAttach;
/******/ 			if(key !== undefined) {
/******/ 				const scripts = document.getElementsByTagName("script");
/******/ 				for(var i = 0; i < scripts.length; i++) {
/******/ 					const s = scripts[i];
/******/ 					if(s.getAttribute("src") == url || s.getAttribute("data-webpack") == dataWebpackPrefix + key) { script = s; break; }
/******/ 				}
/******/ 			}
/******/ 			if(!script) {
/******/ 				needAttach = true;
/******/ 				script = document.createElement('script');
/******/ 		
/******/ 				script.charset = 'utf-8';
/******/ 				if (__webpack_require__.nc) {
/******/ 					script.setAttribute("nonce", __webpack_require__.nc);
/******/ 				}
/******/ 				script.setAttribute("data-webpack", dataWebpackPrefix + key);
/******/ 		
/******/ 				script.src = url;
/******/ 			}
/******/ 			inProgress[url] = [done];
/******/ 			const onScriptComplete = (prev, event) => {
/******/ 				// avoid mem leaks in IE.
/******/ 				script.onerror = script.onload = null;
/******/ 				clearTimeout(timeout);
/******/ 				const doneFns = inProgress[url];
/******/ 				delete inProgress[url];
/******/ 				script.parentNode?.removeChild(script);
/******/ 				doneFns?.forEach((fn) => (fn(event)));
/******/ 				if(prev) return prev(event);
/******/ 			}
/******/ 			const timeout = setTimeout(onScriptComplete.bind(null, undefined, { type: 'timeout', target: script }), 120000);
/******/ 			script.onerror = onScriptComplete.bind(null, script.onerror);
/******/ 			script.onload = onScriptComplete.bind(null, script.onload);
/******/ 			needAttach && document.head.appendChild(script);
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = (exports) => {
/******/ 		Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/ 	
/******/ 	/* webpack/runtime/hot module replacement */
/******/ 	(() => {
/******/ 		var currentModuleData = {};
/******/ 		var installedModules = __webpack_require__.c;
/******/ 		
/******/ 		// module and require creation
/******/ 		var currentChildModule;
/******/ 		var currentParents = [];
/******/ 		
/******/ 		// status
/******/ 		var registeredStatusHandlers = [];
/******/ 		var currentStatus = "idle";
/******/ 		
/******/ 		// while downloading
/******/ 		var blockingPromises = 0;
/******/ 		var blockingPromisesWaiting = [];
/******/ 		
/******/ 		// The update info
/******/ 		var currentUpdateApplyHandlers;
/******/ 		var queuedInvalidatedModules;
/******/ 		
/******/ 		__webpack_require__.hmrD = currentModuleData;
/******/ 		
/******/ 		__webpack_require__.i.push(function (options) {
/******/ 			var module = options.module;
/******/ 			var require = createRequire(options.require, options.id);
/******/ 			module.hot = createModuleHotObject(options.id, module);
/******/ 			module.parents = currentParents;
/******/ 			module.children = [];
/******/ 			currentParents = [];
/******/ 			options.require = require;
/******/ 		});
/******/ 		
/******/ 		__webpack_require__.hmrC = {};
/******/ 		__webpack_require__.hmrI = {};
/******/ 		
/******/ 		function createRequire(require, moduleId) {
/******/ 			var me = installedModules[moduleId];
/******/ 			if (!me) return require;
/******/ 			var fn = function (request) {
/******/ 				if (me.hot.active) {
/******/ 					if (installedModules[request]) {
/******/ 						var parents = installedModules[request].parents;
/******/ 						if (parents.indexOf(moduleId) === -1) {
/******/ 							parents.push(moduleId);
/******/ 						}
/******/ 					} else {
/******/ 						currentParents = [moduleId];
/******/ 						currentChildModule = request;
/******/ 					}
/******/ 					if (me.children.indexOf(request) === -1) {
/******/ 						me.children.push(request);
/******/ 					}
/******/ 				} else {
/******/ 					console.warn(
/******/ 						"[HMR] unexpected require(" +
/******/ 							request +
/******/ 							") from disposed module " +
/******/ 							moduleId
/******/ 					);
/******/ 					currentParents = [];
/******/ 				}
/******/ 				return require(request);
/******/ 			};
/******/ 			var createPropertyDescriptor = function (name) {
/******/ 				return {
/******/ 					configurable: true,
/******/ 					enumerable: true,
/******/ 					get: function () {
/******/ 						return require[name];
/******/ 					},
/******/ 					set: function (value) {
/******/ 						require[name] = value;
/******/ 					}
/******/ 				};
/******/ 			};
/******/ 			for (var name in require) {
/******/ 				if (
/******/ 					Object.prototype.hasOwnProperty.call(require, name) &&
/******/ 					name !== "e" &&
/******/ 					name !== "ei"
/******/ 				) {
/******/ 					Object.defineProperty(fn, name, createPropertyDescriptor(name));
/******/ 				}
/******/ 			}
/******/ 			// A chunk load blocks the update until it settles, and `.ei` is the analyzable
/******/ 			// half of `.e`. A runtime that loads no chunks has neither to wrap.
/******/ 			if (require.e) {
/******/ 				(fn).e = function (chunkId, fetchPriority) {
/******/ 					return trackBlockingPromise(
/******/ 						(require.e)(chunkId, fetchPriority)
/******/ 					);
/******/ 				};
/******/ 			}
/******/ 			if (require.ei) {
/******/ 				(fn).ei = function (chunkId, importFn) {
/******/ 					return trackBlockingPromise(
/******/ 						(require.ei)(chunkId, importFn)
/******/ 					);
/******/ 				};
/******/ 			}
/******/ 			return (fn);
/******/ 		}
/******/ 		
/******/ 		function createModuleHotObject(moduleId, me) {
/******/ 			var _main = currentChildModule !== moduleId;
/******/ 			var hot = {
/******/ 				// private stuff
/******/ 				_acceptedDependencies: {},
/******/ 				_acceptedErrorHandlers: {},
/******/ 				_declinedDependencies: {},
/******/ 				_selfAccepted: false,
/******/ 				_selfDeclined: false,
/******/ 				_selfInvalidated: false,
/******/ 				_disposeHandlers: [],
/******/ 				_main: _main,
/******/ 				_requireSelf: function () {
/******/ 					currentParents = me.parents.slice();
/******/ 					currentChildModule = _main ? undefined : moduleId;
/******/ 					__webpack_require__(moduleId);
/******/ 				},
/******/ 		
/******/ 				// Module API
/******/ 				active: true,
/******/ 				accept: function (dep, callback, errorHandler) {
/******/ 					if (dep === undefined) hot._selfAccepted = true;
/******/ 					else if (typeof dep === "function") hot._selfAccepted = dep;
/******/ 					else if (typeof dep === "object" && dep !== null) {
/******/ 						for (var i = 0; i < dep.length; i++) {
/******/ 							hot._acceptedDependencies[dep[i]] = callback || function () {};
/******/ 							hot._acceptedErrorHandlers[dep[i]] = errorHandler;
/******/ 						}
/******/ 					} else {
/******/ 						hot._acceptedDependencies[dep] = callback || function () {};
/******/ 						hot._acceptedErrorHandlers[dep] = errorHandler;
/******/ 					}
/******/ 				},
/******/ 				decline: function (dep) {
/******/ 					if (dep === undefined) hot._selfDeclined = true;
/******/ 					else if (typeof dep === "object" && dep !== null)
/******/ 						for (var i = 0; i < dep.length; i++)
/******/ 							hot._declinedDependencies[dep[i]] = true;
/******/ 					else hot._declinedDependencies[dep] = true;
/******/ 				},
/******/ 				dispose: function (callback) {
/******/ 					hot._disposeHandlers.push(callback);
/******/ 				},
/******/ 				addDisposeHandler: function (callback) {
/******/ 					hot._disposeHandlers.push(callback);
/******/ 				},
/******/ 				removeDisposeHandler: function (callback) {
/******/ 					var idx = hot._disposeHandlers.indexOf(callback);
/******/ 					if (idx >= 0) hot._disposeHandlers.splice(idx, 1);
/******/ 				},
/******/ 				invalidate: function () {
/******/ 					this._selfInvalidated = true;
/******/ 					switch (currentStatus) {
/******/ 						case "idle":
/******/ 							currentUpdateApplyHandlers = [];
/******/ 							Object.keys(__webpack_require__.hmrI).forEach(function (key) {
/******/ 								__webpack_require__.hmrI[key](
/******/ 									moduleId,
/******/ 									(currentUpdateApplyHandlers)
/******/ 								);
/******/ 							});
/******/ 							setStatus("ready");
/******/ 							break;
/******/ 						case "ready":
/******/ 							Object.keys(__webpack_require__.hmrI).forEach(function (key) {
/******/ 								__webpack_require__.hmrI[key](
/******/ 									moduleId,
/******/ 									(currentUpdateApplyHandlers)
/******/ 								);
/******/ 							});
/******/ 							break;
/******/ 						case "prepare":
/******/ 						case "check":
/******/ 						case "dispose":
/******/ 						case "apply":
/******/ 							(queuedInvalidatedModules = queuedInvalidatedModules || []).push(
/******/ 								moduleId
/******/ 							);
/******/ 							break;
/******/ 						default:
/******/ 							// ignore requests in error states
/******/ 							break;
/******/ 					}
/******/ 				},
/******/ 		
/******/ 				// Management API
/******/ 				check: hotCheck,
/******/ 				apply: hotApply,
/******/ 				status: function (l) {
/******/ 					if (!l) return currentStatus;
/******/ 					registeredStatusHandlers.push(l);
/******/ 				},
/******/ 				addStatusHandler: function (l) {
/******/ 					registeredStatusHandlers.push(l);
/******/ 				},
/******/ 				removeStatusHandler: function (l) {
/******/ 					var idx = registeredStatusHandlers.indexOf(l);
/******/ 					if (idx >= 0) registeredStatusHandlers.splice(idx, 1);
/******/ 				},
/******/ 		
/******/ 				// inherit from previous dispose call
/******/ 				data: currentModuleData[moduleId]
/******/ 			};
/******/ 			currentChildModule = undefined;
/******/ 			return hot;
/******/ 		}
/******/ 		
/******/ 		function setStatus(newStatus) {
/******/ 			currentStatus = newStatus;
/******/ 			var results = [];
/******/ 		
/******/ 			for (var i = 0; i < registeredStatusHandlers.length; i++)
/******/ 				results[i] = registeredStatusHandlers[i].call(null, newStatus);
/******/ 		
/******/ 			return Promise.all(results).then(function () {});
/******/ 		}
/******/ 		
/******/ 		function unblock() {
/******/ 			if (--blockingPromises === 0) {
/******/ 				setStatus("ready").then(function () {
/******/ 					if (blockingPromises === 0) {
/******/ 						var list = blockingPromisesWaiting;
/******/ 						blockingPromisesWaiting = [];
/******/ 						for (var i = 0; i < list.length; i++) {
/******/ 							list[i]();
/******/ 						}
/******/ 					}
/******/ 				});
/******/ 			}
/******/ 		}
/******/ 		
/******/ 		function trackBlockingPromise(promise) {
/******/ 			switch (currentStatus) {
/******/ 				case "ready":
/******/ 					setStatus("prepare");
/******/ 				/* fallthrough */
/******/ 				case "prepare":
/******/ 					blockingPromises++;
/******/ 					promise.then(unblock, unblock);
/******/ 					return promise;
/******/ 				default:
/******/ 					return promise;
/******/ 			}
/******/ 		}
/******/ 		
/******/ 		function waitForBlockingPromises(fn) {
/******/ 			if (blockingPromises === 0) return fn();
/******/ 			return (
/******/ 				new Promise(function (resolve) {
/******/ 					blockingPromisesWaiting.push(function () {
/******/ 						resolve(fn());
/******/ 					});
/******/ 				})
/******/ 			);
/******/ 		}
/******/ 		
/******/ 		function hotCheck(applyOnUpdate) {
/******/ 			if (currentStatus !== "idle") {
/******/ 				throw new Error("check() is only allowed in idle status");
/******/ 			}
/******/ 			return setStatus("check")
/******/ 				.then(__webpack_require__.hmrM)
/******/ 				.then(function (update) {
/******/ 					if (!update) {
/******/ 						return setStatus(applyInvalidatedModules() ? "ready" : "idle").then(
/******/ 							function () {
/******/ 								return null;
/******/ 							}
/******/ 						);
/******/ 					}
/******/ 		
/******/ 					return setStatus("prepare").then(function () {
/******/ 						var updatedModules = [];
/******/ 						currentUpdateApplyHandlers = [];
/******/ 		
/******/ 						return Promise.all(
/******/ 							Object.keys(__webpack_require__.hmrC).reduce(function (
/******/ 								promises,
/******/ 								key
/******/ 							) {
/******/ 								__webpack_require__.hmrC[key](
/******/ 									update.c,
/******/ 									update.r,
/******/ 									update.m,
/******/ 									promises,
/******/ 									(currentUpdateApplyHandlers),
/******/ 									updatedModules,
/******/ 									update.css,
/******/ 									update.f
/******/ 								);
/******/ 								return promises;
/******/ 							}, ([]))
/******/ 						).then(function () {
/******/ 							return waitForBlockingPromises(function () {
/******/ 								if (applyOnUpdate) {
/******/ 									return internalApply(applyOnUpdate);
/******/ 								}
/******/ 								return setStatus("ready").then(function () {
/******/ 									return updatedModules;
/******/ 								});
/******/ 							});
/******/ 						});
/******/ 					});
/******/ 				});
/******/ 		}
/******/ 		
/******/ 		function hotApply(options) {
/******/ 			if (currentStatus !== "ready") {
/******/ 				return Promise.resolve().then(function () {
/******/ 					throw new Error(
/******/ 						"apply() is only allowed in ready status (state: " +
/******/ 							currentStatus +
/******/ 							")"
/******/ 					);
/******/ 				});
/******/ 			}
/******/ 			return internalApply(options);
/******/ 		}
/******/ 		
/******/ 		function internalApply(options) {
/******/ 			options = options || {};
/******/ 		
/******/ 			applyInvalidatedModules();
/******/ 		
/******/ 			var results = (
/******/ 				currentUpdateApplyHandlers
/******/ 			).map(function (handler) {
/******/ 				return handler((options));
/******/ 			});
/******/ 			currentUpdateApplyHandlers = undefined;
/******/ 		
/******/ 			var errors = results
/******/ 				.map(function (r) {
/******/ 					return r.error;
/******/ 				})
/******/ 				.filter(Boolean);
/******/ 		
/******/ 			if (errors.length > 0) {
/******/ 				return setStatus("abort").then(function () {
/******/ 					throw errors[0];
/******/ 				});
/******/ 			}
/******/ 		
/******/ 			// Now in "dispose" phase
/******/ 			var disposePromise = setStatus("dispose");
/******/ 		
/******/ 			results.forEach(function (result) {
/******/ 				if (result.dispose) result.dispose();
/******/ 			});
/******/ 		
/******/ 			// Now in "apply" phase
/******/ 			var applyPromise = setStatus("apply");
/******/ 		
/******/ 			var error;
/******/ 			var reportError = function (err) {
/******/ 				if (!error) error = err;
/******/ 			};
/******/ 		
/******/ 			var outdatedModules = [];
/******/ 		
/******/ 			var onAccepted = function () {
/******/ 				return Promise.all([disposePromise, applyPromise]).then(function () {
/******/ 					// handle errors in accept handlers and self accepted module load
/******/ 					if (error) {
/******/ 						return setStatus("fail").then(function () {
/******/ 							throw error;
/******/ 						});
/******/ 					}
/******/ 		
/******/ 					if (queuedInvalidatedModules) {
/******/ 						return internalApply(options).then(function (list) {
/******/ 							outdatedModules.forEach(function (moduleId) {
/******/ 								if (list.indexOf(moduleId) < 0) list.push(moduleId);
/******/ 							});
/******/ 							return list;
/******/ 						});
/******/ 					}
/******/ 		
/******/ 					return setStatus("idle").then(function () {
/******/ 						return outdatedModules;
/******/ 					});
/******/ 				});
/******/ 			};
/******/ 		
/******/ 			return Promise.all(
/******/ 				results
/******/ 					.filter(function (result) {
/******/ 						return result.apply;
/******/ 					})
/******/ 					.map(function (result) {
/******/ 						return (result.apply)(reportError);
/******/ 					})
/******/ 			)
/******/ 				.then(function (applyResults) {
/******/ 					applyResults.forEach(function (modules) {
/******/ 						if (modules) {
/******/ 							for (var i = 0; i < modules.length; i++) {
/******/ 								outdatedModules.push(modules[i]);
/******/ 							}
/******/ 						}
/******/ 					});
/******/ 				})
/******/ 				.then(onAccepted);
/******/ 		}
/******/ 		
/******/ 		function applyInvalidatedModules() {
/******/ 			if (queuedInvalidatedModules) {
/******/ 				if (!currentUpdateApplyHandlers) currentUpdateApplyHandlers = [];
/******/ 				Object.keys(__webpack_require__.hmrI).forEach(function (key) {
/******/ 					(queuedInvalidatedModules).forEach(
/******/ 						function (moduleId) {
/******/ 							__webpack_require__.hmrI[key](
/******/ 								moduleId,
/******/ 								(currentUpdateApplyHandlers)
/******/ 							);
/******/ 						}
/******/ 					);
/******/ 				});
/******/ 				queuedInvalidatedModules = undefined;
/******/ 				return true;
/******/ 			}
/******/ 		}
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	__webpack_require__.p = "/dist/";
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		const installedChunks = __webpack_require__.hmrS_jsonp = __webpack_require__.hmrS_jsonp || {
/******/ 			"main": 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		let currentUpdatedModulesList;
/******/ 		const waitingUpdateResolves = {};
/******/ 		function loadUpdateChunk(chunkId, updatedModulesList) {
/******/ 			currentUpdatedModulesList = updatedModulesList;
/******/ 			return new Promise((resolve, reject) => {
/******/ 				waitingUpdateResolves[chunkId] = resolve;
/******/ 				// start update chunk loading
/******/ 				const url = __webpack_require__.p + __webpack_require__.hu(chunkId);
/******/ 				// create error before stack unwound to get useful stacktrace later
/******/ 				const error = new Error();
/******/ 				const loadingEnded = (event) => {
/******/ 					if(waitingUpdateResolves[chunkId]) {
/******/ 						waitingUpdateResolves[chunkId] = undefined
/******/ 						const errorType = event && (event.type === 'load' ? 'missing' : event.type);
/******/ 						const realSrc = event && event.target && event.target.src;
/******/ 						error.message = 'Loading hot update chunk ' + chunkId + ' failed.\n(' + errorType + ': ' + realSrc + ')';
/******/ 						error.name = 'ChunkLoadError';
/******/ 						error.type = errorType;
/******/ 						error.request = realSrc;
/******/ 						error.event = event;
/******/ 						reject(error);
/******/ 					}
/******/ 				};
/******/ 				__webpack_require__.l(url, loadingEnded);
/******/ 			});
/******/ 		}
/******/ 		
/******/ 		self["webpackHotUpdateunm_cs_512_obj"] = (chunkId, moreModules, runtime) => {
/******/ 			for(var moduleId in moreModules) {
/******/ 				if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 					currentUpdate[moduleId] = moreModules[moduleId];
/******/ 					currentUpdatedModulesList?.push(moduleId);
/******/ 				}
/******/ 			}
/******/ 			if(runtime) currentUpdateRuntime.push(runtime);
/******/ 			if(waitingUpdateResolves[chunkId]) {
/******/ 				waitingUpdateResolves[chunkId]();
/******/ 				waitingUpdateResolves[chunkId] = undefined;
/******/ 			}
/******/ 		};
/******/ 		
/******/ 		var currentUpdateChunks;
/******/ 		var currentUpdate;
/******/ 		var currentUpdateRemovedChunks;
/******/ 		var currentUpdateRuntime;
/******/ 		function applyHandler(options) {
/******/ 			if (__webpack_require__.f) delete __webpack_require__.f.jsonpHmr;
/******/ 			currentUpdateChunks = (
/******/ 				(undefined)
/******/ 			);
/******/ 			function getAffectedModuleEffects(updateModuleId) {
/******/ 				var outdatedModules = [updateModuleId];
/******/ 				var outdatedDependencies = {};
/******/ 		
/******/ 				var queue = outdatedModules.map(function (id) {
/******/ 					return {
/******/ 						chain: [id],
/******/ 						id: id
/******/ 					};
/******/ 				});
/******/ 				while (queue.length > 0) {
/******/ 					var queueItem = (queue.pop());
/******/ 					var moduleId = queueItem.id;
/******/ 					var chain = queueItem.chain;
/******/ 					var module = __webpack_require__.c[moduleId];
/******/ 					if (
/******/ 						!module ||
/******/ 						(module.hot._selfAccepted && !module.hot._selfInvalidated)
/******/ 					)
/******/ 						continue;
/******/ 					if (module.hot._selfDeclined) {
/******/ 						return {
/******/ 							type: "self-declined",
/******/ 							chain: chain,
/******/ 							moduleId: moduleId
/******/ 						};
/******/ 					}
/******/ 					if (module.hot._main) {
/******/ 						return {
/******/ 							type: "unaccepted",
/******/ 							chain: chain,
/******/ 							moduleId: moduleId
/******/ 						};
/******/ 					}
/******/ 					for (var i = 0; i < module.parents.length; i++) {
/******/ 						var parentId = module.parents[i];
/******/ 						var parent = __webpack_require__.c[parentId];
/******/ 						if (!parent) continue;
/******/ 						if (parent.hot._declinedDependencies[moduleId]) {
/******/ 							return {
/******/ 								type: "declined",
/******/ 								chain: chain.concat([parentId]),
/******/ 								moduleId: moduleId,
/******/ 								parentId: parentId
/******/ 							};
/******/ 						}
/******/ 						if (outdatedModules.indexOf(parentId) !== -1) continue;
/******/ 						if (parent.hot._acceptedDependencies[moduleId]) {
/******/ 							if (!outdatedDependencies[parentId])
/******/ 								outdatedDependencies[parentId] = [];
/******/ 							addAllToSet(outdatedDependencies[parentId], [moduleId]);
/******/ 							continue;
/******/ 						}
/******/ 						delete outdatedDependencies[parentId];
/******/ 						outdatedModules.push(parentId);
/******/ 						queue.push({
/******/ 							chain: chain.concat([parentId]),
/******/ 							id: parentId
/******/ 						});
/******/ 					}
/******/ 				}
/******/ 		
/******/ 				return {
/******/ 					type: "accepted",
/******/ 					moduleId: updateModuleId,
/******/ 					outdatedModules: outdatedModules,
/******/ 					outdatedDependencies: outdatedDependencies
/******/ 				};
/******/ 			}
/******/ 		
/******/ 			function addAllToSet(a, b) {
/******/ 				for (var i = 0; i < b.length; i++) {
/******/ 					var item = b[i];
/******/ 					if (a.indexOf(item) === -1) a.push(item);
/******/ 				}
/******/ 			}
/******/ 		
/******/ 			// at begin all updates modules are outdated
/******/ 			// the "outdated" status can propagate to parents if they don't accept the children
/******/ 			var outdatedDependencies = {};
/******/ 			var outdatedModules = [];
/******/ 			var appliedUpdate = {};
/******/ 		
/******/ 			var warnUnexpectedRequire = function warnUnexpectedRequire(module) {
/******/ 				console.warn(
/******/ 					"[HMR] unexpected require(" + module.id + ") to disposed module"
/******/ 				);
/******/ 			};
/******/ 		
/******/ 			for (var moduleId in currentUpdate) {
/******/ 				if (__webpack_require__.o(currentUpdate, moduleId)) {
/******/ 					var newModuleFactory = currentUpdate[moduleId];
/******/ 					var result = newModuleFactory
/******/ 						? getAffectedModuleEffects(moduleId)
/******/ 						: {
/******/ 								type: "disposed",
/******/ 								moduleId: moduleId
/******/ 							};
/******/ 					var abortError = false;
/******/ 					var doApply = false;
/******/ 					var doDispose = false;
/******/ 					var chainInfo = "";
/******/ 					if (result.chain) {
/******/ 						chainInfo = "\nUpdate propagation: " + result.chain.join(" -> ");
/******/ 					}
/******/ 					switch (result.type) {
/******/ 						case "self-declined":
/******/ 							if (options.onDeclined) options.onDeclined(result);
/******/ 							if (!options.ignoreDeclined)
/******/ 								abortError = new Error(
/******/ 									"Aborted because of self decline: " +
/******/ 										result.moduleId +
/******/ 										chainInfo
/******/ 								);
/******/ 							break;
/******/ 						case "declined":
/******/ 							if (options.onDeclined) options.onDeclined(result);
/******/ 							if (!options.ignoreDeclined)
/******/ 								abortError = new Error(
/******/ 									"Aborted because of declined dependency: " +
/******/ 										result.moduleId +
/******/ 										" in " +
/******/ 										result.parentId +
/******/ 										chainInfo
/******/ 								);
/******/ 							break;
/******/ 						case "unaccepted":
/******/ 							if (options.onUnaccepted) options.onUnaccepted(result);
/******/ 							if (!options.ignoreUnaccepted)
/******/ 								abortError = new Error(
/******/ 									"Aborted because " + moduleId + " is not accepted" + chainInfo
/******/ 								);
/******/ 							break;
/******/ 						case "accepted":
/******/ 							if (options.onAccepted) options.onAccepted(result);
/******/ 							doApply = true;
/******/ 							break;
/******/ 						case "disposed":
/******/ 							if (options.onDisposed) options.onDisposed(result);
/******/ 							doDispose = true;
/******/ 							break;
/******/ 						default:
/******/ 							throw new Error("Unexception type " + result.type);
/******/ 					}
/******/ 					if (abortError) {
/******/ 						return {
/******/ 							error: abortError
/******/ 						};
/******/ 					}
/******/ 					if (doApply) {
/******/ 						appliedUpdate[moduleId] = (
/******/ 							newModuleFactory
/******/ 						);
/******/ 						addAllToSet(
/******/ 							outdatedModules,
/******/ 							(result.outdatedModules)
/******/ 						);
/******/ 						var resultOutdatedDependencies =
/******/ 							(
/******/ 								result.outdatedDependencies
/******/ 							);
/******/ 						for (moduleId in resultOutdatedDependencies) {
/******/ 							if (__webpack_require__.o(resultOutdatedDependencies, moduleId)) {
/******/ 								if (!outdatedDependencies[moduleId])
/******/ 									outdatedDependencies[moduleId] = [];
/******/ 								addAllToSet(
/******/ 									outdatedDependencies[moduleId],
/******/ 									resultOutdatedDependencies[moduleId]
/******/ 								);
/******/ 							}
/******/ 						}
/******/ 					}
/******/ 					if (doDispose) {
/******/ 						addAllToSet(outdatedModules, [result.moduleId]);
/******/ 						appliedUpdate[moduleId] = warnUnexpectedRequire;
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 			currentUpdate = (
/******/ 				(undefined)
/******/ 			);
/******/ 		
/******/ 			// Store self accepted outdated modules to require them later by the module system
/******/ 			var outdatedSelfAcceptedModules = [];
/******/ 			for (var j = 0; j < outdatedModules.length; j++) {
/******/ 				var outdatedModuleId = outdatedModules[j];
/******/ 				var module = __webpack_require__.c[outdatedModuleId];
/******/ 				if (
/******/ 					module &&
/******/ 					(module.hot._selfAccepted || module.hot._main) &&
/******/ 					// removed self-accepted modules should not be required
/******/ 					appliedUpdate[outdatedModuleId] !== warnUnexpectedRequire &&
/******/ 					// when called invalidate self-accepting is not possible
/******/ 					!module.hot._selfInvalidated
/******/ 				) {
/******/ 					outdatedSelfAcceptedModules.push({
/******/ 						module: outdatedModuleId,
/******/ 						require: module.hot._requireSelf,
/******/ 						errorHandler: module.hot._selfAccepted
/******/ 					});
/******/ 				}
/******/ 			}
/******/ 		
/******/ 			var moduleOutdatedDependencies;
/******/ 		
/******/ 			return {
/******/ 				dispose: function () {
/******/ 					currentUpdateRemovedChunks.forEach(function (chunkId) {
/******/ 						delete installedChunks[chunkId];
/******/ 					});
/******/ 					currentUpdateRemovedChunks = (
/******/ 						(undefined)
/******/ 					);
/******/ 		
/******/ 					var idx;
/******/ 					var queue = outdatedModules.slice();
/******/ 					while (queue.length > 0) {
/******/ 						var moduleId = (queue.pop());
/******/ 						var module = __webpack_require__.c[moduleId];
/******/ 						if (!module) continue;
/******/ 		
/******/ 						var data = {};
/******/ 		
/******/ 						// Call dispose handlers
/******/ 						var disposeHandlers = module.hot._disposeHandlers;
/******/ 						for (j = 0; j < disposeHandlers.length; j++) {
/******/ 							disposeHandlers[j].call(null, data);
/******/ 						}
/******/ 						__webpack_require__.hmrD[moduleId] = data;
/******/ 		
/******/ 						// disable module (this disables requires from this module)
/******/ 						module.hot.active = false;
/******/ 		
/******/ 						// remove module from cache
/******/ 						delete __webpack_require__.c[moduleId];
/******/ 		
/******/ 						// when disposing there is no need to call dispose handler
/******/ 						delete outdatedDependencies[moduleId];
/******/ 		
/******/ 						// remove "parents" references from all children
/******/ 						for (j = 0; j < module.children.length; j++) {
/******/ 							var child = __webpack_require__.c[module.children[j]];
/******/ 							if (!child) continue;
/******/ 							idx = child.parents.indexOf(moduleId);
/******/ 							if (idx >= 0) {
/******/ 								child.parents.splice(idx, 1);
/******/ 							}
/******/ 						}
/******/ 					}
/******/ 		
/******/ 					// remove outdated dependency from module children
/******/ 					var dependency;
/******/ 					for (var outdatedModuleId in outdatedDependencies) {
/******/ 						if (__webpack_require__.o(outdatedDependencies, outdatedModuleId)) {
/******/ 							module = __webpack_require__.c[outdatedModuleId];
/******/ 							if (module) {
/******/ 								moduleOutdatedDependencies =
/******/ 									outdatedDependencies[outdatedModuleId];
/******/ 								for (j = 0; j < moduleOutdatedDependencies.length; j++) {
/******/ 									dependency = moduleOutdatedDependencies[j];
/******/ 									idx = module.children.indexOf(dependency);
/******/ 									if (idx >= 0) module.children.splice(idx, 1);
/******/ 								}
/******/ 							}
/******/ 						}
/******/ 					}
/******/ 				},
/******/ 				apply: function (reportError) {
/******/ 					var acceptPromises = [];
/******/ 					// insert new code
/******/ 					for (var updateModuleId in appliedUpdate) {
/******/ 						if (__webpack_require__.o(appliedUpdate, updateModuleId)) {
/******/ 							__webpack_require__.m[updateModuleId] = appliedUpdate[updateModuleId];
/******/ 						}
/******/ 					}
/******/ 		
/******/ 					// run new runtime modules
/******/ 					for (var i = 0; i < currentUpdateRuntime.length; i++) {
/******/ 						currentUpdateRuntime[i](__webpack_require__);
/******/ 					}
/******/ 		
/******/ 					// call accept handlers
/******/ 					for (var outdatedModuleId in outdatedDependencies) {
/******/ 						if (__webpack_require__.o(outdatedDependencies, outdatedModuleId)) {
/******/ 							var module = __webpack_require__.c[outdatedModuleId];
/******/ 							if (module) {
/******/ 								moduleOutdatedDependencies =
/******/ 									outdatedDependencies[outdatedModuleId];
/******/ 								var callbacks = [];
/******/ 								var errorHandlers = [];
/******/ 								var dependenciesForCallbacks = [];
/******/ 								for (var j = 0; j < moduleOutdatedDependencies.length; j++) {
/******/ 									var dependency = moduleOutdatedDependencies[j];
/******/ 									var acceptCallback =
/******/ 										module.hot._acceptedDependencies[dependency];
/******/ 									var errorHandler =
/******/ 										module.hot._acceptedErrorHandlers[dependency];
/******/ 									if (acceptCallback) {
/******/ 										if (callbacks.indexOf(acceptCallback) !== -1) continue;
/******/ 										callbacks.push(acceptCallback);
/******/ 										errorHandlers.push(errorHandler);
/******/ 										dependenciesForCallbacks.push(dependency);
/******/ 									}
/******/ 								}
/******/ 								for (var k = 0; k < callbacks.length; k++) {
/******/ 									var result;
/******/ 									try {
/******/ 										result = callbacks[k].call(null, moduleOutdatedDependencies);
/******/ 									} catch (err) {
/******/ 										if (typeof errorHandlers[k] === "function") {
/******/ 											try {
/******/ 												(errorHandlers[k])(err, {
/******/ 													moduleId: outdatedModuleId,
/******/ 													dependencyId: dependenciesForCallbacks[k]
/******/ 												});
/******/ 											} catch (err2) {
/******/ 												if (options.onErrored) {
/******/ 													options.onErrored({
/******/ 														type: "accept-error-handler-errored",
/******/ 														moduleId: outdatedModuleId,
/******/ 														dependencyId: dependenciesForCallbacks[k],
/******/ 														error: err2,
/******/ 														originalError: err
/******/ 													});
/******/ 												}
/******/ 												if (!options.ignoreErrored) {
/******/ 													reportError(err2);
/******/ 													reportError(err);
/******/ 												}
/******/ 											}
/******/ 										} else {
/******/ 											if (options.onErrored) {
/******/ 												options.onErrored({
/******/ 													type: "accept-errored",
/******/ 													moduleId: outdatedModuleId,
/******/ 													dependencyId: dependenciesForCallbacks[k],
/******/ 													error: err
/******/ 												});
/******/ 											}
/******/ 											if (!options.ignoreErrored) {
/******/ 												reportError(err);
/******/ 											}
/******/ 										}
/******/ 									}
/******/ 									if (
/******/ 										result &&
/******/ 										typeof ((result).then) ===
/******/ 											"function"
/******/ 									) {
/******/ 										acceptPromises.push((result));
/******/ 									}
/******/ 								}
/******/ 							}
/******/ 						}
/******/ 					}
/******/ 		
/******/ 					var onAccepted = function () {
/******/ 						// Load self accepted modules
/******/ 						for (var o = 0; o < outdatedSelfAcceptedModules.length; o++) {
/******/ 							var item = outdatedSelfAcceptedModules[o];
/******/ 							var moduleId = item.module;
/******/ 							try {
/******/ 								item.require(moduleId);
/******/ 							} catch (err) {
/******/ 								if (typeof item.errorHandler === "function") {
/******/ 									try {
/******/ 										item.errorHandler(err, {
/******/ 											moduleId: moduleId,
/******/ 											module: __webpack_require__.c[moduleId]
/******/ 										});
/******/ 									} catch (err1) {
/******/ 										if (options.onErrored) {
/******/ 											options.onErrored({
/******/ 												type: "self-accept-error-handler-errored",
/******/ 												moduleId: moduleId,
/******/ 												error: err1,
/******/ 												originalError: err
/******/ 											});
/******/ 										}
/******/ 										if (!options.ignoreErrored) {
/******/ 											reportError(err1);
/******/ 											reportError(err);
/******/ 										}
/******/ 									}
/******/ 								} else {
/******/ 									if (options.onErrored) {
/******/ 										options.onErrored({
/******/ 											type: "self-accept-errored",
/******/ 											moduleId: moduleId,
/******/ 											error: err
/******/ 										});
/******/ 									}
/******/ 									if (!options.ignoreErrored) {
/******/ 										reportError(err);
/******/ 									}
/******/ 								}
/******/ 							}
/******/ 						}
/******/ 					};
/******/ 		
/******/ 					return Promise.all(acceptPromises)
/******/ 						.then(onAccepted)
/******/ 						.then(function () {
/******/ 							return outdatedModules;
/******/ 						});
/******/ 				}
/******/ 			};
/******/ 		}
/******/ 		__webpack_require__.hmrI.jsonp = function (moduleId, applyHandlers) {
/******/ 			if (!currentUpdate) {
/******/ 				currentUpdate = {};
/******/ 				currentUpdateRuntime = [];
/******/ 				currentUpdateRemovedChunks = [];
/******/ 				applyHandlers.push(applyHandler);
/******/ 			}
/******/ 			if (!__webpack_require__.o(currentUpdate, moduleId)) {
/******/ 				currentUpdate[moduleId] = __webpack_require__.m[moduleId];
/******/ 			}
/******/ 		};
/******/ 		__webpack_require__.hmrC.jsonp = function (
/******/ 			chunkIds,
/******/ 			removedChunks,
/******/ 			removedModules,
/******/ 			promises,
/******/ 			applyHandlers,
/******/ 			updatedModulesList,
/******/ 			css,
/******/ 			forceLoadChunks
/******/ 		) {
/******/ 			applyHandlers.push(applyHandler);
/******/ 			currentUpdateChunks = {};
/******/ 			currentUpdateRemovedChunks = removedChunks;
/******/ 			currentUpdate = removedModules.reduce(function (obj, key) {
/******/ 				obj[key] = false;
/******/ 				return obj;
/******/ 			}, ({}));
/******/ 			currentUpdateRuntime = [];
/******/ 			chunkIds.forEach(function (chunkId) {
/******/ 				if (
/******/ 					__webpack_require__.o(installedChunks, chunkId) &&
/******/ 					installedChunks[chunkId] !== undefined
/******/ 				) {
/******/ 					promises.push(loadUpdateChunk(chunkId, updatedModulesList));
/******/ 					currentUpdateChunks[chunkId] = true;
/******/ 				} else {
/******/ 					currentUpdateChunks[chunkId] = false;
/******/ 				}
/******/ 			});
/******/ 			if (__webpack_require__.f) {
/******/ 				__webpack_require__.f.jsonpHmr = function (chunkId, promises) {
/******/ 					if (
/******/ 						currentUpdateChunks &&
/******/ 						__webpack_require__.o(currentUpdateChunks, chunkId) &&
/******/ 						!currentUpdateChunks[chunkId]
/******/ 					) {
/******/ 						promises.push(loadUpdateChunk(chunkId));
/******/ 						currentUpdateChunks[chunkId] = true;
/******/ 					}
/******/ 				};
/******/ 				// Force-load chunks that now own modules orphaned by a removed chunk;
/******/ 				// ensure handlers skip already-installed chunks, so no guard is needed.
/******/ 				if (forceLoadChunks) {
/******/ 					forceLoadChunks.forEach(function (chunkId) {
/******/ 						Object.keys(__webpack_require__.f).forEach(function (key) {
/******/ 							__webpack_require__.f[key](chunkId, promises);
/******/ 						});
/******/ 					});
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 		
/******/ 		__webpack_require__.hmrM = () => {
/******/ 			if (typeof fetch === "undefined") throw new Error("No browser support: need fetch API");
/******/ 			return fetch(__webpack_require__.p + __webpack_require__.hmrF()).then((response) => {
/******/ 				if(response.status === 404) return; // no update available
/******/ 				if(!response.ok) throw new Error("Failed to fetch update manifest " + response.statusText);
/******/ 				return response.json();
/******/ 			});
/******/ 		};
/******/ 		
/******/ 		// no on chunks loaded
/******/ 		
/******/ 		// no jsonp function
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// module cache are used so entry inlining is disabled
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	__webpack_require__("./node_modules/webpack-dev-server/client/index.js?protocol=ws%3A&hostname=0.0.0.0&port=8080&pathname=%2Fws&logging=info&overlay=true&reconnect=10&hot=true&live-reload=true");
/******/ 	__webpack_require__("./node_modules/webpack/hot/dev-server.js");
/******/ 	let __webpack_exports__ = __webpack_require__("./src/index.js");
/******/ 	
/******/ })()
;