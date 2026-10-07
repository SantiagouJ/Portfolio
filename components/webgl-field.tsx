"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { runtime } from "@/lib/runtime";

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uMode;
  uniform vec2 uMouse;
  uniform vec2 uResolution;
  uniform float uScroll;

  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 4; i++) {
      value += amplitude * noise(p);
      p *= 2.02;
      amplitude *= 0.5;
    }
    return value;
  }

  void main() {
    vec2 uv = vUv;
    float aspect = uResolution.x / max(uResolution.y, 1.0);
    vec2 p = (uv - 0.5) * vec2(aspect, 1.0);
    vec2 mouse = (uMouse - 0.5) * vec2(aspect, 1.0);
    p -= mouse * 0.12;
    p.y += uScroll * 0.18;

    float t = uTime * 0.045;
    float field = fbm(p * 1.35 + t);

    vec2 grid = uv * vec2(22.0, 13.0);
    vec2 cell = abs(fract(grid) - 0.5);
    float lines = 1.0 - smoothstep(0.0, 0.02, min(cell.x, cell.y));
    float fade = smoothstep(1.2, 0.2, length(p));
    float calm = smoothstep(0.0, 0.72, uv.x);
    float ink = lines * 0.075 * fade * (0.28 + 0.72 * calm) + field * 0.03;
    float grain = (hash(gl_FragCoord.xy + fract(uTime * 13.0)) - 0.5) * 0.04;
    float alpha = clamp((ink + grain) * uMode, 0.0, 0.45);
    vec3 col = vec3(0.93, 0.925, 0.9);
    gl_FragColor = vec4(col * alpha, alpha);
  }
`;

export function WebGLField() {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const initial = document.documentElement.dataset.mode === "dev" ? 1 : 0;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: false,
        powerPreference: "high-performance",
        preserveDrawingBuffer: true,
      });
    } catch {
      return;
    }

    const uniforms = {
      uTime: { value: 0 },
      uMode: { value: initial },
      uMouse: { value: new THREE.Vector2(0.5, 0.65) },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uScroll: { value: 0 },
    };

    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
    material.toneMapped = false;

    const scene = new THREE.Scene();
    const camera = new THREE.Camera();
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const canvas = renderer.domElement;
    el.appendChild(canvas);

    const mouse = new THREE.Vector2(0.5, 0.65);
    let frame = 0;
    let running = true;

    const resize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, width < 768 ? 1.25 : 1.5);
      renderer.setPixelRatio(dpr);
      renderer.setSize(width, height, false);
      uniforms.uResolution.value.set(width * dpr, height * dpr);
    };

    const paint = () => {
      if (uniforms.uMode.value < 0.001) {
        renderer.setClearColor(0x000000, 0);
        renderer.clear();
        return;
      }
      renderer.render(scene, camera);
    };

    runtime.setMode = (value: number) => {
      uniforms.uMode.value = value;
      paint();
    };

    const onPointer = (event: PointerEvent) => {
      mouse.x = event.clientX / window.innerWidth;
      mouse.y = 1 - event.clientY / window.innerHeight;
    };

    const onMode = (event: Event) => {
      const next = (event as CustomEvent<"dev" | "design">).detail;
      runtime.setMode(next === "dev" ? 1 : 0);
    };

    const onVisibility = () => {
      running = document.visibilityState !== "hidden";
    };

    const tick = (now: number) => {
      frame = window.requestAnimationFrame(tick);
      if (!running || uniforms.uMode.value < 0.001) return;
      if (!reduce) uniforms.uTime.value = now * 0.001;
      uniforms.uMouse.value.lerp(mouse, reduce ? 1 : 0.05);
      uniforms.uScroll.value += (runtime.scroll - uniforms.uScroll.value) * (reduce ? 1 : 0.06);
      renderer.render(scene, camera);
    };

    resize();
    frame = window.requestAnimationFrame(tick);
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointer);
    window.addEventListener("dm-mode", onMode);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("dm-mode", onMode);
      document.removeEventListener("visibilitychange", onVisibility);
      runtime.setMode = () => {};
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      canvas.remove();
    };
  }, []);

  return <div ref={host} className="webgl" aria-hidden="true" />;
}
