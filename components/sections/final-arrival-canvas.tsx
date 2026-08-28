"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { makeDecalMaterial, refineNissanHoodDecal } from "@/components/sections/shared/nissan-utils";

interface FinalArrivalCanvasProps {
  onReady?: () => void;
  onArrived?: () => void;
}

type VehicleRole = "hero" | "van" | "motorcycle" | "scooter" | "truck";

const assetPaths = {
  branch: "/assets/fleet/tl-mabuhay-branch-arrival-environment.glb",
  nissan: "/assets/2007-nissan-sentra-tl-mabuhay-hood-decal.glb",
  hiace: "/assets/fleet/2018_toyota_hiace_version_2.glb",
  motorcycle: "/assets/fleet/motorcycle_model_planeta_sport.glb",
  scooter: "/assets/fleet/retro_vespa_scooter.glb",
  truck: "/assets/fleet/shacman_f3000_dump_truck.glb",
  grassHorizon: "/assets/fleet/grass.png",
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

    if (role === "truck") {
      // Crisp white automotive paint on cabin, dump bed, and body panels
      if (
        /main|108|body|panel|object_0|object_41/i.test(name) ||
        (tuned.color && tuned.color.r > 0.6 && tuned.color.g < 0.3)
      ) {
        tuned.color.set(0xf8fafc);
        tuned.roughness = 0.30;
        tuned.metalness = 0.04;
        tuned.envMapIntensity = 1.35;
      }

      // Windshield & side window cab glass
      if (name.includes("133") || name.includes("glass")) {
        tuned.color.set(0x0c1e30);
        tuned.roughness = 0.06;
        tuned.metalness = 0.15;
        tuned.transparent = true;
        tuned.opacity = 0.85;
        tuned.depthWrite = true;
        tuned.side = THREE.FrontSide;
      }

      // Chrome emblems, grille & exhaust trim
      if (name.includes("126") || name.includes("icon")) {
        tuned.color.set(0xecf0f5);
        tuned.metalness = 0.92;
        tuned.roughness = 0.14;
      }

      // Dark chassis frame / rubber tires / bumper
      if (/hamm_black|109|116|117|004|tire|wheel|bak\.002/i.test(name)) {
        tuned.color.set(0x18202c);
        tuned.roughness = 0.76;
        tuned.metalness = 0.15;
      }
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

    if (/foliage|tree|shrub|landscape_green/i.test(name)) {
      if (name.includes("blue_green")) {
        tuned.color.set(0x287850);
      } else {
        tuned.color.set(0x1e5e3a);
      }
      tuned.roughness = 0.72;
      tuned.metalness = 0.02;
    }

    if (/twilight_terrain|deep_navy_terrain/i.test(name)) {
      tuned.color.set(0x122e46);
      tuned.roughness = 0.75;
      tuned.metalness = 0.05;
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

    // Remove legacy 2D flat brown billboard backdrop meshes, floor light pools, and temporary guides
    if (
      /arrival_arrow|facade_downlight|repository_twilight_backdrop|horizon_gold_disc|far_horizon|mid_horizon|near_horizon|entry_warm_light_pool|warm_light_pool|light_pool/i.test(
        child.name
      ) ||
      /repository_twilight_backdrop_artwork|tl_gold_horizon_glow|far_horizon_material|mid_horizon_material|near_horizon_material|warm_arrival_light_pool/i.test(
        materialNames
      )
    ) {
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

    if (/wheelchair_wheel|wheelchair_head|wheelchair_body|wheelchair_arm|wheelchair_leg/i.test(child.name)) {
      child.visible = false;
      return;
    }

    // Remove cartoon lollipop trees along the approach road in favor of clean roadside grass shoulders
    if (/editorial_tree/i.test(child.name)) {
      child.visible = false;
      return;
    }

    // Remove outer background perimeter rim borders while keeping the driving guide lines and road gold edge beside the truck
    if (/environment_gold_rim/i.test(child.name)) {
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

function createAccessibleParkingTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.clearRect(0, 0, 512, 512);

  // Pure white thermoplastic road-marking paint with transparent background (matches parking stall blue seamlessly)
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 14;
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(24, 24, 464, 464, 38);
  } else {
    ctx.rect(24, 24, 464, 464);
  }
  ctx.stroke();

  // White wheelchair symbol
  ctx.fillStyle = "#ffffff";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // Head
  ctx.beginPath();
  ctx.arc(260, 115, 34, 0, Math.PI * 2);
  ctx.fill();

  // Wheel (C-curve trimmed at top to create a clean gap from the stickman's back)
  ctx.lineWidth = 32;
  ctx.beginPath();
  ctx.arc(220, 290, 92, -1.62, 0.45, true);
  ctx.stroke();

  // Torso, Thigh, Leg, Foot
  ctx.lineWidth = 32;
  ctx.beginPath();
  ctx.moveTo(255, 175);
  ctx.lineTo(255, 280);
  ctx.lineTo(345, 280);
  ctx.lineTo(370, 375);
  ctx.lineTo(405, 375);
  ctx.stroke();

  // Arm & Hand (Stops cleanly above the thigh, does not cross through the leg)
  ctx.lineWidth = 28;
  ctx.beginPath();
  ctx.moveTo(255, 210);
  ctx.lineTo(325, 255);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
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
    upperEmblem.scale.setScalar(1.35);
    upperEmblem.position.set(6.35, 5.50, 1.918);
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
    poster.position.set(-7.00, 1.65, 1.820);
  }
  if (posterBacking instanceof THREE.Mesh) {
    posterBacking.geometry = new THREE.BoxGeometry(posterWidth + 0.08, posterHeight + 0.08, 0.05);
    posterBacking.position.set(-7.00, 1.65, 1.785);
  }

  // Reshape and position Left Roof Front Band and Slab so they are seamlessly joined with zero co-planar overlap or z-fighting
  const leftRoofBand = root.getObjectByName("Left_Roof_Front_Band");
  if (leftRoofBand instanceof THREE.Mesh) {
    leftRoofBand.geometry = new THREE.BoxGeometry(7.44, 0.60, 0.30);
    leftRoofBand.position.set(-6.53, 4.48, 1.83);
  }

  const leftRoofSlab = root.getObjectByName("Left_Roof_Slab");
  if (leftRoofSlab instanceof THREE.Mesh) {
    // Deck sits flush behind the front band (Z=1.68) with 3cm recessed right margin to eliminate z-fighting
    leftRoofSlab.geometry = new THREE.BoxGeometry(7.38, 0.36, 3.60);
    leftRoofSlab.position.set(-6.54, 4.37, -0.12);
  }

  // Scale down the 2nd-floor square window slightly and center it cleanly on the upper facade wall
  const windowScale = 0.78;
  const winCenterX = -1.75;
  const winCenterY = 5.58;
  const origWinCenterX = -1.85;
  const origWinCenterY = 5.45;

  const winInterior = root.getObjectByName("Upper_Large_Window_Interior");
  if (winInterior) {
    winInterior.scale.set(windowScale, windowScale, 1);
    winInterior.position.set(winCenterX, winCenterY, 1.675);
  }

  const winGlass = root.getObjectByName("Upper_Large_Window_Glass");
  if (winGlass) {
    winGlass.scale.set(windowScale, windowScale, 1);
    winGlass.position.set(winCenterX, winCenterY, 1.74);
  }

  const winGlow = root.getObjectByName("Upper_Window_Warm_Glow");
  if (winGlow) {
    winGlow.scale.set(windowScale, windowScale, 1);
    winGlow.position.set(winCenterX, winCenterY, 1.695);
  }

  const winTopFrame = root.getObjectByName("Upper_Large_Window_Frame_Top");
  if (winTopFrame) {
    winTopFrame.scale.set(windowScale, windowScale, 1);
    winTopFrame.position.set(winCenterX, winCenterY + (6.425 - origWinCenterY) * windowScale, 1.755);
  }

  const winBottomFrame = root.getObjectByName("Upper_Large_Window_Frame_Bottom");
  if (winBottomFrame) {
    winBottomFrame.scale.set(windowScale, windowScale, 1);
    winBottomFrame.position.set(winCenterX, winCenterY + (4.475 - origWinCenterY) * windowScale, 1.755);
  }

  const winLeftFrame = root.getObjectByName("Upper_Large_Window_Frame_Left");
  if (winLeftFrame) {
    winLeftFrame.scale.set(windowScale, windowScale, 1);
    winLeftFrame.position.set(winCenterX + (-2.80 - origWinCenterX) * windowScale, winCenterY, 1.755);
  }

  const winRightFrame = root.getObjectByName("Upper_Large_Window_Frame_Right");
  if (winRightFrame) {
    winRightFrame.scale.set(windowScale, windowScale, 1);
    winRightFrame.position.set(winCenterX + (-0.90 - origWinCenterX) * windowScale, winCenterY, 1.755);
  }

  // Align the 3 upper slot windows to match the square window's height and vertical alignment
  const slotCentersX = [0.15, 1.55, 2.95];
  for (let slotIndex = 1; slotIndex <= 3; slotIndex += 1) {
    const slotCenterX = slotCentersX[slotIndex - 1];

    const slotInterior = root.getObjectByName(`Upper_Slot_${slotIndex}_Interior`);
    if (slotInterior) {
      slotInterior.scale.set(1, windowScale, 1);
      slotInterior.position.set(slotCenterX, winCenterY, 1.675);
    }

    const slotGlass = root.getObjectByName(`Upper_Slot_${slotIndex}_Glass`);
    if (slotGlass) {
      slotGlass.scale.set(1, windowScale, 1);
      slotGlass.position.set(slotCenterX, winCenterY, 1.74);
    }

    const slotTopFrame = root.getObjectByName(`Upper_Slot_${slotIndex}_Frame_Top`);
    if (slotTopFrame) {
      slotTopFrame.scale.set(1, windowScale, 1);
      slotTopFrame.position.set(slotCenterX, winCenterY + (6.425 - origWinCenterY) * windowScale, 1.755);
    }

    const slotBottomFrame = root.getObjectByName(`Upper_Slot_${slotIndex}_Frame_Bottom`);
    if (slotBottomFrame) {
      slotBottomFrame.scale.set(1, windowScale, 1);
      slotBottomFrame.position.set(slotCenterX, winCenterY + (4.475 - origWinCenterY) * windowScale, 1.755);
    }

    const slotLeftFrame = root.getObjectByName(`Upper_Slot_${slotIndex}_Frame_Left`);
    if (slotLeftFrame) {
      slotLeftFrame.scale.set(1, windowScale, 1);
      slotLeftFrame.position.set(slotCenterX - 0.25, winCenterY, 1.755);
    }

    const slotRightFrame = root.getObjectByName(`Upper_Slot_${slotIndex}_Frame_Right`);
    if (slotRightFrame) {
      slotRightFrame.scale.set(1, windowScale, 1);
      slotRightFrame.position.set(slotCenterX + 0.25, winCenterY, 1.755);
    }
  }

  // Position Left Fascia Sign over Left Showroom window — shifted left away from door edge
  const leftSign = root.getObjectByName("Left_TL_Mabuhay_Sign");
  const leftBacking = root.getObjectByName("Left_TL_Mabuhay_Sign_Backing");
  if (leftSign) {
    leftSign.position.set(-6.80, 3.60, 1.970);
  }
  if (leftBacking) {
    leftBacking.position.set(-6.80, 3.60, 1.915);
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

  // Position wall light sconce block in the wall space to the left of the Main Sign (above right of Main Entrance)
  const leftWallLight = root.getObjectByName("Wall_Light_-275") || root.getObjectByName("Wall_Light_-2.75");
  if (leftWallLight) {
    leftWallLight.position.set(-0.55, 3.10, 1.92);
  }

  // Replace crude/distorted 3D wheelchair meshes with a crisp, authentic painted road-marking decal
  const accessibleSymbol = root.getObjectByName("Accessible_Parking_Symbol");
  if (accessibleSymbol) {
    accessibleSymbol.children.forEach((child) => {
      child.visible = false;
    });

    let decalMesh = accessibleSymbol.getObjectByName("Accessible_Parking_Decal_Mesh");
    if (!decalMesh) {
      const decalGeo = new THREE.PlaneGeometry(1.85, 1.85);
      const decalMat = new THREE.MeshBasicMaterial({
        map: createAccessibleParkingTexture(),
        transparent: true,
        opacity: 0.98,
        side: THREE.FrontSide,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -3,
        polygonOffsetUnits: -3,
      });
      decalMesh = new THREE.Mesh(decalGeo, decalMat);
      decalMesh.name = "Accessible_Parking_Decal_Mesh";
      decalMesh.rotation.x = -Math.PI / 2;
      decalMesh.position.set(0, 0.015, 0);
      decalMesh.renderOrder = 4;
      accessibleSymbol.add(decalMesh);
    }
    accessibleSymbol.position.set(8.0, 0.045, 6.75);
  }

  // Ensure the curved access road uses the exact same asphalt material and flush height as the parking lot
  const parkingAsphalt = root.getObjectByName("Parking_Asphalt");
  const curvedRoad = root.getObjectByName("Curved_Approach_Asphalt");
  const leftTerrace = root.getObjectByName("Left_Landscape_Terrace");
  const rightTerrace = root.getObjectByName("Right_Landscape_Terrace");

  if (leftTerrace) leftTerrace.visible = false;
  if (rightTerrace) rightTerrace.visible = false;

  if (parkingAsphalt instanceof THREE.Mesh) {
    parkingAsphalt.position.y = -0.09; // Top surface = 0.00
  }
  if (curvedRoad instanceof THREE.Mesh) {
    if (parkingAsphalt instanceof THREE.Mesh) {
      curvedRoad.material = parkingAsphalt.material;
    }
    curvedRoad.position.y = 0.00; // Top surface = 0.00
  }

  const frontSidewalk = root.getObjectByName("Front_Sidewalk");

  // Concrete perimeter sidewalk base around the building
  let buildingSidewalk = root.getObjectByName("Building_Perimeter_Sidewalk");
  if (!buildingSidewalk && frontSidewalk instanceof THREE.Mesh) {
    const sidewalkGeo = new THREE.BoxGeometry(22.8, 0.22, 6.4);
    const sidewalkMesh = new THREE.Mesh(sidewalkGeo, frontSidewalk.material);
    sidewalkMesh.name = "Building_Perimeter_Sidewalk";
    sidewalkMesh.position.set(0, 0.01, -0.65);
    sidewalkMesh.receiveShadow = true;
    root.add(sidewalkMesh);
  }

  // Compact sidewalk-proportioned asphalt apron matching close background horizon
  let unifiedAsphalt = root.getObjectByName("Seamless_Unified_Asphalt");
  if (!unifiedAsphalt && parkingAsphalt instanceof THREE.Mesh) {
    const apronGeo = new THREE.PlaneGeometry(36, 28);
    const apronMesh = new THREE.Mesh(apronGeo, parkingAsphalt.material);
    apronMesh.name = "Seamless_Unified_Asphalt";
    apronMesh.rotation.x = -Math.PI / 2;
    apronMesh.position.set(0, -0.003, 10);
    apronMesh.receiveShadow = true;
    apronMesh.renderOrder = -1;
    root.add(apronMesh);
  }

  // Ensure road yellow guide line beside the truck is visible and sits above the asphalt
  const leftGoldEdge = root.getObjectByName("Left_Terrace_Gold_Edge");
  const rightGoldEdge = root.getObjectByName("Right_Terrace_Gold_Edge");
  if (leftGoldEdge) {
    leftGoldEdge.visible = true;
    leftGoldEdge.position.y = 0.05;
  }
  if (rightGoldEdge) {
    rightGoldEdge.visible = true;
    rightGoldEdge.position.y = 0.05;
  }

  // Move the NOW OPEN Enrollment sign — centered in the window, clear of the edge
  const enrollmentPoster = root.getObjectByName("Enrollment_Poster");
  const enrollmentBacking = root.getObjectByName("Enrollment_Poster_Backing");
  if (enrollmentPoster) {
    enrollmentPoster.position.set(-6.55, 1.65, 1.82);
    enrollmentPoster.renderOrder = 3;
  }
  if (enrollmentBacking) {
    enrollmentBacking.position.set(-6.55, 1.65, 1.765);
  }
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
    const panelMaterial = makeDecalMaterial(liveryTexture);
    panelMaterial.opacity = 0.96;
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

function addTruckLivery(vehicle: THREE.Group, liveryTexture: THREE.Texture) {
  vehicle.updateMatrixWorld(true);

  const makeDecalMat = () => makeDecalMaterial(liveryTexture);

  // Dump Bed / Dumper Sides: 2.55m wide x 0.68m high, lowered onto the central dumper body panel at Y=1.72m, Z=-0.92m
  const bedGeometry = new THREE.PlaneGeometry(2.55, 0.68);
  const bedOffset = 1.30;

  const leftBed = new THREE.Mesh(bedGeometry, makeDecalMat());
  leftBed.name = "Truck_Livery_Left_Bed";
  leftBed.position.set(-bedOffset, 1.72, -0.92);
  leftBed.rotation.y = -Math.PI / 2;
  leftBed.renderOrder = 4;
  vehicle.add(leftBed);

  const rightBed = new THREE.Mesh(bedGeometry, makeDecalMat());
  rightBed.name = "Truck_Livery_Right_Bed";
  rightBed.position.set(bedOffset, 1.72, -0.92);
  rightBed.rotation.y = Math.PI / 2;
  rightBed.renderOrder = 4;
  vehicle.add(rightBed);
}

function addSentraLivery(
  vehicle: THREE.Group,
  textures: { left?: THREE.Texture; right?: THREE.Texture; rear?: THREE.Texture }
) {
  vehicle.updateMatrixWorld(true);

  const createDecalMaterial = (tex?: THREE.Texture) => makeDecalMaterial(tex);

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

function addPanoramicGrassBackdrop(world: THREE.Group, texture: THREE.Texture) {
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  // Un-mirror texture to match original image orientation exactly
  texture.repeat.set(-1, 1);
  texture.offset.set(1, 0);
  texture.needsUpdate = true;

  // Intimate close-proximity Curved Grass Horizon Backdrop
  const arcRadius = 24;
  const height = 36;
  const geometry = new THREE.CylinderGeometry(
    arcRadius,
    arcRadius,
    height,
    64,
    1,
    true,
    Math.PI * 0.85,
    Math.PI * 1.30
  );

  const material = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide,
    depthWrite: false,
    toneMapped: false,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = "Panoramic_Grass_Backdrop";
  mesh.position.set(0, 11.5, 9.0);
  mesh.renderOrder = -1;

  world.add(mesh);
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

      const camera = new THREE.PerspectiveCamera(37, 1, 0.1, 400);
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

        // 3D Panoramic Grass Landscape Backdrop from Downloads grass.png
        void textureLoader.loadAsync(assetPaths.grassHorizon).then((grassTexture) => {
          if (!disposed) {
            addPanoramicGrassBackdrop(world, grassTexture);
          }
        }).catch((err) => {
          console.warn("Grass horizon backdrop could not load.", err);
        });

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
          bannerTexture.generateMipmaps = true;
          bannerTexture.minFilter = THREE.LinearMipmapLinearFilter;
          bannerTexture.magFilter = THREE.LinearFilter;
          bannerTexture.anisotropy = 16;
          bannerTexture.needsUpdate = true;

          const leftSign = branch.getObjectByName("Left_TL_Mabuhay_Sign");
          const leftBacking = branch.getObjectByName("Left_TL_Mabuhay_Sign_Backing");
          if (leftSign instanceof THREE.Mesh) {
            const bannerWidth = 2.95;
            const bannerHeight = 1.086;
            leftSign.geometry = new THREE.PlaneGeometry(bannerWidth, bannerHeight);
            leftSign.material = new THREE.MeshStandardMaterial({
              map: bannerTexture,
              roughness: 0.30,
              metalness: 0.04,
              emissive: 0xffffff,
              emissiveIntensity: 0.08,
              side: THREE.FrontSide,
            });
            leftSign.position.set(-6.80, 3.60, 1.970); // shifted left, away from door edge
            leftSign.renderOrder = 3;
          }
          if (leftBacking instanceof THREE.Mesh) {
            leftBacking.geometry = new THREE.BoxGeometry(3.05, 1.14, 0.08);
            leftBacking.position.set(-6.80, 3.60, 1.915);
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
              loader.loadAsync(assetPaths.truck),
              new THREE.TextureLoader().loadAsync(assetPaths.logo),
            ]);
            if (disposed) return;

            const logoResult = supportResults[4];
            const liveryTexture = createFleetLiveryTexture(
              logoResult.status === "fulfilled" ? logoResult.value : undefined
            );

            const hiaceResult = supportResults[0];
            if (hiaceResult.status === "fulfilled") {
              const hiace = fitVehicle(hiaceResult.value.scene, 4.55, "van");
              if (liveryTexture) addFleetLivery(hiace, liveryTexture);
              hiace.position.set(-3.85, 0.15, 6.75);
              hiace.rotation.y = viewerFacingHeading;
              world.add(hiace);
            }

            const truckResult = supportResults[3];
            if (truckResult.status === "fulfilled") {
              const truck = fitVehicle(truckResult.value.scene, 7.4, "truck");
              if (liveryTexture) addTruckLivery(truck, liveryTexture);
              truck.position.set(-7.95, 0.15, 6.75);
              truck.rotation.y = viewerFacingHeading;
              world.add(truck);
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
        camera.fov = compact ? 50 : 43;
        camera.updateProjectionMatrix();
        renderer?.setSize(width, height, false);

        if (compact) {
          cameraPosition.set(11.5, 8.2, 25.0);
          cameraTarget.set(-3.2, 2.2, 6.2);
        } else {
          cameraPosition.set(9.2, 5.6, 18.2);
          cameraTarget.set(-3.2, 2.4, 5.8);
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

