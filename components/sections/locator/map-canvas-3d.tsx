"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { branches } from "@/data/branches";

// ─── 3-D Map Anchor Lookup & Fallback Coordinates ───────────────────────────
const PIN_ANCHORS: Record<string, { nodeName: string; x: number; y: number; z: number }> = {
  bacolod:          { nodeName: "Pin_Bacolod",          x: 0.7086, y: -1.2964, z: 0.24 },
  cadiz:            { nodeName: "Pin_Cadiz",            x: 0.9227, y: -1.1307, z: 0.24 },
  pontevedra:       { nodeName: "Pin_Pontevedra",       x: 0.6590, y: -1.4821, z: 0.24 },
  "cagayan-de-oro": { nodeName: "Pin_Cagayan_de_Oro",   x: 1.7147, y: -2.6604, z: 0.24 },
  tagum:            { nodeName: "Pin_Tagum",            x: 2.4195, y: -3.2780, z: 0.24 },
  nabunturan:       { nodeName: "Pin_Nabunturan",       x: 2.5136, y: -3.1828, z: 0.24 },
  samal:            { nodeName: "Pin_Samal",            x: 2.3588, y: -3.5074, z: 0.24 },
  mati:             { nodeName: "Pin_Mati",             x: 2.6631, y: -3.5805, z: 0.24 },
};

export function MapCanvas3D({
  selectedId,
  filteredIds,
  onSelectBranch,
}: {
  selectedId: string;
  filteredIds: string[];
  onSelectBranch: (id: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const selectedIdRef = useRef(selectedId);
  const filteredIdsRef = useRef(filteredIds);

  useEffect(() => { selectedIdRef.current = selectedId; }, [selectedId]);
  useEffect(() => { filteredIdsRef.current = filteredIds; }, [filteredIds]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // ── Renderer ─────────────────────────────────────────────────────────────
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    } catch {
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // ── Scene & Camera ────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x010e1f);

    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 200);
    camera.position.set(0, 0, 18);
    camera.lookAt(0, 0, 0);

    // ── Root container for the map and pins with 3D isometric perspective ────
    const mapGroup = new THREE.Group();
    mapGroup.rotation.x = 0.38;
    mapGroup.rotation.y = -0.16;
    mapGroup.rotation.z = 0.02;
    scene.add(mapGroup);

    // ── 3-Point Studio Lighting for Rich 3D Depth & Shadows ──────────────────
    scene.add(new THREE.HemisphereLight(0xe0f2fe, 0x010b17, 1.8));

    const keyLight = new THREE.DirectionalLight(0xfff5e6, 3.2);
    keyLight.position.set(-7, 14, 16);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(2048, 2048);
    keyLight.shadow.bias = -0.0002;
    keyLight.shadow.radius = 2.5;
    scene.add(keyLight);

    const goldRim = new THREE.DirectionalLight(0xf3b61f, 2.2);
    goldRim.position.set(10, -4, 10);
    scene.add(goldRim);

    const cyanFill = new THREE.DirectionalLight(0x38bdf8, 1.6);
    cyanFill.position.set(-9, -8, 8);
    scene.add(cyanFill);

    // ── Pin materials & geometry ──────────────────────────────────────────────
    const pinGeo = new THREE.SphereGeometry(0.13, 24, 24);
    const stalkGeo = new THREE.CylinderGeometry(0.026, 0.026, 0.42, 14);
    const ringGeo = new THREE.TorusGeometry(0.18, 0.024, 14, 36);

    const matSelected = new THREE.MeshPhysicalMaterial({
      color: 0xf3b61f,
      emissive: 0xf3b61f,
      emissiveIntensity: 2.0,
      metalness: 0.35,
      roughness: 0.12,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });
    const matDefault = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.9,
      metalness: 0.25,
      roughness: 0.22,
      clearcoat: 0.8,
    });
    const matMuted = new THREE.MeshStandardMaterial({
      color: 0x162c3d,
      emissive: 0x0c1b26,
      emissiveIntensity: 0.15,
      metalness: 0.1,
      roughness: 0.8,
      transparent: true,
      opacity: 0.35,
    });
    const stalkMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.9,
      roughness: 0.18,
    });

    const pinMeshes: Array<{ id: string; group: THREE.Group; head: THREE.Mesh; ring: THREE.Mesh }> = [];
    const clickTargets: Array<{ mesh: THREE.Mesh; id: string }> = [];

    // ── Load GLB map model ────────────────────────────────────────────────────
    const loader = new GLTFLoader();
    loader.load(
      "/assets/philippines-geography-map-3d.glb",
      (gltf) => {
        const model = gltf.scene;

        const box = new THREE.Box3().setFromObject(model);
        const center = new THREE.Vector3();
        box.getCenter(center);
        model.position.sub(center);

        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            const existingMat = mesh.material as THREE.MeshStandardMaterial;
            if (existingMat) {
              existingMat.roughness = 0.38;
              existingMat.metalness = 0.15;
              existingMat.needsUpdate = true;
            }
          }
        });

        mapGroup.add(model);

        // Build 3D pins attached directly to each island anchor
        branches.forEach((branch) => {
          const anchorConfig = PIN_ANCHORS[branch.id];
          if (!anchorConfig) return;

          let pinPos = new THREE.Vector3(anchorConfig.x, anchorConfig.y, anchorConfig.z);
          const anchorNode = model.getObjectByName(anchorConfig.nodeName);
          if (anchorNode) {
            pinPos = anchorNode.position.clone();
          }

          const group = new THREE.Group();
          group.position.copy(pinPos);

          const stalk = new THREE.Mesh(stalkGeo, stalkMat);
          stalk.rotation.x = Math.PI / 2;
          stalk.position.z = 0.21;
          stalk.castShadow = true;
          group.add(stalk);

          const head = new THREE.Mesh(pinGeo, matDefault.clone());
          head.position.z = 0.46;
          head.castShadow = true;
          group.add(head);

          const ring = new THREE.Mesh(ringGeo, matDefault.clone());
          ring.position.z = 0.05;
          group.add(ring);

          const hitGeo = new THREE.SphereGeometry(0.42, 12, 12);
          const hitMesh = new THREE.Mesh(hitGeo, new THREE.MeshBasicMaterial({ visible: false }));
          hitMesh.position.z = 0.38;
          group.add(hitMesh);
          clickTargets.push({ mesh: hitMesh, id: branch.id });

          model.add(group);
          pinMeshes.push({ id: branch.id, group, head, ring });
        });
      },
      undefined,
      (err) => {
        console.warn("Map GLB failed to load:", err);
      }
    );

    // ── Interactive Mouse / Cursor Drag & Tilt ───────────────────────────────
    const BASE_ROT_X = 0.38;
    const BASE_ROT_Y = -0.16;
    let targetRotX = BASE_ROT_X;
    let targetRotY = BASE_ROT_Y;
    let currentRotX = BASE_ROT_X;
    let currentRotY = BASE_ROT_Y;

    let isPointerDown = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let dragLastX = 0;
    let dragLastY = 0;
    let hasDragged = false;
    let isHoveringPin = false;

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const getPointerNDC = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      pointer.set(
        ((clientX - rect.left) / rect.width) * 2 - 1,
        -((clientY - rect.top) / rect.height) * 2 + 1
      );
    };

    const updateCursor = () => {
      if (isPointerDown) {
        canvas.style.cursor = "grabbing";
      } else if (isHoveringPin) {
        canvas.style.cursor = "pointer";
      } else {
        canvas.style.cursor = "grab";
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      isPointerDown = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      dragLastX = e.clientX;
      dragLastY = e.clientY;
      hasDragged = false;
      updateCursor();
    };

    const onPointerMove = (e: PointerEvent) => {
      if (isPointerDown) {
        const dx = e.clientX - dragLastX;
        const dy = e.clientY - dragLastY;
        dragLastX = e.clientX;
        dragLastY = e.clientY;

        if (Math.hypot(e.clientX - dragStartX, e.clientY - dragStartY) > 5) {
          hasDragged = true;
        }

        targetRotY = Math.min(0.35, Math.max(-0.65, targetRotY + dx * 0.005));
        targetRotX = Math.min(0.68, Math.max(0.12, targetRotX + dy * 0.005));
      } else {
        getPointerNDC(e.clientX, e.clientY);
        raycaster.setFromCamera(pointer, camera);
        const hits = raycaster.intersectObjects(clickTargets.map((t) => t.mesh));
        const nowHovering = hits.length > 0;
        if (nowHovering !== isHoveringPin) {
          isHoveringPin = nowHovering;
          updateCursor();
        }
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!isPointerDown) return;
      isPointerDown = false;
      updateCursor();

      if (!hasDragged) {
        getPointerNDC(e.clientX, e.clientY);
        raycaster.setFromCamera(pointer, camera);
        const hits = raycaster.intersectObjects(clickTargets.map((t) => t.mesh));
        if (hits[0]) {
          const target = clickTargets.find((t) => t.mesh === hits[0].object);
          if (target) onSelectBranch(target.id);
        }
      }
    };

    canvas.style.cursor = "grab";
    canvas.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    // ── Auto-Framing Resize: Guarantees full map visibility with zero cutoff ─
    let lastW = 0, lastH = 0;
    const resize = () => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      if (!w || !h || (w === lastW && h === lastH)) return;
      lastW = w; lastH = h;
      renderer.setSize(w, h, false);

      const aspect = w / h;
      camera.aspect = aspect;

      const targetHeight = Math.max(12.2, 7.6 / (aspect || 1));
      const fovRad = (camera.fov * Math.PI) / 360;
      const distance = (targetHeight / 2) / Math.tan(fovRad);

      camera.position.set(0, -0.3, distance);
      camera.lookAt(0, -0.1, 0);
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", resize, { passive: true });

    // ── Render Loop ───────────────────────────────────────────────────────────
    let raf = 0;
    const render = () => {
      resize();
      raf = requestAnimationFrame(render);

      currentRotX += (targetRotX - currentRotX) * 0.08;
      currentRotY += (targetRotY - currentRotY) * 0.08;
      mapGroup.rotation.x = currentRotX;
      mapGroup.rotation.y = currentRotY;

      const selId = selectedIdRef.current;
      const filtIds = filteredIdsRef.current;

      pinMeshes.forEach(({ id, group, head, ring }) => {
        const isSelected = id === selId;
        const isMuted = filtIds.length > 0 && !filtIds.includes(id);

        const targetMat = isSelected ? matSelected : isMuted ? matMuted : matDefault;
        if ((head.material as THREE.Material) !== targetMat) {
          head.material = targetMat;
          ring.material = targetMat;
        }

        const targetScale = isSelected ? 1.35 : isMuted ? 0.7 : 1.0;
        group.scale.set(targetScale, targetScale, targetScale);
      });

      renderer.render(scene, camera);
    };
    render();

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("resize", resize);
      renderer.dispose();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="map-canvas-3d"
      aria-label="Interactive 3D map of the Philippines showing TL Mabuhay branch locations"
    />
  );
}
