import { Engine } from '@babylonjs/core/Engines/engine';
import { Scene } from '@babylonjs/core/scene';
import { Vector3, Color3 } from '@babylonjs/core/Maths/math';
import { FreeCamera } from '@babylonjs/core/Cameras/freeCamera';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { Mesh } from '@babylonjs/core/Meshes/mesh';

import '@babylonjs/core/Materials/standardMaterial';
import '@babylonjs/core/Meshes/meshBuilder';

// import load3dModels from './load-3d-models';

export default function init3dScene() {
  const canvas = document.getElementById('babylon-container');
  const engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });

  function createScene() {
    const scene = new Scene(engine);
    scene.clearColor = new Color3(0.169, 0.286, 0.439);

    const camera = new FreeCamera('camera1', new Vector3(0, 5, -10), scene);
    camera.setTarget(Vector3.Zero());
    camera.attachControl(canvas, false);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    const sphere = Mesh.CreateSphere('sphere1', 16, 2, scene, false, Mesh.FRONTSIDE);
    sphere.position.y = 1;

    Mesh.CreateGround('ground1', 6, 6, 2, scene, false);
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
