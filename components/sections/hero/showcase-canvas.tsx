"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { DRACOLoader as DracoLoaderType } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { applyNissanMaterials, makeDecalMaterial, refineNissanHoodDecal } from "@/components/sections/shared/nissan-utils";
import { useNearViewport } from "@/hooks/use-near-viewport";

interface ShowcaseCanvasProps {
  onReady: (ready: boolean) => void;
}



const BUMPER_CONTOUR = [
  { x: 0.00, dz: 0.0000 },
  { x: 0.12, dz: 0.0018 },
  { x: 0.20, dz: 0.0065 },
  { x: 0.28, dz: 0.0143 },
  { x: 0.36, dz: 0.0246 },
  { x: 0.44, dz: 0.0397 },
  { x: 0.52, dz: 0.0625 },
  { x: 0.60, dz: 0.0941 },
  { x: 0.68, dz: 0.1805 },
];

function getBumperSurfaceOffsetZ(absX: number): number {
  if (absX <= 0) return 0;
  if (absX >= 0.68) return 0.1805 + (absX - 0.68) * 1.1;

  for (let i = 0; i < BUMPER_CONTOUR.length - 1; i++) {
    const p0 = BUMPER_CONTOUR[i];
    const p1 = BUMPER_CONTOUR[i + 1];
    if (absX >= p0.x && absX <= p1.x) {
      const t = (absX - p0.x) / (p1.x - p0.x);
      const st = t * t * (3 - 2 * t);
      return p0.dz + st * (p1.dz - p0.dz);
    }
  }
  return 0.1805;
}

function createCurvedBumperDecal(
  texture: THREE.Texture,
  scaleFactor = 1.0
): THREE.Mesh {
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 16;
  texture.needsUpdate = true;

  const halfWidth = 0.66 * scaleFactor;
  const yMin = 0.455 * scaleFactor;
  const yMax = 0.575 * scaleFactor;
  const cols = 64;
  const rows = 12;

  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let r = 0; r <= rows; r++) {
    const v = r / rows;
    const y = yMin + v * (yMax - yMin);
    const yBulge = Math.sin(v * Math.PI) * 0.002 * scaleFactor;

    for (let c = 0; c <= cols; c++) {
      const u = c / cols;
      const x = -halfWidth + u * (2 * halfWidth);
      const absX = Math.abs(x / scaleFactor);

      const zOffset = getBumperSurfaceOffsetZ(absX) * scaleFactor;
      const z = (-2.0725 * scaleFactor) + zOffset - yBulge;

      const eps = 0.01;
      const zL = getBumperSurfaceOffsetZ(Math.max(0, absX - eps));
      const zR = getBumperSurfaceOffsetZ(absX + eps);
      const dz_dx = ((zR - zL) / (2 * eps)) * Math.sign(x);
      const norm = new THREE.Vector3(dz_dx, -0.05, -1.0).normalize();

      positions.push(x, y, z);
      normals.push(norm.x, norm.y, norm.z);
      uvs.push(1 - u, v);
    }
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i0 = r * (cols + 1) + c;
      const i1 = i0 + 1;
      const i2 = (r + 1) * (cols + 1) + c;
      const i3 = i2 + 1;

      indices.push(i0, i2, i1);
      indices.push(i1, i2, i3);
    }
  }

  const decalGeometry = new THREE.BufferGeometry();
  decalGeometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  decalGeometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  decalGeometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  decalGeometry.setIndex(indices);
  decalGeometry.computeBoundingBox();

  const decalMaterial = new THREE.MeshStandardMaterial({
    name: "TL_MABUHAY_WIDE_REAR_BUMPER_VINYL",
    map: texture,
    transparent: true,
    opacity: 0.98,
    alphaTest: 0.05,
    depthWrite: false,
    roughness: 0.35,
    metalness: 0.05,
    side: THREE.FrontSide,
    polygonOffset: true,
    polygonOffsetFactor: -3,
    polygonOffsetUnits: -3,
  });

  const decalMesh = new THREE.Mesh(decalGeometry, decalMaterial);
  decalMesh.name = "TL_MABUHAY_WIDE_REAR_BUMPER_MESH";
  decalMesh.castShadow = true;
  decalMesh.receiveShadow = true;
  decalMesh.renderOrder = 4;

  return decalMesh;
}

function createFallbackAcademyCar(): THREE.Group {
  const group = new THREE.Group();

  const bodyMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0x102b66),
    metalness: 0.88,
    roughness: 0.18,
    clearcoat: 1.0,
    clearcoatRoughness: 0.08,
  });

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0x0d2038),
    transmission: 0.85,
    transparent: true,
    opacity: 0.88,
    roughness: 0.05,
  });

  const trimMat = new THREE.MeshStandardMaterial({
    color: 0x11161f,
    roughness: 0.7,
    metalness: 0.3,
  });

  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xf3b61f,
    metalness: 0.85,
    roughness: 0.22,
  });

  // Base chassis
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.62, 1.82), bodyMat);
  chassis.position.y = 0.58;
  chassis.castShadow = true;
  chassis.receiveShadow = true;
  group.add(chassis);

  // Cabin
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.72, 1.58), glassMat);
  cabin.position.set(-0.18, 1.15, 0);
  cabin.castShadow = true;
  group.add(cabin);

  // Roof
  const roof = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.08, 1.52), bodyMat);
  roof.position.set(-0.18, 1.53, 0);
  roof.castShadow = true;
  group.add(roof);

  // Hood badge
  const badge = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.03, 24), goldMat);
  badge.position.set(1.68, 0.91, 0);
  badge.rotation.z = -Math.PI / 12;
  group.add(badge);

  // Headlights
  const lightMat = new THREE.MeshStandardMaterial({
    color: 0xfffbee,
    emissive: 0xffeaad,
    emissiveIntensity: 3.5,
  });
  const headlightL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.18, 0.34), lightMat);
  headlightL.position.set(2.05, 0.68, 0.62);
  group.add(headlightL);

  const headlightR = headlightL.clone();
  headlightR.position.z = -0.62;
  group.add(headlightR);

  // Wheels
  const wheelGeom = new THREE.CylinderGeometry(0.38, 0.38, 0.28, 32);
  wheelGeom.rotateZ(Math.PI / 2);
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x14181f, roughness: 0.85 });

  const wheelPositions = [
    [1.32, 0.38, 0.94],
    [1.32, 0.38, -0.94],
    [-1.32, 0.38, 0.94],
    [-1.32, 0.38, -0.94],
  ];

  wheelPositions.forEach(([x, y, z]) => {
    const wheel = new THREE.Mesh(wheelGeom, wheelMat);
    wheel.position.set(x, y, z);
    wheel.castShadow = true;
    group.add(wheel);

    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.3, 16), trimMat);
    rim.rotateZ(Math.PI / 2);
    rim.position.set(x, y, z);
    group.add(rim);
  });

  return group;
}

function createShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const gradient = ctx.createRadialGradient(256, 256, 40, 256, 256, 240);
    gradient.addColorStop(0, "rgba(2, 8, 24, 0.92)");
    gradient.addColorStop(0.35, "rgba(5, 18, 48, 0.72)");
    gradient.addColorStop(0.65, "rgba(10, 32, 80, 0.32)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function ShowcaseCanvas({ onReady }: ShowcaseCanvasProps) {
  const { ref: containerRef, isNearViewport } = useNearViewport<HTMLDivElement>({
    rootMargin: "180px 0px",
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isNearViewport) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const isMobile = window.matchMedia("(max-width: 768px), (pointer: coarse)").matches;
    let disposed = false;
    let dracoLoader: DracoLoaderType | null = null;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: !isMobile,
        alpha: true,
        powerPreference: isMobile ? "low-power" : "high-performance",
      });
    } catch {
      onReady(false);
      return;
    }

    renderer.setPixelRatio(isMobile ? 1 : Math.min(window.devicePixelRatio, 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    renderer.shadowMap.enabled = !isMobile;
    if (!isMobile) renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      onReady(false);
    };
    canvas.addEventListener("webglcontextlost", handleContextLost);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x040e22);
    scene.fog = new THREE.FogExp2(0x040e22, 0.024);

    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 120);
    camera.position.set(4.7, 1.85, 4.7);
    camera.lookAt(1.65, 0.45, 0);

    // Studio lighting with TL Mabuhay Royal Blue & Gold Brand Harmony
    scene.add(new THREE.AmbientLight(0xffffff, 1.6));
    scene.add(new THREE.HemisphereLight(0xe8f0fa, 0x0a1d44, 2.2));

    const keyLight = new THREE.DirectionalLight(0xfffaec, 4.6);
    keyLight.position.set(-2, 14, 8);
    keyLight.castShadow = !isMobile;
    keyLight.shadow.mapSize.set(2048, 2048);
    keyLight.shadow.camera.left = -6;
    keyLight.shadow.camera.right = 6;
    keyLight.shadow.camera.top = 6;
    keyLight.shadow.camera.bottom = -6;
    keyLight.shadow.bias = -0.0001;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const frontFillLight = new THREE.DirectionalLight(0xdbeafe, 2.8);
    frontFillLight.position.set(6, 6, 8);
    scene.add(frontFillLight);

    const goldRimLight = new THREE.DirectionalLight(0xf3b61f, 3.6);
    goldRimLight.position.set(10, 5, -8);
    scene.add(goldRimLight);

    // Signature TL Mabuhay Royal Blue Rim Light
    const royalBlueRim = new THREE.DirectionalLight(0x29489d, 4.0);
    royalBlueRim.position.set(-9, 4, -9);
    scene.add(royalBlueRim);

    // Royal Blue Studio Floor Bounce
    const floorBounce = new THREE.PointLight(0x244eb8, 3.2, 16);
    floorBounce.position.set(1.65, 0.3, 0);
    scene.add(floorBounce);

    // Studio Stage / Turntable Platform positioned in open right half
    const platformGroup = new THREE.Group();
    platformGroup.position.set(1.65, 0, 0);
    scene.add(platformGroup);

    const stageMat = new THREE.MeshStandardMaterial({
      color: 0x0a1e42,
      metalness: 0.88,
      roughness: 0.28,
    });
    const stageDisc = new THREE.Mesh(new THREE.CylinderGeometry(3.9, 3.9, 0.14, 64), stageMat);
    stageDisc.position.y = -0.07;
    stageDisc.receiveShadow = true;
    platformGroup.add(stageDisc);

    const outerRing = new THREE.Mesh(
      new THREE.TorusGeometry(3.92, 0.035, 16, 96),
      new THREE.MeshBasicMaterial({ color: 0xf3b61f })
    );
    outerRing.rotation.x = Math.PI / 2;
    outerRing.position.y = 0.005;
    platformGroup.add(outerRing);

    // Inner Ring: Official TL Mabuhay Royal Blue (Glowing)
    const innerRing = new THREE.Mesh(
      new THREE.TorusGeometry(2.9, 0.026, 16, 96),
      new THREE.MeshBasicMaterial({ color: 0x395fc7 })
    );
    innerRing.rotation.x = Math.PI / 2;
    innerRing.position.y = 0.005;
    platformGroup.add(innerRing);

    // Engineering dial notches
    const tickMat = new THREE.MeshBasicMaterial({ color: 0x6088d4 });
    for (let i = 0; i < 8; i += 1) {
      const angle = (i / 8) * Math.PI * 2;
      const tick = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.006, 0.42), tickMat);
      tick.position.set(Math.sin(angle) * 3.42, 0.006, Math.cos(angle) * 3.42);
      tick.rotation.y = angle;
      platformGroup.add(tick);
    }

    // Shadow plane
    const shadowMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(8.5, 8.5),
      new THREE.MeshBasicMaterial({
        map: createShadowTexture(),
        transparent: true,
        opacity: 0.92,
        depthWrite: false,
      })
    );
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = 0.008;
    platformGroup.add(shadowMesh);

    // Studio floor sits safely underneath the turntable platform
    const floorMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(160, 160),
      new THREE.MeshStandardMaterial({
        color: 0x030b1a,
        roughness: 0.45,
        metalness: 0.6,
      })
    );
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = -0.14;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    // Car Group
    const carHolder = new THREE.Group();
    platformGroup.add(carHolder);

    // Load Nissan Model with Decals
    const textureLoader = new THREE.TextureLoader();

    void (async () => {
      const { DRACOLoader } = await import("three/examples/jsm/loaders/DRACOLoader.js");
      if (disposed) return;
      dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath("/draco/");
      const loader = new GLTFLoader();
      loader.setDRACOLoader(dracoLoader);

      loader.load(
        "/assets/2007-nissan-sentra-tl-mabuhay-hood-decal.glb",
        (gltf) => {
          if (disposed) return;
          const model = gltf.scene;
          refineNissanHoodDecal(model);
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

        applyNissanMaterials(model);

        // Add Side & Rear Decals to Showcase Car
        const createDecalMat = (tex: THREE.Texture) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.anisotropy = 8;
          tex.needsUpdate = true;
          return makeDecalMaterial(tex);
        };

        void Promise.allSettled([
          textureLoader.loadAsync("/assets/fleet/tl-mabuhay-side-livery-left.png"),
          textureLoader.loadAsync("/assets/fleet/tl-mabuhay-side-livery-right.png"),
          textureLoader.loadAsync("/assets/fleet/tl-mabuhay-rear-caution-student-driver.png"),
        ]).then(([leftRes, rightRes, rearRes]) => {
          const sideGeo = new THREE.PlaneGeometry(1.24, 0.29);

          if (leftRes.status === "fulfilled") {
            const leftPanel = new THREE.Mesh(sideGeo, createDecalMat(leftRes.value));
            leftPanel.position.set(-0.81, 0.65, 0.10);
            leftPanel.rotation.y = -Math.PI / 2;
            leftPanel.renderOrder = 4;
            carHolder.add(leftPanel);
          }

          if (rightRes.status === "fulfilled") {
            const rightPanel = new THREE.Mesh(sideGeo, createDecalMat(rightRes.value));
            rightPanel.position.set(0.81, 0.65, 0.10);
            rightPanel.rotation.y = Math.PI / 2;
            rightPanel.renderOrder = 4;
            carHolder.add(rightPanel);
          }

          if (rearRes.status === "fulfilled") {
            const bumperDecal = createCurvedBumperDecal(rearRes.value, 1.0);
            carHolder.add(bumperDecal);
          }
        });

        carHolder.add(model);
        onReady(true);
      },
      undefined,
      (err) => {
        if (disposed) return;
        console.error("Error loading Sentra GLB:", err);
        const fallback = createFallbackAcademyCar();
        carHolder.add(fallback);
        onReady(true);
      }
    );
    })().catch((error) => {
      if (disposed) return;
      console.error("The Nissan showcase decoder could not initialize:", error);
      carHolder.add(createFallbackAcademyCar());
      onReady(true);
    });

    // Interactive mouse drag and inertia
    let isDragging = false;
    let prevMouseX = 0;
    let rotationVelocity = 0;
    let targetRotation = -0.35;
    let autoRotate = true;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      autoRotate = false;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      prevMouseX = e.clientX;
      rotationVelocity = deltaX * 0.005;
      targetRotation += rotationVelocity;
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    container.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    // Resize handling
    let animationFrameId = 0;

    const handleResize = () => {
      if (!canvas || !container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (!width || !height) return;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    // Render only while the hero is visible. Mobile is intentionally capped at
    // 30 FPS so the main thread and GPU keep enough headroom for scrolling.
    let sceneVisible = true;
    let pageVisible = !document.hidden;
    let lastRenderTime = 0;
    const targetFrameInterval = isMobile ? 1000 / 30 : 1000 / 60;

    const animate = (time: number) => {
      animationFrameId = 0;
      if (disposed || !sceneVisible || !pageVisible) return;

      animationFrameId = requestAnimationFrame(animate);
      if (time - lastRenderTime < targetFrameInterval) return;

      const delta = lastRenderTime === 0
        ? 0
        : Math.min((time - lastRenderTime) / 1000, 0.05);
      lastRenderTime = time;

      if (autoRotate && !isDragging) {
        platformGroup.rotation.y += delta * 0.22;
      } else {
        platformGroup.rotation.y += (targetRotation - platformGroup.rotation.y) * 0.1;
        rotationVelocity *= 0.92;
        targetRotation += rotationVelocity;

        if (Math.abs(rotationVelocity) < 0.0001 && !isDragging) {
          autoRotate = true;
        }
      }

      renderer.render(scene, camera);
    };

    const stopLoop = () => {
      if (!animationFrameId) return;
      cancelAnimationFrame(animationFrameId);
      animationFrameId = 0;
    };

    const startLoop = () => {
      if (disposed || !sceneVisible || !pageVisible || animationFrameId) return;
      lastRenderTime = 0;
      animationFrameId = requestAnimationFrame(animate);
    };

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        sceneVisible = entry.isIntersecting;
        if (sceneVisible) {
          handleResize();
          startLoop();
        } else {
          stopLoop();
        }
      },
      { threshold: 0.01 }
    );
    visibilityObserver.observe(container);

    const handlePageVisibility = () => {
      pageVisible = !document.hidden;
      if (pageVisible) startLoop();
      else stopLoop();
    };
    document.addEventListener("visibilitychange", handlePageVisibility);
    startLoop();

    return () => {
      disposed = true;
      stopLoop();
      visibilityObserver.disconnect();
      document.removeEventListener("visibilitychange", handlePageVisibility);
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("webglcontextlost", handleContextLost);
      dracoLoader?.dispose();
      renderer.dispose();
    };
  }, [containerRef, isNearViewport, onReady]);

  return (
    <div ref={containerRef} className="showcase-canvas-container" aria-label="3D Nissan Sentra interactive showcase">
      <canvas ref={canvasRef} className="showcase-canvas" />
    </div>
  );
}
