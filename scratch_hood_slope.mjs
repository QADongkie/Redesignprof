import fs from 'fs';
global.self = global;
global.window = global;
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const buf = fs.readFileSync('public/assets/2007-nissan-sentra-tl-mabuhay-hood-decal.glb');
const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
const loader = new GLTFLoader();

loader.parse(ab, '', (gltf) => {
  const decal = gltf.scene.getObjectByName('TL_MABUHAY_HOOD_DECAL');
  const pos = decal.geometry.getAttribute('position');
  
  let minZ = 1e9, maxZ = -1e9, yAtMinZ = 0, yAtMaxZ = 0;
  for (let i = 0; i < pos.count; i++) {
    const z = pos.getZ(i);
    const y = pos.getY(i);
    if (z < minZ) { minZ = z; yAtMinZ = y; }
    if (z > maxZ) { maxZ = z; yAtMaxZ = y; }
  }
  const slope = (yAtMaxZ - yAtMinZ) / (maxZ - minZ);
  console.log(`minZ=${minZ.toFixed(6)}, yAtMinZ=${yAtMinZ.toFixed(6)}`);
  console.log(`maxZ=${maxZ.toFixed(6)}, yAtMaxZ=${yAtMaxZ.toFixed(6)}`);
  console.log(`Slope dY/dZ = ${slope.toFixed(6)}`);
});
