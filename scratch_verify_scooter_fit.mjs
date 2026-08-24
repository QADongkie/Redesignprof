import fs from 'fs';
global.self = global;
global.window = global;
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const buf = fs.readFileSync('public/assets/fleet/retro_vespa_scooter.glb');
const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
const loader = new GLTFLoader();

function fitVehicle(model, targetLength) {
  model.updateMatrixWorld(true);
  const originalBounds = new THREE.Box3().setFromObject(model);
  const originalSize = new THREE.Vector3();
  originalBounds.getSize(originalSize);
  const largestHorizontalDimension = Math.max(originalSize.x, originalSize.z, 0.001);
  model.scale.multiplyScalar(targetLength / largestHorizontalDimension);
  model.updateMatrixWorld(true);

  const fittedBounds = new THREE.Box3().setFromObject(model);
  const center = new THREE.Vector3();
  fittedBounds.getCenter(center);
  model.position.x -= center.x;
  model.position.z -= center.z;
  model.position.y -= fittedBounds.min.y;
  model.updateMatrixWorld(true);

  const holder = new THREE.Group();
  holder.add(model);
  return holder;
}

loader.parse(ab, '', (gltf) => {
  for (const rot of [0, Math.PI]) {
    const holder = fitVehicle(gltf.scene.clone(), 1.92);
    holder.rotation.y = rot;
    holder.updateMatrixWorld(true);

    let frontWheelZ = 0;
    let rearRackZ = 0;

    holder.traverse(child => {
      if (child.isMesh) {
        const wp = new THREE.Vector3();
        child.getWorldPosition(wp);
        const n = child.name.toLowerCase();
        if (/light_red|rack/i.test(n)) rearRackZ = wp.z;
        if (/light_0/i.test(n)) frontWheelZ = wp.z;
      }
    });

    console.log(`\nWith holder.rotation.y = ${rot === 0 ? '0' : 'Math.PI'}:`);
    console.log(`  Front Headlight (Light_0) World Z: ${frontWheelZ.toFixed(3)}`);
    console.log(`  Rear Taillight (Light_Red) World Z: ${rearRackZ.toFixed(3)}`);
    console.log(`  FRONT IS FACING: ${frontWheelZ > rearRackZ ? 'FORWARD / VIEWER (+Z)' : 'BACKWARDS / BUILDING (-Z)'}`);
  }
});
