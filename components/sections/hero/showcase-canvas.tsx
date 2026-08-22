"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

interface ShowcaseCanvasProps {
  onReady: (ready: boolean) => void;
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
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

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
    renderer.toneMappingExposure = 1.18;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

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
    keyLight.castShadow = true;
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
        const scale = 4.15 / (maxDim || 1);
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
              const decalMat = mesh.material as THREE.MeshStandardMaterial;
              if (decalMat) {
                decalMat.transparent = true;
                decalMat.depthWrite = false;
                decalMat.polygonOffset = true;
                decalMat.polygonOffsetFactor = -2;
                decalMat.polygonOffsetUnits = -2;
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
                color: new THREE.Color(0x0e2759),
                metalness: 0.86,
                roughness: 0.2,
                clearcoat: 1.0,
                clearcoatRoughness: 0.1,
                reflectivity: 0.9,
              });
            } else if (matName.includes("glass")) {
              mesh.material = new THREE.MeshPhysicalMaterial({
                color: new THREE.Color(0x0a1d36),
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
    let animationFrameId: number;

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

    // Render loop
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

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

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      renderer.dispose();
    };
  }, [onReady]);

  return (
    <div ref={containerRef} className="showcase-canvas-container" aria-label="3D Nissan Sentra interactive showcase">
      <canvas ref={canvasRef} className="showcase-canvas" />
    </div>
  );
}
