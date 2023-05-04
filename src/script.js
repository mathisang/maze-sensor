import './style.css'
import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {GUI} from 'dat.gui'

class DataPoint {
    constructor() {
        this.arr = []
    }

    setFilter(n) {
        this.sum = 0;

        if(this.arr.length >= n) {
            for(this.i = 0; this.i < n; this.i++) {
                this.sum += this.arr[this.arr.length - (this.i+1)]
            }
        }

        return this.sum / n;
    }

    push(data) {
        this.arr.push(data)
    }

    getDataFilter() {
        return this.setFilter(3)
    }
}

let moveX = new DataPoint();
let moveY = new DataPoint();

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Moouse & Mobile orientation
if (window.DeviceOrientationEvent) {
    window.addEventListener(
        "deviceorientation",
        (event) => {
            moveX.push(event.gamma)
            moveY.push(event.beta)
        },
        true
    );
}
else if (window.matchMedia('(hover: hover)').matches) {
    window.addEventListener('mousemove', (event) => {
        moveX.push((event.clientX / sizes.width) * 60 - 30);
        moveY.push((event.clientY / sizes.height) * 60 - 30);
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
const loader = new GLTFLoader();
let maze;
loader.load(
    '/models/scene.gltf',
    (gltf) =>
    {
        maze = gltf.scene
        maze.scale.set(0.035, 0.035, 0.035)
        maze.rotation.x = Math.PI / 2
        scene.add(maze)
    }
)

// console.log(gltf)

// Cube
// const cube = new THREE.Mesh(
//     new THREE.BoxGeometry(1.5, 2, .4),
//     new THREE.MeshStandardMaterial({
//         color: '#ffffff'
//     })
// )
// cube.castShadow = true
// cube.receiveShadow = true
// scene.add(cube)

// Ambient Light
const light = new THREE.AmbientLight("#aadebf");
light.intensity = .43;
scene.add(light);

// Directional Light
const directionalLight = new THREE.DirectionalLight('#ffffff', .87)
directionalLight.position.x = 1
directionalLight.position.y = 2
directionalLight.position.z = 5.5
scene.add(directionalLight)

// GUI
// const gui = new GUI()
// const lightFolder = gui.addFolder('Lights')
// lightFolder.add(directionalLight.position, 'x').min(-20).max(20).step(.5)
// lightFolder.add(directionalLight.position, 'y').min(-20).max(20).step(.5)
// lightFolder.add(directionalLight.position, 'z').min(-20).max(20).step(.5)
// lightFolder.add(directionalLight, 'intensity').min(0).max(2).step(.01)
// lightFolder.add(light, 'intensity').min(0).max(2).step(.01)
// lightFolder.open()

// Animate
const clock = new THREE.Clock()
let lastElapsedTime = 0

const tick = () => {
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - lastElapsedTime
    lastElapsedTime = elapsedTime

    // Update controls
    // controls.update()

    // cube.rotation.x = moveY.getDataFilter() / 100
    // cube.rotation.y = moveX.getDataFilter() / 100
    if(maze) {
        maze.rotation.x = (Math.PI / 2) + (moveY.getDataFilter() / 100)
        maze.rotation.z = -(moveX.getDataFilter() / 100)
    }

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()