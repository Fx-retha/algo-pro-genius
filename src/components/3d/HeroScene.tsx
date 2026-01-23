import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, Sparkles, ContactShadows, PerspectiveCamera } from '@react-three/drei';
import { RobotHead } from './RobotHead';
import { PhoneMockup } from './PhoneMockup';

interface HeroSceneProps {
  className?: string;
  showPhones?: boolean;
}

export function HeroScene({ className, showPhones = false }: HeroSceneProps) {
  return (
    <div className={className}>
      <Canvas
        style={{ background: 'transparent' }}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 6]} fov={50} />
        
        <Suspense fallback={null}>
          {/* Lighting Setup */}
          <ambientLight intensity={0.2} />
          <spotLight 
            position={[10, 10, 10]} 
            angle={0.3} 
            penumbra={1} 
            intensity={0.5}
            castShadow
          />
          <pointLight position={[-5, 5, -5]} intensity={0.3} color="#00f7ff" />
          <pointLight position={[5, -5, 5]} intensity={0.2} color="#f0b429" />

          {/* Main Robot Head */}
          <group position={[0, 0.3, 0]} scale={1.1}>
            <RobotHead />
          </group>

          {/* Optional Phone Mockups */}
          {showPhones && (
            <>
              <PhoneMockup position={[-2.5, -0.5, 0.5]} rotation={[0, 0.3, 0.05]} />
              <PhoneMockup position={[2.5, -0.5, 0.5]} rotation={[0, -0.3, -0.05]} />
            </>
          )}

          {/* Ambient Particles */}
          <Sparkles
            count={80}
            scale={8}
            size={1.5}
            speed={0.2}
            color="#00f7ff"
          />

          {/* Ground Shadow */}
          <ContactShadows
            position={[0, -2, 0]}
            opacity={0.3}
            scale={10}
            blur={2}
            far={4}
            color="#00f7ff"
          />

          {/* Environment */}
          <Environment preset="night" />
        </Suspense>
      </Canvas>
    </div>
  );
}
