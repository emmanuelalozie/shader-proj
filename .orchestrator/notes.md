# shader-proj notes

## Purpose
Three.js and shader practice experiments ("THREE.js and shaders practice"). Each experiment is a standalone Vite project in its own folder. `README.md` has an "Experiments" list (sphere-1, sphere-2) and run steps. Add new experiments to that list.

## Stack
- Plain JavaScript (ES modules, no TypeScript), Vite and npm. There is no linter and no test framework.
- Pinned versions, copied exactly in every experiment:
  - `package.json` ranges: three `^0.181.2`, gsap `^3.13.0`, vite `^7.2.4`
  - `package-lock.json` exact versions: three 0.181.2, gsap 3.13.0, vite 7.2.4
- Scripts: `dev`, `build`, `preview`.

## Commands
- Run these in each experiment folder: `npm ci` (or `npm install`), then `npm run build` or `npm run dev`.
- `npm ls` checks the installed versions.
- Shaders can be checked with `glslangValidator`. This environment can't run WebGL, so rendering has to be checked by eye in a browser.

## Structure
- **`sphere-1/`**
  - `index.html` has the canvas `.webgl`, a `<nav>` with three `<a>` links, and `h1.title`.
  - Nav links: Sphere goes to `#sphere`, About goes to `#about`, and Github Page goes to `https://github.com/emmanuelalozie/shader-proj` in a new tab.
  - Loads the Poppins 400/700 font.
  - `src/main.js` uses `MeshStandardMaterial` and a `PointLight`. `src/style.css` holds the styles.
  - `public/vite.svg` is the favicon, so keep it.
- **`sphere-2/`** (noise-displacement sphere)
  - Same page layout as sphere-1, with the `h1` "Noise Sphere".
  - `src/shaders/vertex.glsl` and `fragment.glsl` are imported with `?raw`. There's no plugin and no `vite.config`.
  - Vertex shader: Ashima/stegu 3D simplex noise moves each vertex along its normal, and normals are recalculated.
  - Fragment shader: blends from `uBaseColor` to `uColor` by displacement, plus a fresnel rim glow.
  - Uniforms: `uTime`, `uStrength` (0.4, rising to 0.65 on mouse move), `uFrequency` (0.8), `uColor`, `uBaseColor`.
  - Varyings: `vDisplacement`, `vNormal`, `vViewDir`.
  - Mesh: `IcosahedronGeometry(3, 64)` with a `ShaderMaterial` and no lights.

## Conventions (main.js)
- Code style: no semicolons, single quotes, 2-space indent, short `// Section` comments. `style.css` uses a 4-space indent.
- `sizes` object; `PerspectiveCamera(45, …, 0.1, 100)` at z=20.
- `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))`, called both at setup and on resize.
- OrbitControls: damping on, pan and zoom off, auto-rotate with `autoRotateSpeed = 5`.
- GSAP intro timeline (`duration: 1`): mesh scale, then nav slides in from -100%, then the title fades in.
- Click-drag colour: pageX/pageY map to r/g, b is fixed at 150, values are divided by 255 and tweened with `gsap.to`.
- Uniform and varying names must match between `main.js` and the shaders.

## Current state and known issues
- The sphere-1 fixes and sphere-2 are uncommitted. sphere-2 hasn't been checked visually in a browser yet.
- `tester-checks.cjs` (49 checks, all passing; run with `node tester-checks.cjs`) and `tester-tmp/` are test leftovers in the repo root. Delete them before committing unless the user wants to keep them.
- `npm ci` reports 6 high-severity vulnerabilities from the pinned versions. Don't run `npm audit fix`, because it moves the projects off the pinned versions.
- Expected warnings that are safe to ignore:
  - npm warns that esbuild's install script isn't approved.
  - Vite warns that the bundle is over 500 kB (about 583 kB) because it includes all of Three.js.
