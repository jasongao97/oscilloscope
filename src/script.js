import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";

import { Particle } from "./physics";

/**
 * Base
 */
// Debug
const gui = new dat.GUI();
const debugObject = {
  horizontal: {
    gain: 0.8,
    period: 4,
  },
  vertical: {
    gain: 0.8,
    period: 3,
  },
  clear: () => {
    particlesArray = [];
  },
};
const hFolder = gui.addFolder("Horizontal");
hFolder.open();
hFolder.add(debugObject.horizontal, "gain", 0, 2, 0.01);
hFolder.add(debugObject.horizontal, "period", 1, 4, 1);

const vFolder = gui.addFolder("Vertical");
vFolder.open();
vFolder.add(debugObject.vertical, "gain", 0, 2, 0.01);
vFolder.add(debugObject.vertical, "period", 1, 4, 1);

gui.add(debugObject, "clear").name("Clear");

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();
const particleTexture = textureLoader.load("/textures/particle.png");

/**
 * Particles
 */

// Geometry
// const particlesGeometry = new THREE.SphereBufferGeometry(1, 32, 32);
const particlesGeometry = new THREE.BufferGeometry();

// Material
const particlesMaterial = new THREE.PointsMaterial();
particlesMaterial.size = 0.1;
particlesMaterial.sizeAttenuation = true; // distant particles will be smaller than the closer one
particlesMaterial.vertexColors = true;

particlesMaterial.transparent = true;
particlesMaterial.alphaMap = particleTexture;
// particlesMaterial.alphaTest = 0.01;
// particlesMaterial.depthTest = false;
particlesMaterial.depthWrite = false;
particlesMaterial.blending = THREE.AdditiveBlending;

// Points
const particles = new THREE.Points(particlesGeometry, particlesMaterial);

let particlesArray = [];
updateParticleAttributes();

scene.add(particles);

// Electron generator
const generatorGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.6, 32);
const generatorMaterial = new THREE.MeshNormalMaterial();

const generator = new THREE.Mesh(generatorGeometry, generatorMaterial);
generator.rotation.z = Math.PI / 2;
generator.position.x = -4;
scene.add(generator);

// Plate
const plateGeometry = new THREE.BoxGeometry(1.1, 0.1, 1);
const plateMaterial = new THREE.MeshNormalMaterial();

const plateTop = new THREE.Mesh(plateGeometry, plateMaterial);
plateTop.position.y = 0.6;
scene.add(plateTop);
const plateBottom = new THREE.Mesh(plateGeometry, plateMaterial);
plateBottom.position.y = -0.6;
scene.add(plateBottom);

const plateRight = new THREE.Mesh(plateGeometry, plateMaterial);
plateRight.rotation.x = Math.PI / 2;
plateRight.position.x = -2;
plateRight.position.z = 0.6;
scene.add(plateRight);

const plateLeft = new THREE.Mesh(plateGeometry, plateMaterial);
plateLeft.rotation.x = Math.PI / 2;
plateLeft.position.x = -2;
plateLeft.position.z = -0.6;
scene.add(plateLeft);

// Screen
const screenGeometry = new THREE.PlaneGeometry(6, 6);
const screenMaterial = new THREE.MeshBasicMaterial({ color: 0x111111 });
screenMaterial.side = THREE.DoubleSide;

const screen = new THREE.Mesh(screenGeometry, screenMaterial);
screen.rotation.y = Math.PI / 2;
screen.position.x = 4;
scene.add(screen);

function updateParticleAttributes() {
  const count = particlesArray.length;
  const positionArray = new Float32Array(count * 3);
  const colorArray = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positionArray[i * 3 + 0] = particlesArray[i].pos.x;
    positionArray[i * 3 + 1] = particlesArray[i].pos.y;
    positionArray[i * 3 + 2] = particlesArray[i].pos.z;

    colorArray[i * 3 + 0] = particlesArray[i].brightness;
    colorArray[i * 3 + 1] = particlesArray[i].brightness;
    colorArray[i * 3 + 2] = particlesArray[i].brightness;
  }
  particles.geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positionArray, 3)
  );
  particles.geometry.setAttribute(
    "color",
    new THREE.BufferAttribute(colorArray, 3)
  );
}

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.y = 2;
camera.position.z = 5;
camera.position.x = -5;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update particles;
  particlesArray.forEach((particle) => {
    // calculate accellaration
    if (
      particle.pos.x >
        plateTop.position.x - plateTop.geometry.parameters.width / 2 &&
      particle.pos.x <
        plateTop.position.x + plateTop.geometry.parameters.width / 2
    ) {
      particle.applyForce(
        new THREE.Vector3(
          0,
          (Math.sin(elapsedTime * debugObject.vertical.period) / 4000) *
            debugObject.vertical.gain,
          0
        )
      );
    }

    if (
      particle.pos.x >
        plateRight.position.x - plateRight.geometry.parameters.width / 2 &&
      particle.pos.x <
        plateRight.position.x + plateRight.geometry.parameters.width / 2
    ) {
      particle.applyForce(
        new THREE.Vector3(
          0,
          0,
          (Math.sin(elapsedTime * debugObject.horizontal.period) / 4000) *
            debugObject.horizontal.gain
        )
      );
    }

    if (
      particle.pos.x > 4 &&
      particle.pos.y > -3 &&
      particle.pos.y < 3 &&
      particle.pos.z > -3 &&
      particle.pos.z < 3
    ) {
      particle.fade();
      particle.pos.x = 4.001;
      particle.vel.set(0, 0, 0);
    }

    particle.update();
  });

  // remove dead one
  particlesArray = particlesArray.filter((particle) => !particle.isDead());
  updateParticleAttributes();

  particlesArray.push(
    new Particle({
      x: -4,
      y: 0,
      z: 0,
      velX: 0.025,
    })
  );

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
