import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float, Ring, Torus } from '@react-three/drei';
import * as THREE from 'three';

export function RobotHead() {
  const groupRef = useRef<THREE.Group>(null);
  const eyeLeftRef = useRef<THREE.Mesh>(null);
  const eyeRightRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    // Subtle head movement
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(t * 0.3) * 0.1;
      groupRef.current.rotation.x = Math.cos(t * 0.2) * 0.05;
    }

    // Pulsing eyes
    if (eyeLeftRef.current && eyeRightRef.current) {
      const pulse = 0.9 + Math.sin(t * 2) * 0.1;
      eyeLeftRef.current.scale.setScalar(pulse);
      eyeRightRef.current.scale.setScalar(pulse);
    }

    // Rotating ring
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.5;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <group ref={groupRef}>
        {/* Main Head */}
        <Sphere args={[1.5, 64, 64]} position={[0, 0, 0]}>
          <MeshDistortMaterial
            color="#0a1628"
            roughness={0.2}
            metalness={0.9}
            distort={0.1}
            speed={2}
          />
        </Sphere>

        {/* Outer Glow Shell */}
        <Sphere args={[1.55, 32, 32]} position={[0, 0, 0]}>
          <meshBasicMaterial
            color="#00f7ff"
            transparent
            opacity={0.05}
            side={THREE.BackSide}
          />
        </Sphere>

        {/* Face Plate */}
        <mesh position={[0, 0, 0.8]}>
          <circleGeometry args={[0.9, 64]} />
          <meshStandardMaterial
            color="#0d2137"
            roughness={0.3}
            metalness={0.8}
          />
        </mesh>

        {/* Left Eye */}
        <mesh ref={eyeLeftRef} position={[-0.35, 0.15, 1.1]}>
          <sphereGeometry args={[0.18, 32, 32]} />
          <meshBasicMaterial color="#00f7ff" />
        </mesh>

        {/* Left Eye Glow */}
        <pointLight position={[-0.35, 0.15, 1.3]} color="#00f7ff" intensity={0.5} distance={2} />

        {/* Right Eye */}
        <mesh ref={eyeRightRef} position={[0.35, 0.15, 1.1]}>
          <sphereGeometry args={[0.18, 32, 32]} />
          <meshBasicMaterial color="#00f7ff" />
        </mesh>

        {/* Right Eye Glow */}
        <pointLight position={[0.35, 0.15, 1.3]} color="#00f7ff" intensity={0.5} distance={2} />

        {/* Mouth/Visor */}
        <mesh position={[0, -0.3, 1]}>
          <boxGeometry args={[0.6, 0.08, 0.1]} />
          <meshBasicMaterial color="#f0b429" />
        </mesh>

        {/* Ear Pieces */}
        <mesh position={[-1.4, 0, 0]}>
          <boxGeometry args={[0.3, 0.5, 0.3]} />
          <meshStandardMaterial color="#0a1628" roughness={0.3} metalness={0.9} />
        </mesh>
        <mesh position={[1.4, 0, 0]}>
          <boxGeometry args={[0.3, 0.5, 0.3]} />
          <meshStandardMaterial color="#0a1628" roughness={0.3} metalness={0.9} />
        </mesh>

        {/* Tech Ring around head */}
        <Ring ref={ringRef} args={[1.7, 1.85, 64]} position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <meshBasicMaterial color="#00f7ff" transparent opacity={0.3} side={THREE.DoubleSide} />
        </Ring>

        {/* Decorative Torus */}
        <Torus args={[1.65, 0.05, 16, 64]} position={[0, 0, 0]} rotation={[Math.PI / 4, 0, 0]}>
          <meshBasicMaterial color="#f0b429" transparent opacity={0.5} />
        </Torus>
      </group>
    </Float>
  );
}
