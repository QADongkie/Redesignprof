"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { CourseId } from "@/data/courses";

// Global cache for loaded GLTF model so all cards load instantaneously
let cachedGltfScene: THREE.Group | null = null;
let gltfPromise: Promise<THREE.Group> | null = null;

function loadNissanModel(): Promise<THREE.Group> {
  if (cachedGltfScene) return Promise.resolve(cachedGltfScene.clone());
  if (gltfPromise) return gltfPromise.then((scene) => scene.clone());

  gltfPromise = new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.load(
      "/assets/nissan-sentra.glb",
      (gltf) => {
        cachedGltfScene = gltf.scene;
        resolve(gltf.scene.clone());
      },
      undefined,
      (err) => {
        console.warn("Failed to load Nissan GLB in course diorama:", err);
        reject(err);
      }
    );
  });
  return gltfPromise.then((scene) => scene.clone());
}

function createClassroomBannerTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 440;
  canvas.height = 240;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#f3b61f";
    ctx.fillRect(0, 0, 440, 240);

    ctx.fillStyle = "#0c2152";
    ctx.fillRect(8, 8, 424, 224);

    ctx.fillStyle = "#f3b61f";
    ctx.font = "900 22px 'Manrope', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("LEARN TO DRIVE THE MABUHAY WAY", 220, 36);

    ctx.fillStyle = "#05112c";
    ctx.beginPath();
    ctx.moveTo(80, 220);
    ctx.lineTo(200, 70);
    ctx.lineTo(240, 70);
    ctx.lineTo(360, 220);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "#f3b61f";
    ctx.lineWidth = 3;
    ctx.setLineDash([12, 10]);
    ctx.beginPath();
    ctx.moveTo(220, 70);
    ctx.lineTo(220, 220);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#106334";
    ctx.beginPath();
    ctx.moveTo(8, 220);
    ctx.lineTo(80, 220);
    ctx.lineTo(200, 70);
    ctx.lineTo(8, 70);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(432, 220);
    ctx.lineTo(360, 220);
    ctx.lineTo(240, 70);
    ctx.lineTo(432, 70);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = "800 13px 'Manrope', sans-serif";
    ctx.fillText("15-HOUR MANDATORY LTO SEMINAR", 220, 214);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createTrafficSignsPosterTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 420;
  canvas.height = 300;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#0c1d42";
    ctx.fillRect(0, 0, 420, 300);

    ctx.strokeStyle = "#29489d";
    ctx.lineWidth = 4;
    ctx.strokeRect(4, 4, 412, 292);

    ctx.fillStyle = "#f3b61f";
    ctx.font = "800 15px 'Manrope', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("INTERNATIONAL STANDARD TRAFFIC SIGNS", 210, 25);

    const colors = ["#ef4444", "#3b82f6", "#f59e0b", "#22c55e", "#ef4444", "#3b82f6"];
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 8; c++) {
        const x = 32 + c * 46;
        const y = 50 + r * 46;
        const col = colors[(r + c) % colors.length];

        if (r === 0 || r === 3) {
          ctx.strokeStyle = col;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(x + 16, y);
          ctx.lineTo(x + 32, y + 28);
          ctx.lineTo(x, y + 28);
          ctx.closePath();
          ctx.stroke();
        } else if (r === 1 || r === 4) {
          ctx.strokeStyle = col;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(x + 16, y + 14, 13, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          ctx.fillStyle = col;
          ctx.fillRect(x + 3, y + 2, 26, 24);
          ctx.fillStyle = "#06132e";
          ctx.fillRect(x + 7, y + 6, 18, 16);
        }
      }
    }

    ctx.fillStyle = "#94a3b8";
    ctx.font = "700 11px 'Manrope', sans-serif";
    ctx.fillText("LTO THEORETICAL DRIVING COURSE (TDC)", 210, 285);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createSpeedLimitTexture(speed = "40"): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(128, 128, 122, 0, Math.PI * 2);
    ctx.fill();

    ctx.lineWidth = 26;
    ctx.strokeStyle = "#dc2626";
    ctx.beginPath();
    ctx.arc(128, 128, 114, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "#0f172a";
    ctx.font = "900 114px 'Manrope', 'Arial Black', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(speed, 128, 134);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function buildClassroomArmchair(): THREE.Group {
  const chair = new THREE.Group();

  const plasticMat = new THREE.MeshStandardMaterial({
    color: 0xe0a736,
    roughness: 0.35,
    metalness: 0.15,
  });
  const metalLegMat = new THREE.MeshStandardMaterial({
    color: 0x1a2b4c,
    roughness: 0.5,
    metalness: 0.8,
  });

  const seat = new THREE.Mesh(new RoundedBoxGeometry(0.38, 0.035, 0.38, 3, 0.015), plasticMat);
  seat.position.y = 0.38;
  seat.castShadow = true;
  chair.add(seat);

  const back = new THREE.Mesh(new RoundedBoxGeometry(0.36, 0.38, 0.03, 3, 0.012), plasticMat);
  back.position.set(0, 0.65, -0.17);
  back.rotation.x = -0.12;
  back.castShadow = true;
  chair.add(back);

  const slitMat = new THREE.MeshStandardMaterial({ color: 0xb58220, roughness: 0.6 });
  for (let s = -0.09; s <= 0.09; s += 0.06) {
    const slit = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.22, 0.035), slitMat);
    slit.position.set(s, 0.65, -0.17);
    slit.rotation.x = -0.12;
    chair.add(slit);
  }

  const legCoords = [
    [-0.16, -0.16],
    [0.16, -0.16],
    [-0.16, 0.16],
    [0.16, 0.16],
  ];
  legCoords.forEach(([lx, lz]) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.015, 0.38, 8), metalLegMat);
    leg.position.set(lx, 0.19, lz);
    leg.castShadow = true;
    chair.add(leg);
  });

  const armSupport = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.32, 8), metalLegMat);
  armSupport.position.set(0.22, 0.52, 0.08);
  chair.add(armSupport);

  const armDesk = new THREE.Mesh(new RoundedBoxGeometry(0.32, 0.028, 0.44, 3, 0.015), plasticMat);
  armDesk.position.set(0.18, 0.64, 0.12);
  armDesk.rotation.y = -0.08;
  armDesk.castShadow = true;
  chair.add(armDesk);

  return chair;
}

export function CourseCardDiorama({ courseId }: { courseId: CourseId }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    } catch {
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x07152d, 0.042);

    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 60);

    if (courseId === "tdc") {
      camera.position.set(2.8, 2.5, 3.8);
      camera.lookAt(-0.2, 0.7, -0.3);
    } else {
      camera.position.set(3.2, 2.4, 4.2);
      camera.lookAt(0, 0.3, 0);
    }

    // Studio Lighting infused with TL Mabuhay Royal Blue + Gold
    scene.add(new THREE.AmbientLight(0xffffff, 1.3));
    scene.add(new THREE.HemisphereLight(0xe4edfa, 0x0a1c3d, 1.9));

    const sun = new THREE.DirectionalLight(0xfff8ee, 3.4);
    sun.position.set(6, 12, 8);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.left = -6;
    sun.shadow.camera.right = 6;
    sun.shadow.camera.top = 6;
    sun.shadow.camera.bottom = -6;
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 30;
    sun.shadow.normalBias = 0.02;
    sun.shadow.bias = -0.0001;
    scene.add(sun);

    const goldFill = new THREE.DirectionalLight(0xf3b61f, 2.2);
    goldFill.position.set(-6, 4, -4);
    scene.add(goldFill);

    // Signature TL Mabuhay Royal Blue Rim Light
    const royalBlueRim = new THREE.DirectionalLight(0x29489d, 3.2);
    royalBlueRim.position.set(3, 2, -6);
    scene.add(royalBlueRim);

    const world = new THREE.Group();
    scene.add(world);

    const markMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    });
    const goldMarkMat = new THREE.MeshStandardMaterial({
      color: 0xf3b61f,
      roughness: 0.35,
      metalness: 0.7,
      emissive: 0x885500,
      emissiveIntensity: 0.4,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    });
    const curbMat = new THREE.MeshStandardMaterial({ color: 0x16294d, roughness: 0.7, metalness: 0.25 });

    let animUpdate = (_time: number) => {};

    if (courseId === "tdc") {
      // ═════════════════════════════════════════════════════════════════════════
      // ─── 01 TDC: CLASSROOM DIORAMA WITH OFFICIAL TL MABUHAY LOGO ─────────────
      // ═════════════════════════════════════════════════════════════════════════
      const floorMat = new THREE.MeshStandardMaterial({
        color: 0x081a38,
        roughness: 0.35,
        metalness: 0.4,
      });
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(28, 28), floorMat);
      floor.rotation.x = -Math.PI / 2;
      floor.position.y = 0;
      floor.receiveShadow = true;
      world.add(floor);

      const wallMat = new THREE.MeshStandardMaterial({
        color: 0x0c2149,
        roughness: 0.55,
        metalness: 0.2,
      });
      const backWall = new THREE.Mesh(new THREE.PlaneGeometry(16, 8), wallMat);
      backWall.position.set(0, 2.5, -2.1);
      backWall.receiveShadow = true;
      world.add(backWall);

      const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(16, 8), wallMat);
      leftWall.rotation.y = Math.PI / 2;
      leftWall.position.set(-3.6, 2.5, 0);
      world.add(leftWall);

      const baseboardBack = new THREE.Mesh(new THREE.BoxGeometry(16, 0.12, 0.04), goldMarkMat);
      baseboardBack.position.set(0, 0.06, -2.08);
      world.add(baseboardBack);

      const baseboardLeft = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.12, 16), goldMarkMat);
      baseboardLeft.position.set(-3.58, 0.06, 0);
      world.add(baseboardLeft);

      // ── OFFICIAL TL MABUHAY LOGO ON LEFT WALL ────────────────────────────────
      const texLoader = new THREE.TextureLoader();
      const logoTexture = texLoader.load("/assets/tl-mabuhay-logo.png");
      logoTexture.colorSpace = THREE.SRGBColorSpace;

      const logoPlaque = new THREE.Mesh(
        new THREE.CylinderGeometry(0.72, 0.72, 0.02, 32),
        new THREE.MeshStandardMaterial({ color: 0x091d42, roughness: 0.3, metalness: 0.8 })
      );
      logoPlaque.rotation.z = -Math.PI / 2;
      logoPlaque.position.set(-3.57, 1.85, -0.65);
      world.add(logoPlaque);

      const logoGoldRim = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.025, 16, 48), goldMarkMat);
      logoGoldRim.rotation.y = Math.PI / 2;
      logoGoldRim.position.set(-3.55, 1.85, -0.65);
      world.add(logoGoldRim);

      const logoPoster = new THREE.Mesh(
        new THREE.PlaneGeometry(1.4, 1.4),
        new THREE.MeshStandardMaterial({
          map: logoTexture,
          transparent: true,
          roughness: 0.25,
          metalness: 0.1,
          polygonOffset: true,
          polygonOffsetFactor: -2,
          polygonOffsetUnits: -2,
        })
      );
      logoPoster.rotation.y = Math.PI / 2;
      logoPoster.position.set(-3.54, 1.85, -0.65);
      world.add(logoPoster);

      // ── BACK WALL POSTERS ───────────────────────────────────────────────────
      const bannerTex = createClassroomBannerTexture();
      const bannerPoster = new THREE.Mesh(
        new THREE.PlaneGeometry(1.65, 0.95),
        new THREE.MeshBasicMaterial({ map: bannerTex })
      );
      bannerPoster.position.set(-1.3, 2.0, -2.06);
      world.add(bannerPoster);

      const signsTex = createTrafficSignsPosterTexture();
      const signsPoster = new THREE.Mesh(
        new THREE.PlaneGeometry(1.6, 1.15),
        new THREE.MeshBasicMaterial({ map: signsTex })
      );
      signsPoster.position.set(1.4, 2.0, -2.06);
      world.add(signsPoster);

      // ── CLASSROOM TRAFFIC LIGHT TRAINING STAND ──────────────────────────────
      const poleMat = new THREE.MeshStandardMaterial({ color: 0x14233c, metalness: 0.85, roughness: 0.25 });
      const signalPole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.2, 12), poleMat);
      signalPole.position.set(-0.05, 1.1, -1.92);
      signalPole.castShadow = true;
      world.add(signalPole);

      const signalBase = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.05, 16), poleMat);
      signalBase.position.set(-0.05, 0.025, -1.92);
      world.add(signalBase);

      const signalBox = new THREE.Mesh(new RoundedBoxGeometry(0.26, 0.78, 0.22, 3, 0.03), poleMat);
      signalBox.position.set(-0.05, 1.88, -1.86);
      world.add(signalBox);

      const redMat = new THREE.MeshStandardMaterial({ color: 0x330000, emissive: 0xff1111, emissiveIntensity: 3.5 });
      const redBulb = new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 12), redMat);
      redBulb.position.set(-0.05, 2.12, -1.74);
      world.add(redBulb);

      const yellowMat = new THREE.MeshStandardMaterial({ color: 0x332200, emissive: 0xffaa00, emissiveIntensity: 0.05 });
      const yellowBulb = new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 12), yellowMat);
      yellowBulb.position.set(-0.05, 1.88, -1.74);
      world.add(yellowBulb);

      const greenMat = new THREE.MeshStandardMaterial({ color: 0x003311, emissive: 0x22ff66, emissiveIntensity: 0.05 });
      const greenBulb = new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 12), greenMat);
      greenBulb.position.set(-0.05, 1.64, -1.74);
      world.add(greenBulb);

      // ── STUDENT ARM-DESK CHAIRS IN 3 NEAT ROWS ──────────────────────────────
      const chairRows = [
        { z: -1.0, xs: [-1.65, -0.65, 0.45, 1.45] },
        { z: -0.15, xs: [-1.8, -0.75, 0.35, 1.35] },
        { z: 0.7, xs: [-1.95, -0.85, 0.25, 1.25] },
      ];

      chairRows.forEach(({ z, xs }) => {
        xs.forEach((x) => {
          const armchair = buildClassroomArmchair();
          armchair.position.set(x, 0, z);
          armchair.rotation.y = 0.05;
          world.add(armchair);
        });
      });

      const roomBulbGlow = new THREE.PointLight(0xff1111, 2.2, 5.5);
      roomBulbGlow.position.set(-0.05, 1.88, -1.4);
      world.add(roomBulbGlow);

      animUpdate = (time) => {
        const cycle = time % 6.0;
        if (cycle < 2.4) {
          redMat.emissiveIntensity = 3.5;
          yellowMat.emissiveIntensity = 0.05;
          greenMat.emissiveIntensity = 0.05;
          roomBulbGlow.color.setHex(0xff1111);
        } else if (cycle < 3.2) {
          redMat.emissiveIntensity = 0.05;
          yellowMat.emissiveIntensity = 3.5;
          greenMat.emissiveIntensity = 0.05;
          roomBulbGlow.color.setHex(0xffaa00);
        } else {
          redMat.emissiveIntensity = 0.05;
          yellowMat.emissiveIntensity = 0.05;
          greenMat.emissiveIntensity = 3.5;
          roomBulbGlow.color.setHex(0x22ff66);
        }
      };
    } else if (courseId === "pdc") {
      // ═════════════════════════════════════════════════════════════════════════
      // ─── 02 PDC: PRACTICAL DRIVING COURSE (WIDE BAY & PERFECT CENTERED PARK) ─
      // ═════════════════════════════════════════════════════════════════════════
      const groundMat = new THREE.MeshStandardMaterial({ color: 0x06142a, roughness: 0.85, metalness: 0.15 });
      const groundPlane = new THREE.Mesh(new THREE.PlaneGeometry(28, 28), groundMat);
      groundPlane.rotation.x = -Math.PI / 2;
      groundPlane.position.y = -0.01;
      groundPlane.receiveShadow = true;
      world.add(groundPlane);

      const asphaltMat = new THREE.MeshStandardMaterial({ color: 0x0e2040, roughness: 0.65, metalness: 0.25 });
      const road = new THREE.Mesh(new THREE.PlaneGeometry(5.4, 28), asphaltMat);
      road.rotation.x = -Math.PI / 2;
      road.position.y = 0.0;
      road.receiveShadow = true;
      world.add(road);

      const sidewalkL = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.04, 28), curbMat);
      sidewalkL.position.set(-4.7, 0.02, 0);
      sidewalkL.receiveShadow = true;
      world.add(sidewalkL);

      const sidewalkR = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.04, 28), curbMat);
      sidewalkR.position.set(4.7, 0.02, 0);
      sidewalkR.receiveShadow = true;
      world.add(sidewalkR);

      // Wide, Generous Gold Parking Bay Lines
      const bayLineL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.008, 3.4), goldMarkMat);
      bayLineL.position.set(-1.2, 0.005, 0);
      world.add(bayLineL);

      const bayLineR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.008, 3.4), goldMarkMat);
      bayLineR.position.set(1.2, 0.005, 0);
      world.add(bayLineR);

      const bayBack = new THREE.Mesh(new THREE.BoxGeometry(2.48, 0.008, 0.08), goldMarkMat);
      bayBack.position.set(0, 0.005, -1.7);
      world.add(bayBack);

      const coneMat = new THREE.MeshStandardMaterial({ color: 0xff5500, roughness: 0.35 });
      const coneStripeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
      const conePositions = [
        [-1.4, 1.7],
        [1.4, 1.7],
        [-1.4, -1.7],
        [1.4, -1.7],
      ];

      conePositions.forEach(([cx, cz]) => {
        const coneGroup = new THREE.Group();
        coneGroup.position.set(cx, 0, cz);

        const cBase = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.025, 0.24), coneMat);
        cBase.position.y = 0.012;
        coneGroup.add(cBase);

        const cBody = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.32, 16), coneMat);
        cBody.position.y = 0.17;
        cBody.castShadow = true;
        coneGroup.add(cBody);

        const cRing = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.07, 16), coneStripeMat);
        cRing.position.y = 0.16;
        coneGroup.add(cRing);

        world.add(coneGroup);
      });

      const carHolder = new THREE.Group();
      world.add(carHolder);

      loadNissanModel().then((model) => {
        const box = new THREE.Box3().setFromObject(model);
        const size = new THREE.Vector3();
        box.getSize(size);
        const scale = 2.0 / (Math.max(size.x, size.z) || 1);
        model.scale.setScalar(scale);

        const scaledBox = new THREE.Box3().setFromObject(model);
        const scaledCenter = new THREE.Vector3();
        scaledBox.getCenter(scaledCenter);

        model.position.x = -scaledCenter.x;
        model.position.z = -scaledCenter.z;
        model.position.y = -scaledBox.min.y + 0.01;

        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            mesh.visible = true;

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
          }
        });

        carHolder.add(model);
      });

      animUpdate = (time) => {
        const cycle = time % 8.2;

        if (cycle < 1.8) {
          const p = cycle / 1.8;
          carHolder.position.set(0.18 - p * 0.06, 0, 1.3 - p * 0.4);
          carHolder.rotation.set(0, 0.04, 0);
        } else if (cycle < 2.8) {
          carHolder.position.set(0.12, 0, 0.9);
          carHolder.rotation.set(0, 0.06, 0);
        } else if (cycle < 5.4) {
          const p = (cycle - 2.8) / 2.6;
          const ease = p * p * (3 - 2 * p);
          const posX = 0.12 - ease * 0.12;
          const posZ = 0.9 - ease * 0.9;
          const rotY = 0.06 - ease * 0.06;
          carHolder.position.set(posX, 0, posZ);
          carHolder.rotation.set(0, rotY, 0);
        } else if (cycle < 7.4) {
          carHolder.position.set(0, 0, 0);
          carHolder.rotation.set(0, 0, 0);
        } else {
          carHolder.position.set(0.18, 0, 1.3);
          carHolder.rotation.set(0, 0.04, 0);
        }
      };
    } else {
      // ═════════════════════════════════════════════════════════════════════════
      // ─── 03 REFRESHER: ROAD RULES & SIGNALS REFRESH (TRAFFIC LIGHT & SPEED 40)
      // ═════════════════════════════════════════════════════════════════════════
      const groundMat = new THREE.MeshStandardMaterial({ color: 0x06142a, roughness: 0.85, metalness: 0.15 });
      const groundPlane = new THREE.Mesh(new THREE.PlaneGeometry(28, 28), groundMat);
      groundPlane.rotation.x = -Math.PI / 2;
      groundPlane.position.y = -0.01;
      groundPlane.receiveShadow = true;
      world.add(groundPlane);

      const asphaltMat = new THREE.MeshStandardMaterial({ color: 0x0e2040, roughness: 0.65, metalness: 0.25 });
      const road = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 28), asphaltMat);
      road.rotation.x = -Math.PI / 2;
      road.position.y = 0.0;
      road.receiveShadow = true;
      world.add(road);

      const sidewalkL = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.04, 28), curbMat);
      sidewalkL.position.set(-4.2, 0.02, 0);
      sidewalkL.receiveShadow = true;
      world.add(sidewalkL);

      const sidewalkR = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.04, 28), curbMat);
      sidewalkR.position.set(4.2, 0.02, 0);
      sidewalkR.receiveShadow = true;
      world.add(sidewalkR);

      for (let i = -1.5; i <= 1.5; i += 0.5) {
        const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.008, 0.8), markMat);
        stripe.position.set(i, 0.005, 0.85);
        world.add(stripe);
      }

      const stopLine = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.008, 0.12), goldMarkMat);
      stopLine.position.set(0, 0.005, 0.25);
      world.add(stopLine);

      const poleMat = new THREE.MeshStandardMaterial({ color: 0x243b66, metalness: 0.7, roughness: 0.3 });
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.0, 12), poleMat);
      pole.position.set(2.45, 1.0, 0.2);
      pole.castShadow = true;
      world.add(pole);

      const signalBox = new THREE.Mesh(new RoundedBoxGeometry(0.24, 0.68, 0.24, 3, 0.04), curbMat);
      signalBox.position.set(2.45, 1.8, 0.28);
      world.add(signalBox);

      const redMat = new THREE.MeshStandardMaterial({ color: 0x330000, emissive: 0xff1111, emissiveIntensity: 3.5 });
      const redBulb = new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 12), redMat);
      redBulb.position.set(2.45, 2.0, 0.41);
      world.add(redBulb);

      const yellowMat = new THREE.MeshStandardMaterial({ color: 0x332200, emissive: 0xffaa00, emissiveIntensity: 0.05 });
      const yellowBulb = new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 12), yellowMat);
      yellowBulb.position.set(2.45, 1.8, 0.41);
      world.add(yellowBulb);

      const greenMat = new THREE.MeshStandardMaterial({ color: 0x003311, emissive: 0x22ff66, emissiveIntensity: 0.05 });
      const greenBulb = new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 12), greenMat);
      greenBulb.position.set(2.45, 1.6, 0.41);
      world.add(greenBulb);

      const signPost = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.5, 8), poleMat);
      signPost.position.set(-2.45, 0.75, 0.2);
      signPost.castShadow = true;
      world.add(signPost);

      const signPlate = new THREE.Mesh(
        new THREE.CylinderGeometry(0.32, 0.32, 0.02, 32),
        new THREE.MeshStandardMaterial({ color: 0xc8d2dc, metalness: 0.7, roughness: 0.35 })
      );
      signPlate.rotation.x = Math.PI / 2;
      signPlate.position.set(-2.45, 1.45, 0.24);
      world.add(signPlate);

      const signFace = new THREE.Mesh(
        new THREE.PlaneGeometry(0.62, 0.62),
        new THREE.MeshStandardMaterial({
          map: createSpeedLimitTexture("40"),
          transparent: true,
          roughness: 0.35,
          metalness: 0.05,
          polygonOffset: true,
          polygonOffsetFactor: -1,
          polygonOffsetUnits: -1,
        })
      );
      signFace.position.set(-2.45, 1.45, 0.26);
      world.add(signFace);

      const carHolder = new THREE.Group();
      world.add(carHolder);

      loadNissanModel().then((model) => {
        const box = new THREE.Box3().setFromObject(model);
        const size = new THREE.Vector3();
        box.getSize(size);
        const scale = 2.15 / (Math.max(size.x, size.z) || 1);
        model.scale.setScalar(scale);

        const scaledBox = new THREE.Box3().setFromObject(model);
        const scaledCenter = new THREE.Vector3();
        scaledBox.getCenter(scaledCenter);

        model.position.x = -scaledCenter.x;
        model.position.z = -scaledCenter.z;
        model.position.y = -scaledBox.min.y + 0.01;

        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            mesh.visible = true;

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
          }
        });

        carHolder.add(model);
      });

      carHolder.position.set(0, 0, -1.15);
      carHolder.rotation.y = 0.06;

      animUpdate = (time) => {
        const cycle = time % 6.8;

        if (cycle < 2.8) {
          redMat.emissiveIntensity = 3.5;
          yellowMat.emissiveIntensity = 0.05;
          greenMat.emissiveIntensity = 0.05;

          carHolder.position.set(0, 0, -1.15);
          carHolder.rotation.y = 0.06;
          carHolder.rotation.x = 0;
        } else if (cycle < 3.5) {
          redMat.emissiveIntensity = 0.05;
          yellowMat.emissiveIntensity = 3.5;
          greenMat.emissiveIntensity = 0.05;

          carHolder.position.set(0, Math.sin(time * 35) * 0.003, -1.15);
          carHolder.rotation.x = Math.sin(time * 30) * 0.005;
        } else if (cycle < 5.8) {
          redMat.emissiveIntensity = 0.05;
          yellowMat.emissiveIntensity = 0.05;
          greenMat.emissiveIntensity = 3.5;

          const progress = (cycle - 3.5) / 2.3;
          const ease = progress * progress * (3 - 2 * progress);
          const currentZ = -1.15 + ease * 3.8;

          const roadBounce = Math.sin(time * 24) * 0.004;
          carHolder.position.set(0, roadBounce, currentZ);
          carHolder.rotation.x = progress < 0.25 ? 0.04 : -0.01;
          carHolder.rotation.y = 0.06;
        } else {
          redMat.emissiveIntensity = 0.8;
          yellowMat.emissiveIntensity = 0.05;
          greenMat.emissiveIntensity = 0.05;

          carHolder.position.set(0, 0, -1.15);
          carHolder.rotation.x = 0;
          carHolder.rotation.y = 0.06;
        }
      };
    }

    // ── Mouse Hover Tilt Effect ───────────────────────────────────────────────
    let targetTiltX = 0;
    let targetTiltY = 0;
    let currentTiltX = 0;
    let currentTiltY = 0;

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      targetTiltY = nx * 0.28;
      targetTiltX = -ny * 0.18;
    };

    const onMouseLeave = () => {
      targetTiltX = 0;
      targetTiltY = 0;
    };

    container.addEventListener("mousemove", onMouseMove);
    container.addEventListener("mouseleave", onMouseLeave);

    // ── Resize & Render Loop ──────────────────────────────────────────────────
    let raf = 0;
    const resize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    const render = () => {
      raf = requestAnimationFrame(render);
      resize();

      currentTiltX += (targetTiltX - currentTiltX) * 0.08;
      currentTiltY += (targetTiltY - currentTiltY) * 0.08;
      world.rotation.x = currentTiltX;
      world.rotation.y = currentTiltY;

      const time = performance.now() / 1000;
      animUpdate(time);

      renderer.render(scene, camera);
    };
    render();

    return () => {
      cancelAnimationFrame(raf);
      container.removeEventListener("mousemove", onMouseMove);
      container.removeEventListener("mouseleave", onMouseLeave);
      renderer.dispose();
    };
  }, [courseId]);

  return (
    <div ref={containerRef} className="course-diorama-wrap" aria-label="Course 3D Showcase">
      <canvas ref={canvasRef} className="course-diorama-canvas" />
    </div>
  );
}
