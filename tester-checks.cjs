// Tester checks for the sphere-1 fixes and the sphere-2 experiment
const fs = require('fs')
const path = require('path')
const { execFileSync } = require('child_process')

const root = __dirname
const read = (...p) => fs.readFileSync(path.join(root, ...p), 'utf8')
const exists = (...p) => fs.existsSync(path.join(root, ...p))

let failed = 0
const check = (ok, msg, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${msg}${!ok && detail ? `\n     -> ${detail}` : ''}`)
  if (!ok) failed++
}

// ---------- Part 1: sphere-1 ----------
const html1 = read('sphere-1', 'index.html')
const css1 = read('sphere-1', 'src', 'style.css')
const main1 = read('sphere-1', 'src', 'main.js')

check(/fonts\.googleapis\.com\/css2\?family=Poppins/.test(html1), 'sphere-1 loads Poppins')
check(!/Lato/.test(html1), 'sphere-1 no longer loads Lato')
check(/Poppins/.test(css1), 'sphere-1 style.css uses Poppins')
check(/<a[^>]*href="#sphere"[^>]*>\s*Sphere\s*<\/a>/.test(html1), 'sphere-1 "Sphere" is an # anchor link')
check(/<a[^>]*href="#about"[^>]*>\s*About\s*<\/a>/.test(html1), 'sphere-1 "About" is an # anchor link')
check(/<a[^>]*href="https:\/\/github\.com\/emmanuelalozie\/shader-proj"[^>]*>\s*Github Page\s*<\/a\s*>/.test(html1), 'sphere-1 "Github Page" links to the repo')
check(!/setPixelRatio\(\s*2\s*\)/.test(main1), 'sphere-1 has no hardcoded setPixelRatio(2)')
const resize1 = main1.slice(main1.indexOf("addEventListener('resize'"))
check((main1.match(/setPixelRatio\(Math\.min\(window\.devicePixelRatio, 2\)\)/g) || []).length === 2, 'sphere-1 sets capped pixel ratio at init and on resize')
check(/setPixelRatio\(Math\.min\(window\.devicePixelRatio, 2\)\)/.test(resize1.slice(0, resize1.indexOf('})'))), 'sphere-1 resize handler sets pixel ratio')
check(!/id="app"/.test(html1), 'sphere-1 <div id="app"> removed')
check(!exists('sphere-1', 'src', 'javascript.svg'), 'sphere-1 src/javascript.svg removed')
check(exists('sphere-1', 'public', 'vite.svg'), 'sphere-1 favicon public/vite.svg still present')

// ---------- Part 2: sphere-2 ----------
const html2 = read('sphere-2', 'index.html')
const main2 = read('sphere-2', 'src', 'main.js')
const vert = read('sphere-2', 'src', 'shaders', 'vertex.glsl')
const frag = read('sphere-2', 'src', 'shaders', 'fragment.glsl')
const p1 = JSON.parse(read('sphere-1', 'package.json'))
const p2 = JSON.parse(read('sphere-2', 'package.json'))
const l1 = JSON.parse(read('sphere-1', 'package-lock.json'))
const l2 = JSON.parse(read('sphere-2', 'package-lock.json'))

for (const dep of ['three', 'gsap', 'vite']) {
  const r1 = (p1.dependencies || {})[dep] || (p1.devDependencies || {})[dep]
  const r2 = (p2.dependencies || {})[dep] || (p2.devDependencies || {})[dep]
  check(r1 === r2, `sphere-2 ${dep} range matches sphere-1 (${r2})`)
  const v1 = l1.packages[`node_modules/${dep}`].version
  const v2 = l2.packages[`node_modules/${dep}`].version
  check(v1 === v2, `sphere-2 lockfile ${dep} version matches sphere-1`, `sphere-1 ${v1}, sphere-2 ${v2}`)
}

check(/<canvas class="webgl">/.test(html2) && /<nav>/.test(html2) && /<h1 class="title">/.test(html2), 'sphere-2 layout has canvas, nav and title')
check(/family=Poppins/.test(html2), 'sphere-2 loads Poppins')
check(/new THREE\.IcosahedronGeometry\(3, 64\)/.test(main2), 'sphere-2 uses IcosahedronGeometry(3, 64)')
check(/new THREE\.ShaderMaterial\(/.test(main2), 'sphere-2 uses ShaderMaterial')
check(/from '\.\/shaders\/vertex\.glsl\?raw'/.test(main2) && /from '\.\/shaders\/fragment\.glsl\?raw'/.test(main2), 'sphere-2 imports shaders with ?raw')
check(!['vite.config.js', 'vite.config.mjs', 'vite.config.ts'].some((f) => exists('sphere-2', f)), 'sphere-2 has no vite config / plugin')
check(!Object.keys({ ...p2.dependencies, ...p2.devDependencies }).some((d) => /glsl/.test(d)), 'sphere-2 has no glsl plugin dependency')
for (const u of ['uTime', 'uStrength', 'uFrequency']) {
  check(new RegExp(`uniform float ${u};`).test(vert), `vertex.glsl declares uniform float ${u}`)
}
check(/snoise\(/.test(vert) && /Ashima Arts/.test(vert), 'vertex.glsl has simplex noise with MIT header')
check(/position \+ normal \* noise \* uStrength/.test(vert), 'vertex displaces along the normal by noise * uStrength')
check(/uTime/.test(vert.slice(vert.indexOf('float getNoise'))), 'noise is animated by uTime')
check(/uniforms\.uTime\.value = clock\.getElapsedTime\(\)/.test(main2), 'uTime updated every frame')
check(/mix\(uBaseColor, uColor/.test(frag) && /vDisplacement/.test(frag), 'fragment blends two colours by displacement')
check(/fresnel/.test(frag) && /pow\(1\.0 - clamp\(dot\(/.test(frag), 'fragment has fresnel rim')
check(/gsap\.to\(material\.uniforms\.uColor\.value/.test(main2) && /if \(mouseDown\)/.test(main2), 'click-drag tweens uColor with GSAP')
check(/gsap\.to\(material\.uniforms\.uStrength/.test(main2), 'mouse movement tweens uStrength')
check(/controls\.autoRotate = true/.test(main2) && /OrbitControls/.test(main2), 'OrbitControls with auto-rotate')
check(/gsap\.timeline\(/.test(main2) && /tl\.fromTo\('nav'/.test(main2) && /tl\.fromTo\('\.title'/.test(main2), 'GSAP intro timeline present')
const resize2 = main2.slice(main2.indexOf("addEventListener('resize'"))
check(/camera\.updateProjectionMatrix\(\)/.test(resize2) && /setPixelRatio\(Math\.min/.test(resize2), 'sphere-2 resize handler updates camera and pixel ratio')
check(/\[`sphere-2`\]\(\.\/sphere-2\)/.test(read('README.md')), 'README lists sphere-2')

// Every uniform the shaders declare is supplied by main.js, and vice versa
const declared = new Set([...(vert + frag).matchAll(/uniform \w+ (\w+);/g)].map((m) => m[1]))
const supplied = new Set([...main2.matchAll(/(\w+): \{ value:/g)].map((m) => m[1]))
check([...declared].every((u) => supplied.has(u)), 'all shader uniforms are supplied by main.js', [...declared].filter((u) => !supplied.has(u)).join(','))
check([...supplied].every((u) => declared.has(u)), 'all main.js uniforms are used by shaders', [...supplied].filter((u) => !declared.has(u)).join(','))

// Varyings match between stages
const vVary = [...vert.matchAll(/varying (\w+) (\w+);/g)].map((m) => `${m[1]} ${m[2]}`).sort().join(',')
const fVary = [...frag.matchAll(/varying (\w+) (\w+);/g)].map((m) => `${m[1]} ${m[2]}`).sort().join(',')
check(vVary === fVary, 'varyings match between vertex and fragment', `${vVary} vs ${fVary}`)

// ---------- Compile shaders the way three r181 WebGLRenderer does ----------
const precision = 'precision highp float;\nprecision highp int;\n#define HIGH_PRECISION\n'
const vertexPrefix = [
  '#version 300 es',
  '#define attribute in',
  '#define varying out',
  '#define texture2D texture',
  precision,
  '#define SHADER_TYPE ShaderMaterial',
  'uniform mat4 modelMatrix;',
  'uniform mat4 modelViewMatrix;',
  'uniform mat4 projectionMatrix;',
  'uniform mat4 viewMatrix;',
  'uniform mat3 normalMatrix;',
  'uniform vec3 cameraPosition;',
  'uniform bool isOrthographic;',
  'attribute vec3 position;',
  'attribute vec3 normal;',
  'attribute vec2 uv;',
  '',
].join('\n')
const fragmentPrefix = [
  '#version 300 es',
  '#define varying in',
  'layout(location = 0) out highp vec4 pc_fragColor;',
  '#define gl_FragColor pc_fragColor',
  '#define texture2D texture',
  precision,
  '#define SHADER_TYPE ShaderMaterial',
  'uniform mat4 viewMatrix;',
  'uniform vec3 cameraPosition;',
  'uniform bool isOrthographic;',
  '',
].join('\n')

const tmp = path.join(root, 'tester-tmp')
const validator = path.join(tmp, 'node_modules', 'glslang-validator-prebuilt-predownloaded', 'bin', 'glslangValidator.exe')
if (!fs.existsSync(validator)) {
  check(false, 'glslangValidator available', validator)
} else {
  const vFile = path.join(tmp, 'sphere2.vert')
  const fFile = path.join(tmp, 'sphere2.frag')
  fs.writeFileSync(vFile, vertexPrefix + vert)
  fs.writeFileSync(fFile, fragmentPrefix + frag)
  const run = (args) => {
    try {
      return { ok: true, out: execFileSync(validator, args, { encoding: 'utf8' }) }
    } catch (e) {
      return { ok: false, out: `${e.stdout || ''}${e.stderr || ''}` }
    }
  }
  const v = run([vFile])
  check(v.ok, 'vertex.glsl compiles as GLSL ES 3.00 with ShaderMaterial prefix', v.out.trim())
  const f = run([fFile])
  check(f.ok, 'fragment.glsl compiles as GLSL ES 3.00 with ShaderMaterial prefix', f.out.trim())
  // Negative control: a broken shader must be rejected
  const badFile = path.join(tmp, 'bad.frag')
  fs.writeFileSync(badFile, fragmentPrefix + 'void main() { gl_FragColor = vec4(undefinedThing, 1.0); }\n')
  check(!run([badFile]).ok, 'validator rejects a broken shader (negative control)')
  const l = run(['-l', vFile, fFile])
  check(l.ok, 'vertex + fragment link together', l.out.trim())
}

// ---------- Built output ----------
for (const proj of ['sphere-1', 'sphere-2']) {
  check(exists(proj, 'dist', 'index.html'), `${proj} build produced dist/index.html`)
}

console.log(failed ? `\n${failed} check(s) failed` : '\nAll checks passed')
process.exit(failed ? 1 : 0)
