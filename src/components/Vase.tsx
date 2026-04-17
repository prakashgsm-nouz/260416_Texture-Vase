import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { appState } from '../state';
import { modifyVaseMaterial } from '../shaders/VaseShader';

export const Vase = ({ profileParams, textureParams }: any) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const material = useMemo(() => {
     // use mesh physical material for premium look
     const mat = new THREE.MeshPhysicalMaterial({ 
        roughness: 0.1,
        metalness: 0.4,
        clearcoat: 0.8,
        clearcoatRoughness: 0.1,
        side: THREE.DoubleSide
     });
     modifyVaseMaterial(mat);
     return mat;
  }, []);

  useFrame(() => {
    if(material.userData.shader) {
       const uniforms = material.userData.shader.uniforms;
       uniforms.uBaseRadius.value = profileParams.baseRadius;
       uniforms.uMidRadius.value = profileParams.midRadius;
       uniforms.uTopRadius.value = profileParams.topRadius;
       uniforms.uHeight.value = profileParams.height;
       uniforms.uMidHeight.value = profileParams.midHeight;
       
       uniforms.uNoiseType.value = textureParams.noiseType;
       uniforms.uNoiseScale.value = textureParams.noiseScale;
       uniforms.uDisplacement.value = textureParams.displacement;
       uniforms.uInvertLogic.value = textureParams.invertLogic;
       
       const pts = appState.curvePoints;
       uniforms.uNumPoints.value = pts.length;
       for(let i=0; i<pts.length; i++) {
         if (uniforms.uCurvePoints.value[i]) {
            uniforms.uCurvePoints.value[i].copy(pts[i]);
         }
       }
    }
    
    // We adjust the geometry Y position depending on height so its bottom sits at zero
    if(meshRef.current) {
        meshRef.current.position.y = profileParams.height / 2;
    }
  });

  // Geometry remains static, size is driven by shader
  const geometryArgs = useMemo(() => [1, 1, 1, 512, 512] as any, []);

  return (
    <mesh ref={meshRef} material={material} castShadow receiveShadow>
      {/* 512 radial segments for smooth noise, 256 height segments */}
      <cylinderGeometry args={geometryArgs} />
    </mesh>
  );
};
