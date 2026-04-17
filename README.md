# 260416_Texture Vase

A browser-based, interactive 3D vase generator build with React Three Fiber. Users can control the vase's geometric profile and apply procedural vertex displacement textures such as Simplex, Perlin, Worley, and simulated Differential Growth. The texture noise is driven by an editable 3D Attractor Curve positioned around the vase.

## Features
- Parametric Base, Mid, and Top radius controls.
- Realtime Vertex Displacement (Simplex, Perlin, Worley, Differential FBM).
- 3D Interactive Attractor Curve using Catmull-Rom spline and TransformControls.
- Displacement-mapped Normal recalculating for accurate lighting.
- Gradient colouring mapping peak/valleys values.

## Getting Started
1. `npm install`
2. `npm run dev`
3. Open `http://localhost:5173` in your browser.

## Controls
- Use **Leva UI** overlay on the top-right to adjust profile dimensions and texture noise properties.
- **Drag the Red Control Spheres** in the 3D viewport to manipulate the Attractor Curve focus area.
- Use **Left/Right click and drag** to pan, rotate, and zoom the camera via OrbitControls.
