import { Scene, Shader, objects, Controls } from "PotatoEngine";
import { common } from "PotatoEngine/src/materials";
import { rgb } from "PotatoEngine/src/objects";
const loader = document.getElementById("loader-wrapper");

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

scene.addShader(
  new Shader(
    "phongFragment",
    scene.gl.FRAGMENT_SHADER,
    "",
    "./PotatoEngine/src/shaders/phong.frag",
  ),
);

scene.addMaterial(
  common.generateMaterial("ceramic", {
    ka: [0.4, 0.4, 0.4],
    kd: [0.4, 0.4, 0.4],
    ks: [0.8, 0.8, 0.8],
    specularExp: 32,
  }),
  "phong",
);

/**
 * Initalize all the objects in the starting scene
 * - 10 random barrels
 * - cannon
 * - pillar canon sits on
 * - water
 */
function initSceneObjects(phong = true) {
  let color = undefined;
  let shader = "basic";
  let mat = undefined;

  if (phong) {
    color = rgb(200, 200, 200);
    shader = "phong";
    mat = "ceramic";
  }

  scene.removeObject("teapot");
  const teapot = objects.generateOBJObject("teapot", color, "teapot");
  teapot.position[1] = -1.5;
  scene.addObject(teapot, shader, mat);
}

let spin = true;
/**
 * init event listeners on the controls
 *
 */
function initHandlers() {
  document.getElementById("spincheck").addEventListener("input", (event) => {
    spin = event.target.checked;
  });

  document
    .getElementById("shaderSelector")
    .addEventListener("input", (event) => {
      initSceneObjects(event.target.value == "phong");
    });
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
  loader.className = "";
  scene.addProgram("basic", "basicVertex", "basicFragment");
  scene.addProgram("phong", "basicVertex", "phongFragment");

  scene.loadMaterials();

  initSceneObjects();
  scene.initBuffers();

  Controls.BasicControls.setupMouseControls(scene);
  Controls.BasicControls.setupKeyboardControls(scene);
  initHandlers();

  setInterval(() => {
    if (spin) {
      scene.rotationX += Math.PI / 180;
      scene.rotationY += Math.PI / 180;
    }
    scene.render();
  }, 30);
}

main();
