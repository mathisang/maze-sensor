// Import
import './style.css'
import {DataPoint} from './DataPoint.js'

import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';

import * as CANNON from 'cannon-es'
import CannonDebugger from 'cannon-es-debugger'

// Global variables
let scene, renderer, canvas, sizes, moveX, moveY, maze, ball, floorBody, sphereBody, world, controls, camera,
    cannonDebugger, clock = new THREE.Clock(), lastElapsedTime = 0, ballSize = .2, mazeBis, shakeEvent = false

// Init functions
initThree()
initCannon()
initMovement()
// initDebugger()

// Change maze
function changeMaze() {
    if(shakeEvent === false) {
        shakeEvent = true
        maze.visible = !maze.visible
        mazeBis.visible = !mazeBis.visible

        setTimeout(function () {
            shakeEvent = false
        }, 3000);
    }
}

// Mouse & Mobile orientation
function initMovement() {
    moveX = new DataPoint();
    moveY = new DataPoint();

    // Manual shake detection
    document.getElementById('shake').addEventListener('click', () => {
        changeMaze()
    })
    // Orientation detection
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
    // Mouse detection
    else if (window.matchMedia('(hover: hover)').matches) {
        window.addEventListener('mousemove', (event) => {
            moveX.push((event.clientX / sizes.width) * 60 - 30);
            moveY.push((event.clientY / sizes.height) * 60 - 30);
        });
    }
}

function initThree() {
    canvas = document.querySelector('canvas.webgl')
    scene = new THREE.Scene()

    // Canvas size
    sizes = {
        width: window.innerWidth,
        height: window.innerHeight
    }

    // Resize window
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
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
    })
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    // Camera
    camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000)
    camera.position.x = 0
    camera.position.y = 10
    camera.position.z = 0
    camera.lookAt(0, 0, 0)
    scene.add(camera)

    // Controls
    controls = new OrbitControls(camera, canvas)

    // Ambient Light
    const light = new THREE.AmbientLight("#aadebf");
    // light.intensity = .43;
    light.intensity = 1;
    scene.add(light);

    // Directional Light
    const directionalLight = new THREE.DirectionalLight('#ffffff', .87)
    directionalLight.position.x = 1
    directionalLight.position.y = 5.5
    directionalLight.position.z = 2
    scene.add(directionalLight)

    // Load Maze
    const loader = new GLTFLoader();
    let scaleMaze = .09
    loader.load(
        '/models/scene.gltf',
        (gltf) =>
        {
            maze = gltf.scene
            maze.scale.set(scaleMaze, scaleMaze, scaleMaze)
            maze.position.y = .45
            scene.add(maze)
        }
    )

    // Load Maze Bis
    let scaleMazeBis = .09
    loader.load(
        '/models/ballmazefirst.gltf',
        (gltf) =>
        {
            mazeBis = gltf.scene
            mazeBis.scale.set(scaleMazeBis, scaleMazeBis, scaleMazeBis)
            // mazeBis.position.y = 0
            mazeBis.visible = false
            mazeBis.rotation.x = -(Math.PI / 2)
            scene.add(mazeBis)
        }
    )

    // Ball
    ball = new THREE.Mesh(
        new THREE.SphereGeometry(ballSize, 20, 20),
        new THREE.MeshStandardMaterial({
            color: '#1d6899'
        })
    )
    ball.position.x = 0
    ball.position.y = 0.1
    ball.position.z = 0
    scene.add(ball)
}

function initCannon() {
    // World
    world = new CANNON.World();
    world.gravity.set(0, -9.82, 0); // m/s²

    // Materials
    const concreteMaterial = new CANNON.Material('concrete')
    const plasticMaterial = new CANNON.Material('plastic')

    // Ball physics
    const sphereShape = new CANNON.Sphere(ballSize)
    sphereBody = new CANNON.Body({
        mass: 2,
        position: new CANNON.Vec3(0, .5, 0),
        shape: sphereShape,
        material: plasticMaterial
    })
    sphereBody.linearDamping = .6
    world.addBody(sphereBody);

    // Floor physics
    const floorShape = new CANNON.Box(new CANNON.Vec3(5, 5, 0.1))
    floorBody = new CANNON.Body()
    floorBody.mass = 0
    floorBody.addShape(floorShape)
    floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.5)
    floorBody.material = concreteMaterial
    world.addBody(floorBody)

    // Contact materials
    const concretePlasticContactMaterial = new CANNON.ContactMaterial(
        concreteMaterial,
        plasticMaterial,
        {
            friction: 0.1,
            restitution: 0.7
        }
    )
    world.addContactMaterial(concretePlasticContactMaterial)
}

function initDebugger() {
    cannonDebugger = new CannonDebugger(scene, world)
}

const updatePhysics = () => {
    // Timing
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - lastElapsedTime

    // Update physics
    world.step(1 / 60, deltaTime, 3)

    // Debugger cannon
    // cannonDebugger.update()

    // Update floor & maze
    let quaternionFloor = {x: new CANNON.Quaternion(), y: new CANNON.Quaternion()}
    let quaternionMaze = {x: new CANNON.Quaternion()}
    quaternionFloor.x.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -(Math.PI / 2) + (moveY.getDataFilter() / 100));
    quaternionFloor.y.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), -moveX.getDataFilter() / 100);
    quaternionMaze.x.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), moveY.getDataFilter() / 100);

    let quaternionFloorNormalize = quaternionFloor.y.mult(quaternionFloor.x).normalize();
    let quaternionMazeNormalize = quaternionFloor.y.mult(quaternionMaze.x).normalize();

    floorBody.quaternion.copy(quaternionFloorNormalize);

    if (maze) {
        maze.quaternion.copy(
            new THREE.Quaternion(
                quaternionMazeNormalize.x,
                quaternionMazeNormalize.y,
                quaternionMazeNormalize.z,
                quaternionMazeNormalize.w
            )
        );
    }
    if (mazeBis) {
        mazeBis.quaternion.copy(
            new THREE.Quaternion(
                quaternionFloorNormalize.x,
                quaternionFloorNormalize.y,
                quaternionFloorNormalize.z,
                quaternionFloorNormalize.w
            )
        );
    }

    // Update ball
    ball.position.copy(sphereBody.position);
    ball.quaternion.copy(sphereBody.quaternion);

    // Reset ball
    if(sphereBody.position.y < -10) {
        sphereBody.position.y = 1
        sphereBody.position.x = 0
        sphereBody.position.z = 0

        sphereBody.velocity.x = 0
        sphereBody.velocity.y = 0
        sphereBody.velocity.z = 0
        sphereBody.angularVelocity.x = 0
        sphereBody.angularVelocity.y = 0
        sphereBody.angularVelocity.z = 0
    }

    // Shake detection
    if (window.DeviceMotionEvent) {
        window.addEventListener(
            "devicemotion",
            (event) => {
                let ax = event.acceleration.x
                let ay = event.acceleration.y
                let az = event.acceleration.z

                let oldData = 0
                let norm = Math.pow(Math.pow(100 * ax, 2) + Math.pow(100 * ay, 2) + Math.pow(100 * az, 2), 2)
                let derivate = 10.0 * (norm - oldData) / deltaTime;
                oldData = norm

                document.getElementById("test").innerText = derivate / 100000

                // if((ax > 30 || ax < -30) || (ay > 30 || ay < -30) || (az > 30 || az < -30)) {
                //     changeMaze()
                // }
            },
            true
        );
    }

    // Render
    renderer.render(scene, camera)

    // Call updatePhysics again on the next frame
    window.requestAnimationFrame(updatePhysics)
}

updatePhysics()