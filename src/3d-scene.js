import * as three from 'three';
import physijs from 'whitestormjs-physijs';

export default function init3dScene() {
  const threeContainer = document.getElementById('three-container');
  const scene = new three.Scene();
  const camera = new three.PerspectiveCamera(75, threeContainer.offsetWidth / threeContainer.offsetHeight, 0.1, 1000);
  const renderer = new three.WebGLRenderer({ antialias: true });
  const axesHelper = new three.AxesHelper(5);
  scene.add(axesHelper);

  scene.background = new three.Color(0x2B4970);
  threeContainer.appendChild(renderer.domElement);

  camera.position.set(-15, 10, 15);
  camera.lookAt(scene.position);

  const geometry = new three.BoxGeometry(1, 1, 1);
  const material = new three.MeshBasicMaterial({ color: 0x00ff00 });
  const cube = new three.Mesh(geometry, material);
  scene.add(cube);

  function animate() {
    requestAnimationFrame(animate);

    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    renderer.render(scene, camera);
  }
  animate();

  // Resize renderer on container resize
  function onResize() {
    camera.aspect = threeContainer.offsetWidth / threeContainer.offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(threeContainer.offsetWidth, threeContainer.offsetHeight);
    console.log(`${threeContainer.offsetWidth}, ${threeContainer.offsetHeight}`);
  }

  onResize();
  window.addEventListener('resize', onResize.bind(this), false);
}
