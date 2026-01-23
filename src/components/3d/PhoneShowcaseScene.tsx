import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, RoundedBox, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

interface PhoneProps {
  position: [number, number, number];
  rotation: [number, number, number];
  screenColor: string;
  label: string;
}

function Phone3D({ position, rotation, screenColor, label }: PhoneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const screenRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    if (screenRef.current) {
      const material = screenRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.85 + Math.sin(t * 2) * 0.1;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.3}>
      <group ref={groupRef} position={position} rotation={rotation}>
        {/* Phone Frame */}
        <RoundedBox args={[1.4, 2.8, 0.12]} radius={0.12} smoothness={4}>
          <meshStandardMaterial color="#1a1a2e" roughness={0.2} metalness={0.9} />
        </RoundedBox>

        {/* Screen Border */}
        <RoundedBox args={[1.25, 2.6, 0.02]} radius={0.08} smoothness={4} position={[0, 0, 0.06]}>
          <meshStandardMaterial color="#0a0a14" roughness={0.1} metalness={0.5} />
        </RoundedBox>

        {/* Screen */}
        <mesh ref={screenRef} position={[0, 0, 0.07]}>
          <planeGeometry args={[1.15, 2.45]} />
          <meshBasicMaterial color="#0f1419" transparent opacity={0.9} />
        </mesh>

        {/* Screen Content Background Gradient */}
        <mesh position={[0, 0.4, 0.075]}>
          <planeGeometry args={[1.1, 1.4]} />
          <meshBasicMaterial color={screenColor} transparent opacity={0.15} />
        </mesh>

        {/* Robot Avatar Circle */}
        <mesh position={[0, 0.6, 0.08]}>
          <circleGeometry args={[0.28, 32]} />
          <meshBasicMaterial color={screenColor} transparent opacity={0.2} />
        </mesh>
        <mesh position={[0, 0.6, 0.085]}>
          <ringGeometry args={[0.25, 0.28, 32]} />
          <meshBasicMaterial color={screenColor} />
        </mesh>

        {/* Play Button */}
        <mesh position={[0, 0.1, 0.08]}>
          <circleGeometry args={[0.18, 32]} />
          <meshBasicMaterial color={screenColor} />
        </mesh>
        <mesh position={[0.03, 0.1, 0.09]}>
          <coneGeometry args={[0.08, 0.12, 3]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>

        {/* Action Buttons Row */}
        {[-0.35, 0, 0.35].map((x, i) => (
          <mesh key={i} position={[x, -0.25, 0.08]}>
            <circleGeometry args={[0.12, 32]} />
            <meshBasicMaterial color={i === 1 ? screenColor : "#2a2a3e"} transparent opacity={0.8} />
          </mesh>
        ))}

        {/* Bottom Navigation */}
        <mesh position={[0, -1, 0.075]}>
          <planeGeometry args={[1.1, 0.35]} />
          <meshBasicMaterial color="#1a1a2e" transparent opacity={0.9} />
        </mesh>

        {/* Navigation Icons */}
        {[-0.35, 0, 0.35].map((x, i) => (
          <mesh key={i} position={[x, -1, 0.08]}>
            <circleGeometry args={[0.07, 16]} />
            <meshBasicMaterial color={i === 0 ? screenColor : "#444"} />
          </mesh>
        ))}

        {/* Dynamic Island / Notch */}
        <mesh position={[0, 1.15, 0.075]}>
          <planeGeometry args={[0.35, 0.06]} />
          <meshBasicMaterial color="#000" />
        </mesh>

        {/* Camera dot */}
        <mesh position={[0.1, 1.15, 0.08]}>
          <circleGeometry args={[0.02, 16]} />
          <meshBasicMaterial color="#1a3a5c" />
        </mesh>
      </group>
    </Float>
  );
}

interface PhoneShowcaseSceneProps {
  className?: string;
}

export function PhoneShowcaseScene({ className }: PhoneShowcaseSceneProps) {
  return (
    <div className={className}>
      <Canvas
        style={{ background: 'transparent' }}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 6]} fov={50} />
        
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.3} />
          <spotLight position={[5, 5, 5]} angle={0.4} penumbra={1} intensity={0.6} />
          <pointLight position={[-3, 3, 3]} intensity={0.4} color="#00f7ff" />
          <pointLight position={[3, -3, 3]} intensity={0.3} color="#f0b429" />

          {/* Left Phone - Cyan theme */}
          <Phone3D 
            position={[-2, 0, 0]} 
            rotation={[0, 0.25, 0.05]} 
            screenColor="#00f7ff"
            label="Aggressive Scalper AI"
          />

          {/* Center Phone - Gold theme */}
          <Phone3D 
            position={[0, 0.3, 0.5]} 
            rotation={[0, 0, 0]} 
            screenColor="#f0b429"
            label="EA Gold Trader"
          />

          {/* Right Phone - Red/Orange theme */}
          <Phone3D 
            position={[2, 0, 0]} 
            rotation={[0, -0.25, -0.05]} 
            screenColor="#ef4444"
            label="Blue Pips Traders"
          />

          <Environment preset="night" />
        </Suspense>
      </Canvas>
    </div>
  );
}
