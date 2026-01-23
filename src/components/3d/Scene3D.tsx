import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, Sparkles, Stars } from '@react-three/drei';
import { RobotHead } from './RobotHead';

interface Scene3DProps {
  className?: string;
}

export function Scene3D({ className }: Scene3DProps) {
  return (
    <div className={className}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true, antialias: true }}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.3} />
          <directionalLight position={[5, 5, 5]} intensity={0.5} color="#ffffff" />
          <pointLight position={[-5, -5, 5]} intensity={0.3} color="#00f7ff" />
          <pointLight position={[5, -5, 5]} intensity={0.2} color="#f0b429" />

          {/* Robot Head */}
          <RobotHead />

          {/* Particles */}
          <Sparkles
            count={100}
            scale={10}
            size={2}
            speed={0.3}
            color="#00f7ff"
          />

          {/* Background Stars */}
          <Stars
            radius={50}
            depth={50}
            count={1000}
            factor={4}
            saturation={0}
            fade
            speed={1}
          />

          {/* Environment */}
          <Environment preset="night" />
        </Suspense>
      </Canvas>
    </div>
  );
}
