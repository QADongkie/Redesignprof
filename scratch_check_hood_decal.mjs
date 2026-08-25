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
  if (!decal) {
    console.log('No decal found');
    return;
  }

  decal.geometry.computeBoundingBox();
  const box = decal.geometry.boundingBox;
  const size = new THREE.Vector3();
  box.getSize(size);
  const center = new THREE.Vector3();
  box.getCenter(center);

  console.log('Decal Local Box:', box.min, 'to', box.max);
  console.log('Decal Size:', size);
  console.log('Decal Center:', center);
});
