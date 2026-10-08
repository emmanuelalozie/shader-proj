import * as THREE from 'three'
import './style.css'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import gsap from 'gsap'
import vertexShader from './shaders/vertex.glsl?raw'
import fragmentShader from './shaders/fragment.glsl?raw'
import particlesVertexShader from './shaders/particles/vertex.glsl?raw'
import particlesFragmentShader from './shaders/particles/fragment.glsl?raw'

// Create a scene
const scene = new THREE.Scene()

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

// Create a noise sphere
const baseStrength = 0.4
const strengthBoost = 0.25

const geometry = new THREE.IcosahedronGeometry(3, 64)
const material = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms: {
    uTime: { value: 0 },
    uStrength: { value: baseStrength },
    uFrequency: { value: 0.8 },
    uColor: { value: new THREE.Color(0.6, 0.3, 0.9) },
    uBaseColor: { value: new THREE.Color(0.05, 0.05, 0.15) },
  },
})
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

// Create a particle halo around the sphere
const particlesCount = 4000
const positions = new Float32Array(particlesCount * 3)
const scales = new Float32Array(particlesCount)
const randoms = new Float32Array(particlesCount)
const point = new THREE.Vector3()

for (let i = 0; i < particlesCount; i++) {
  // Uniform direction on the sphere, radius between 3.8 and 7
  const radius = 3.8 + Math.random() * 3.2
  const phi = Math.acos(2 * Math.random() - 1)
  const theta = Math.random() * Math.PI * 2
  point.setFromSphericalCoords(radius, phi, theta)
  point.toArray(positions, i * 3)

  scales[i] = 0.4 + Math.random()
  randoms[i] = Math.random()
}

const particlesGeometry = new THREE.BufferGeometry()
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
particlesGeometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1))
particlesGeometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1))

const particlesMaterial = new THREE.ShaderMaterial({
  vertexShader: particlesVertexShader,
  fragmentShader: particlesFragmentShader,
  uniforms: {
    uTime: { value: 0 },
    uSize: { value: 0.2 },
    uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
    uScale: { value: sizes.height * 0.5 },
    uAgitation: { value: 0 },
    uOpacity: { value: 0 },
    // Share the sphere's colour so both follow the drag tween
    uColor: { value: material.uniforms.uColor.value },
  },
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
})
const particles = new THREE.Points(particlesGeometry, particlesMaterial)
scene.add(particles)

// Camera setup
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 20
scene.add(camera)

// Renderer setup
const canvas = document.querySelector('.webgl')
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.render(scene, camera)

// Controls setup
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.enablePan = false
controls.enableZoom = false
controls.autoRotate = true
controls.autoRotateSpeed = 5

// Resize handler
window.addEventListener('resize', () => {
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  particlesMaterial.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2)
  particlesMaterial.uniforms.uScale.value = sizes.height * 0.5
})

// Animation loop
const clock = new THREE.Clock()

const loop = () => {
  const elapsedTime = clock.getElapsedTime()
  material.uniforms.uTime.value = elapsedTime
  particlesMaterial.uniforms.uTime.value = elapsedTime
  controls.update()
  renderer.render(scene, camera)
  window.requestAnimationFrame(loop)
}
loop()

// Intro timeline
const tl = gsap.timeline({ defaults: { duration: 1 } })
tl.fromTo(mesh.scale, { z: 0, x: 0, y: 0 }, { z: 1, x: 1, y: 1 })
tl.fromTo(particlesMaterial.uniforms.uOpacity, { value: 0 }, { value: 1 })
tl.fromTo(particles.scale, { z: 0.5, x: 0.5, y: 0.5 }, { z: 1, x: 1, y: 1 }, '<')
tl.fromTo('nav', { y: '-100%' }, { y: '0%' })
tl.fromTo('.title', { opacity: 0 }, { opacity: 1 })

// Mouse animation color, strength and particle agitation
let mouseDown = false
let rgb = []
window.addEventListener('mousedown', () => (mouseDown = true))
window.addEventListener('mouseup', () => (mouseDown = false))

window.addEventListener('mousemove', (e) => {
  // Bump the displacement, then ease back to rest
  gsap.to(material.uniforms.uStrength, { value: baseStrength + strengthBoost, duration: 0.3, overwrite: true })
  gsap.to(material.uniforms.uStrength, { value: baseStrength, duration: 1.5, delay: 0.3 })

  // Stir up the particles, then let them settle
  gsap.to(particlesMaterial.uniforms.uAgitation, { value: 1, duration: 0.3, overwrite: true })
  gsap.to(particlesMaterial.uniforms.uAgitation, { value: 0, duration: 1.5, delay: 0.3 })

  if (mouseDown) {
    rgb = [
      Math.round((e.pageX / sizes.width) * 255),
      Math.round((e.pageY / sizes.height) * 255),
      150,
    ]
    gsap.to(material.uniforms.uColor.value, { r: rgb[0] / 255, g: rgb[1] / 255, b: rgb[2] / 255 })
  }
})
