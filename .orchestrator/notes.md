# shader-proj notes

## Purpose
Three.js and shader practice experiments. Each experiment is a standalone Vite project in its own folder. Root `README.md` has an "Experiments" list (sphere-1, sphere-2, sphere-3) and run steps. Add new experiments to that list.

## Stack
- Plain JS (ES modules), Vite, npm. No linter, no test framework, no `vite.config`.
- Pinned versions, copied exactly in every experiment: `package.json` three `^0.181.2`, gsap `^3.13.0`, vite `^7.2.4`. The lock has the exact 0.181.2 / 3.13.0 / 7.2.4.
- For a new experiment, copy the previous lock and change only the `"name"` fields.
- Scripts: `dev`, `build`, `preview`.

## Commands
- In each experiment folder: `npm ci`, then `npm run build` or `npm run dev`. Use `npm ls` to check versions.
- `node tester-checks.cjs` (repo root, 99 checks, all passing):
  - Needs every sphere built, because it checks each `dist/index.html`.
  - Needs glslangValidator: `npm install --prefix tester-tmp --no-save --no-package-lock glslang-validator-prebuilt-predownloaded`
- WebGL can't run here, so check rendering by eye in a browser.

## Structure
- **sphere-1/**
  - `index.html`: `canvas.webgl`, a nav (`#sphere`, `#about`, Github link in a new tab), `h1.title`, Poppins 400/700.
  - `main.js`: `MeshStandardMaterial` and a `PointLight`.
  - `public/vite.svg` is the favicon (keep it).
- **sphere-2/**: noise sphere, `h1` "Noise Sphere".
  - Shaders in `src/shaders/*.glsl`, imported with `?raw`.
  - Vertex: simplex noise displaces along the normal, and normals are recomputed.
  - Fragment: `uBaseColor`→`uColor` blend plus a fresnel rim.
  - Uniforms: `uTime`, `uStrength` (0.4, rising to 0.65 on mousemove), `uFrequency` (0.8), `uColor`, `uBaseColor`.
  - Varyings: `vDisplacement`, `vNormal`, `vViewDir`.
  - `IcosahedronGeometry(3, 64)`, no lights.
- **sphere-3/**: sphere-2's sphere inside a particle halo, `h1` "Particle Sphere". `body, html` have a black background.
  - Sphere shaders are copied unchanged.
  - `src/shaders/particles/{vertex,fragment}.glsl` have their own copy of the noise, because `?raw` can't include files.
  - Particles: 4000 `THREE.Points` at radius 3.8–7, with additive blending, `transparent`, `depthWrite: false`.
    - Attributes: `aScale` (0.4–1.4), `aRandom`.
    - Uniforms: `uTime`, `uSize` (0.2), `uPixelRatio`, `uScale` (`sizes.height*0.5`), `uAgitation`, `uOpacity`, `uColor`. Varying `vAlpha`.
  - Motion is all in the shader: y-orbit, noise drift, pulsing size and alpha. Mousemove agitation changes amplitude, not speed, to avoid jumps.
  - Both materials share one `THREE.Color`, so one tween recolours both.
  - Intro: sphere scales up, particles fade in and grow, nav slides in, title fades in.
  - Resize also updates `uPixelRatio` and `uScale`.

## Conventions (main.js)
- No semicolons, single quotes, 2-space indent, short `// Section` comments. CSS uses 4 spaces. GLSL files have `// Uniforms` and `// Varyings` headers.
- Shared setup:
  - `sizes` object and `PerspectiveCamera(45, …, 0.1, 100)` at z=20.
  - Pixel ratio `Math.min(devicePixelRatio, 2)`, set at setup and on resize.
  - OrbitControls: damping on, no pan or zoom, `autoRotateSpeed = 5`.
  - GSAP timeline steps are 1 s.
- Click-drag colour: pageX/pageY map to r/g, b=150, values divided by 255, tweened with `gsap.to`.
- Uniform and varying names must match between `main.js` and the shaders.

## Current state and known issues
- sphere-3, its README line and the tester-checks additions are uncommitted.
- `tester-checks.cjs` and `tester-tmp/` are committed in the repo.
  - The script writes scratch files to `tester-tmp/sphere3*`.
  - Git shows some `tester-tmp` files as modified, but only their line endings.
- Not yet checked in a browser:
  - sphere-2 and sphere-3.
  - For sphere-3: dots have no square edges, are hidden behind the sphere, puff outward on mousemove, keep a similar size after resize, and aren't oversized on Retina.
- `npm ci` reports 6 high-severity vulnerabilities. Don't run `npm audit fix`, because it breaks the pinned versions.
- Expected warnings that are safe to ignore: esbuild's install script isn't approved, and the bundle is over 500 kB (about 583–592 kB).
