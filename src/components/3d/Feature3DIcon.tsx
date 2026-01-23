import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Float, Torus, Icosahedron, Octahedron, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface Feature3DIconProps {
  type: 'copy' | 'sync' | 'shield' | 'refresh' | 'globe' | 'clock';
  color?: string;
}

function IconMesh({ type, color = "#00f7ff" }: Feature3DIconProps) {
  switch (type) {
    case 'copy':
      return (
        <Float speed={2} rotationIntensity={0.5}>
          <group>
            <mesh position={[-0.15, 0.15, 0]}>
              <boxGeometry args={[0.5, 0.6, 0.05]} />
              <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[0.15, -0.15, 0.1]}>
              <boxGeometry args={[0.5, 0.6, 0.05]} />
              <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} transparent opacity={0.7} />
            </mesh>
          </group>
        </Float>
      );
    case 'sync':
      return (
        <Float speed={3} rotationIntensity={1}>
          <Torus args={[0.35, 0.08, 16, 32]}>
            <MeshDistortMaterial color={color} metalness={0.8} roughness={0.2} distort={0.2} speed={2} />
          </Torus>
        </Float>
      );
    case 'shield':
      return (
        <Float speed={1.5} rotationIntensity={0.3}>
          <Icosahedron args={[0.4, 0]}>
            <meshStandardMaterial color={color} metalness={0.9} roughness={0.1} flatShading />
          </Icosahedron>
        </Float>
      );
    case 'refresh':
      return (
        <Float speed={2} rotationIntensity={0.8}>
          <group>
            <Torus args={[0.3, 0.06, 8, 32]} rotation={[0, 0, 0]}>
              <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
            </Torus>
            <mesh position={[0.3, 0.1, 0]} rotation={[0, 0, -Math.PI / 4]}>
              <coneGeometry args={[0.1, 0.15, 3]} />
              <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
            </mesh>
          </group>
        </Float>
      );
    case 'globe':
      return (
        <Float speed={1} rotationIntensity={0.4}>
          <group>
            <mesh>
              <sphereGeometry args={[0.35, 16, 16]} />
              <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} wireframe />
            </mesh>
            <Torus args={[0.38, 0.02, 8, 32]} rotation={[Math.PI / 2, 0, 0]}>
              <meshBasicMaterial color={color} />
            </Torus>
          </group>
        </Float>
      );
    case 'clock':
      return (
        <Float speed={1.5} rotationIntensity={0.2}>
          <group>
            <mesh>
              <cylinderGeometry args={[0.4, 0.4, 0.08, 32]} />
              <meshStandardMaterial color="#1a1a2e" metalness={0.9} roughness={0.1} />
            </mesh>
            <mesh position={[0, 0.05, 0]}>
              <cylinderGeometry args={[0.35, 0.35, 0.02, 32]} />
              <meshBasicMaterial color="#0d2137" />
            </mesh>
            {/* Hour hand */}
            <mesh position={[0, 0.06, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
              <boxGeometry args={[0.03, 0.15, 0.02]} />
              <meshBasicMaterial color={color} />
            </mesh>
            {/* Minute hand */}
            <mesh position={[0.08, 0.06, 0]} rotation={[Math.PI / 2, 0, Math.PI / 2]}>
              <boxGeometry args={[0.02, 0.2, 0.02]} />
              <meshBasicMaterial color={color} />
            </mesh>
          </group>
        </Float>
      );
    default:
      return (
        <Octahedron args={[0.4]}>
          <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
        </Octahedron>
      );
  }
}

export function Feature3DIcon({ type, color }: Feature3DIconProps) {
  return (
    <div className="w-16 h-16">
      <Canvas
        camera={{ position: [0, 0, 2], fov: 50 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true, antialias: true }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <pointLight position={[2, 2, 2]} intensity={0.5} color="#ffffff" />
          <pointLight position={[-2, -2, 2]} intensity={0.3} color={color || "#00f7ff"} />
          <IconMesh type={type} color={color} />
        </Suspense>
      </Canvas>
    </div>
  );
}
