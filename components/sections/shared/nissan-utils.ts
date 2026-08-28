/**
 * Shared Three.js utilities for the Nissan Sentra model used across
 * showcase-canvas, course-card-diorama, and final-arrival-canvas.
 *
 * Centralising these prevents drift between the three scenes and makes
 * future tweaks a single-file change.
 */

import * as THREE from "three";

// ─── Decal Material ──────────────────────────────────────────────────────────

/**
 * Creates a standard decal/livery MeshStandardMaterial.
 * Handles transparency, polygon offset, and optional texture binding.
 */
export function makeDecalMaterial(tex?: THREE.Texture | null): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    map: tex ?? null,
    transparent: true,
    opacity: 0.96,
    alphaTest: 0.05,
    depthWrite: false,
    roughness: 0.35,
    metalness: 0.05,
    side: THREE.FrontSide,
    polygonOffset: true,
    polygonOffsetFactor: -3,
    polygonOffsetUnits: -3,
  });
}

// ─── Hood Decal Geometry Refinement ──────────────────────────────────────────

/**
 * Refines the Nissan Sentra hood vinyl decal:
 *  - Scales geometry to ~40 cm diameter
 *  - Shifts it downwards along the hood slope towards the front grille
 *  - Replaces the source material with a clean vinyl MeshStandardMaterial
 */
export function refineNissanHoodDecal(root: THREE.Object3D): void {
  const decal = root.getObjectByName("TL_MABUHAY_HOOD_DECAL");
  if (!(decal instanceof THREE.Mesh)) return;

  const geometry = decal.geometry.clone();
  geometry.computeBoundingBox();
  const bounds = geometry.boundingBox;
  const position = geometry.getAttribute("position");
  if (bounds && position) {
    const center = new THREE.Vector3();
    bounds.getCenter(center);
    const scaleFactor = 0.72; // Scaled to ~40cm diameter
    const slope = -0.2084;
    const shiftZ = 0.00065; // ~5.9cm shift downwards towards front grille
    for (let i = 0; i < position.count; i++) {
      const origX = position.getX(i);
      const origY = position.getY(i);
      const origZ = position.getZ(i);

      const x = center.x + (origX - center.x) * scaleFactor;
      const z = center.z + (origZ - center.z) * scaleFactor + shiftZ;
      const dz = z - origZ;
      const y = origY + dz * slope + 0.00004;

      position.setXYZ(i, x, y, z);
    }
    position.needsUpdate = true;
    geometry.computeVertexNormals();
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
    decal.geometry = geometry;
  }

  const sourceMaterial = Array.isArray(decal.material) ? decal.material[0] : decal.material;
  const sourceMap =
    sourceMaterial instanceof THREE.MeshBasicMaterial || sourceMaterial instanceof THREE.MeshStandardMaterial
      ? sourceMaterial.map
      : null;
  decal.material = new THREE.MeshStandardMaterial({
    name: "TL_MABUHAY_AUTOMOTIVE_HOOD_VINYL",
    map: sourceMap,
    color: 0xffffff,
    transparent: true,
    opacity: 0.96,
    alphaTest: 0.05,
    depthWrite: false,
    roughness: 0.35,
    metalness: 0.05,
    side: THREE.FrontSide,
    polygonOffset: true,
    polygonOffsetFactor: -3,
    polygonOffsetUnits: -3,
  });
  decal.renderOrder = 4;
}

// ─── Nissan Sentra Material Overrides ────────────────────────────────────────

/**
 * Traverses a loaded Nissan Sentra GLTF scene and applies per-material
 * overrides: deep-navy paint with clearcoat, tinted glass, emissive lights,
 * and correct tyre/wheel/plastic finishes.
 *
 * Also enables shadow casting and receiving on every mesh.
 */
export function applyNissanMaterials(model: THREE.Object3D): void {
  model.traverse((child) => {
    if (!(child as THREE.Mesh).isMesh) return;
    const mesh = child as THREE.Mesh;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.visible = true;

    const matName = (mesh.material as THREE.Material)?.name ?? "";

    if (matName.includes("DECAL") || mesh.name.includes("DECAL")) {
      const decalMat = mesh.material as THREE.MeshStandardMaterial;
      if (decalMat) {
        decalMat.transparent = true;
        decalMat.depthWrite = false;
        decalMat.polygonOffset = true;
        decalMat.polygonOffsetFactor = -2;
        decalMat.polygonOffsetUnits = -2;
        decalMat.roughness = 0.45;
        decalMat.needsUpdate = true;
      }
    } else if (
      matName.includes("NISSANsentra") &&
      !matName.includes("plast") &&
      !matName.includes("luz") &&
      !matName.includes("wheel") &&
      !matName.includes("int")
    ) {
      mesh.material = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(0x0e2759),
        metalness: 0.86,
        roughness: 0.2,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
      });
    } else if (matName.includes("glass")) {
      mesh.material = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(0x0a1d36),
        transmission: 0.82,
        transparent: true,
        opacity: 0.88,
        roughness: 0.08,
      });
    } else if (matName.includes("luz")) {
      mesh.material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0xfffaec),
        emissive: new THREE.Color(0xffeaad),
        emissiveIntensity: 3.5,
      });
    } else if (matName.includes("llanta")) {
      mesh.material = new THREE.MeshStandardMaterial({ color: new THREE.Color(0x181a1d), roughness: 0.86 });
    } else if (matName.includes("wheel")) {
      mesh.material = new THREE.MeshStandardMaterial({ color: new THREE.Color(0xdde3e8), metalness: 0.9, roughness: 0.22 });
    } else if (matName.includes("disk")) {
      mesh.material = new THREE.MeshStandardMaterial({ color: new THREE.Color(0x929ea8), metalness: 0.94, roughness: 0.28 });
    } else if (matName.includes("plast") || matName.includes("bajo")) {
      mesh.material = new THREE.MeshStandardMaterial({ color: new THREE.Color(0x15191d), roughness: 0.68, metalness: 0.18 });
    }
  });
}
