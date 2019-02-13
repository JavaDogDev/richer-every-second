import '@babylonjs/loaders/STL';
import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader';
import { Vector3, Color3 } from '@babylonjs/core/Maths/math';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';

export default function load3dModels(scene) {
  const silverCoin = new StandardMaterial('silverCoin', scene);
  silverCoin.diffuseColor = new Color3(0.627, 0.651, 0.667);

  const bronzeCoin = new StandardMaterial('bronzeCoin', scene);
  bronzeCoin.diffuseColor = new Color3(0.722, 0.451, 0.2);

  const toLoad = new Map();
  toLoad.set('1c', { path: '1c.stl', material: bronzeCoin });
  toLoad.set('5c', { path: '5c.stl', material: silverCoin });
  toLoad.set('10c', { path: '10c.stl', material: silverCoin });

  return Promise.all([...toLoad.keys()].map(
    name => SceneLoader.ImportMeshAsync(null, '3d-models/', toLoad.get(name).path, scene)
      .then((result) => {
        const mesh = result.meshes[0];
        mesh.scaling = new Vector3(0.1, 0.1, 0.1);
        mesh.addRotation(0, 180, 0);
        mesh.material = toLoad.get(name).material;
        return mesh;
      })
      .catch(err => console.error(`Error while loading 3D model '${name}':\n${err}`))));
}
