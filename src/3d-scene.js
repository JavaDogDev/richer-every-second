import '@babylonjs/core/Animations/animatable';
import '@babylonjs/core/Physics/physicsEngineComponent';
import { Engine } from '@babylonjs/core/Engines/engine';
import { Scene } from '@babylonjs/core/scene';
import { Vector3, Color3 } from '@babylonjs/core/Maths/math';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { PhysicsImpostor } from '@babylonjs/core/Physics/physicsImpostor';
import { OimoJSPlugin } from '@babylonjs/core/Physics/Plugins/oimoJSPlugin';
import { PointLight } from '@babylonjs/core/Lights/pointLight';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';

import currentMoney from './current-money';
import load3dModels from './load-3d-models';

export default function init3dScene() {
  const canvas = document.getElementById('babylon-container');
  const engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });

  function createScene() {
    const scene = new Scene(engine);
    scene.clearColor = new Color3(0.169, 0.286, 0.439);
    scene.enablePhysics(new Vector3(0, -65, 0), new OimoJSPlugin());

    const camera = new ArcRotateCamera('camera', (-Math.PI / 2), 1.5, 185, new Vector3(0, 15, 100), scene);
    camera.attachControl(canvas, false);

    const light = new PointLight('light', new Vector3(0, 50, -50), scene);
    light.intensity = 0.9;

    const ground = MeshBuilder.CreateBox('ground', { size: 60, height: 25 }, scene);
    ground.physicsImpostor = new PhysicsImpostor(ground, PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.2, friction: 1 }, scene);
    ground.isVisible = false;

    // build 4 containment walls around scene
    const walls = [];
    walls.push(new MeshBuilder.CreateBox('backWall', { width: 60, height: 100, depth: 25 }, scene));
    walls.push(new MeshBuilder.CreateBox('frontWall', { width: 60, height: 100, depth: 25 }, scene));
    walls.push(new MeshBuilder.CreateBox('leftWall', { width: 25, height: 100, depth: 60 }, scene));
    walls.push(new MeshBuilder.CreateBox('rightWall', { width: 25, height: 100, depth: 60 }, scene));
    walls[0].position.set(0, 50, 32);
    walls[1].position.set(0, 50, -32);
    walls[2].position.set(-32, 50, 0);
    walls[3].position.set(32, 50, 0);
    walls.forEach((wall) => {
      wall.physicsImpostor = new PhysicsImpostor(wall, PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.2, friction: 1 }, scene);
      wall.isVisible = false;
    });

    return scene;
  }
  const scene = createScene();

  engine.runRenderLoop(() => {
    scene.render();
  });

  /** Map of currency value -> array of mesh objects active in scene */
  const activeModels = new Map();

  // Load 3D models
  load3dModels(scene)
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

    [...activeModels.keys()].forEach((currencyValue) => {
      if (!valuesToShow.has(currencyValue)) {
        // Shouldn't be showing any of this currencyValue, remove all
        const meshesToDelete = activeModels.get(currencyValue).splice(0);
        removeMoneyFromScene(meshesToDelete);
      } else if (valuesToShow.get(currencyValue) < activeModels.get(currencyValue).length) {
        // Should be showing fewer of this currencyValue than we are, remove some
        const numToDelete = activeModels.get(currencyValue).length - valuesToShow.get(currencyValue);
        const meshesToDelete = activeModels.get(currencyValue).splice(0, numToDelete);
        removeMoneyFromScene(meshesToDelete);
      } else if (valuesToShow.get(currencyValue) > activeModels.get(currencyValue).length) {
        // Should be showing more than we are, add some
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
      newInstance.position.set(rndNum(-20, 20), rndNum(55, 75), rndNum(-20, 20));
      newInstance.physicsImpostor = new PhysicsImpostor(
        newInstance,
        PhysicsImpostor.CylinderImpostor,
        { mass: 25, restitution: 0.2, friction: 0.7 },
        sceneRef);
      const randomSpin = new Vector3(rndNum(0, 5), rndNum(0, 5), rndNum(0, 5));
      newInstance.physicsImpostor.applyImpulse(randomSpin, newInstance.getAbsolutePosition().add(new Vector3(0, 3, 0)));
      createdMeshes.push(newInstance);
    }
    return createdMeshes;
  }

  function removeMoneyFromScene(meshes) {
    meshes.forEach((mesh) => {
      // remove existing physics impostor and replace with a new one
      // that has a different set of collision flags
      mesh.physicsImpostor.dispose();
      mesh.physicsImpostor = new PhysicsImpostor(
        mesh,
        PhysicsImpostor.CylinderImpostor,
        { mass: 25, restitution: 0.2, friction: 0.7 },
        mesh.getScene());
      mesh.physicsImpostor.physicsBody.shapes.belongsTo = 4;
      mesh.physicsImpostor.physicsBody.shapes.collidesWith = 4;

      // Apply a random spin, then delete the object after a while
      const randomSpin = new Vector3(rndNum(0, 5), rndNum(0, 5), rndNum(0, 5));
      mesh.physicsImpostor.applyImpulse(randomSpin, mesh.getAbsolutePosition().add(new Vector3(0, 3, 0)));
      setTimeout(() => mesh.dispose(), 2500);
    });
  }
}

function rndNum(min, max) {
  return Math.floor(Math.random() * max) + min;
}
