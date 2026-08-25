"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

interface FinalArrivalCanvasProps {
  onReady?: () => void;
  onArrived?: () => void;
}

type VehicleRole = "hero" | "van" | "motorcycle" | "scooter";

const assetPaths = {
  branch: "/assets/fleet/tl-mabuhay-branch-arrival-environment.glb",
  nissan: "/assets/2007-nissan-sentra-tl-mabuhay-hood-decal.glb",
  hiace: "/assets/fleet/2018_toyota_hiace_version_2.glb",
  motorcycle: "/assets/fleet/motorcycle_model_planeta_sport.glb",
  scooter: "/assets/fleet/retro_vespa_scooter.glb",
  logo: "/assets/tl-mabuhay-logo-transparent.png",
  navalPoster: "/assets/fleet/tl-mabuhay-naval-poster.png",
  coursesBanner: "/assets/fleet/tl-mabuhay-courses-banner.png",
  sentraSideLeft: "/assets/fleet/tl-mabuhay-side-livery-left.png",
  sentraSideRight: "/assets/fleet/tl-mabuhay-side-livery-right.png",
  sentraRear: "/assets/fleet/tl-mabuhay-student-driver-sticker.png",
};

const branchArtworkMaterialPattern = /(?:sign|poster|logo|message)_artwork/;

function tuneMaterial(material: THREE.Material, role?: VehicleRole) {
  const tuned = material.clone();
  const name = tuned.name.toLowerCase();

  if (tuned instanceof THREE.MeshStandardMaterial) {
    tuned.envMapIntensity = role ? 1.25 : 0.72;

    if (role === "hero" && name.includes("nissansentra") && !/glass|plast|wheel|luz|int/.test(name)) {
      tuned.color.set(0x0d285b);
      tuned.metalness = 0.82;
      tuned.roughness = 0.22;
    }

    if ((role === "motorcycle" || role === "scooter") && name.includes("orange")) {
      tuned.color.set(0xf3b61f);
      tuned.metalness = 0.68;
      tuned.roughness = 0.28;
    }

    if (role === "van" && name.includes("mirror")) {
      tuned.color.set(0x31445a);
      tuned.metalness = 0.92;
      tuned.roughness = 0.16;
      tuned.envMapIntensity = 1.6;
      tuned.transparent = false;
      tuned.opacity = 1;
      tuned.depthWrite = true;
      tuned.depthTest = true;
      tuned.side = THREE.DoubleSide;
      tuned.polygonOffset = true;
      tuned.polygonOffsetFactor = -1;
      tuned.polygonOffsetUnits = -1;
    }

    if (role === "van" && (name.includes("glass") || /object_10|object_24|object_40|object_56|object_62/i.test(name))) {
      tuned.color.set(0x0c1e30);
      tuned.metalness = 0.15;
      tuned.roughness = 0.08;
      tuned.transparent = true;
      tuned.opacity = 0.88;
      tuned.depthWrite = true;
      tuned.depthTest = true;
      tuned.side = THREE.FrontSide;
      tuned.polygonOffset = true;
      tuned.polygonOffsetFactor = -1;
      tuned.polygonOffsetUnits = -1;
    }

    if (/sign_artwork|logo_artwork|warm_light|facade_downlight/.test(name)) {
      tuned.emissive.set(0xf3b61f);
      tuned.emissiveIntensity = 0.48;
    }

    if (/storefront_glass|interior_shadow/.test(name)) {
      tuned.emissive.set(0x173d68);
      tuned.emissiveIntensity = 0.22;
    }

    if (/decal/.test(name)) {
      tuned.transparent = true;
      tuned.depthWrite = false;
      tuned.polygonOffset = true;
      tuned.polygonOffsetFactor = -2;
      tuned.polygonOffsetUnits = -2;
    }
  }

  return tuned;
}

function prepareModel(root: THREE.Object3D, role?: VehicleRole) {
  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;

    const materials = Array.isArray(child.material) ? child.material : [child.material];
    const materialNames = materials.map((material) => material.name.toLowerCase()).join(" ");
    if (/arrival_arrow|facade_downlight/i.test(child.name)) {
      child.visible = false;
      return;
    }

    // Eliminate HiAce duplicate/overlapping window mesh layers that cause z-fighting flickering
    if (
      role === "van" &&
      /object_26|object_30|object_82|object_36|object_42|object_86|object_54|object_88|object_66|object_90/i.test(
        child.name
      )
    ) {
      child.visible = false;
      return;
    }

    if (
      role === "motorcycle" &&
      (/circle\.003|background/.test(child.name.toLowerCase()) || materialNames.includes("c_background"))
    ) {
      child.visible = false;
      return;
    }

    child.castShadow = role !== undefined;
    child.receiveShadow = true;
    child.frustumCulled = role !== "van";

    child.material = Array.isArray(child.material)
      ? child.material.map((material) => tuneMaterial(material, role))
      : tuneMaterial(child.material, role);
  });
}

function correctBranchArtwork(root: THREE.Object3D) {
  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    if (!materials.some((material) => branchArtworkMaterialPattern.test(material.name.toLowerCase()))) {
      return;
    }

    const geometry = child.geometry.clone();
    const sourceUv = geometry.getAttribute("uv");
    if (sourceUv) {
      const correctedUv = sourceUv.clone();
      for (let index = 0; index < correctedUv.count; index += 1) {
        correctedUv.setY(index, 1 - correctedUv.getY(index));
      }
      correctedUv.needsUpdate = true;
      geometry.setAttribute("uv", correctedUv);
      child.geometry = geometry;
    }
  });

  const upperEmblem = root.getObjectByName("Upper_Round_Emblem");
  if (upperEmblem instanceof THREE.Mesh) {
    upperEmblem.position.set(5.30, 5.70, 1.918);
    upperEmblem.renderOrder = 4;
  }

  // Scale and center the showroom window Enrollment Poster (exact 1.200 aspect ratio)
  const poster = root.getObjectByName("Enrollment_Poster");
  const posterBacking = root.getObjectByName("Enrollment_Poster_Backing");
  const posterWidth = 1.32;
  const posterHeight = 1.10;
  if (poster instanceof THREE.Mesh) {
    const posterGeometry = new THREE.PlaneGeometry(posterWidth, posterHeight);
    const posterUv = posterGeometry.getAttribute("uv");
    for (let index = 0; index < posterUv.count; index += 1) {
      posterUv.setY(index, 1 - posterUv.getY(index));
    }
    posterUv.needsUpdate = true;
    poster.geometry = posterGeometry;
    poster.position.set(-8.58, 1.65, 1.820);
  }
  if (posterBacking instanceof THREE.Mesh) {
    posterBacking.geometry = new THREE.BoxGeometry(posterWidth + 0.08, posterHeight + 0.08, 0.05);
    posterBacking.position.set(-8.58, 1.65, 1.785);
  }

  // Position Left Fascia Sign over Left Showroom window with clean clearance from AC unit and doorway
  const leftSign = root.getObjectByName("Left_TL_Mabuhay_Sign");
  const leftBacking = root.getObjectByName("Left_TL_Mabuhay_Sign_Backing");
  if (leftSign) {
    leftSign.position.set(-6.93, 3.65, 1.970);
  }
  if (leftBacking) {
    leftBacking.position.set(-6.93, 3.65, 1.915);
  }

  // Position Main Fascia Sign centered over Main Showroom glass facade
  const mainSign = root.getObjectByName("Main_TL_Mabuhay_Sign");
  const mainBacking = root.getObjectByName("Main_TL_Mabuhay_Sign_Backing");
  if (mainSign) {
    mainSign.position.set(3.45, 3.80, 1.960);
  }
  if (mainBacking) {
    mainBacking.position.set(3.45, 3.80, 1.905);
  }
}

function refineNissanHoodDecal(root: THREE.Object3D) {
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
  const sourceMap = sourceMaterial instanceof THREE.MeshBasicMaterial || sourceMaterial instanceof THREE.MeshStandardMaterial
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

function fitVehicle(model: THREE.Object3D, targetLength: number, role: VehicleRole) {
  prepareModel(model, role);
  model.updateMatrixWorld(true);

  const bounds = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3();
  bounds.getSize(size);

  const largestHorizontalDimension = Math.max(size.x, size.z, 0.001);
  const scale = targetLength / largestHorizontalDimension;
  model.scale.setScalar(scale);
  model.updateMatrixWorld(true);

  const fittedBounds = new THREE.Box3().setFromObject(model);
  const center = new THREE.Vector3();
  fittedBounds.getCenter(center);

  model.position.x -= center.x;
  model.position.z -= center.z;
  model.position.y -= fittedBounds.min.y;

  const holder = new THREE.Group();
  holder.name = `${role.toUpperCase()}_HOLDER`;
  holder.add(model);
  return holder;
}

function createFleetLiveryTexture(logoTexture?: THREE.Texture) {
  const canvas = document.createElement("canvas");
  canvas.width = 1280;
  canvas.height = 400;
  const context = canvas.getContext("2d");
  if (!context) return null;

  context.clearRect(0, 0, canvas.width, canvas.height);

  const logoImage = logoTexture?.image as CanvasImageSource | undefined;
  if (logoImage) {
    context.drawImage(logoImage, 40, 56, 288, 288);
  } else {
    context.fillStyle = "#071a31";
    context.beginPath();
    context.arc(176, 200, 140, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#f8bd20";
    context.font = "900 94px Arial, sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText("TL", 176, 204);
  }

  context.textAlign = "left";
  context.textBaseline = "alphabetic";
  context.fillStyle = "#071a31";
  context.font = "900 116px Arial, sans-serif";
  context.fillText("TL MABUHAY", 348, 154);
  context.font = "800 45px Arial, sans-serif";
  context.fillText("DRIVING LESSON ACADEMY, INC.", 352, 220);
  context.fillStyle = "#f2b71c";
  context.fillRect(350, 244, 824, 12);
  context.fillStyle = "#a7182a";
  context.font = "italic 800 40px Arial, sans-serif";
  context.fillText("Your Defensive Driving Advocate", 352, 312);

  const liveryTexture = new THREE.CanvasTexture(canvas);
  liveryTexture.colorSpace = THREE.SRGBColorSpace;
  liveryTexture.anisotropy = 8;
  liveryTexture.premultiplyAlpha = true;
  liveryTexture.needsUpdate = true;
  return liveryTexture;
}

function addFleetLivery(vehicle: THREE.Group, liveryTexture: THREE.Texture) {
  vehicle.updateMatrixWorld(true);

  const panelLength = 1.82;
  const panelHeight = 0.54;
  const panelGeometry = new THREE.PlaneGeometry(panelLength, panelHeight);

  // Door sheet metal X offset (actual side body surface of the HiAce is at ~0.893m)
  const sideOffset = 0.898;

  const makePanel = (side: -1 | 1) => {
    const panelMaterial = new THREE.MeshStandardMaterial({
      map: liveryTexture,
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
    const panel = new THREE.Mesh(panelGeometry, panelMaterial);
    panel.name = side === 1 ? "TL_Mabuhay_Livery_Right" : "TL_Mabuhay_Livery_Left";
    panel.position.set(
      side === 1 ? sideOffset : -sideOffset,
      0.90, // centered on the solid white metal door panel below the window line (Y=1.23m)
      0.22  // centered along the mid-forward side body
    );
    panel.rotation.y = side === 1 ? Math.PI / 2 : -Math.PI / 2;
    panel.renderOrder = 4;
    vehicle.add(panel);
  };

  makePanel(-1);
  makePanel(1);
}

function addSentraLivery(
  vehicle: THREE.Group,
  textures: { left?: THREE.Texture; right?: THREE.Texture; rear?: THREE.Texture }
) {
  vehicle.updateMatrixWorld(true);

  const createDecalMaterial = (tex?: THREE.Texture) =>
    new THREE.MeshStandardMaterial({
      map: tex,
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

  const sideGeometry = new THREE.PlaneGeometry(1.36, 0.318);

  if (textures.left) {
    textures.left.colorSpace = THREE.SRGBColorSpace;
    textures.left.anisotropy = 8;
    textures.left.needsUpdate = true;
    const leftPanel = new THREE.Mesh(sideGeometry, createDecalMaterial(textures.left));
    leftPanel.name = "Sentra_Livery_Left";
    leftPanel.position.set(-0.865, 0.68, 0.10);
    leftPanel.rotation.y = -Math.PI / 2;
    leftPanel.renderOrder = 4;
    vehicle.add(leftPanel);
  }

  if (textures.right) {
    textures.right.colorSpace = THREE.SRGBColorSpace;
    textures.right.anisotropy = 8;
    textures.right.needsUpdate = true;
    const rightPanel = new THREE.Mesh(sideGeometry, createDecalMaterial(textures.right));
    rightPanel.name = "Sentra_Livery_Right";
    rightPanel.position.set(0.865, 0.68, 0.10);
    rightPanel.rotation.y = Math.PI / 2;
    rightPanel.renderOrder = 4;
    vehicle.add(rightPanel);
  }

  if (textures.rear) {
    textures.rear.colorSpace = THREE.SRGBColorSpace;
    textures.rear.anisotropy = 8;
    textures.rear.needsUpdate = true;
    const bumperGeometry = new THREE.PlaneGeometry(1.44, 0.14);
    const bumperSticker = new THREE.Mesh(bumperGeometry, createDecalMaterial(textures.rear));
    bumperSticker.name = "Sentra_Bumper_Sticker";
    bumperSticker.position.set(0.00, 0.52, -2.228);
    bumperSticker.rotation.y = Math.PI;
    bumperSticker.renderOrder = 4;
    vehicle.add(bumperSticker);
  }
}

function addMotorcycleParkingArea(world: THREE.Group) {
  const parkingGroup = new THREE.Group();
  parkingGroup.name = "Dedicated_Motorcycle_Parking";

  // White road-marking paint for the center stall divider line
  const dividerMaterial = new THREE.MeshStandardMaterial({
    color: 0xf4f7fa,
    roughness: 0.52,
    metalness: 0.02,
  });
  const centerDivider = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.015, 5.52),
    dividerMaterial
  );
  centerDivider.position.set(4, 0.058, 6.65);
  centerDivider.receiveShadow = true;
  parkingGroup.add(centerDivider);

  world.add(parkingGroup);
}

function addNavalBranchPoster(world: THREE.Group, posterTexture: THREE.Texture) {
  posterTexture.colorSpace = THREE.SRGBColorSpace;
  posterTexture.anisotropy = 8;
  posterTexture.needsUpdate = true;

  const posterGroup = new THREE.Group();
  posterGroup.name = "Naval_Branch_Promotional_Poster";

  const posterWidth = 0.88;
  const posterHeight = 1.35;

  // Exterior dark aluminum backing frame
  const backingMaterial = new THREE.MeshStandardMaterial({
    color: 0x182433,
    roughness: 0.38,
    metalness: 0.72,
  });
  const backingMesh = new THREE.Mesh(
    new THREE.BoxGeometry(posterWidth + 0.05, posterHeight + 0.05, 0.02),
    backingMaterial
  );
  backingMesh.position.set(-3.06, 1.65, 1.795);
  backingMesh.castShadow = true;
  backingMesh.receiveShadow = true;
  posterGroup.add(backingMesh);

  // High-resolution Naval Branch course pricing poster graphic
  const posterMaterial = new THREE.MeshStandardMaterial({
    map: posterTexture,
    roughness: 0.35,
    metalness: 0.04,
    side: THREE.FrontSide,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  });
  const posterMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(posterWidth, posterHeight),
    posterMaterial
  );
  posterMesh.position.set(-3.06, 1.65, 1.808);
  posterMesh.renderOrder = 3;
  posterGroup.add(posterMesh);

  world.add(posterGroup);
}

export function FinalArrivalCanvas({ onReady, onArrived }: FinalArrivalCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const host = containerRef.current;
    const canvasElement = canvasRef.current;
    if (!host || !canvasElement) return;
    const stableHost: HTMLDivElement = host;
    const stableCanvas: HTMLCanvasElement = canvasElement;

    let disposed = false;
    let initialized = false;
    let sceneVisible = false;
    let animationFrame = 0;
    let renderer: THREE.WebGLRenderer | null = null;
    let resizeObserver: ResizeObserver | null = null;

    const pointer = new THREE.Vector2();

    const preloadObserver = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting) || initialized) return;
        initialized = true;
        preloadObserver.disconnect();
        void initializeScene();
      },
      { rootMargin: "900px 0px" }
    );

    const visibilityObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        sceneVisible = entry.isIntersecting;
      },
      { threshold: 0 }
    );

    const onPointerMove = (event: PointerEvent) => {
      const bounds = stableHost.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      pointer.y = -(((event.clientY - bounds.top) / bounds.height) * 2 - 1);
    };

    async function initializeScene() {
      renderer = new THREE.WebGLRenderer({
        canvas: stableCanvas,
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.24;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      const scene = new THREE.Scene();
      const pmrem = new THREE.PMREMGenerator(renderer);
      const room = new RoomEnvironment();
      const envMap = pmrem.fromScene(room, 0.04).texture;
      scene.environment = envMap;
      room.dispose();
      pmrem.dispose();

      const camera = new THREE.PerspectiveCamera(37, 1, 0.1, 180);
      const cameraPosition = new THREE.Vector3();
      const cameraTarget = new THREE.Vector3();

      scene.add(new THREE.AmbientLight(0xe4f0fb, 1.15));

      const sunlight = new THREE.DirectionalLight(0xfff3d8, 3.2);
      sunlight.position.set(16, 22, 18);
      sunlight.castShadow = true;
      sunlight.shadow.mapSize.set(2048, 2048);
      sunlight.shadow.camera.near = 1;
      sunlight.shadow.camera.far = 70;
      sunlight.shadow.camera.left = -16;
      sunlight.shadow.camera.right = 16;
      sunlight.shadow.camera.top = 16;
      sunlight.shadow.camera.bottom = -16;
      sunlight.shadow.bias = -0.00035;
      scene.add(sunlight);

      // Warm Golden Sunrise Rim Light streaming from the horizon
      const sunriseBacklight = new THREE.DirectionalLight(0xffbe4d, 2.4);
      sunriseBacklight.position.set(-16, 12, -4);
      scene.add(sunriseBacklight);

      const navyFill = new THREE.DirectionalLight(0x8bb8e4, 1.4);
      navyFill.position.set(14, 9, 8);
      scene.add(navyFill);

      const branchGlow = new THREE.PointLight(0xffca58, 4.8, 32, 1.4);
      branchGlow.position.set(0, 5.2, 4.6);
      scene.add(branchGlow);

      // Showroom interior warm light fill
      const interiorFill = new THREE.PointLight(0xffe8a3, 3.6, 24, 1.5);
      interiorFill.position.set(0, 2.8, 0.0);
      scene.add(interiorFill);

      const arrivalPool = new THREE.SpotLight(0xffc55c, 4.2, 18, Math.PI / 4.6, 0.74, 1.5);
      arrivalPool.position.set(-1.5, 9, 11);
      arrivalPool.target.position.set(0, 0, 6.75);
      scene.add(arrivalPool, arrivalPool.target);

      const world = new THREE.Group();
      scene.add(world);

      const loader = new GLTFLoader();
      const viewerFacingHeading = 0;

      try {
        const branchGltf = await loader.loadAsync(assetPaths.branch);
        if (disposed) return;

        const branch = branchGltf.scene;
        prepareModel(branch);
        correctBranchArtwork(branch);
        const embeddedVehicle = branch.getObjectByName("Student_Driver_Car");
        if (embeddedVehicle) embeddedVehicle.visible = false;
        world.add(branch);
        addMotorcycleParkingArea(world);

        const textureLoader = new THREE.TextureLoader();
        void textureLoader.loadAsync(assetPaths.navalPoster).then((posterTexture) => {
          if (!disposed) {
            addNavalBranchPoster(world, posterTexture);
          }
        }).catch((err) => {
          console.warn("Naval branch poster could not load.", err);
        });

        void textureLoader.loadAsync(assetPaths.coursesBanner).then((bannerTexture) => {
          if (disposed) return;
          bannerTexture.colorSpace = THREE.SRGBColorSpace;
          bannerTexture.anisotropy = 8;
          bannerTexture.needsUpdate = true;

          const leftSign = branch.getObjectByName("Left_TL_Mabuhay_Sign");
          const leftBacking = branch.getObjectByName("Left_TL_Mabuhay_Sign_Backing");
          if (leftSign instanceof THREE.Mesh) {
            const bannerWidth = 2.95;
            const bannerHeight = 1.086;
            leftSign.geometry = new THREE.PlaneGeometry(bannerWidth, bannerHeight);
            leftSign.material = new THREE.MeshStandardMaterial({
              map: bannerTexture,
              roughness: 0.35,
              metalness: 0.04,
              emissive: 0xf3b61f,
              emissiveIntensity: 0.12,
              side: THREE.FrontSide,
            });
            leftSign.position.set(-6.93, 3.65, 1.970);
            leftSign.renderOrder = 3;
          }
          if (leftBacking instanceof THREE.Mesh) {
            leftBacking.geometry = new THREE.BoxGeometry(3.05, 1.186, 0.08);
            leftBacking.position.set(-6.93, 3.65, 1.915);
          }
        }).catch((err) => {
          console.warn("Courses banner could not load.", err);
        });

        let heroModel: THREE.Object3D | null = null;
        try {
          heroModel = (await loader.loadAsync(assetPaths.nissan)).scene;
        } catch {
          if (embeddedVehicle) {
            embeddedVehicle.removeFromParent();
            embeddedVehicle.visible = true;
            embeddedVehicle.position.set(0, 0, 0);
            embeddedVehicle.rotation.set(0, 0, 0);
            embeddedVehicle.scale.set(1, 1, 1);
            heroModel = embeddedVehicle;
          }
        }

        if (heroModel) {
          refineNissanHoodDecal(heroModel);
          const heroVehicle = fitVehicle(heroModel, 4.45, "hero");
          heroVehicle.position.set(0, 0.15, 6.75);
          heroVehicle.rotation.y = viewerFacingHeading;
          world.add(heroVehicle);

          void Promise.allSettled([
            textureLoader.loadAsync(assetPaths.sentraSideLeft),
            textureLoader.loadAsync(assetPaths.sentraSideRight),
            textureLoader.loadAsync(assetPaths.sentraRear),
          ]).then(([leftRes, rightRes, rearRes]) => {
            if (disposed) return;
            addSentraLivery(heroVehicle, {
              left: leftRes.status === "fulfilled" ? leftRes.value : undefined,
              right: rightRes.status === "fulfilled" ? rightRes.value : undefined,
              rear: rearRes.status === "fulfilled" ? rearRes.value : undefined,
            });
          }).catch((err) => {
            console.warn("Sentra liveries could not load.", err);
          });
        }

        const compactLayout = stableHost.clientWidth < 760;
        if (!compactLayout) {
          const loadSupportFleet = async () => {
            const supportResults = await Promise.allSettled([
              loader.loadAsync(assetPaths.hiace),
              loader.loadAsync(assetPaths.motorcycle),
              loader.loadAsync(assetPaths.scooter),
              new THREE.TextureLoader().loadAsync(assetPaths.logo),
            ]);
            if (disposed) return;

            const logoResult = supportResults[3];
            const liveryTexture = createFleetLiveryTexture(
              logoResult.status === "fulfilled" ? logoResult.value : undefined
            );

            const hiaceResult = supportResults[0];
            if (hiaceResult.status === "fulfilled") {
              const hiace = fitVehicle(hiaceResult.value.scene, 4.55, "van");
              if (liveryTexture) addFleetLivery(hiace, liveryTexture);
              hiace.position.set(-4, 0.15, 6.75);
              hiace.rotation.y = viewerFacingHeading;
              world.add(hiace);
            }

            const motorcycleResult = supportResults[1];
            if (motorcycleResult.status === "fulfilled") {
              const motorcycle = fitVehicle(motorcycleResult.value.scene, 2.24, "motorcycle");
              motorcycle.position.set(3.03, 0.15, 6.75);
              motorcycle.rotation.y = viewerFacingHeading;
              world.add(motorcycle);
            }

            const scooterResult = supportResults[2];
            if (scooterResult.status === "fulfilled") {
              const scooter = fitVehicle(scooterResult.value.scene, 1.92, "scooter");
              scooter.position.set(4.97, 0.15, 6.75);
              scooter.rotation.y = viewerFacingHeading;
              world.add(scooter);
            }
          };

          void loadSupportFleet().catch((error) => {
            console.warn("The supporting arrival fleet could not finish loading.", error);
          });
        }

        onReady?.();
        onArrived?.();
      } catch (error) {
        console.warn("The branch-arrival scene could not load; showing the branded fallback.", error);
        onReady?.();
      }

      const setCameraFraming = () => {
        const width = Math.max(stableHost.clientWidth, 1);
        const height = Math.max(stableHost.clientHeight, 1);
        const compact = width < 760;

        camera.aspect = width / height;
        camera.fov = compact ? 47 : 37;
        camera.updateProjectionMatrix();
        renderer?.setSize(width, height, false);

        if (compact) {
          cameraPosition.set(13.7, 9.2, 23.4);
          cameraTarget.set(0, 2.2, 6.2);
        } else {
          cameraPosition.set(11.5, 6.7, 15.8);
          cameraTarget.set(0, 2.25, 5.8);
        }
      };

      resizeObserver = new ResizeObserver(setCameraFraming);
      resizeObserver.observe(stableHost);
      setCameraFraming();

      const renderFrame = () => {
        animationFrame = window.requestAnimationFrame(renderFrame);
        if (!renderer || disposed || !sceneVisible) return;

        camera.position.copy(cameraPosition);
        camera.position.x += pointer.x * (stableHost.clientWidth < 760 ? 0.18 : 0.42);
        camera.position.y += pointer.y * 0.18;
        camera.lookAt(cameraTarget);

        renderer.render(scene, camera);
      };

      animationFrame = window.requestAnimationFrame(renderFrame);
    }

    preloadObserver.observe(stableHost);
    visibilityObserver.observe(stableHost);
    stableHost.addEventListener("pointermove", onPointerMove, { passive: true });

    return () => {
      disposed = true;
      window.cancelAnimationFrame(animationFrame);
      preloadObserver.disconnect();
      visibilityObserver.disconnect();
      resizeObserver?.disconnect();
      stableHost.removeEventListener("pointermove", onPointerMove);
      renderer?.dispose();
    };
  }, [onArrived, onReady]);

  return (
    <div
      ref={containerRef}
      className="arrival-canvas-shell"
      role="img"
      aria-label="A TL Mabuhay training fleet parked at the academy branch and facing the viewer"
    >
      <canvas ref={canvasRef} className="arrival-canvas" aria-hidden="true" />
    </div>
  );
}
