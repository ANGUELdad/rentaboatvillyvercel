"use client";

import { Float } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

export interface Boat3DMouse {
  x: number;
  y: number;
}

export function CharterBoat3D({
  mouse,
  scale = 1,
  interactive = true,
}: {
  mouse?: Boat3DMouse;
  scale?: number;
  interactive?: boolean;
}) {
  const hull = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!hull.current) return;
    const t = state.clock.elapsedTime;
    hull.current.position.y = Math.sin(t * 0.9) * 0.08 - 0.05;
    if (interactive && mouse) {
      hull.current.rotation.y = THREE.MathUtils.lerp(
        hull.current.rotation.y,
        mouse.x * 0.55,
        0.05,
      );
      hull.current.rotation.z = THREE.MathUtils.lerp(
        hull.current.rotation.z,
        Math.sin(t * 0.5) * 0.04 + mouse.y * 0.05,
        0.05,
      );
      hull.current.rotation.x = THREE.MathUtils.lerp(
        hull.current.rotation.x,
        mouse.y * 0.08,
        0.05,
      );
    } else {
      hull.current.rotation.y = Math.sin(t * 0.25) * 0.15;
      hull.current.rotation.z = Math.sin(t * 0.45) * 0.03;
    }
  });

  return (
    <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.35}>
      <group ref={hull} scale={scale}>
        {/* Hull */}
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[2.8, 0.42, 0.95]} />
          <meshStandardMaterial
            color="#0c3550"
            metalness={0.65}
            roughness={0.35}
            emissive="#0a2840"
            emissiveIntensity={0.15}
          />
        </mesh>
        <mesh position={[0, -0.12, 0]} rotation={[0, 0, 0]}>
          <boxGeometry args={[2.5, 0.15, 0.7]} />
          <meshStandardMaterial color="#071525" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Bow wedge */}
        <mesh position={[1.55, 0.05, 0]} rotation={[0, 0, -0.35]}>
          <boxGeometry args={[0.7, 0.28, 0.75]} />
          <meshStandardMaterial color="#143a52" metalness={0.6} roughness={0.4} />
        </mesh>
        {/* Cabin */}
        <mesh position={[0.1, 0.42, 0]} castShadow>
          <boxGeometry args={[1.15, 0.55, 0.62]} />
          <meshStandardMaterial
            color="#e8f4fa"
            metalness={0.2}
            roughness={0.25}
            emissive="#2ee8d6"
            emissiveIntensity={0.08}
          />
        </mesh>
        {/* Windshield */}
        <mesh position={[0.55, 0.48, 0]} rotation={[0, 0, -0.2]}>
          <boxGeometry args={[0.08, 0.38, 0.58]} />
          <meshStandardMaterial
            color="#a8e8f0"
            transparent
            opacity={0.75}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
        {/* Mast */}
        <mesh position={[-0.45, 1.05, 0]}>
          <cylinderGeometry args={[0.035, 0.04, 1.2, 8]} />
          <meshStandardMaterial color="#c8d8e4" metalness={0.4} roughness={0.35} />
        </mesh>
        {/* Sail */}
        <mesh position={[-0.45, 1.1, 0.15]} rotation={[0.3, 0, 0]}>
          <boxGeometry args={[0.04, 0.9, 0.55]} />
          <meshStandardMaterial
            color="#f5fcff"
            transparent
            opacity={0.82}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Teak deck stripe */}
        <mesh position={[0.5, 0.22, 0]}>
          <boxGeometry args={[0.55, 0.06, 0.5]} />
          <meshStandardMaterial color="#1e4a62" metalness={0.5} roughness={0.45} />
        </mesh>
        {/* Teal accent rail */}
        <mesh position={[-0.9, 0.28, 0]}>
          <boxGeometry args={[0.5, 0.05, 0.72]} />
          <meshStandardMaterial
            color="#2ee8d6"
            emissive="#2ee8d6"
            emissiveIntensity={0.35}
            metalness={0.7}
            roughness={0.2}
          />
        </mesh>
        {/* Wake glow under hull */}
        <mesh position={[0, -0.28, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.8, 1.6, 32]} />
          <meshBasicMaterial
            color="#2ee8d6"
            transparent
            opacity={0.12}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
    </Float>
  );
}
