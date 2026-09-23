import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { planets } from "./planets.js";

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const canvas = document.querySelector(".threejs");
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(48, innerWidth / innerHeight, 0.1, 1200);
camera.position.set(0, 48, 118);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 8;
controls.maxDistance = 220;
controls.target.set(0, 0, 0);

const textureLoader = new THREE.TextureLoader();
const loadTexture = (name) => {
  const texture = textureLoader.load(`/textures/${name}`);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  return texture;
};

const cubeLoader = new THREE.CubeTextureLoader().setPath("/textures/cubeMap/");
scene.background = cubeLoader.load(["px.png", "nx.png", "py.png", "ny.png", "pz.png", "nz.png"]);

scene.add(new THREE.AmbientLight(0x7590bd, 0.42));
const sunlight = new THREE.PointLight(0xfff1ce, 850, 250, 1.5);
scene.add(sunlight);

const sun = new THREE.Mesh(
  new THREE.SphereGeometry(6.2, 64, 64),
  new THREE.MeshBasicMaterial({ map: loadTexture("2k_sun.jpg") })
);
scene.add(sun);
const sunGlow = new THREE.Mesh(
  new THREE.SphereGeometry(6.75, 48, 48),
  new THREE.MeshBasicMaterial({ color: 0xffb349, transparent: true, opacity: 0.12, side: THREE.BackSide })
);
scene.add(sunGlow);

const orbitMaterial = new THREE.LineBasicMaterial({ color: 0x8090ad, transparent: true, opacity: 0.17 });
const planetObjects = [];
const interactiveMeshes = [];
const moonTexture = loadTexture("2k_moon.jpg");

planets.forEach((planet, index) => {
  const points = [];
  for (let step = 0; step <= 128; step += 1) {
    const angle = (step / 128) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(angle) * planet.distance, 0, Math.sin(angle) * planet.distance));
  }
  scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), orbitMaterial));

  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(planet.radius, 48, 48),
    new THREE.MeshStandardMaterial({ map: loadTexture(planet.texture), roughness: 0.8, metalness: 0 })
  );
  mesh.userData.planetIndex = index;
  mesh.rotation.z = planet.id === "urano" ? 1.7 : 0.08 + index * 0.018;
  scene.add(mesh);
  interactiveMeshes.push(mesh);

  if (planet.rings) {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(planet.radius * 1.35, planet.radius * 2.05, 96),
      new THREE.MeshBasicMaterial({ color: planet.id === "saturno" ? 0xd8c395 : 0x87bdc5, transparent: true, opacity: 0.48, side: THREE.DoubleSide, depthWrite: false })
    );
    ring.rotation.x = Math.PI / 2.25;
    ring.userData.planetIndex = index;
    mesh.add(ring);
    interactiveMeshes.push(ring);
  }

  if (planet.id === "terra") {
    const moon = new THREE.Mesh(new THREE.SphereGeometry(0.36, 24, 24), new THREE.MeshStandardMaterial({ map: moonTexture }));
    moon.position.set(3.2, 0, 0);
    mesh.add(moon);
  }

  planetObjects.push({ mesh, angle: index * 0.71 + 0.35 });
});

const ui = {
  hero: document.querySelector("#hero-copy"), panel: document.querySelector("#planet-panel"), list: document.querySelector("#planet-list"),
  name: document.querySelector("#planet-name"), order: document.querySelector("#planet-order"), type: document.querySelector("#planet-type"), summary: document.querySelector("#planet-summary"),
  facts: document.querySelector("#planet-facts"), comparison: document.querySelector("#planet-comparison"), details: document.querySelector("#planet-details"), curiosity: document.querySelector("#planet-curiosity"),
  tooltip: document.querySelector("#tooltip"), quizModal: document.querySelector("#quiz-modal"), quizTitle: document.querySelector("#quiz-title"), quizQuestion: document.querySelector("#quiz-question"), quizOptions: document.querySelector("#quiz-options"), quizFeedback: document.querySelector("#quiz-feedback"),
  help: document.querySelector("#explorer-help"), moreDetails: document.querySelector("#more-details")
};

let selectedIndex = -1;
let orbiting = true;
let orbitSpeed = 1;
let cameraFollowing = false;
let pointerDown = null;
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const focusPosition = new THREE.Vector3();
const desiredCamera = new THREE.Vector3();

planets.forEach((planet, index) => {
  const button = document.createElement("button");
  button.className = "planet-option";
  button.type = "button";
  button.dataset.index = index;
  button.setAttribute("aria-label", `Explorar ${planet.name}`);
  button.style.setProperty("--dot-color", planet.color);
  button.innerHTML = `<span class="planet-dot" style="--dot-size:${9 + planet.radius * 2.2}px"></span><span>${planet.name}</span>`;
  button.addEventListener("click", () => selectPlanet(index));
  ui.list.appendChild(button);
});

function selectPlanet(index) {
  selectedIndex = (index + planets.length) % planets.length;
  const planet = planets[selectedIndex];
  cameraFollowing = true;
  ui.hero.classList.add("is-hidden");
  ui.panel.classList.add("is-open");
  ui.panel.setAttribute("aria-hidden", "false");
  ui.panel.style.setProperty("--planet-color", planet.color);
  ui.name.textContent = planet.name;
  ui.order.textContent = `Planeta ${String(planet.order).padStart(2, "0")}`;
  ui.type.textContent = planet.type;
  ui.summary.textContent = planet.summary;
  ui.comparison.textContent = planet.comparison;
  ui.details.textContent = planet.details;
  ui.curiosity.textContent = planet.curiosity;
  ui.moreDetails.open = false;
  ui.facts.innerHTML = planet.facts.map(([label, value, note]) => `<div class="fact"><span>${label}</span><strong>${value}</strong><small>${note}</small></div>`).join("");
  document.querySelectorAll(".planet-option").forEach((button, buttonIndex) => button.classList.toggle("is-active", buttonIndex === selectedIndex));
  const activeButton = ui.list.children[selectedIndex];
  activeButton.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", inline: "center", block: "nearest" });
}

function closePanel() {
  selectedIndex = -1;
  cameraFollowing = false;
  ui.panel.classList.remove("is-open");
  ui.panel.setAttribute("aria-hidden", "true");
  ui.hero.classList.remove("is-hidden");
  document.querySelectorAll(".planet-option").forEach((button) => button.classList.remove("is-active"));
  controls.target.set(0, 0, 0);
  desiredCamera.set(0, 48, 118);
}

function setModal(modal, open) {
  modal.classList.toggle("is-open", open);
  modal.setAttribute("aria-hidden", String(!open));
  if (open) modal.querySelector("button").focus();
}

function openQuiz() {
  const planet = planets[selectedIndex];
  if (!planet) return;
  ui.quizTitle.textContent = `Quiz: ${planet.name}`;
  ui.quizQuestion.textContent = planet.quiz.question;
  ui.quizFeedback.textContent = "";
  ui.quizOptions.innerHTML = "";
  planet.quiz.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = option;
    button.addEventListener("click", () => answerQuiz(index));
    ui.quizOptions.appendChild(button);
  });
  setModal(ui.quizModal, true);
}

function answerQuiz(answer) {
  const quiz = planets[selectedIndex].quiz;
  [...ui.quizOptions.children].forEach((button, index) => {
    button.disabled = true;
    if (index === quiz.answer) button.classList.add("correct");
    if (index === answer && answer !== quiz.answer) button.classList.add("wrong");
  });
  ui.quizFeedback.textContent = `${answer === quiz.answer ? "Muito bem!" : "Quase!"} ${quiz.explanation}`;
}

function updatePointer(event) {
  pointer.x = (event.clientX / innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / innerHeight) * 2 + 1;
}

function planetAtPointer(event) {
  updatePointer(event);
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(interactiveMeshes, false)[0];
  return hit ? hit.object.userData.planetIndex : -1;
}

canvas.addEventListener("pointerdown", (event) => { pointerDown = { x: event.clientX, y: event.clientY }; });
canvas.addEventListener("pointerup", (event) => {
  if (!pointerDown || Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y) > 6) return;
  const index = planetAtPointer(event);
  if (index >= 0) selectPlanet(index);
});
canvas.addEventListener("pointermove", (event) => {
  const index = planetAtPointer(event);
  canvas.style.cursor = index >= 0 ? "pointer" : "grab";
  ui.tooltip.classList.toggle("is-visible", index >= 0);
  if (index >= 0) {
    ui.tooltip.textContent = `Explorar ${planets[index].name}`;
    ui.tooltip.style.left = `${event.clientX + 14}px`;
    ui.tooltip.style.top = `${event.clientY + 14}px`;
  }
});
canvas.addEventListener("pointerleave", () => ui.tooltip.classList.remove("is-visible"));

document.querySelector("#start-button").addEventListener("click", () => selectPlanet(2));
document.querySelector("#close-panel").addEventListener("click", closePanel);
document.querySelector("#previous-planet").addEventListener("click", () => selectPlanet(selectedIndex < 0 ? planets.length - 1 : selectedIndex - 1));
document.querySelector("#next-planet").addEventListener("click", () => selectPlanet(selectedIndex < 0 ? 0 : selectedIndex + 1));
document.querySelector("#quiz-button").addEventListener("click", openQuiz);
document.querySelector("#close-quiz").addEventListener("click", () => setModal(ui.quizModal, false));
document.querySelector("#help-button").addEventListener("click", () => setModal(ui.help, true));
document.querySelector("#close-help").addEventListener("click", () => setModal(ui.help, false));
document.querySelector("#toggle-orbits").addEventListener("click", (event) => {
  orbiting = !orbiting;
  event.currentTarget.setAttribute("aria-pressed", String(!orbiting));
  event.currentTarget.innerHTML = orbiting ? '<span aria-hidden="true">‖</span> Pausar órbitas' : '<span aria-hidden="true">▶</span> Retomar órbitas';
});
document.querySelector("#speed-control").addEventListener("input", (event) => { orbitSpeed = Number(event.target.value); });

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") { setModal(ui.help, false); setModal(ui.quizModal, false); }
  if (event.key === "ArrowRight" && !ui.quizModal.classList.contains("is-open")) selectPlanet(selectedIndex < 0 ? 0 : selectedIndex + 1);
  if (event.key === "ArrowLeft" && !ui.quizModal.classList.contains("is-open")) selectPlanet(selectedIndex < 0 ? planets.length - 1 : selectedIndex - 1);
});

window.addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8));
});

const clock = new THREE.Clock();
function render() {
  const delta = Math.min(clock.getDelta(), 0.04);
  sun.rotation.y += delta * 0.035;
  planetObjects.forEach(({ mesh }, index) => {
    const planet = planets[index];
    if (orbiting && !prefersReducedMotion) planetObjects[index].angle += delta * planet.speed * orbitSpeed;
    const angle = planetObjects[index].angle;
    mesh.position.set(Math.cos(angle) * planet.distance, 0, Math.sin(angle) * planet.distance);
    mesh.rotation.y += delta * (0.12 + index * 0.01);
    if (planet.id === "terra" && mesh.children[0]) mesh.children[0].rotation.y += delta * 0.8;
  });

  if (selectedIndex >= 0 && cameraFollowing) {
    const selected = planetObjects[selectedIndex].mesh;
    selected.getWorldPosition(focusPosition);
    const radius = planets[selectedIndex].radius;
    const side = innerWidth < 760 ? 0 : -radius * 1.5;
    desiredCamera.set(focusPosition.x + side, radius * 1.25 + 2.5, focusPosition.z + Math.max(10, radius * 4.2));
    const ease = prefersReducedMotion ? 1 : 1 - Math.pow(0.001, delta);
    controls.target.lerp(focusPosition, ease);
    camera.position.lerp(desiredCamera, ease * 0.72);
  } else if (selectedIndex < 0 && desiredCamera.lengthSq() > 0) {
    camera.position.lerp(desiredCamera, prefersReducedMotion ? 1 : 0.035);
    if (camera.position.distanceTo(desiredCamera) < 0.1) desiredCamera.set(0, 0, 0);
  }

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

render();
