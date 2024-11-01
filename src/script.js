import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Pane } from "tweakpane";

// initialize pane
const pane = new Pane();

// initialize the scene
const scene = new THREE.Scene();

// add textureLoader
const textureLoader = new THREE.TextureLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader();
cubeTextureLoader.setPath('/textures/cubeMap/');

// adding textures
const sunTexture = textureLoader.load("/textures/2k_sun.jpg");
const mercuryTexture = textureLoader.load("/textures/2k_mercury.jpg");
const venusTexture = textureLoader.load("/textures/2k_venus_surface.jpg");
const earthTexture = textureLoader.load("/textures/2k_earth_daymap.jpg");
const marsTexture = textureLoader.load("/textures/2k_mars.jpg");
const jupiterTexture = textureLoader.load("/textures/2k_jupiter.jpg");
const saturnTexture = textureLoader.load("/textures/2k_saturn.jpg");
const uranusTexture = textureLoader.load("/textures/2k_uranus.jpg");
const neptuneTexture = textureLoader.load("/textures/2k_neptune.jpg");
const moonTexture = textureLoader.load("/textures/2k_moon.jpg");

const backgroundCubemap = cubeTextureLoader.load([
  'px.png',
  'nx.png',
  'py.png',
  'ny.png',
  'pz.png',
  'nz.png',
]);

scene.background = backgroundCubemap;

// add materials
const mercuryMaterial = new THREE.MeshStandardMaterial({ map: mercuryTexture });
const venusMaterial = new THREE.MeshStandardMaterial({ map: venusTexture });
const earthMaterial = new THREE.MeshStandardMaterial({ map: earthTexture });
const marsMaterial = new THREE.MeshStandardMaterial({ map: marsTexture });
const jupiterMaterial = new THREE.MeshStandardMaterial({ map: jupiterTexture });
const saturnMaterial = new THREE.MeshStandardMaterial({ map: saturnTexture });
const uranusMaterial = new THREE.MeshStandardMaterial({ map: uranusTexture });
const neptuneMaterial = new THREE.MeshStandardMaterial({ map: neptuneTexture });
const moonMaterial = new THREE.MeshStandardMaterial({ map: moonTexture });

// Raycaster for detecting clicks
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// HTML Element for displaying name
const planetNameDiv = document.createElement('div');
planetNameDiv.style.position = 'absolute';
planetNameDiv.style.color = 'white';
planetNameDiv.style.padding = '4px';
planetNameDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
planetNameDiv.style.display = 'none';
document.body.appendChild(planetNameDiv);

// Sun
const sunGeometry = new THREE.SphereGeometry(7, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// Planets
const planets = [
  {
    name: "Mercury",
    radius: 1.2,
    distance: 8.5,
    speed: 0.02,
    material: mercuryMaterial,
    moons: [],
  },
  {
    name: "Vênus",
    radius: 1.5,
    distance: 10,
    speed: 0.015,
    material: venusMaterial,
    moons: [],
  },
  {
    name: "Terra",
    radius: 2,
    distance: 15,
    speed: 0.01,
    material: earthMaterial,
    moons: [
      {
        name: "Lua",
        radius: 0.4,
        distance: 3,
        speed: 0.05,
        material: moonMaterial,
      },
    ],
  },
  {
    name: "Marte",
    radius: 1.7,
    distance: 20,
    speed: 0.008,
    material: marsMaterial,
    moons: [
      {
        name: "Phobos",
        radius: 0.2,
        distance: 2.5,
        speed: 0.05,
        material: moonMaterial,
      },
      {
        name: "Deimos",
        radius: 0.15,
        distance: 3,
        speed: 0.04,
        material: moonMaterial,
      },
    ],
  },
  {
    name: "Júpiter",
    radius: 4,
    distance: 45,
    speed: 0.005,
    material: jupiterMaterial,
    moons: [
      {
        name: "Io",
        radius: 0.7,
        distance: 6,
        speed: 0.03,
        material: moonMaterial,
      },
      {
        name: "Europa",
        radius: 0.6,
        distance: 7,
        speed: 0.025,
        material: moonMaterial,
      },
      {
        name: "Ganymede",
        radius: 0.9,
        distance: 8.5,
        speed: 0.02,
        material: moonMaterial,
      },
      {
        name: "Callisto",
        radius: 0.8,
        distance: 10,
        speed: 0.015,
        material: moonMaterial,
      },
    ],
  },
  {
    name: "Saturno",
    radius: 3.5,
    distance: 60,
    speed: 0.003,
    material: saturnMaterial,
    moons: [
      {
        name: "Titan",
        radius: 1.2,
        distance: 6,
        speed: 0.02,
        material: moonMaterial,
      },
    ],
    rings: {
      innerRadius: 4.5,
      outerRadius: 7,
      color: 0xb39c6a,
      inclination: 0.4,
    },
  },
  {
    name: "Urano",
    radius: 3,
    distance: 80,
    speed: 0.002,
    material: uranusMaterial,
    moons: [
      {
        name: "Miranda",
        radius: 0.4,
        distance: 4.5,
        speed: 0.02,
        material: moonMaterial,
      },
    ],
    rings: {
      innerRadius: 3.5,
      outerRadius: 5,
      color: 0x8db6cd,
      inclination: 0.8,
    },
  },
  {
    name: "Netuno",
    radius: 3,
    distance: 100,
    speed: 0.001,
    material: neptuneMaterial,
    moons: [
      {
        name: "Triton",
        radius: 0.9,
        distance: 5,
        speed: 0.015,
        material: moonMaterial,
      },
    ],
  },
];

// Create planets
const createPlanet = (planet) => {
  const planetGeometry = new THREE.SphereGeometry(planet.radius, 32, 32);
  const planetMesh = new THREE.Mesh(planetGeometry, planet.material);
  planetMesh.position.x = planet.distance;
  planetMesh.userData.name = planet.name;

  // Create rings if the planet has them
  if (planet.rings) {
    const ringGeometry = new THREE.RingGeometry(planet.rings.innerRadius, planet.rings.outerRadius, 64);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: planet.rings.color,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6,
    });
    const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.rotation.y = planet.rings.inclination;
    ringMesh.name = "ring";

    planetMesh.add(ringMesh);
  }

  return planetMesh;
};

// Create moons
const createMoon = (moon) => {
  const moonGeometry = new THREE.SphereGeometry(moon.radius, 32, 32);
  const moonMesh = new THREE.Mesh(moonGeometry, moon.material || moonMaterial);
  moonMesh.position.x = moon.distance;
  moonMesh.userData.name = moon.name;
  return moonMesh;
};

// Create planets and their moons
const planetMeshes = planets.map((planet) => {
  const planetMesh = createPlanet(planet);
  scene.add(planetMesh);

  if (planet.moons) {
    planet.moons.forEach((moon) => {
      const moonMesh = createMoon(moon);
      planetMesh.add(moonMesh);
    });
  }

  return planetMesh;
});

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 2);
pointLight.position.set(0, 0, 0);
scene.add(pointLight);

// Camera
const camera = new THREE.PerspectiveCamera(
  50, 
  window.innerWidth / window.innerHeight,
  0.1,
  3000
);
camera.position.z = 250; 
camera.position.y = 45; 

// Renderer
const canvas = document.querySelector("canvas.threejs");
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Orbit controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.maxDistance = 1500;
controls.minDistance = 20;

// Resize listener
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Handle click events
window.addEventListener('click', (event) => {
  // Convert screen coordinates to normalized device coordinates
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

  // Update the raycaster with the camera and mouse position
  raycaster.setFromCamera(mouse, camera);

  // Calculate objects intersected by the raycaster
  const intersects = raycaster.intersectObjects(scene.children, true);

  if (intersects.length > 0) {
    const intersected = intersects[0].object;
    const name = intersected.userData.name;

    if (name) {
      planetNameDiv.innerText = name;
      planetNameDiv.style.display = 'block';
      planetNameDiv.style.left = `${event.clientX + 10}px`;
      planetNameDiv.style.top = `${event.clientY + 10}px`;
    }
  } else {
    planetNameDiv.style.display = 'none';
  }
});

// Render loop
const renderloop = () => {
  planetMeshes.forEach((planet, planetIndex) => {
    planet.rotation.y += planets[planetIndex].speed;
    planet.position.x = Math.sin(planet.rotation.y) * planets[planetIndex].distance;
    planet.position.z = Math.cos(planet.rotation.y) * planets[planetIndex].distance;

    planet.children.forEach((moon, moonIndex) => {
      if (moon.name !== "ring" && planets[planetIndex].moons[moonIndex]) {
        moon.rotation.y += planets[planetIndex].moons[moonIndex].speed;
        moon.position.x = Math.sin(moon.rotation.y) * planets[planetIndex].moons[moonIndex].distance;
        moon.position.z = Math.cos(moon.rotation.y) * planets[planetIndex].moons[moonIndex].distance;
      }
    });
  });

  controls.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(renderloop);
};

renderloop();
