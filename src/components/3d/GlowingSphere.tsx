import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

interface GlowingSphereProps {
  position?: [number, number, number];
  color?: string;
  size?: number;
  speed?: number;
}

export function GlowingSphere({ position = [0, 0, 0], color = "#00f7ff", size = 0.5, speed = 1 }: GlowingSphereProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime() * speed;
    
    if (meshRef.current) {
      meshRef.current.scale.setScalar(1 + Math.sin(t * 2) * 0.1);
    }
    
    if (glowRef.current) {
      const material = glowRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.3 + Math.sin(t * 3) * 0.1;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
      <group position={position}>
        {/* Core sphere */}
        <mesh ref={meshRef}>
          <sphereGeometry args={[size, 32, 32]} />
          <meshBasicMaterial color={color} />
        </mesh>
        
        {/* Outer glow */}
        <mesh ref={glowRef}>
          <sphereGeometry args={[size * 1.5, 32, 32]} />
          <meshBasicMaterial 
            color={color} 
            transparent 
            opacity={0.3} 
            side={THREE.BackSide}
          />
        </mesh>
        
        {/* Point light for glow effect */}
        <pointLight color={color} intensity={0.5} distance={3} />
      </group>
    </Float>
  );
}
