import fs from 'fs';
global.self = global;
global.window = global;
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const buf = fs.readFileSync('public/assets/2007-nissan-sentra-tl-mabuhay-hood-decal.glb');
const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
const loader = new GLTFLoader();

loader.parse(ab, '', (gltf) => {
  const model = gltf.scene;

  const box = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3();
  box.getSize(size);

  const maxDim = Math.max(size.x, size.z);
  const scale = 4.15 / (maxDim || 1);
  model.scale.setScalar(scale);

  const scaledBox = new THREE.Box3().setFromObject(model);
  const scaledCenter = new THREE.Vector3();
  scaledBox.getCenter(scaledCenter);

  model.position.x = -scaledCenter.x;
  model.position.z = -scaledCenter.z;
  model.position.y = -scaledBox.min.y + 0.015;

  const holder = new THREE.Group();
  holder.add(model);
  holder.updateMatrixWorld(true);

  const finalBounds = new THREE.Box3().setFromObject(holder);
  console.log(`Showcase Sentra Bounds (Scale 4.15m):`);
  console.log(`  X: [${finalBounds.min.x.toFixed(3)} to ${finalBounds.max.x.toFixed(3)}]`);
  console.log(`  Y: [${finalBounds.min.y.toFixed(3)} to ${finalBounds.max.y.toFixed(3)}]`);
  console.log(`  Z: [${finalBounds.min.z.toFixed(3)} to ${finalBounds.max.z.toFixed(3)}]`);

  // Outer door surface is at X = +/- (0.861 * 4.15 / 4.45) = +/- 0.803
  // Mid door Y = 0.635, Z = 0.09
  // Rear trunk lid Z = -2.05, Y = 0.73
  console.log(`Target side decal pos: X = +/-0.805m, Y = 0.635m, Z = 0.09m`);
  console.log(`Target rear decal pos: X = 0.00m, Y = 0.73m, Z = -2.055m`);
});
