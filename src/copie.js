import './style.css'
import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {GUI} from 'dat.gui'
import * as CANNON from 'cannon-es'
import CannonDebugger from 'cannon-es-debugger'

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

// Mouse & Mobile orientation
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

let world = new CANNON.World();
world.gravity.set(0, -9.82, 0); // m/s²

const concreteMaterial = new CANNON.Material('concrete')
const plasticMaterial = new CANNON.Material('plastic')

const sphereShape = new CANNON.Sphere(0.5)
const sphereBody = new CANNON.Body({
    mass: 10,
    position: new CANNON.Vec3(0, 0.5, 0),
    shape: sphereShape,
    material: plasticMaterial
})
world.addBody(sphereBody);

const concretePlasticContactMaterial = new CANNON.ContactMaterial(
    concreteMaterial,
    plasticMaterial,
    {
        friction: 0.1,
        restitution: 0.7
    }
)
world.addContactMaterial(concretePlasticContactMaterial)

const floorShape = new CANNON.Plane()
const floorBody = new CANNON.Body()
floorBody.mass = 0
floorBody.addShape(floorShape)
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.5)
floorBody.material = concreteMaterial

world.addBody(floorBody)

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

// const floor = new THREE.Mesh(
//     new THREE.PlaneGeometry(10, 10),
//     new THREE.MeshStandardMaterial({
//         color: '#ffffff',
//         metalness: 0.3,
//         roughness: 0.4
//     })
// )
// floor.rotation.x = -Math.PI * 0.5
// scene.add(floor)

const cannonDebugger = new CannonDebugger(scene, world)

// Load a resource
const loader = new GLTFLoader();
let maze;
let scaleMaze = .09
loader.load(
    '/models/scene.gltf',
    (gltf) =>
    {
        maze = gltf.scene
        maze.scale.set(scaleMaze, scaleMaze, scaleMaze)
        // maze.rotation.y = Math.PI / 2
        scene.add(maze)
    }
)


// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000)
camera.position.x = 0
camera.position.y = 10
camera.position.z = 0
camera.lookAt(0, 0, 0)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)


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

// let cannonDebugRenderer = new THREE.CannonDebugRenderer( scene, world );

// Ambient Light
const light = new THREE.AmbientLight("#aadebf");
light.intensity = .43;
scene.add(light);

// Directional Light
const directionalLight = new THREE.DirectionalLight('#ffffff', .87)
directionalLight.position.x = 1
directionalLight.position.y = 5.5
directionalLight.position.z = 2
scene.add(directionalLight)

// Ball
const ball = new THREE.Mesh(
    new THREE.SphereGeometry(.5, 20, 20),
    new THREE.MeshStandardMaterial({
        color: '#1d6899'
    })
)
ball.position.x = 0
ball.position.y = 0.1
ball.position.z = 0
scene.add(ball)

// GUI
const gui = new GUI()
const lightFolder = gui.addFolder('Lights')
lightFolder.add(directionalLight.position, 'x').min(-20).max(20).step(.5)
lightFolder.add(directionalLight.position, 'y').min(-20).max(20).step(.5)
lightFolder.add(directionalLight.position, 'z').min(-20).max(20).step(.5)
lightFolder.add(directionalLight, 'intensity').min(0).max(2).step(.01)
lightFolder.add(light, 'intensity').min(0).max(2).step(.01)
lightFolder.open()

// Animate
const clock = new THREE.Clock()
let lastElapsedTime = 0

const tick = () => {
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - lastElapsedTime
    lastElapsedTime = elapsedTime

    // Update controls
    // controls.update()

    // floorBody.quaternion.x = -(Math.PI / 2) + (moveY.getDataFilter() / 100)
    // floorBody.quaternion.y = moveX.getDataFilter() / 100
    // if(maze) {
    //     maze.rotation.x = (Math.PI / 2) + (moveY.getDataFilter() / 100)
    //     maze.rotation.z = -(moveX.getDataFilter() / 100)
    // }
    // cannonDebugRenderer.update();
    cannonDebugger.update()

    world.step(1 / 60, deltaTime, 3)

    let quaternionX = new CANNON.Quaternion();
    let quaternionXMaze = new CANNON.Quaternion();
    let quaternionY = new CANNON.Quaternion();
    quaternionX.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -(Math.PI / 2) + (moveY.getDataFilter() / 100));
    quaternionXMaze.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), moveY.getDataFilter() / 100);
    quaternionY.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), -moveX.getDataFilter() / 100);
    let quaternion = quaternionY.mult(quaternionX);
    let quaternionMaze = quaternionY.mult(quaternionXMaze);
    quaternion.normalize();
    quaternionMaze.normalize();

    floorBody.quaternion.copy(quaternion);

    if (maze) {
        maze.quaternion.copy(
            new THREE.Quaternion(
                quaternionMaze.x,
                quaternionMaze.y,
                quaternionMaze.z,
                quaternionMaze.w
            )
        );
    }

    ball.position.copy(sphereBody.position);
    ball.quaternion.copy(sphereBody.quaternion);

    // if (maze) {
    //     maze.quaternion.copy(floorBody.quaternion);
    // }
    // floor.position.copy(floorBody.position);

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()