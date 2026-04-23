import * as THREE from 'three';
import { createNoise3D } from 'simplex-noise';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js';
import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

const saveBlob = (blob: Blob, filename: string) => {
   const link = document.createElement('a');
   link.href = URL.createObjectURL(blob);
   link.download = filename;
   link.click();
}

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const smoothstep = (edge0: number, edge1: number, x: number) => {
    const t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
    return t * t * (3.0 - 2.0 * t);
}

const worleyF1F2 = (x: number, y: number, z: number) => {
    const xF = Math.floor(x), yF = Math.floor(y), zF = Math.floor(z);
    const xFR = x - xF, yFR = y - yF, zFR = z - zF;
    let F1 = 1000.0, F2 = 1000.0;
    
    for(let k=-1; k<=1; k++) {
        for(let j=-1; j<=1; j++) {
            for(let i=-1; i<=1; i++) {
                const nx = xF + i, ny = yF + j, nz = zF + k;
                
                const vx = Math.sin(nx * 12.9898) * 43758.5453;
                const vy = Math.sin(ny * 78.233) * 43758.5453;
                const vz = Math.sin(nz * 37.719) * 43758.5453;
                
                const rx = vx - Math.floor(vx);
                const ry = vy - Math.floor(vy);
                const rz = vz - Math.floor(vz);
                
                const dx = i - xFR + rx;
                const dy = j - yFR + ry;
                const dz = k - zFR + rz;
                
                const d = dx*dx + dy*dy + dz*dz;
                if (d < F1) {
                    F2 = F1;
                    F1 = d;
                } else if (d < F2) {
                    F2 = d;
                }
            }
        }
    }
    return [Math.sqrt(F1), Math.sqrt(F2)];
}

const distToSegment = (px: number, py: number, pz: number, 
                       ax: number, ay: number, az: number, 
                       bx: number, by: number, bz: number) => {
   const pax = px - ax, pay = py - ay, paz = pz - az;
   const bax = bx - ax, bay = by - ay, baz = bz - az;
   
   const dotBABA = bax*bax + bay*bay + baz*baz;
   const h = clamp((pax*bax + pay*bay + paz*baz) / dotBABA, 0.0, 1.0);
   
   const projX = pax - bax*h;
   const projY = pay - bay*h;
   const projZ = paz - baz*h;
   return Math.sqrt(projX*projX + projY*projY + projZ*projZ);
}

const getCurveDist = (px: number, py: number, pz: number, pts: THREE.Vector3[]) => {
   let minDist = 10000.0;
   for(let i=0; i<pts.length - 1; i++) {
       const d = distToSegment(px, py, pz, pts[i].x, pts[i].y, pts[i].z, pts[i+1].x, pts[i+1].y, pts[i+1].z);
       if (d < minDist) minDist = d;
   }
   return minDist;
}

export const exportGeometry = (format: 'stl'|'obj'|'gltf', geoParams: any, profileParams: any, textureParams: any, curvePoints: THREE.Vector3[]) => {
  let res = 128;
  if (geoParams.subdivisionLevel === 2) res = 256;
  if (geoParams.subdivisionLevel === 3) res = 512;
  if (geoParams.subdivisionLevel === 4) res = 1024;
  
  const geo = new THREE.CylinderGeometry(1, 1, 1, res, res, false);
  const pos = geo.attributes.position;
  const snoise3 = createNoise3D();
  
  const getNoise = (px: number, py: number, pz: number, type: number, scale: number) => {
      const sx = px*scale, sy = py*scale, sz = pz*scale;
      if (type === 0) return snoise3(sx, sy, sz);
      if (type === 1) return snoise3(sx, sy, sz)*0.5 + snoise3(sx*2, sy*2, sz*2)*0.25 + snoise3(sx*4, sy*4, sz*4)*0.125;
      if (type === 2) return 1.0 - worleyF1F2(sx, sy, sz)[0];
      if (type === 3) {
         const w = worleyF1F2(sx, sy, sz);
         return w[1] - w[0];
      }
      return 0.0;
  };

  const { baseRadius, midRadius, topRadius, height, midHeight } = profileParams;
  const { midRotX, midRotY, midRotZ } = profileParams; 
  const { noiseType, textureScaleClosest, textureScaleFarthest, displacement, invertDisplacement, textureSharpening, invertLogic, easeInBottom, easeOutTop } = textureParams;
  
  const rx = (midRotX || 0) * Math.PI / 180.0;
  const ry = (midRotY || 0) * Math.PI / 180.0;
  const rz = (midRotZ || 0) * Math.PI / 180.0;
  
  for(let i=0; i<pos.count; i++) {
      let vx = pos.getX(i);
      let vy = pos.getY(i); 
      let vz = pos.getZ(i);
      
      const normY = vy + 0.5;
      let profileR = 1.0;
      if (normY < midHeight) {
          profileR = baseRadius + (midRadius - baseRadius) * smoothstep(0, 1, normY / midHeight);
      } else {
          profileR = midRadius + (topRadius - midRadius) * smoothstep(0, 1, (normY - midHeight) / (1.0 - midHeight));
      }
      
      let profX = vx * profileR;
      let profY = vy * height;
      let profZ = vz * profileR;
      
      let curX = 0, curY = 0, curZ = 0;
      if (normY < midHeight) {
         const f = smoothstep(0, 1, normY / midHeight);
         curX = rx * f; curY = ry * f; curZ = rz * f;
      } else {
         const f = smoothstep(0, 1, (normY - midHeight) / (1.0 - midHeight));
         curX = rx * (1-f); curY = ry * (1-f); curZ = rz * (1-f);
      }
      
      let p_y = profY, p_z = profZ;
      profY = p_y * Math.cos(curX) - p_z * Math.sin(curX);
      profZ = p_y * Math.sin(curX) + p_z * Math.cos(curX);
      
      let p_x = profX; p_y = profY;
      profX = p_x * Math.cos(curZ) - p_y * Math.sin(curZ);
      profY = p_x * Math.sin(curZ) + p_y * Math.cos(curZ);
      
      p_x = profX; p_z = profZ;
      profX = p_x * Math.cos(curY) + p_z * Math.sin(curY);
      profZ = -p_x * Math.sin(curY) + p_z * Math.cos(curY);
      
      const dist = getCurveDist(profX, profY + height * 0.5, profZ, curvePoints);
      let falloff = smoothstep(3.0, 0.0, dist);
      if (invertLogic) falloff = 1.0 - falloff;
      
      const easeIn = easeInBottom > 0.0 ? smoothstep(0.0, easeInBottom, normY) : 1.0;
      const easeOut = easeOutTop > 0.0 ? (1.0 - smoothstep(1.0 - easeOutTop, 1.0, normY)) : 1.0;
      falloff *= easeIn * easeOut;
      
      const currentScale = textureScaleFarthest + (textureScaleClosest - textureScaleFarthest) * falloff;
      let nv = getNoise(profX, profY, profZ, noiseType, currentScale);
      
      if (textureSharpening > 0.0) {
          let ridged = nv;
          if (noiseType === 0 || noiseType === 1) ridged = 1.0 - Math.abs(nv);
          const sharp = Math.pow(ridged, 1.0 + textureSharpening * 4.0);
          nv = nv + (sharp - nv) * smoothstep(0.0, 1.0, textureSharpening);
      }
      
      const dirLength = Math.sqrt(profX*profX + profZ*profZ);
      let d = nv * displacement * falloff;
      if (invertDisplacement) d = -d;
      
      profX += (profX / dirLength) * d;
      profZ += (profZ / dirLength) * d;
      
      pos.setXYZ(i, profX, profY, profZ);
  }
  
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo);
  mesh.position.y = height / 2;
  mesh.updateMatrixWorld();
  
  const fn = 'ParametricVase';
  if (format === 'stl') {
      const exp = new STLExporter();
      saveBlob(new Blob([exp.parse(mesh)], { type: 'text/plain' }), fn + '.stl');
  } else if (format === 'obj') {
      const exp = new OBJExporter();
      saveBlob(new Blob([exp.parse(mesh)], { type: 'text/plain' }), fn + '.obj');
  } else if (format === 'gltf') {
      const exp = new GLTFExporter();
      exp.parse(mesh, (gltf) => {
         saveBlob(new Blob([JSON.stringify(gltf, null, 2)], { type: 'text/plain' }), fn + '.gltf');
      }, (e) => console.error(e));
  }
}
