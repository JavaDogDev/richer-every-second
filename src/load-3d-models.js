import { OBJFileLoader } from '@babylonjs/loaders/OBJ';
import { Vector3, Color3 } from '@babylonjs/core/Maths/math';
import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';

OBJFileLoader.MATERIAL_LOADING_FAILS_SILENTLY = true;

export default function load3dModels(scene) {
  const modelPaths = new Map();
  modelPaths.set('1c', '1c.obj');
  modelPaths.set('5c', '5c.obj');
  modelPaths.set('10c', '10c.obj');

  // const material = new StandardMaterial('coinMaterial', scene);
  // material.diffuseColor = new Color3(1, 0, 1);

  return Promise.all([...modelPaths.keys()].map(
    name => SceneLoader.ImportMeshAsync(null, '3d-models/', modelPaths.get(name), scene)
      .then((result) => {
        const mesh = result.meshes[0];
        mesh.scaling = new Vector3(0.2, 0.2, 0.2);
        mesh.position = new Vector3(0, 0, 0);
        mesh.addRotation(0, 180, 0);
        mesh.wireframe = true;
        return mesh;
      })
      .catch(err => console.error(`Error while loading 3D model '${name}':\n${err}`))));
}
