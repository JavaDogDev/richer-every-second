import { Engine } from '@babylonjs/core/Engines/engine';
import { Scene } from '@babylonjs/core/scene';
import { Vector3, Color3 } from '@babylonjs/core/Maths/math';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { PhysicsImpostor } from '@babylonjs/core/Physics/physicsImpostor';
import { OimoJSPlugin } from '@babylonjs/core/Physics/Plugins/oimoJSPlugin';
import { PointLight } from '@babylonjs/core/Lights/pointLight';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { AxesViewer } from '@babylonjs/core/Debug/axesViewer';

import '@babylonjs/core/Physics/Plugins/cannonJSPlugin';

import '@babylonjs/core/Materials/standardMaterial';

import '@babylonjs/core/Debug/debugLayer';
import '@babylonjs/inspector';

import currentMoney from './current-money';
import load3dModels from './load-3d-models';

const COLLISION_GROUP = 1;

export default function init3dScene() {
  const canvas = document.getElementById('babylon-container');
  const engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });

  function createScene() {
    const scene = new Scene(engine);
    scene.clearColor = new Color3(0.169, 0.286, 0.439);
    scene.enablePhysics(new Vector3(0, -30, 0), new OimoJSPlugin());

    const camera = new ArcRotateCamera('camera', (-Math.PI / 2), 1.5, 185, new Vector3(0, 15, 100), scene);
    camera.attachControl(canvas, false);

    const light = new PointLight('light', new Vector3(0, 50, -50), scene);
    light.intensity = 0.9;

    const ground = MeshBuilder.CreateBox('ground', { size: 60, height: 5 }, scene);
    ground.physicsImpostor = new PhysicsImpostor(ground, PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.2 }, scene);
    ground.isVisible = false;
    ground.collisionGroup = COLLISION_GROUP;

    // build 4 containment walls around scene
    const walls = [];
    walls.push(new MeshBuilder.CreateBox('backWall', { width: 60, height: 100, depth: 5 }, scene));
    walls.push(new MeshBuilder.CreateBox('frontWall', { width: 60, height: 100, depth: 5 }, scene));
    walls.push(new MeshBuilder.CreateBox('leftWall', { width: 5, height: 100, depth: 60 }, scene));
    walls.push(new MeshBuilder.CreateBox('rightWall', { width: 5, height: 100, depth: 60 }, scene));
    walls[0].position.set(0, 50, 32);
    walls[1].position.set(0, 50, -32);
    walls[2].position.set(-32, 50, 0);
    walls[3].position.set(32, 50, 0);
    walls.forEach((wall) => {
      wall.physicsImpostor = new PhysicsImpostor(wall, PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.2 }, scene);
      wall.isVisible = false;
    });

    // eslint-disable-next-line no-unused-vars
    const axesViewer = new AxesViewer(scene, 100);

    return scene;
  }
  const scene = createScene();

  scene.debugLayer.show({
    overlay: true,
  });

  engine.runRenderLoop(() => {
    scene.render();
  });

  /** Map of currency value -> array of mesh objects active in scene */
  const activeModels = new Map();

  // Load 3D models
  load3dModels(scene)
    // Add/remove models as necessary
    .then((origMeshes) => {
      [...origMeshes.keys()].forEach(availableValue => activeModels.set(availableValue, []));
      scene.registerBeforeRender(updateActiveModels.bind(this, origMeshes, scene));
    })
    .catch(err => console.error(`Problem loading 3D models:\n${err}`));

  // Resize renderer on container resize
  function onResize() {
    engine.resize();
  }
  window.addEventListener('resize', onResize.bind(this), false);
  onResize();

  /** Adds new 3d money models to scene, removes unneeded ones */
  function updateActiveModels(origMeshes, sceneRef) {
    const valuesToShow = currentMoney.getChangeAmounts([...origMeshes.keys()]);

    // TODO nickels have a bug... just watch the screen
    [...activeModels.keys()].forEach((currencyValue) => {
      if (valuesToShow.get(currencyValue) < activeModels.get(currencyValue).length) {
        const numToDelete = activeModels.get(currencyValue).length - valuesToShow.get(currencyValue);
        const meshesToDelete = activeModels.get(currencyValue).splice(0, numToDelete);
        removeMoneyFromScene(meshesToDelete);
      } else if (valuesToShow.get(currencyValue) > activeModels.get(currencyValue).length) {
        const numToAdd = valuesToShow.get(currencyValue) - activeModels.get(currencyValue).length;
        const addedMeshes = addMoneyToScene(origMeshes.get(currencyValue), numToAdd, sceneRef);
        activeModels.set(currencyValue, [...activeModels.get(currencyValue), ...addedMeshes]);
      }
    });
  }

  function addMoneyToScene(origMesh, count, sceneRef) {
    const createdMeshes = [];
    for (let i = 0; i < count; i++) {
      const newInstance = origMesh.createInstance();
      newInstance.position.set(0, 10, 0);
      newInstance.physicsImpostor = new PhysicsImpostor(
        newInstance,
        PhysicsImpostor.CylinderImpostor,
        { mass: 25, restitution: 0.2, friction: 0.7 },
        sceneRef);
      createdMeshes.push(newInstance);
    }
    return createdMeshes;
  }

  function removeMoneyFromScene(meshes) {
    // disable collision
    // apply a little random spin
    // .dispose() mesh after 3 seconds
    meshes.forEach((mesh) => {
      // TODO disable collision somehow
      const randomSpin = new Vector3(rndNum(0, 5), rndNum(0, 5), rndNum(0, 5));
      mesh.physicsImpostor.applyImpulse(randomSpin, mesh.getAbsolutePosition().add(new Vector3(0, 3, 0)));
      setTimeout(mesh.dispose(), 3000);
    });
  }
}

function rndNum(min, max) {
  return Math.floor(Math.random() * max) + min;
}
