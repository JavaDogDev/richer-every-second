import * as BABYLON from '@babylonjs/core/Legacy/legacy';

import '@babylonjs/core/Materials/standardMaterial';
import '@babylonjs/core/Meshes/meshBuilder';

// import load3dModels from './load-3d-models';

export default function init3dScene() {
  const canvas = document.getElementById('babylon-container');
  const engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });

  function createScene() {
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.169, 0.286, 0.439);

    const camera = new BABYLON.FreeCamera('camera1', new BABYLON.Vector3(0, 5, -10), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, false);

    const light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    const sphere = BABYLON.Mesh.CreateSphere('sphere1', 16, 2, scene, false, BABYLON.Mesh.FRONTSIDE);
    sphere.position.y = 1;

    BABYLON.Mesh.CreateGround('ground1', 6, 6, 2, scene, false);
    return scene;
  }
  const scene = createScene();

  engine.runRenderLoop(() => {
    scene.render();
  });

  // Load 3D models
  // load3dModels()
  //   .then((models) => {
  //     console.log(models);
  //     models.forEach((model, index) => {
  //       scene.add(model);
  //       model.position.set(index * 2, 2, 0);
  //     });
  //   })
  //   .catch(err => console.error(`Problem loading 3D models:\n${err}`));


  // Resize renderer on container resize
  function onResize() {
    engine.resize();
  }

  window.addEventListener('resize', onResize.bind(this), false);
  onResize();
}
