import './style.css'
import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

// Canvas
const canvas = document.querySelector('canvas.webgl')

let moveX = 0;
let moveY = 0;
// let moveZ = 0;

// x : rotation
// y : inclinaison gauche droite
// z : inclinaison avant arrière

if (window.DeviceOrientationEvent) {
    window.addEventListener(
        "deviceorientation",
        (event) => {
            moveX = event.gamma;
            moveY = event.beta;
            //moveZ = event.beta;
        },
        true
    );
}
else if (window.matchMedia('(hover: hover)').matches) {
    window.addEventListener('mousemove', (event) => {
        moveX = (event.clientX / sizes.width) * 60 - 30;
        moveY = (event.clientY / sizes.height) * 60 - 30;
    });
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
camera.position.x = 0
camera.position.y = 0
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
const light = new THREE.AmbientLight("#deaaaa");
light.intensity = .3;
scene.add(light);

// Directional Light
const directionalLight = new THREE.DirectionalLight('#ffffff', .7)
directionalLight.position.x = 2
directionalLight.position.y = 5
directionalLight.position.z = 3
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
    // cube.rotation.x = moveY / 100
    // cube.rotation.y = moveZ / 100

    cube.rotation.x = moveY / 100
    cube.rotation.y = moveX / 100

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()