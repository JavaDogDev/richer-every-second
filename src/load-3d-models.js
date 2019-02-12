import { OBJFileLoader } from '@babylonjs/loaders/OBJ';
import { Vector3 } from '@babylonjs/core/Maths/math';
import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader';

OBJFileLoader.MATERIAL_LOADING_FAILS_SILENTLY = true;

export default function load3dModels(scene) {
  const modelPaths = new Map();
  modelPaths.set('1c', '1c.obj');
  modelPaths.set('5c', '5c.obj');
  modelPaths.set('10c', '10c.obj');

  return Promise.all([...modelPaths.keys()].map(
    name => SceneLoader.ImportMeshAsync(name, '3d-models/', modelPaths.get(name), scene)
      .then((result) => {
        const mesh = result.meshes[0];
        mesh.scaling = new Vector3(5, 5, 5);
        return mesh;
      })
      .catch(err => console.error(`Error while loading 3D model '${name}':\n${err}`))));
}
