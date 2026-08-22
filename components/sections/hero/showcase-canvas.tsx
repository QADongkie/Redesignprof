"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

function createShadowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);
  const grad = ctx.createRadialGradient(256, 256, 40, 256, 256, 240);
  grad.addColorStop(0, "rgba(0, 7, 16, 0.95)");
  grad.addColorStop(0.35, "rgba(0, 10, 22, 0.6)");
  grad.addColorStop(0.7, "rgba(0, 12, 26, 0.2)");
  grad.addColorStop(1, "rgba(0, 12, 26, 0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createFallbackAcademyCar() {
  const car = new THREE.Group();
  const paint = new THREE.MeshPhysicalMaterial({
    color: 0x082d50,
    metalness: 0.82,
    roughness: 0.2,
    clearcoat: 1,
  });
  const glass = new THREE.MeshPhysicalMaterial({
    color: 0x102d43,
    transmission: 0.4,
    transparent: true,
    opacity: 0.9,
    roughness: 0.08,
  });
  const tire = new THREE.MeshStandardMaterial({ color: 0x050608, roughness: 0.82 });
  const rim = new THREE.MeshStandardMaterial({ color: 0x80909c, metalness: 0.9, roughness: 0.18 });

  const body = new THREE.Mesh(new RoundedBoxGeometry(2.08, 0.6, 4.48, 6, 0.16), paint);
  body.position.y = 0.61;
  body.castShadow = true;
  car.add(body);

  const cabin = new THREE.Mesh(new RoundedBoxGeometry(1.66, 0.72, 1.95, 6, 0.18), glass);
  cabin.position.set(0, 1.32, 0.18);
  cabin.castShadow = true;
  car.add(cabin);

  const wheelGeometry = new THREE.CylinderGeometry(0.42, 0.42, 0.28, 32);
  const rimGeometry = new THREE.CylinderGeometry(0.22, 0.22, 0.292, 18);
  ([
    [-1.05, 0.48, -1.38],
    [1.05, 0.48, -1.38],
    [-1.05, 0.48, 1.38],
    [1.05, 0.48, 1.38],
  ] as const).forEach(([x, y, z]) => {
    const wheel = new THREE.Mesh(wheelGeometry, tire);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(x, y, z);
    wheel.castShadow = true;
    const wheelRim = new THREE.Mesh(rimGeometry, rim);
    wheelRim.rotation.z = Math.PI / 2;
    wheel.add(wheelRim);
    car.add(wheel);
  });

  return car;
}

export function ShowcaseCanvas({
  onReady,
}: {
  onReady: (ready: boolean) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      onReady(true);
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x021120);
    scene.fog = new THREE.FogExp2(0x021120, 0.024);

    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 120);
    camera.position.set(4.8, 1.95, 5.2);

    // Studio lighting
    scene.add(new THREE.HemisphereLight(0xdcecf8, 0x010c17, 1.8));

    const keyLight = new THREE.DirectionalLight(0xfffaec, 3.8);
    keyLight.position.set(-6, 13, 7);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(2048, 2048);
    keyLight.shadow.camera.left = -5;
    keyLight.shadow.camera.right = 5;
    keyLight.shadow.camera.top = 5;
    keyLight.shadow.camera.bottom = -5;
    keyLight.shadow.bias = -0.0004;
    scene.add(keyLight);

    const goldRimLight = new THREE.DirectionalLight(0xf3b61f, 3.4);
    goldRimLight.position.set(10, 5, -8);
    scene.add(goldRimLight);

    const cyanRimLight = new THREE.DirectionalLight(0x38bdf8, 2.6);
    cyanRimLight.position.set(-9, 4, -9);
    scene.add(cyanRimLight);

    const floorBounce = new THREE.PointLight(0x0a3254, 2.2, 12);
    floorBounce.position.set(0, 0.2, 0);
    scene.add(floorBounce);

    // Studio Stage / Turntable Platform
    const platformGroup = new THREE.Group();
    scene.add(platformGroup);

    const stageMat = new THREE.MeshStandardMaterial({
      color: 0x051a2d,
      metalness: 0.88,
      roughness: 0.28,
    });
    const stageDisc = new THREE.Mesh(new THREE.CylinderGeometry(4.7, 4.7, 0.14, 64), stageMat);
    stageDisc.position.y = -0.07;
    stageDisc.receiveShadow = true;
    platformGroup.add(stageDisc);

    const outerRing = new THREE.Mesh(
      new THREE.TorusGeometry(4.72, 0.035, 16, 96),
      new THREE.MeshBasicMaterial({ color: 0xf3b61f })
    );
    outerRing.rotation.x = Math.PI / 2;
    outerRing.position.y = 0.002;
    platformGroup.add(outerRing);

    const innerRing = new THREE.Mesh(
      new THREE.TorusGeometry(3.6, 0.02, 16, 96),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    innerRing.rotation.x = Math.PI / 2;
    innerRing.position.y = 0.002;
    platformGroup.add(innerRing);

    // Engineering dial notches
    const tickMat = new THREE.MeshBasicMaterial({ color: 0x6e93b2 });
    for (let i = 0; i < 8; i += 1) {
      const angle = (i / 8) * Math.PI * 2;
      const tick = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.005, 0.45), tickMat);
      tick.position.set(Math.sin(angle) * 4.15, 0.003, Math.cos(angle) * 4.15);
      tick.rotation.y = angle;
      platformGroup.add(tick);
    }

    // Shadow plane
    const shadowMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(10.5, 10.5),
      new THREE.MeshBasicMaterial({
        map: createShadowTexture(),
        transparent: true,
        opacity: 0.92,
        depthWrite: false,
      })
    );
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = 0.005;
    platformGroup.add(shadowMesh);

    // Studio floor
    const floorMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(160, 160),
      new THREE.MeshStandardMaterial({
        color: 0x010912,
        roughness: 0.45,
        metalness: 0.6,
      })
    );
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = -0.075;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    // Car Group
    const carHolder = new THREE.Group();
    platformGroup.add(carHolder);

    // Load Nissan Model
    const loader = new GLTFLoader();
    loader.load(
      "/assets/nissan-sentra.glb",
      (gltf) => {
        const model = gltf.scene;
        const box = new THREE.Box3().setFromObject(model);
        const size = new THREE.Vector3();
        box.getSize(size);

        const maxDim = Math.max(size.x, size.z);
        const scale = 4.45 / (maxDim || 1);
        model.scale.setScalar(scale);

        const scaledBox = new THREE.Box3().setFromObject(model);
        const scaledCenter = new THREE.Vector3();
        scaledBox.getCenter(scaledCenter);

        model.position.x = -scaledCenter.x;
        model.position.z = -scaledCenter.z;
        model.position.y = -scaledBox.min.y + 0.015;

        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            const matName = (mesh.material as THREE.Material)?.name || "";

            if (matName.includes("DECAL") || mesh.name.includes("DECAL")) {
              // Preserve the TL Mabuhay hood logo decal and avoid z-fighting
              const decalMat = mesh.material as THREE.MeshStandardMaterial;
              if (decalMat) {
                decalMat.transparent = true;
                decalMat.depthWrite = true;
                decalMat.polygonOffset = true;
                decalMat.polygonOffsetFactor = -1.5;
                decalMat.polygonOffsetUnits = -1.5;
                decalMat.roughness = 0.45;
                decalMat.metalness = 0.05;
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
                color: new THREE.Color(0x082945),
                metalness: 0.84,
                roughness: 0.2,
                clearcoat: 1.0,
                clearcoatRoughness: 0.1,
                reflectivity: 0.9,
              });
            } else if (matName.includes("glass")) {
              mesh.material = new THREE.MeshPhysicalMaterial({
                color: new THREE.Color(0x0c2032),
                transmission: 0.82,
                transparent: true,
                opacity: 0.88,
                roughness: 0.05,
                metalness: 0.1,
                ior: 1.5,
              });
            } else if (matName.includes("cromo")) {
              mesh.material = new THREE.MeshStandardMaterial({
                color: new THREE.Color(0xffffff),
                metalness: 0.96,
                roughness: 0.08,
              });
            } else if (matName.includes("luz")) {
              mesh.material = new THREE.MeshStandardMaterial({
                color: new THREE.Color(0xfffaec),
                emissive: new THREE.Color(0xffeaad),
                emissiveIntensity: 3.2,
                roughness: 0.2,
              });
            } else if (matName.includes("llanta")) {
              mesh.material = new THREE.MeshStandardMaterial({
                color: new THREE.Color(0x181a1d),
                roughness: 0.86,
                metalness: 0.05,
              });
            } else if (matName.includes("wheel")) {
              mesh.material = new THREE.MeshStandardMaterial({
                color: new THREE.Color(0xdde3e8),
                metalness: 0.9,
                roughness: 0.22,
              });
            } else if (matName.includes("disk")) {
              mesh.material = new THREE.MeshStandardMaterial({
                color: new THREE.Color(0x929ea8),
                metalness: 0.94,
                roughness: 0.28,
              });
            } else if (matName.includes("plast") || matName.includes("bajo")) {
              mesh.material = new THREE.MeshStandardMaterial({
                color: new THREE.Color(0x15191d),
                roughness: 0.68,
                metalness: 0.18,
              });
            }
          }
        });

        carHolder.add(model);
        onReady(true);
      },
      undefined,
      (err) => {
        console.error("Error loading Sentra GLB:", err);
        const fallback = createFallbackAcademyCar();
        carHolder.add(fallback);
        onReady(true);
      }
    );

    // Interaction & Animation State
    let raf = 0;
    let lastWidth = 0;
    let lastHeight = 0;

    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let turntableAngle = 0.35;
    let turntableVelocity = 0;
    let manualPitch = 0;

    const cameraPos = new THREE.Vector3(4.8, 1.95, 5.2);
    const lookTarget = new THREE.Vector3(0, 0.72, 0);

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartX;
      const dy = e.clientY - dragStartY;
      dragStartX = e.clientX;
      dragStartY = e.clientY;

      turntableVelocity = dx * 0.006;
      turntableAngle += dx * 0.006;
      manualPitch = clamp(manualPitch - dy * 0.003, -0.25, 0.4);
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const resize = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (!width || !height || (width === lastWidth && height === lastHeight)) return;
      lastWidth = width;
      lastHeight = height;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const render = () => {
      resize();

      if (!isDragging) {
        turntableVelocity *= 0.92;
        turntableAngle += turntableVelocity + (reduced ? 0 : 0.0045);
      }

      carHolder.rotation.y = turntableAngle;

      camera.position.set(cameraPos.x, cameraPos.y + manualPitch, cameraPos.z);
      camera.lookAt(lookTarget);

      renderer.render(scene, camera);
      raf = window.requestAnimationFrame(render);
    };

    window.addEventListener("resize", resize, { passive: true });
    canvas.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    raf = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      renderer.dispose();
    };
  }, [onReady]);

  return <canvas ref={canvasRef} className="driving-canvas" aria-label="3D Rotating Training Vehicle" />;
}
