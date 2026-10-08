import * as THREE from 'three'
import './style.css'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import gsap from 'gsap'
import vertexShader from './shaders/vertex.glsl?raw'
import fragmentShader from './shaders/fragment.glsl?raw'

// Create a scene
const scene = new THREE.Scene()

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

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

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
})

// Animation loop
const clock = new THREE.Clock()

const loop = () => {
  material.uniforms.uTime.value = clock.getElapsedTime()
  controls.update()
  renderer.render(scene, camera)
  window.requestAnimationFrame(loop)
}
loop()

// Intro timeline
const tl = gsap.timeline({ defaults: { duration: 1 } })
tl.fromTo(mesh.scale, { z: 0, x: 0, y: 0 }, { z: 1, x: 1, y: 1 })
tl.fromTo('nav', { y: '-100%' }, { y: '0%' })
tl.fromTo('.title', { opacity: 0 }, { opacity: 1 })

// Mouse animation color and strength
let mouseDown = false
let rgb = []
window.addEventListener('mousedown', () => (mouseDown = true))
window.addEventListener('mouseup', () => (mouseDown = false))

window.addEventListener('mousemove', (e) => {
  // Bump the displacement, then ease back to rest
  gsap.to(material.uniforms.uStrength, { value: baseStrength + strengthBoost, duration: 0.3, overwrite: true })
  gsap.to(material.uniforms.uStrength, { value: baseStrength, duration: 1.5, delay: 0.3 })

  if (mouseDown) {
    rgb = [
      Math.round((e.pageX / sizes.width) * 255),
      Math.round((e.pageY / sizes.height) * 255),
      150,
    ]
    gsap.to(material.uniforms.uColor.value, { r: rgb[0] / 255, g: rgb[1] / 255, b: rgb[2] / 255 })
  }
})
