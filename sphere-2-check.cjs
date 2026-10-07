// Check the sphere-2 build: shader source is bundled and package ranges match sphere-1
const fs = require('fs')
const path = require('path')

const root = __dirname
let failed = false
const check = (ok, msg) => {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${msg}`)
  if (!ok) failed = true
}

// Bundle contents
const assets = path.join(root, 'sphere-2', 'dist', 'assets')
const js = fs.readdirSync(assets).filter((f) => f.endsWith('.js'))
const bundle = js.map((f) => fs.readFileSync(path.join(assets, f), 'utf8')).join('\n')
for (const needle of ['snoise', 'taylorInvSqrt', 'uStrength', 'uFrequency', 'uBaseColor', 'vDisplacement', 'gl_FragColor']) {
  check(bundle.includes(needle), `bundle contains "${needle}"`)
}
check(!bundle.includes('.glsl?raw'), 'no unresolved ?raw import left in bundle')

// Package ranges
const p1 = JSON.parse(fs.readFileSync(path.join(root, 'sphere-1', 'package.json'), 'utf8'))
const p2 = JSON.parse(fs.readFileSync(path.join(root, 'sphere-2', 'package.json'), 'utf8'))
check(JSON.stringify(p1.dependencies) === JSON.stringify(p2.dependencies), 'dependencies match sphere-1')
check(JSON.stringify(p1.devDependencies) === JSON.stringify(p2.devDependencies), 'devDependencies match sphere-1')
check(JSON.stringify(p1.scripts) === JSON.stringify(p2.scripts), 'scripts match sphere-1')
check(p2.type === p1.type && p2.private === true && p2.name === 'sphere-2', 'name/private/type')

// Copied assets are byte-identical
for (const file of ['public/vite.svg', '.gitignore']) {
  const a = fs.readFileSync(path.join(root, 'sphere-1', file))
  const b = fs.readFileSync(path.join(root, 'sphere-2', file))
  check(a.equals(b), `${file} identical to sphere-1`)
}

// Lockfile kept, dist/node_modules ignored
check(fs.existsSync(path.join(root, 'sphere-2', 'package-lock.json')), 'package-lock.json exists')
const ignore = fs.readFileSync(path.join(root, 'sphere-2', '.gitignore'), 'utf8').split(/\r?\n/)
check(ignore.includes('node_modules') && ignore.includes('dist'), '.gitignore covers node_modules and dist')

// No semicolons at line ends in main.js
const main = fs.readFileSync(path.join(root, 'sphere-2', 'src', 'main.js'), 'utf8')
check(!/;\s*$/m.test(main), 'main.js has no trailing semicolons')

process.exit(failed ? 1 : 0)
