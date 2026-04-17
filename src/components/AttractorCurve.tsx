import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { TransformControls } from '@react-three/drei';
import { appState } from '../state';

export const AttractorCurve = () => {
  const lineRef = useRef<THREE.Line>(null);

  // Use a closed CatmullRomCurve to circle around the vase
  const curve = useMemo(() => new THREE.CatmullRomCurve3(appState.curvePoints, true), []);
  
  useFrame(() => {
    if (lineRef.current) {
      const g = lineRef.current.geometry;
      g.setFromPoints(curve.getPoints(100));
    }
  });

  return (
    <group>
      <line ref={lineRef as any}>
        <bufferGeometry />
        <lineBasicMaterial color="#c471ed" linewidth={3} transparent opacity={0.8} />
      </line>

      {appState.curvePoints.map((point, index) => (
        <ControlPoint key={index} index={index} point={point} curve={curve} />
      ))}
    </group>
  );
};

const ControlPoint = ({ index, point, curve }: { index: number, point: THREE.Vector3, curve: THREE.CatmullRomCurve3 }) => {
  return (
    <TransformControls 
      position={point}
      mode="translate"
      size={0.5}
      onObjectChange={(e) => {
        const target = e?.target as any;
        if (target && target.object) {
            appState.curvePoints[index].copy(target.object.position);
            curve.points = appState.curvePoints;
        }
      }}
    >
      <mesh>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color="#f64f59" />
      </mesh>
    </TransformControls>
  );
};
