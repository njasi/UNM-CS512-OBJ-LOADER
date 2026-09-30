import { Scene, Shader, objects, Controls } from "PotatoEngine";

// try to plug in new scene abstraction
const scene = new Scene("glcanvas");
scene.background = [0, 0, 0, 1];

scene.camera.move(0, 0, -2);

scene.addShader(
  new Shader(
    "basicVertex",
    scene.gl.VERTEX_SHADER,
    "",
    "./PotatoEngine/src/shaders/vertex.vert",
  ),
);

scene.addShader(
  new Shader(
    "basicFragment",
    scene.gl.FRAGMENT_SHADER,
    "",
    "./PotatoEngine/src/shaders/fragment.frag",
  ),
);

/**
 * Initalize all the objects in the starting scene
 * - 10 random barrels
 * - cannon
 * - pillar canon sits on
 * - water
 */
function initSceneObjects() {
  const teapot = objects.generateOBJObject("teapot", undefined, "teapot");
  teapot.position[1] = -1.5
  scene.addObject(teapot, "basic");
}

/**
 * Main init function
 * - load the scene shaders
 * - init all objects
 * - initialize buffers
 * - attach keyboard, mouse, input listeners
 * - start animation loop
 */
async function main() {
  await objects.cacheOBJ("./public/utah_teapot.obj", "teapot");
  await scene.loadShaders();

  scene.addProgram("basic", "basicVertex", "basicFragment");

  initSceneObjects();
  scene.initBuffers();

  Controls.BasicControls.setupMouseControls(scene);
  Controls.BasicControls.setupKeyboardControls(scene);

  setInterval(() => {

    scene.rotationX += Math.PI / 180 ;
    scene.rotationY += Math.PI / 180 ;
    scene.render();
  }, 30);
}

main();
