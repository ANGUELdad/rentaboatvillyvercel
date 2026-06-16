"use client";

import { OrbitControls, Sparkles, Stars } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { CharterBoat3D, type Boat3DMouse } from "./CharterBoat3D";

function OceanPlane() {
  const mesh = useRef<THREE.Mesh>(null);
  const geometry = useMemo(() => new THREE.PlaneGeometry(32, 32, 40, 40), []);

  useFrame((state) => {
    if (!mesh.current) return;
    const positions = mesh.current.geometry.attributes.position;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      positions.setZ(
        i,
        Math.sin(x * 0.5 + t * 0.7) * 0.07 +
          Math.cos(y * 0.4 + t * 0.55) * 0.05,
      );
    }
    positions.needsUpdate = true;
  });

  return (
    <mesh
      ref={mesh}
      geometry={geometry}
      rotation={[-Math.PI / 2.1, 0, 0]}
      position={[0, -0.55, 0]}
    >
      <meshStandardMaterial
        color="#061828"
        metalness={0.85}
        roughness={0.2}
        transparent
        opacity={0.75}
      />
    </mesh>
  );
}

function Scene({
  mouse,
  interactive,
  showControls,
}: {
  mouse: Boat3DMouse;
  interactive: boolean;
  showControls?: boolean;
}) {
  return (
    <>
      <fog attach="fog" args={["#040d18", 6, 22]} />
      <color attach="background" args={["#040d18"]} />
      <Stars radius={40} depth={30} count={1200} factor={3} fade speed={0.4} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[6, 8, 4]} intensity={1.4} color="#ffe4b5" />
      <pointLight position={[-4, 2, 5]} intensity={0.7} color="#2ee8d6" />
      <pointLight position={[3, -1, -2]} intensity={0.25} color="#13a6aa" />
      <OceanPlane />
      <Sparkles
        count={80}
        scale={[8, 2, 6]}
        position={[0, 0.2, 0]}
        size={1.5}
        speed={0.3}
        color="#2ee8d6"
        opacity={0.45}
      />
      <CharterBoat3D mouse={mouse} scale={1} interactive={interactive} />
      {showControls && (
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 3.5}
          maxPolarAngle={Math.PI / 2.2}
          autoRotate
          autoRotateSpeed={0.35}
        />
      )}
    </>
  );
}

interface Boat3DCanvasProps {
  className?: string;
  cameraPosition?: [number, number, number];
  interactive?: boolean;
  showControls?: boolean;
  dpr?: [number, number];
}

export function Boat3DCanvas({
  className = "",
  cameraPosition = [0, 1.2, 4.5],
  interactive = true,
  showControls = false,
  dpr = [1, 1.75],
}: Boat3DCanvasProps) {
  const [mouse, setMouse] = useState<Boat3DMouse>({ x: 0, y: 0 });
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setEnabled(!motionMq.matches);
    update();
    motionMq.addEventListener("change", update);
    return () => motionMq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!interactive) return;
    const onMove = (e: MouseEvent | TouchEvent) => {
      const point =
        "touches" in e ? e.touches[0] : (e as MouseEvent);
      if (!point) return;
      setMouse({
        x: (point.clientX / window.innerWidth) * 2 - 1,
        y: -(point.clientY / window.innerHeight) * 2 + 1,
      });
    };
    window.addEventListener("mousemove", onMove as EventListener, { passive: true });
    window.addEventListener("touchmove", onMove as EventListener, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove as EventListener);
      window.removeEventListener("touchmove", onMove as EventListener);
    };
  }, [interactive]);

  if (!enabled) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-b from-ocean-950/80 to-transparent ${className}`}
        aria-hidden
      >
        <div className="size-24 rounded-full bg-app-teal/10 blur-2xl" />
      </div>
    );
  }

  return (
    <div className={className} aria-hidden>
      <Canvas
        camera={{ position: cameraPosition, fov: 40 }}
        dpr={dpr}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      >
        <Scene
          mouse={mouse}
          interactive={interactive && !showControls}
          showControls={showControls}
        />
      </Canvas>
    </div>
  );
}
