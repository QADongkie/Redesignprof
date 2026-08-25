import * as THREE from 'three';

const fov = 38;
const fovRad = (fov * Math.PI) / 360;

function calculateCamera(w, h) {
  const aspect = w / h;
  const targetHeight = Math.max(11.2, 7.2 / (aspect || 1));
  const distance = (targetHeight / 2) / Math.tan(fovRad);
  
  const camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 200);
  camera.position.set(0, 0.35, distance);
  camera.lookAt(0, 0.35, 0);
  camera.updateProjectionMatrix();

  // Test map center point (0, 0, 0) rotated by 0.38 around X: (0, 0, 0)
  // Test Northern Luzon (top of PH) at (0, 3.5, 0) in mapGroup -> rotated by 0.38
  // Y_rot = 3.5 * cos(0.38) = 3.25, Z_rot = 3.5 * sin(0.38) = 1.30
  // Test Mindanao (bottom of PH) at (0, -3.5, 0) in mapGroup -> rotated by 0.38
  // Y_rot = -3.25, Z_rot = -1.30

  const pCenter = new THREE.Vector3(0, 0, 0).project(camera);
  const pTop = new THREE.Vector3(0, 3.25, 1.30).project(camera);
  const pBottom = new THREE.Vector3(0, -3.25, -1.30).project(camera);

  console.log(`Viewport ${w}x${h} (aspect ${aspect.toFixed(2)}):`);
  console.log(`  Distance: ${distance.toFixed(2)}`);
  console.log(`  Center Screen Y: ${pCenter.y.toFixed(3)}`);
  console.log(`  Top (Luzon) Screen Y: ${pTop.y.toFixed(3)}`);
  console.log(`  Bottom (Mindanao) Screen Y: ${pBottom.y.toFixed(3)}`);
}

calculateCamera(1200, 700); // Desktop
calculateCamera(800, 600);  // Tablet
calculateCamera(450, 600);  // Mobile
calculateCamera(375, 600);  // Small Mobile
calculateCamera(320, 600);  // Extra Small Mobile
