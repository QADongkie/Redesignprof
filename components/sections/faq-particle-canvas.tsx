"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export function FaqParticleCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 45;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Particle System 1: Drifting Gold & Cyan Road-Light Particles
    const particleCount = 140;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);
    const speeds = new Float32Array(particleCount);

    const goldColor = new THREE.Color(0xf3b61f);
    const blueColor = new THREE.Color(0x395fc7);
    const navyColor = new THREE.Color(0x1a3274);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      // Position across a wide 3D volume
      positions[i3] = (Math.random() - 0.5) * 80;
      positions[i3 + 1] = (Math.random() - 0.5) * 50;
      positions[i3 + 2] = (Math.random() - 0.5) * 40;

      // Color distribution: mix of warm gold and brand deep blue
      const mixedColor = Math.random() > 0.4
        ? goldColor.clone().lerp(new THREE.Color(0xffffff), Math.random() * 0.4)
        : blueColor.clone().lerp(navyColor, Math.random() * 0.5);

      colors[i3] = mixedColor.r;
      colors[i3 + 1] = mixedColor.g;
      colors[i3 + 2] = mixedColor.b;

      scales[i] = Math.random() * 3.5 + 1.2;
      speeds[i] = Math.random() * 0.04 + 0.015;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    // Custom Canvas Circular Particle Texture
    const createCircleTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
        gradient.addColorStop(0.3, "rgba(255, 255, 255, 0.8)");
        gradient.addColorStop(0.7, "rgba(255, 255, 255, 0.2)");
        gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 64, 64);
      }
      return new THREE.CanvasTexture(canvas);
    };

    const material = new THREE.PointsMaterial({
      size: 1.6,
      vertexColors: true,
      transparent: true,
      opacity: 0.55,
      map: createCircleTexture(),
      blending: THREE.NormalBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Particle System 2: Floating Curved Road-Stream Wave
    const curvePoints: THREE.Vector3[] = [];
    for (let i = 0; i <= 24; i++) {
      const t = (i / 24) * Math.PI * 2;
      curvePoints.push(
        new THREE.Vector3(
          (i - 12) * 3.4,
          Math.sin(t * 1.5) * 6 - 8,
          Math.cos(t) * 8 - 10
        )
      );
    }
    const spline = new THREE.CatmullRomCurve3(curvePoints);
    const lineGeo = new THREE.BufferGeometry().setFromPoints(spline.getPoints(80));
    const lineMat = new THREE.LineBasicMaterial({
      color: 0xf3b61f,
      transparent: true,
      opacity: 0.18,
      linewidth: 1,
    });
    const roadGuideLine = new THREE.Line(lineGeo, lineMat);
    scene.add(roadGuideLine);

    // Mouse Interaction Tracking
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      targetMouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      targetMouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };

    const handleMouseLeave = () => {
      targetMouseX = 0;
      targetMouseY = 0;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave);

    // Visibility Observer to save GPU cycles when out of view
    let isVisible = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    // Animation Loop
    let animationFrameId = 0;
    let clock = new THREE.Clock();

    const animateLoop = () => {
      animationFrameId = requestAnimationFrame(animateLoop);

      if (!isVisible) return;

      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse lerp
      currentMouseX += (targetMouseX - currentMouseX) * 0.05;
      currentMouseY += (targetMouseY - currentMouseY) * 0.05;

      // Parallax rotation
      particles.rotation.y = elapsedTime * 0.03 + currentMouseX * 0.15;
      particles.rotation.x = Math.sin(elapsedTime * 0.02) * 0.05 + currentMouseY * 0.1;
      roadGuideLine.rotation.y = elapsedTime * 0.02 + currentMouseX * 0.08;

      // Drift particle positions
      const posArray = geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        posArray[i3 + 1] += speeds[i] * 0.6; // rise gently
        if (posArray[i3 + 1] > 26) {
          posArray[i3 + 1] = -26;
        }
      }
      geometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animateLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", handleResize);
      observer.disconnect();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      geometry.dispose();
      material.dispose();
      lineGeo.dispose();
      lineMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="faq-particle-canvas-wrap"
      aria-hidden="true"
    />
  );
}
