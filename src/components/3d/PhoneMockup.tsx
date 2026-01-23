import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Float, Text } from '@react-three/drei';
import * as THREE from 'three';

interface PhoneMockupProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  label?: string;
}

export function PhoneMockup({ position = [0, 0, 0], rotation = [0, 0, 0], label }: PhoneMockupProps) {
  const phoneRef = useRef<THREE.Group>(null);
  const screenRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    if (screenRef.current) {
      // Screen glow pulse
      const material = screenRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.8 + Math.sin(t * 2) * 0.1;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.3}>
      <group ref={phoneRef} position={position} rotation={rotation}>
        {/* Phone Frame */}
        <RoundedBox args={[1.2, 2.4, 0.1]} radius={0.1} smoothness={4}>
          <meshStandardMaterial color="#1a1a2e" roughness={0.3} metalness={0.8} />
        </RoundedBox>

        {/* Screen */}
        <mesh ref={screenRef} position={[0, 0, 0.06]}>
          <planeGeometry args={[1.05, 2.2]} />
          <meshBasicMaterial color="#0f1419" transparent opacity={0.9} />
        </mesh>

        {/* Screen Content - Gradient */}
        <mesh position={[0, 0.3, 0.07]}>
          <planeGeometry args={[1, 1.2]} />
          <meshBasicMaterial color="#00f7ff" transparent opacity={0.1} />
        </mesh>

        {/* Robot Avatar Circle */}
        <mesh position={[0, 0.5, 0.08]}>
          <circleGeometry args={[0.25, 32]} />
          <meshBasicMaterial color="#00f7ff" transparent opacity={0.3} />
        </mesh>
        <mesh position={[0, 0.5, 0.085]}>
          <ringGeometry args={[0.22, 0.25, 32]} />
          <meshBasicMaterial color="#00f7ff" />
        </mesh>

        {/* Play Button */}
        <mesh position={[0, 0, 0.08]}>
          <circleGeometry args={[0.15, 32]} />
          <meshBasicMaterial color="#00f7ff" />
        </mesh>

        {/* Bottom Navigation */}
        <mesh position={[0, -0.9, 0.07]}>
          <planeGeometry args={[1, 0.3]} />
          <meshBasicMaterial color="#1a1a2e" transparent opacity={0.8} />
        </mesh>

        {/* Navigation Icons */}
        {[-0.3, 0, 0.3].map((x, i) => (
          <mesh key={i} position={[x, -0.9, 0.08]}>
            <circleGeometry args={[0.06, 16]} />
            <meshBasicMaterial color={i === 0 ? "#00f7ff" : "#444"} />
          </mesh>
        ))}

        {/* Notch */}
        <mesh position={[0, 1.1, 0.06]}>
          <planeGeometry args={[0.4, 0.05]} />
          <meshBasicMaterial color="#000" />
        </mesh>
      </group>
    </Float>
  );
}
