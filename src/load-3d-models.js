import { OBJFileLoader } from '@babylonjs/loaders/OBJ';
import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader';

OBJFileLoader.INVERT_Y = true;

/**
 * @returns a Map of currencyValue:number => Mesh
 */
export default function load3dModels(scene) {
  const toLoad = new Map();
  toLoad.set(0.01, { path: '1c.obj' });
  toLoad.set(0.05, { path: '5c.obj' });
  toLoad.set(0.10, { path: '10c.obj' });

  return Promise.all([...toLoad.keys()].map(
    currencyValue => SceneLoader.ImportMeshAsync(null, '3d-models/', toLoad.get(currencyValue).path, scene)
      .then((result) => {
        const mesh = result.meshes[0];
        mesh.position.set(-150, -150, -150);
        mesh.isVisible = false;
        return { mesh, currencyValue };
      })
      .catch(err => console.error(`Error while loading 3D model '${currencyValue}':\n${err}`))))
    .then((results) => {
      const loadedMeshes = new Map();
      results.forEach(({ mesh, currencyValue }) => loadedMeshes.set(currencyValue, mesh));
      return loadedMeshes;
    });
}
