import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Grid } from '@react-three/drei';
import { Leva, useControls, folder } from 'leva';
import { Vase } from './components/Vase';
import { AttractorCurve } from './components/AttractorCurve';
import { IterationUI } from './components/IterationUI';

export default function App() {
  const [profileParams, setProfileConfig] = useControls('Vase Profile', () => ({
    baseRadius: { value: 1.0, min: 0.1, max: 5.0 },
    topRadius: { value: 1.0, min: 0.1, max: 5.0 },
    midRadius: { value: 2.0, min: 0.1, max: 5.0 },
    height: { value: 5.0, min: 1.0, max: 10.0 },
    midHeight: { value: 0.5, min: 0.1, max: 0.9, step: 0.01 },
    Rotations: folder({
      midRotX: { value: 0.0, min: -45.0, max: 45.0, step: 1.0, label: 'Bend Pitch (X)' },
      midRotY: { value: 0.0, min: -45.0, max: 45.0, step: 1.0, label: 'Twist Yaw (Y)' },
      midRotZ: { value: 0.0, min: -45.0, max: 45.0, step: 1.0, label: 'Bend Roll (Z)' },
    })
  }));

  const [textureParams, setTextureConfig] = useControls('Texture & Noise', () => ({
    noiseType: { options: { Simplex: 0, Perlin: 1, Worley: 2, Alligator: 3 } },
    textureScaleClosest: { value: 5.0, min: 0.000001, max: 20.0, step: 0.000001 },
    textureScaleFarthest: { value: 1.0, min: 0.000001, max: 20.0, step: 0.000001 },
    displacement: { value: 0.5, min: 0.0, max: 2.0 },
    invertDisplacement: false,
    textureSharpening: { value: 0.0, min: 0.0, max: 2.0, step: 0.01, label: 'Sharpen Ridges' },
    invertLogic: false,
    easeInBottom: { value: 0.05, min: 0.0, max: 0.5, step: 0.01, label: 'Fade Bottom' },
    easeOutTop: { value: 0.05, min: 0.0, max: 0.5, step: 0.01, label: 'Fade Top' },
    Colors: folder({
      colorValley: '#0d3380',
      colorPeak: '#ff6633'
    })
  }));

  const [geoParams, setGeoConfig] = useControls('Geometry Base', () => ({
    subdivisionLevel: { value: 3, min: 1, max: 4, step: 1, label: 'Subdivision Lvl' },
    showAttractor: { value: true, label: 'Show Attractor' },
    wireframePreview: { value: false, label: 'Mesh Preview (Wireframe)' }
  }));

  return (
    <>
      <div className="overlay">
        <h1>Vase Generator</h1>
        <p>Parametric & Procedural</p>
      </div>
      <IterationUI 
          currentParams={{ profileParams, textureParams, geoParams }}
          setters={{ setProfileConfig, setTextureConfig, setGeoConfig }} 
      />
      <Leva theme={{ colors: { elevation1: '#181c20', elevation2: '#282d34' } }} />
      <Canvas camera={{ position: [5, 5, 5], fov: 45 }}>
        <color attach="background" args={['#0d0f12']} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        
        <Vase profileParams={profileParams} textureParams={textureParams} geoParams={geoParams} />
        {geoParams.showAttractor && <AttractorCurve />}

        <OrbitControls makeDefault />
        <Environment preset="city" />
        <Grid position={[0, 0, 0]} infiniteGrid fadeDistance={50} fadeStrength={5} cellColor="#4f4f4f" sectionColor="#8f8f8f" />
        <ContactShadows position={[0, -0.01, 0]} opacity={0.5} scale={10} blur={2} far={10} />
      </Canvas>
    </>
  );
}
