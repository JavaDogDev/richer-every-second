import '@babylonjs/loaders/STL';
import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader';
import { Color3 } from '@babylonjs/core/Maths/math';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';

/**
 * @returns a Map of currencyValue:number => Mesh
 */
export default function load3dModels(scene) {
  const silverCoin = new StandardMaterial('silverCoin', scene);
  silverCoin.diffuseColor = new Color3(0.627, 0.651, 0.667);

  const bronzeCoin = new StandardMaterial('bronzeCoin', scene);
  bronzeCoin.diffuseColor = new Color3(0.722, 0.451, 0.2);

  const toLoad = new Map();
  toLoad.set(0.01, { path: '1c.stl', material: bronzeCoin });
  toLoad.set(0.05, { path: '5c.stl', material: silverCoin });
  toLoad.set(0.10, { path: '10c.stl', material: silverCoin });

  return Promise.all([...toLoad.keys()].map(
    currencyValue => SceneLoader.ImportMeshAsync(null, '3d-models/', toLoad.get(currencyValue).path, scene)
      .then((result) => {
        const mesh = result.meshes[0];
        mesh.addRotation(0, 180, 0);
        mesh.position.set(-150, -150, -150);
        mesh.material = toLoad.get(currencyValue).material;
        mesh.isVisible = false;
        mesh.alpha = 1;
        return { mesh, currencyValue };
      })
      .catch(err => console.error(`Error while loading 3D model '${currencyValue}':\n${err}`))))
    .then((results) => {
      const loadedMeshes = new Map();
      results.forEach(({ mesh, currencyValue }) => loadedMeshes.set(currencyValue, mesh));
      return loadedMeshes;
    });
}
