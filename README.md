# 260416_Texture Vase

[![Live Demo](https://img.shields.io/badge/Demo-Live_Preview-blue)](https://prakashgsm-nouz.github.io/260416_Texture-Vase/)

A browser-based, interactive 3D vase generator build with React Three Fiber. Users can control the vase's geometric profile and apply procedural vertex displacement textures such as Simplex, Perlin, Worley, and simulated Differential Growth. The texture noise is driven by an editable 3D Attractor Curve positioned around the vase.

## Features
- Parametric Base, Mid, and Top radius controls.
- Realtime Vertex Displacement Options: Simplex, Perlin, Worley, and Alligator noise.
- **New:** "Crisp Mountain Ridges" texture sharpening modifier targeting high peaks.
- **New:** Dynamic GPU Subdivision parameter forcing scaling polygon resolutions logically without custom web compute constraints.
- **New:** Smooth ease-in / ease-out fading applying textures correctly within the Y-axis perimeter limits.
- **New:** Segment-calculated Grasshopper-style 3D Attractor curve matching explicitly projected line continuity accurately over distance scaling arrays!
- Editable XYZ Rotations driving structural torsions from Pitch, Yaw, and Roll configurations safely within `-45` and `45` bounds.
- Displacement-mapped Normal recalculating for accurate lighting.
- **New:** Iteration Stack UI securely locking and reloading unique profile configuration templates live.
- **New:** Dedicated internal CPU Math-Deformer explicitly mapping shader properties directly into `.obj` exports with exact scale and vertex coloring!
- **New:** Toggle tools supporting isolated visual Wireframe Previews and invisible splines dynamically.
- Gradient colouring mapping peak/valleys values, now with customizable Leva color swatches!

## Getting Started
1. `npm install`
2. `npm run dev`
3. Open `http://localhost:5173` in your browser.

## Controls
- Use **Leva UI** overlay on the top-right to adjust profile dimensions and texture noise properties.
- **Drag the Red Control Spheres** in the 3D viewport to manipulate the Attractor Curve focus area.
- Use **Left/Right click and drag** to pan, rotate, and zoom the camera via OrbitControls.
- Utilize the floating UI stack on the bottom-left to Export configurations flawlessly!

## Deployment (GitHub Pages)

This project avoids static root routing bugs securely by rebuilding local path maps actively.
To compile your application dynamically before publishing:

```bash
npx vite build --base=./
```

To automatically stage and deploy the compiled folder internally across the GitHub Pages branch mathematically without deleting your local root files securely execute:

```bash
npx gh-pages -d dist
```
