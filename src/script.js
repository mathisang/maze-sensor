import './style.css'
import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

// Canvas
const canvas = document.querySelector('canvas.webgl')

// const gx = document.querySelector('.gx');
// const gy = document.querySelector('.gy');
// const gz = document.querySelector('.gz');

if (window.DeviceOrientationEvent) {
    window.addEventListener(
        "deviceorientation",
        (event) => {
            console.log('x : '+event.alpha);
            console.log('y : '+event.gamma);
            console.log('z : '+event.beta);
        },
        true
    );
}

// Scene
const scene = new THREE.Scene()

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000)
camera.position.x = 1
camera.position.y = 1
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)

// Load a resource
// const loader = new OBJLoader();
// loader.load(
//     // resource URL
//     '3dmodels/maze.gltf',
//     // called when resource is loaded
//     function ( object ) {
//         scene.add( object );
//     },
//     function (xhr) {
//         console.log((xhr.loaded / xhr.total * 100) + '% loaded');
//     },
//     function (error) {
//         console.log('An error happened');
//     }
// );

// Cube with shadow
const cube = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshStandardMaterial({
        color: '#ffffff'
    })
)
cube.castShadow = true
cube.receiveShadow = true
scene.add(cube)

// Ambient Light
// const light = new THREE.AmbientLight("#ffffff");
// light.intensity = 3;
// scene.add(light);

// Directional Light
const directionalLight = new THREE.DirectionalLight('#ffffff', .9)
directionalLight.position.x = -10
directionalLight.position.y = 2
directionalLight.position.z = 15
scene.add(directionalLight)

// Animate
const clock = new THREE.Clock()
let lastElapsedTime = 0

const tick = () => {
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - lastElapsedTime
    lastElapsedTime = elapsedTime

    // Update controls
    // controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()