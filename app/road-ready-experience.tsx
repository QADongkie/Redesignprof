"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { animate, createDrawable, stagger } from "animejs";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

const smoothstep = (start: number, end: number, value: number) => {
  const x = clamp((value - start) / (end - start));
  return x * x * (3 - 2 * x);
};

type CourseId = "tdc" | "pdc" | "refresher";
type Transmission = "Manual" | "Automatic";

const courses: Array<{
  id: CourseId;
  eyebrow: string;
  title: string;
  duration: string;
  description: string;
  outcomes: string[];
}> = [
    {
      id: "tdc",
      eyebrow: "Start with the road",
      title: "Theoretical Driving Course",
      duration: "15 hours",
      description:
        "Build the judgment behind every safe decision—from signs and road rules to responsible driving behavior.",
      outcomes: ["Road rules", "Hazard awareness", "Driver responsibility"],
    },
    {
      id: "pdc",
      eyebrow: "Put knowledge in motion",
      title: "Practical Driving Course",
      duration: "Hands-on training",
      description:
        "Develop vehicle control and road confidence with guided practice from an accredited driving school.",
      outcomes: ["Vehicle control", "Road positioning", "Defensive habits"],
    },
    {
      id: "refresher",
      eyebrow: "Return with confidence",
      title: "Refresher Training",
      duration: "Schedule by branch",
      description:
        "A focused return to safe driving for licensed drivers who want calmer, more confident road habits.",
      outcomes: ["Skill refresh", "Confidence building", "Safer decisions"],
    },
  ];

const branches = [
  {
    id: "bacolod",
    name: "Bacolod",
    region: "Region VI",
    city: "Bacolod City",
    address: "EL Court Building, Door 11, 1st Lacson Street, Brgy. 17, Bacolod City 6100",
    phone: "0963 300 2653",
    x: 221,
    y: 397,
  },
  {
    id: "cadiz",
    name: "Cadiz",
    region: "Region VI",
    city: "Cadiz City",
    address: "Desiree Bldg., Emerald St., San Eusebio Subd., Brgy. Zone 2, Cadiz City 6121",
    phone: "0963 027 5805",
    x: 221,
    y: 368,
  },
  {
    id: "pontevedra",
    name: "Pontevedra",
    region: "Region VI",
    city: "Negros Occidental",
    address: "Rizal St., Brgy. III (Poblacion), Pontevedra, Negros Occidental",
    phone: "0909 140 0474",
    x: 227,
    y: 426,
  },
  {
    id: "cagayan-de-oro",
    name: "Cagayan de Oro",
    region: "Region X",
    city: "Cagayan de Oro City",
    address: "#88 National Highway, Zone 7, 2F Total Gasoline Station, Bulua, Cagayan de Oro City",
    phone: "0905 102 1955",
    x: 334,
    y: 528,
  },
  {
    id: "tagum",
    name: "Tagum",
    region: "Region XI",
    city: "Tagum City",
    address: "Tagum City, Davao del Norte",
    phone: "0909 671 6850",
    x: 390,
    y: 552,
  },
  {
    id: "nabunturan",
    name: "Nabunturan",
    region: "Region XI",
    city: "Davao de Oro",
    address: "3F Bunyag Bldg., Purok 8, Poblacion, Nabunturan, Davao de Oro",
    phone: "0946 062 9296",
    x: 418,
    y: 548,
  },
  {
    id: "samal",
    name: "Samal",
    region: "Region XI",
    city: "IGACOS",
    address: "Purok 3, Sitio Pasig, Brgy. Peñaplata, IGACOS, Davao del Norte 8119",
    phone: "0965 256 1665",
    x: 387,
    y: 578,
  },
  {
    id: "mati",
    name: "Mati",
    region: "Region XI",
    city: "Davao Oriental",
    address: "Hardware Ville, Madang, Brgy. Central, Mati City, Davao Oriental",
    phone: "0917 100 9676",
    x: 444,
    y: 579,
  },
] as const;

const faqs = [
  {
    question: "Which course should a first-time applicant take?",
    answer:
      "Most first-time applicants begin with the 15-hour Theoretical Driving Course, then continue to practical training. Confirm the correct sequence with your chosen branch and the latest LTO requirements.",
  },
  {
    question: "Are course fees the same at every branch?",
    answer:
      "Fees and schedules can vary by branch, date, vehicle, transmission, and availability. Use this page to choose a course, then confirm the live offer during official enrollment.",
  },
  {
    question: "Can I choose manual or automatic training?",
    answer:
      "Yes, subject to vehicle availability at your selected branch. Choose your preference in the course planner and confirm it with the branch before your session.",
  },
  {
    question: "Where can I see all TL Mabuhay locations?",
    answer:
      "The locator below highlights selected verified branches. Use the official branch directory for the complete, most current list and contact details.",
  },
];

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h13M14 7l5 5-5 5" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 21s7-6.1 7-12a7 7 0 1 0-14 0c0 5.9 7 12 7 12Z" />
      <circle cx="12" cy="9" r="2.25" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7.2 3.5 4.6 5.1c-.8.5-.8 1.7-.5 2.8 1.5 5.3 5.6 9.4 10.9 11 1.2.3 2.3.2 2.8-.6l1.6-2.6-4.1-2.1-1.3 1.8c-2.4-1-4.4-3-5.4-5.4l1.8-1.3-2.2-4.2Z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m5 12.5 4.2 4.2L19 7" />
    </svg>
  );
}

function LogoIntro({ sceneReady }: { sceneReady: boolean }) {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const startExit = window.setTimeout(() => setLeaving(true), reduced ? 320 : sceneReady ? 1150 : 2000);
    const remove = window.setTimeout(() => setVisible(false), reduced ? 650 : sceneReady ? 1800 : 2750);
    return () => {
      window.clearTimeout(startExit);
      window.clearTimeout(remove);
    };
  }, [sceneReady]);

  useEffect(() => {
    if (!visible) return;
    document.documentElement.classList.add("intro-active");
    return () => document.documentElement.classList.remove("intro-active");
  }, [visible]);

  if (!visible) return null;

  return (
    <div className={`brand-intro${leaving ? " is-leaving" : ""}`} role="status" aria-label="TL Mabuhay is loading">
      <div className="intro-line intro-line--top" aria-hidden="true" />
      <div className="intro-lockup">
        <div className="intro-seal">
          <Image src="/assets/tl-mabuhay-logo-exact.svg" alt="" width={220} height={220} priority />
        </div>
        <span>TL MABUHAY</span>
        <strong>Your Defensive Driving Advocate</strong>
      </div>
      <div className="intro-line intro-line--bottom" aria-hidden="true" />
    </div>
  );
}

function useBusinessMotion() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      document.documentElement.classList.add("reduced-motion");
      return;
    }

    const heroTimer = window.setTimeout(() => {
      animate(document.querySelectorAll<HTMLElement>("[data-hero-line]"), {
        opacity: [0, 1],
        y: [30, 0],
        duration: 760,
        delay: stagger(95),
        ease: "outExpo",
      });
    }, 980);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || entry.target.classList.contains("is-revealed")) return;
          entry.target.classList.add("is-revealed");
          const element = entry.target as HTMLElement;
          const items = element.querySelectorAll<HTMLElement>("[data-reveal-item]");
          animate(items.length ? items : element, {
            opacity: [0, 1],
            y: [24, 0],
            duration: 720,
            delay: items.length ? stagger(85) : 0,
            ease: "outExpo",
          });

          const drawTargets = element.querySelectorAll<SVGGeometryElement>("[data-draw]");
          if (drawTargets.length) {
            animate(createDrawable(drawTargets), {
              draw: ["0 0", "0 1"],
              duration: 1450,
              delay: stagger(160),
              ease: "inOutQuad",
            });
          }

          const pins = element.querySelectorAll<SVGGElement>("[data-map-pin]");
          if (pins.length) {
            animate(pins, {
              opacity: [0, 1],
              scale: [0.5, 1],
              duration: 560,
              delay: stagger(70, { start: 520 }),
              ease: "outBack",
            });
          }
          observer.unobserve(element);
        });
      },
      { threshold: 0.18 },
    );

    document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((element) => observer.observe(element));
    return () => {
      window.clearTimeout(heroTimer);
      observer.disconnect();
    };
  }, []);
}

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

function ShowcaseCanvas({
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

            if (
              matName.includes("NISSANsentra") &&
              !matName.includes("plast") &&
              !matName.includes("luz") &&
              !matName.includes("wheel") &&
              !matName.includes("int")
            ) {
              mesh.material = new THREE.MeshPhysicalMaterial({
                color: new THREE.Color(0x082945), // TL Mabuhay signature Royal Navy
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

      // Continuous 360 degree auto-rotation
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

function CoursePlanner() {
  const [courseId, setCourseId] = useState<CourseId>("tdc");
  const [transmission, setTransmission] = useState<Transmission>("Manual");
  const selected = courses.find((course) => course.id === courseId) ?? courses[0];

  return (
    <div className="planner" data-reveal>
      <div className="planner-options" data-reveal-item>
        <span className="field-label">1. Choose your course</span>
        <div className="segmented" role="group" aria-label="Choose a course">
          {courses.map((course) => (
            <button
              key={course.id}
              type="button"
              className={course.id === courseId ? "is-active" : ""}
              aria-pressed={course.id === courseId}
              onClick={() => setCourseId(course.id)}
            >
              {course.id.toUpperCase()}
            </button>
          ))}
        </div>

        <span className="field-label">2. Choose your preference</span>
        <div className="segmented" role="group" aria-label="Choose transmission">
          {(["Manual", "Automatic"] as Transmission[]).map((item) => (
            <button
              key={item}
              type="button"
              className={item === transmission ? "is-active" : ""}
              aria-pressed={item === transmission}
              onClick={() => setTransmission(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="planner-summary" data-reveal-item aria-live="polite">
        <span>Your plan</span>
        <h3>{selected.title}</h3>
        <p>{transmission} vehicle preference</p>
        <ul>
          {selected.outcomes.map((outcome) => (
            <li key={outcome}><CheckIcon /> {outcome}</li>
          ))}
        </ul>
        <a className="button button--gold" href="https://tlmabuhay.com/enroll">
          Continue to official enrollment <ArrowIcon />
        </a>
        <small>Availability, schedules, and fees are confirmed by your selected branch.</small>
      </div>
    </div>
  );
}

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

function MapCanvas3D({
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

    // ── Lighting ──────────────────────────────────────────────────────────────
    scene.add(new THREE.HemisphereLight(0xdbeafe, 0x020d1c, 2.0));

    const sun = new THREE.DirectionalLight(0xfff6e5, 2.8);
    sun.position.set(-4, 8, 14);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.bias = -0.0003;
    scene.add(sun);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 1.4);
    fillLight.position.set(6, -4, 8);
    scene.add(fillLight);

    const goldAccent = new THREE.DirectionalLight(0xf3b61f, 1.2);
    goldAccent.position.set(-6, -6, 6);
    scene.add(goldAccent);

    // ── Root container for the map and pins with 3D isometric perspective ────
    const mapGroup = new THREE.Group();
    // 3D tilt so the extruded island relief, side bevels, and elevation layers pop
    mapGroup.rotation.x = 0.38;
    mapGroup.rotation.y = -0.16;
    mapGroup.rotation.z = 0.02;
    scene.add(mapGroup);

    // ── 3-Point Studio Lighting for Rich 3D Depth & Shadows ──────────────────
    scene.add(new THREE.HemisphereLight(0xe0f2fe, 0x010b17, 1.8));

    // Key light (top-left) casting crisp 3D island drop shadows
    const keyLight = new THREE.DirectionalLight(0xfff5e6, 3.2);
    keyLight.position.set(-7, 14, 16);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(2048, 2048);
    keyLight.shadow.bias = -0.0002;
    keyLight.shadow.radius = 2.5;
    scene.add(keyLight);

    // Golden rim light (right) highlighting 3D extruded side walls
    const goldRim = new THREE.DirectionalLight(0xf3b61f, 2.2);
    goldRim.position.set(10, -4, 10);
    scene.add(goldRim);

    // Cyan fill light (bottom-left) for deep architectural contrast
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

        // Perfectly center the model at (0, 0, 0)
        const box = new THREE.Box3().setFromObject(model);
        const center = new THREE.Vector3();
        box.getCenter(center);
        model.position.sub(center);

        // Enhance materials with 3D physical sheen & shadows
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

          // Stalk extends outward along +Z (perpendicular to map face)
          const stalk = new THREE.Mesh(stalkGeo, stalkMat);
          stalk.rotation.x = Math.PI / 2;
          stalk.position.z = 0.21;
          stalk.castShadow = true;
          group.add(stalk);

          // Pin head floats above the stalk with specular glint
          const head = new THREE.Mesh(pinGeo, matDefault.clone());
          head.position.z = 0.46;
          head.castShadow = true;
          group.add(head);

          // Base ring rests on the island surface
          const ring = new THREE.Mesh(ringGeo, matDefault.clone());
          ring.position.z = 0.05;
          group.add(ring);

          // Invisible larger hit area for seamless clicking
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

        // Apply smooth bounded rotation delta
        targetRotY = Math.min(0.35, Math.max(-0.65, targetRotY + dx * 0.005));
        targetRotX = Math.min(0.68, Math.max(0.12, targetRotX + dy * 0.005));
      } else {
        // Hover raycasting to check if cursor is over a pin
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

      // If released without significant drag, process as pin click
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

      // Model span with 3D tilt: height ~10.0, width ~5.86
      // Distance calculation guarantees full bounds fit without any cutoff
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

      // Smooth inertia rotation lerp
      currentRotX += (targetRotX - currentRotX) * 0.08;
      currentRotY += (targetRotY - currentRotY) * 0.08;
      mapGroup.rotation.x = currentRotX;
      mapGroup.rotation.y = currentRotY;

      const selId = selectedIdRef.current;
      const filtIds = filteredIdsRef.current;

      // Update pin materials and selection state
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

function BranchMap() {
  const [region, setRegion] = useState("All regions");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string>(branches[0].id);
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return branches.filter((branch) => {
      const regionMatch = region === "All regions" || branch.region === region;
      const queryMatch = !normalized || `${branch.name} ${branch.city} ${branch.address}`.toLowerCase().includes(normalized);
      return regionMatch && queryMatch;
    });
  }, [query, region]);
  const selected = filtered.find((branch) => branch.id === selectedId) ?? filtered[0] ?? branches[0];

  const filteredIds = useMemo(() => filtered.map((b) => b.id), [filtered]);

  const chooseBranch = (id: string) => {
    setSelectedId(id);
    const branch = branches.find((item) => item.id === id);
    if (branch) setRegion(branch.region);
  };

  return (
    <div className="locator-shell" data-reveal>
      <div className="locator-map locator-map--3d" data-reveal-item>
        <MapCanvas3D
          selectedId={selectedId}
          filteredIds={filteredIds}
          onSelectBranch={chooseBranch}
        />
      </div>

      <div className="locator-panel" data-reveal-item>
        <div className="locator-heading">
          <span>Branch explorer</span>
          <strong>{filtered.length} shown</strong>
        </div>
        <label className="branch-search">
          <span className="sr-only">Search branch, city, or province</span>
          <PinIcon />
          <input
            type="search"
            value={query}
            placeholder="Search city or province"
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <div className="region-tabs" role="group" aria-label="Filter branches by region">
          {["All regions", "Region VI", "Region X", "Region XI"].map((item) => (
            <button
              key={item}
              type="button"
              className={region === item ? "is-active" : ""}
              aria-pressed={region === item}
              onClick={() => setRegion(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="branch-list" aria-label="Matching branches">
          {filtered.map((branch) => (
            <button
              key={branch.id}
              type="button"
              className={branch.id === selected.id ? "branch-row is-active" : "branch-row"}
              onClick={() => setSelectedId(branch.id)}
            >
              <span><b>{branch.name}</b><small>{branch.city}</small></span>
              <em>{branch.region}</em>
            </button>
          ))}
          {!filtered.length && <p className="no-results">No matching branch in this preview. Try the official directory.</p>}
        </div>

        <article className="branch-detail" aria-live="polite">
          <span>{selected.region}</span>
          <h3>{selected.name}</h3>
          <p>{selected.address}</p>
          <div>
            <a href={`tel:${selected.phone.replace(/\s/g, "")}`}><PhoneIcon /> {selected.phone}</a>
            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selected.address)}`}>
              Directions <ArrowIcon />
            </a>
          </div>
        </article>
        <a className="official-directory" href="https://tlmabuhay.com/#branches">
          View the complete official branch directory <ArrowIcon />
        </a>
      </div>
    </div>
  );
}

function BrandTimeline() {
  return (
    <div className="timeline" data-reveal>
      <svg viewBox="0 0 1200 230" preserveAspectRatio="none" aria-hidden="true">
        <path className="timeline-track" d="M35 145C240 145 262 75 455 75s230 105 410 78c111-17 149-80 300-80" />
        <path data-draw className="timeline-route" d="M35 145C240 145 262 75 455 75s230 105 410 78c111-17 149-80 300-80" />
      </svg>
      <article className="timeline-item timeline-item--one" data-reveal-item>
        <span>2017</span>
        <h3>A clear purpose begins.</h3>
        <p>TL Mabuhay starts with a commitment to disciplined, responsible driver education.</p>
      </article>
      <article className="timeline-item timeline-item--two" data-reveal-item>
        <span>Today</span>
        <h3>147 branches. 8 regions.</h3>
        <p>Accessible training continues to grow across communities in the Philippines.</p>
      </article>
      <article className="timeline-item timeline-item--three" data-reveal-item>
        <span>160,000+</span>
        <h3>Drivers trained.</h3>
        <p>Each lesson moves one more driver toward safer, more confident road behavior.</p>
      </article>
    </div>
  );
}

export default function RoadReadyExperience() {
  const [sceneReady, setSceneReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSceneReady = useCallback((ready: boolean) => setSceneReady(ready), []);

  useBusinessMotion();

  return (
    <div className="page-shell">
      <LogoIntro sceneReady={sceneReady} />
      <noscript><style>{".brand-intro{display:none!important}html{overflow:auto!important}"}</style></noscript>
      <a className="skip-link" href="#main-content">Skip to main content</a>

      <header className="site-header">
        <a className="brand" href="#top" aria-label="TL Mabuhay home">
          <Image src="/assets/tl-mabuhay-logo-exact.svg" alt="" width={52} height={52} priority />
          <span>
            <strong>TL MABUHAY</strong>
            <small>DRIVING LESSON ACADEMY</small>
          </span>
        </a>
        <nav className={menuOpen ? "site-nav is-open" : "site-nav"} aria-label="Primary navigation">
          <a href="#courses" onClick={() => setMenuOpen(false)}>Courses</a>
          <a href="#why-tl" onClick={() => setMenuOpen(false)}>Why TL</a>
          <a href="#branches" onClick={() => setMenuOpen(false)}>Branches</a>
          <a href="#faq" onClick={() => setMenuOpen(false)}>FAQ</a>
        </nav>
        <a className="header-cta" href="https://tlmabuhay.com/enroll">Enroll now <ArrowIcon /></a>
        <button
          type="button"
          className="menu-button"
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <MenuIcon />
        </button>
      </header>

      <main id="main-content">
        <section className="hero-section" id="hero">
          <div className="hero-visual">
            <ShowcaseCanvas onReady={handleSceneReady} />
          </div>

          <div className="hero-content">
            <div className="hero-copy">
              <p className="eyebrow" data-hero-line><i /> LTO-accredited driving school</p>
              <h1 id="hero-title" data-hero-line>
                Your Defensive<br /><span>Driving Advocate.</span>
              </h1>
              <p className="hero-lead" data-hero-line>
                Learn with discipline. Practice with purpose. Train in accredited dual-control vehicles engineered for student driver safety.
              </p>
              <div className="hero-actions" data-hero-line>
                <a className="button button--gold" href="https://tlmabuhay.com/enroll">Start enrollment <ArrowIcon /></a>
                <a className="button button--quiet" href="#courses">Explore courses</a>
              </div>
              <div className="hero-proof" data-hero-line>
                <div><strong>147</strong><span>branches</span></div>
                <div><strong>160K+</strong><span>drivers trained</span></div>
                <div><strong>2017</strong><span>established</span></div>
              </div>
            </div>
            <div className="scroll-prompt" data-hero-line><i /> Scroll to explore courses</div>
          </div>
        </section>

        <section className="trust-strip" aria-label="TL Mabuhay credentials">
          <div><span>Accredited</span><strong>LTO Driving School</strong></div>
          <div><span>Established</span><strong>Since 2017</strong></div>
          <div><span>Reach</span><strong>147 branches • 8 regions</strong></div>
          <div><span>Impact</span><strong>160,000+ drivers trained</strong></div>
        </section>

        <section className="section section--light" id="courses">
          <div className="section-heading" data-reveal>
            <p data-reveal-item>Courses</p>
            <h2 data-reveal-item>Learn the road.<br />Own the drive.</h2>
            <span data-reveal-item>Focused training for first-time applicants and returning drivers.</span>
          </div>
          <div className="course-grid" data-reveal>
            {courses.map((course, index) => (
              <article className="course-card" key={course.id} data-reveal-item>
                <div><span>0{index + 1}</span><small>{course.duration}</small></div>
                <p>{course.eyebrow}</p>
                <h3>{course.title}</h3>
                <p>{course.description}</p>
                <ul>{course.outcomes.map((outcome) => <li key={outcome}><CheckIcon />{outcome}</li>)}</ul>
                <a href="https://tlmabuhay.com/courses">View course details <ArrowIcon /></a>
              </article>
            ))}
          </div>
        </section>

        <section className="section planner-section">
          <div className="section-heading section-heading--compact" data-reveal>
            <p data-reveal-item>Course planner</p>
            <h2 data-reveal-item>A clear next step.</h2>
            <span data-reveal-item>Choose a training path now, then confirm live availability and fees with the official enrollment system.</span>
          </div>
          <CoursePlanner />
        </section>

        <section className="campaign-section" id="why-tl">
          <div className="campaign-image" data-reveal>
            <Image
              src="/advocate-hero.png"
              alt="TL Mabuhay Road to Ready campaign showing a vehicle traveling safely toward its destination"
              width={1536}
              height={1024}
              sizes="(max-width: 900px) 100vw, 58vw"
              data-reveal-item
            />
          </div>
          <div className="campaign-copy" data-reveal>
            <p data-reveal-item>Why TL Mabuhay</p>
            <h2 data-reveal-item>Advocacy behind every lesson.</h2>
            <p data-reveal-item>
              We prepare drivers to do more than operate a vehicle. We teach awareness, discipline, and respect for every person sharing the road.
            </p>
            <blockquote data-reveal-item>“Your Defensive Driving Advocate.”</blockquote>
            <a data-reveal-item href="https://tlmabuhay.com/about">Learn about TL Mabuhay <ArrowIcon /></a>
          </div>
        </section>

        <section className="section timeline-section">
          <div className="section-heading section-heading--compact" data-reveal>
            <p data-reveal-item>Our journey</p>
            <h2 data-reveal-item>Purpose, carried forward.</h2>
            <span data-reveal-item>A growing academy with one consistent standard: safer drivers and safer roads.</span>
          </div>
          <BrandTimeline />
        </section>

        <section className="section section--light locator-section" id="branches">
          <div className="section-heading" data-reveal>
            <p data-reveal-item>Branch locator</p>
            <h2 data-reveal-item>Training closer to home.</h2>
            <span data-reveal-item>Select a pin or search a city to view branch details and directions.</span>
          </div>
          <BranchMap />
        </section>

        <section className="section enrollment-section">
          <div className="section-heading section-heading--compact" data-reveal>
            <p data-reveal-item>Enrollment</p>
            <h2 data-reveal-item>From interest to instruction.</h2>
          </div>
          <ol className="enrollment-steps" data-reveal>
            <li data-reveal-item><span>01</span><div><h3>Choose a course</h3><p>Start with TDC, PDC, or refresher training.</p></div></li>
            <li data-reveal-item><span>02</span><div><h3>Select a branch</h3><p>Confirm a convenient location, schedule, and vehicle.</p></div></li>
            <li data-reveal-item><span>03</span><div><h3>Complete enrollment</h3><p>Review the official requirements and secure your slot.</p></div></li>
            <li data-reveal-item><span>04</span><div><h3>Begin your training</h3><p>Learn with discipline and practice with purpose.</p></div></li>
          </ol>
          <a className="button button--gold enrollment-cta" href="https://tlmabuhay.com/enroll">Open official enrollment <ArrowIcon /></a>
        </section>

        <section className="section faq-section" id="faq">
          <div className="section-heading section-heading--compact" data-reveal>
            <p data-reveal-item>Frequently asked</p>
            <h2 data-reveal-item>Before you begin.</h2>
          </div>
          <div className="faq-list" data-reveal>
            {faqs.map((item, index) => (
              <details key={item.question} data-reveal-item open={index === 0}>
                <summary><span>0{index + 1}</span>{item.question}<i>+</i></summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="final-cta">
          <div data-reveal>
            <Image data-reveal-item src="/assets/tl-mabuhay-logo-exact.svg" alt="TL Mabuhay emblem" width={122} height={122} />
            <p data-reveal-item>Your road to confident driving starts here.</p>
            <h2 data-reveal-item>Ready when you are.</h2>
            <div data-reveal-item>
              <a className="button button--gold" href="https://tlmabuhay.com/enroll">Enroll now <ArrowIcon /></a>
              <a className="button button--quiet" href="#branches">Find your branch</a>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <a className="brand brand--footer" href="#top" aria-label="Back to top">
          <Image src="/assets/tl-mabuhay-logo-exact.svg" alt="" width={58} height={58} />
          <span><strong>TL MABUHAY</strong><small>YOUR DEFENSIVE DRIVING ADVOCATE</small></span>
        </a>
        <nav aria-label="Footer navigation">
          <a href="https://tlmabuhay.com/courses">Courses</a>
          <a href="https://tlmabuhay.com/#branches">Branches</a>
          <a href="https://tlmabuhay.com/enrollment-rules">Enrollment rules</a>
          <a href="https://tlmabuhay.com/enroll">Enroll</a>
        </nav>
        <p>© 2026 TL Mabuhay Driving Lesson Academy. Concept experience.</p>
      </footer>
    </div>
  );
}
