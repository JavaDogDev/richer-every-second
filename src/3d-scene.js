import { Engine } from '@babylonjs/core/Engines/engine';
import { Scene } from '@babylonjs/core/scene';
import { Vector3, Color3 } from '@babylonjs/core/Maths/math';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { PointLight } from '@babylonjs/core/Lights/pointLight';
import { Mesh } from '@babylonjs/core/Meshes/mesh';

import '@babylonjs/core/Materials/standardMaterial';
import '@babylonjs/core/Meshes/meshBuilder';

import load3dModels from './load-3d-models';


export default function init3dScene() {
  const canvas = document.getElementById('babylon-container');
  const engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });

  function createScene() {
    const scene = new Scene(engine);
    scene.clearColor = new Color3(0.169, 0.286, 0.439);
    scene.ambientColor = new Color3(1, 1, 1);

    const camera = new ArcRotateCamera('camera', 0, 0, 10, new Vector3(0, 5, -10), scene);
    camera.setTarget(Vector3.Zero());
    camera.attachControl(canvas, false);

    const light = new PointLight('light', new Vector3(0, 5, -5), scene);
    light.intensity = 0.7;

    Mesh.CreateGround('ground', 6, 6, 2, scene, false);
    return scene;
  }
  const scene = createScene();

  engine.runRenderLoop(() => {
    scene.render();
  });

  // Load 3D models
  load3dModels(scene)
    .then((models) => {
      models.forEach((model, index) => {
        console.log(model, index);
      });
    })
    .catch(err => console.error(`Problem loading 3D models:\n${err}`));


  // Resize renderer on container resize
  function onResize() {
    engine.resize();
  }

  window.addEventListener('resize', onResize.bind(this), false);
  onResize();
}
