// Removed React import
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { Leva, useControls } from 'leva';
import { Vase } from './components/Vase';
import { AttractorCurve } from './components/AttractorCurve';

export default function App() {
  const profileParams = useControls('Vase Profile', {
    baseRadius: { value: 1.0, min: 0.1, max: 5.0 },
    topRadius: { value: 1.0, min: 0.1, max: 5.0 },
    midRadius: { value: 2.0, min: 0.1, max: 5.0 },
    height: { value: 5.0, min: 1.0, max: 10.0 },
    midHeight: { value: 0.5, min: 0.1, max: 0.9, step: 0.01 },
  });

  const textureParams = useControls('Texture & Noise', {
    noiseType: { options: { Simplex: 0, Perlin: 1, Worley: 2, 'Differential Growth': 3 } },
    noiseScale: { value: 3.0, min: 0.1, max: 20.0 },
    displacement: { value: 0.5, min: 0.0, max: 2.0 },
    invertLogic: false
  });

  return (
    <>
      <div className="overlay">
        <h1>Vase Generator</h1>
        <p>Parametric & Procedural</p>
      </div>
      <Leva theme={{ colors: { elevation1: '#181c20', elevation2: '#282d34' } }} />
      <Canvas camera={{ position: [5, 5, 5], fov: 45 }}>
        <color attach="background" args={['#0d0f12']} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        
        <Vase profileParams={profileParams} textureParams={textureParams} />
        <AttractorCurve />

        <OrbitControls makeDefault />
        <Environment preset="city" />
        <ContactShadows position={[0, -0.01, 0]} opacity={0.5} scale={10} blur={2} far={10} />
      </Canvas>
    </>
  );
}
