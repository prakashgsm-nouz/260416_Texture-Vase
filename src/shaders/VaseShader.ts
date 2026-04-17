import * as THREE from 'three';

const noiseFunctions = `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 = v - i + dot(i, C.xxx) ;
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute( permute( permute( i.z + vec4(0.0, i1.z, i2.z, 1.0 )) + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
  float n_ = 0.142857142857;
  vec3  ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );
  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
}

float worley(vec3 p) {
    vec3 n = floor(p);
    vec3 f = fract(p);
    float res = 1.0;
    for(int k=-1; k<=1; k++)
    for(int j=-1; j<=1; j++)
    for(int i=-1; i<=1; i++) {
        vec3 b = vec3(float(i), float(j), float(k));
        vec3 r = vec3(b) - f + fract(sin(vec3(n + b)*vec3(12.9898, 78.233, 37.719))*43758.5453);
        float d = dot(r, r);
        res = min(res, d);
    }
    return sqrt(res);
}

float getNoise(vec3 pos, int type, float scale) {
  vec3 p = pos * scale;
  if(type == 0) { // Simplex
    return snoise(p);
  } else if(type == 1) { // Perlin/FBM approx
    return snoise(p) * 0.5 + snoise(p * 2.0) * 0.25 + snoise(p * 4.0) * 0.125;
  } else if(type == 2) { // Worley
    return 1.0 - worley(p);
  } else if(type == 3) { // Differential Growth Approx (Ridged FBM)
    float n = abs(snoise(p));
    n += 0.5 * abs(snoise(p * 2.0));
    n += 0.25 * abs(snoise(p * 4.0));
    return 1.0 - n;
  }
  return 0.0;
}
`;

export const modifyVaseMaterial = (material: THREE.Material) => {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uBaseRadius = { value: 1.0 };
    shader.uniforms.uMidRadius = { value: 2.0 };
    shader.uniforms.uTopRadius = { value: 1.0 };
    shader.uniforms.uHeight = { value: 5.0 };
    shader.uniforms.uMidHeight = { value: 0.5 };
    shader.uniforms.uMidRotation = { value: 0.0 };
    
    shader.uniforms.uNoiseType = { value: 0 };
    shader.uniforms.uTextureScaleClosest = { value: 5.0 };
    shader.uniforms.uTextureScaleFarthest = { value: 1.0 };
    shader.uniforms.uTextureSharpening = { value: 0.0 };
    shader.uniforms.uDisplacement = { value: 0.5 };
    shader.uniforms.uInvertLogic = { value: false };
    shader.uniforms.uColorValley = { value: new THREE.Color('#0d3380') };
    shader.uniforms.uColorPeak = { value: new THREE.Color('#ff6633') };
    
    // Max 50 points
    shader.uniforms.uCurvePoints = { value: new Array(50).fill(0).map(()=>new THREE.Vector3()) };
    shader.uniforms.uNumPoints = { value: 5 };

    shader.vertexShader = `
      uniform float uBaseRadius;
      uniform float uMidRadius;
      uniform float uTopRadius;
      uniform float uHeight;
      uniform float uMidHeight;
      uniform float uMidRotation;
      
      uniform int uNoiseType;
      uniform float uTextureScaleClosest;
      uniform float uTextureScaleFarthest;
      uniform float uTextureSharpening;
      uniform float uDisplacement;
      uniform bool uInvertLogic;
      
      uniform vec3 uCurvePoints[50];
      uniform int uNumPoints;
      
      varying float vDisplacement;
      varying vec2 vUv;
      
      ${noiseFunctions}
      
      float getRadius(float y) {
        float hY = y / uHeight;
        if(hY < uMidHeight) {
          float t = hY / uMidHeight;
          return mix(uBaseRadius, uMidRadius, smoothstep(0.0, 1.0, t));
        } else {
          float t = (hY - uMidHeight) / (1.0 - uMidHeight);
          return mix(uMidRadius, uTopRadius, smoothstep(0.0, 1.0, t));
        }
      }
      
      float getDistanceToCurve(vec3 p) {
        float minDist = 10000.0;
        for(int i = 0; i < 50; i++) {
          if(i >= uNumPoints) break;
          // Approximate curve as points to avoid heavy line distance calculation
          float d = distance(p, uCurvePoints[i]);
          minDist = min(minDist, d);
        }
        return minDist;
      }
      
    ` + shader.vertexShader;

    shader.vertexShader = shader.vertexShader.replace(
      `#include <begin_vertex>`,
      `
      #include <begin_vertex>
      
      float normY = position.y + 0.5; // 0.0 to 1.0 natively via cylinder args
      float yMap = normY * uHeight;
      float profileR = getRadius(yMap);
      
      vec3 profilePos = vec3(position.x * profileR, position.y * uHeight, position.z * profileR);
      
      // Interpolate Rotation around Y
      float rotAngle = 0.0;
      if(normY < uMidHeight) {
        rotAngle = mix(0.0, uMidRotation, smoothstep(0.0, 1.0, normY / uMidHeight));
      } else {
        rotAngle = mix(uMidRotation, 0.0, smoothstep(0.0, 1.0, (normY - uMidHeight) / (1.0 - uMidHeight)));
      }
      float c = cos(rotAngle);
      float s = sin(rotAngle);
      mat2 rMat = mat2(c, -s, s, c);
      profilePos.xz = rMat * profilePos.xz;
      
      float dist = getDistanceToCurve(profilePos);
      float curveFalloff = smoothstep(3.0, 0.0, dist);
      if(uInvertLogic) {
        curveFalloff = 1.0 - curveFalloff;
      }
      
      // Add ease-in and ease-out vertically so noise fades at top and bottom rims
      float yFalloff = smoothstep(0.0, 0.05, normY) * (1.0 - smoothstep(0.95, 1.0, normY));
      float falloff = curveFalloff * yFalloff;
      
      float currentScale = mix(uTextureScaleFarthest, uTextureScaleClosest, falloff);
      float noiseVal = getNoise(profilePos, uNoiseType, currentScale);
      
      // Crisp Mountain Ridge Sharpening
      float sharpened = noiseVal;
      if (uTextureSharpening > 0.0) {
          float ridged = noiseVal;
          // For simplex and perlin, they are mostly [-1, 1], so we map to [0, 1] ridges
          if (uNoiseType == 0 || uNoiseType == 1) {
             ridged = 1.0 - abs(noiseVal);
          }
          // Increase exponent to sharpen peaks
          float sharp = pow(ridged, 1.0 + uTextureSharpening * 4.0);
          sharpened = mix(noiseVal, sharp, smoothstep(0.0, 1.0, uTextureSharpening));
      }
      
      vec2 dir = normalize(profilePos.xz);
      float d = sharpened * uDisplacement * falloff;
      
      profilePos.x += dir.x * d;
      profilePos.z += dir.y * d;
      
      transformed = profilePos;
      vDisplacement = d;
      vUv = uv;
      `
    );

    shader.fragmentShader = `
      varying float vDisplacement;
      uniform float uDisplacement;
      uniform vec3 uColorValley;
      uniform vec3 uColorPeak;
      varying vec2 vUv;
    ` + shader.fragmentShader;

    shader.fragmentShader = shader.fragmentShader.replace(
      `#include <color_fragment>`,
      `
      #include <color_fragment>
      
      float t = (vDisplacement + uDisplacement*0.5) / (uDisplacement + 0.001); 
      t = clamp(t, 0.0, 1.0);
      
      diffuseColor.rgb = mix(uColorValley, uColorPeak, t);
      `
    );

    // Compute normals via screen space derivatives for accurate lighting
    shader.fragmentShader = shader.fragmentShader.replace(
      `#include <normal_fragment_begin>`,
      `
      #include <normal_fragment_begin>
      // Only do this if extensions are supported, standard material usually has them
      vec3 fdx = vec3( dFdx( vViewPosition.x ), dFdx( vViewPosition.y ), dFdx( vViewPosition.z ) );
      vec3 fdy = vec3( dFdy( vViewPosition.x ), dFdy( vViewPosition.y ), dFdy( vViewPosition.z ) );
      normal = normalize( cross( fdx, fdy ) );
      `
    );

    material.userData.shader = shader;
  };
};
