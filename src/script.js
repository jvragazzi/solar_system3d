import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { planets } from "./planets.js";

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
const maxPixelRatio = coarsePointer ? 1.5 : 1.8;
// Celulares baixam versões recomprimidas (máx. 1024 px), cerca de 3x mais leves.
const textureFolder = coarsePointer || Math.min(screen.width, screen.height) < 768 ? "textures/mobile" : "textures";
const canvas = document.querySelector(".threejs");
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(48, innerWidth / innerHeight, 0.1, 1200);
const overviewPosition = (target = new THREE.Vector3()) => {
  // Em telas em pé o campo horizontal é estreito, então afastamos a câmera para caber mais órbitas.
  const scale = Math.min(1.8, Math.max(1, 0.85 / camera.aspect));
  return target.set(0, 48 * scale, 118 * scale);
};
overviewPosition(camera.position);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, maxPixelRatio));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 8;
controls.maxDistance = 320;
controls.target.set(0, 0, 0);

const textureLoader = new THREE.TextureLoader();
const loadTexture = (name) => {
  const texture = textureLoader.load(`/${textureFolder}/${name}`);
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
// Área de toque invisível e maior que o planeta, para facilitar a seleção de mundos pequenos no celular.
const hitAreaMaterial = new THREE.MeshBasicMaterial();

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

  const hitArea = new THREE.Mesh(new THREE.SphereGeometry(Math.max(planet.radius * 1.6, 2.6), 12, 12), hitAreaMaterial);
  hitArea.visible = false;
  hitArea.userData.planetIndex = index;
  mesh.add(hitArea);
  interactiveMeshes.push(hitArea);

  planetObjects.push({ mesh, angle: index * 0.71 + 0.35 });
});

const ui = {
  hero: document.querySelector("#hero-copy"), panel: document.querySelector("#planet-panel"), list: document.querySelector("#planet-list"),
  name: document.querySelector("#planet-name"), order: document.querySelector("#planet-order"), type: document.querySelector("#planet-type"), summary: document.querySelector("#planet-summary"),
  facts: document.querySelector("#planet-facts"), comparison: document.querySelector("#planet-comparison"), details: document.querySelector("#planet-details"), curiosity: document.querySelector("#planet-curiosity"),
  tooltip: document.querySelector("#tooltip"), quizModal: document.querySelector("#quiz-modal"), quizTitle: document.querySelector("#quiz-title"), quizQuestion: document.querySelector("#quiz-question"), quizOptions: document.querySelector("#quiz-options"), quizFeedback: document.querySelector("#quiz-feedback"),
  help: document.querySelector("#explorer-help"), moreDetails: document.querySelector("#more-details"),
  topbar: document.querySelector(".topbar"), bottomBar: document.querySelector(".bottom-bar"), sheetHandle: document.querySelector("#sheet-handle"), sheetToggle: document.querySelector("#sheet-toggle")
};

let selectedIndex = -1;
let orbiting = true;
let orbitSpeed = 1;
let cameraFollowing = false;
let userAdjusted = false;
let pointerDown = null;
let sheetDrag = null;
let suppressSheetClick = false;
let panelSwipe = null;
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const focusPosition = new THREE.Vector3();
const cameraDirection = new THREE.Vector3();
const desiredCamera = new THREE.Vector3();
const targetStep = new THREE.Vector3();
const viewOffset = { x: 0, y: 0 };

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
  userAdjusted = false;
  document.body.classList.add("has-selection");
  setSheetExpanded(false);
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
  document.body.classList.remove("has-selection");
  ui.panel.classList.remove("is-open");
  ui.panel.setAttribute("aria-hidden", "true");
  ui.hero.classList.remove("is-hidden");
  document.querySelectorAll(".planet-option").forEach((button) => button.classList.remove("is-active"));
  controls.target.set(0, 0, 0);
  overviewPosition(desiredCamera);
}

function setSheetExpanded(expanded) {
  ui.panel.classList.toggle("is-expanded", expanded);
  ui.panel.scrollTop = 0;
  ui.sheetHandle.setAttribute("aria-expanded", String(expanded));
  ui.sheetHandle.setAttribute("aria-label", expanded ? "Recolher informações" : "Expandir informações");
  ui.sheetToggle.setAttribute("aria-expanded", String(expanded));
  ui.sheetToggle.firstChild.textContent = expanded ? "Mostrar menos " : "Ver dados e quiz ";
}

// Região da tela que não está coberta pela interface; o planeta em foco é centralizado nela.
function visibleArea() {
  const area = { top: ui.topbar.offsetHeight, bottom: ui.bottomBar.getBoundingClientRect().top, left: 0, right: innerWidth };
  if (selectedIndex >= 0) {
    if (ui.panel.offsetWidth > innerWidth * 0.7) area.bottom = Math.min(area.bottom, ui.panel.offsetTop);
    else area.right = Math.min(area.right, ui.panel.offsetLeft);
  } else if (ui.hero.offsetWidth > innerWidth * 0.7) {
    area.bottom = Math.min(area.bottom, ui.hero.offsetTop);
  } else if (innerHeight <= 520 && innerWidth > innerHeight) {
    area.left = ui.hero.offsetLeft + ui.hero.offsetWidth;
  }
  return area;
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
  const tapTolerance = event.pointerType === "mouse" ? 6 : 12;
  if (!pointerDown || Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y) > tapTolerance) return;
  const index = planetAtPointer(event);
  if (index >= 0) selectPlanet(index);
});
canvas.addEventListener("pointermove", (event) => {
  if (event.pointerType !== "mouse") return;
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
ui.sheetToggle.addEventListener("click", () => setSheetExpanded(!ui.panel.classList.contains("is-expanded")));
ui.sheetHandle.addEventListener("click", () => {
  if (suppressSheetClick) { suppressSheetClick = false; return; }
  setSheetExpanded(!ui.panel.classList.contains("is-expanded"));
});
ui.sheetHandle.addEventListener("pointerdown", (event) => { sheetDrag = event.clientY; suppressSheetClick = false; });
ui.sheetHandle.addEventListener("pointerup", (event) => {
  if (sheetDrag === null) return;
  const distance = event.clientY - sheetDrag;
  sheetDrag = null;
  if (Math.abs(distance) < 30) return;
  suppressSheetClick = true;
  const expanded = ui.panel.classList.contains("is-expanded");
  if (distance < 0) setSheetExpanded(true);
  else if (expanded) setSheetExpanded(false);
  else closePanel();
});
ui.sheetHandle.addEventListener("pointercancel", () => { sheetDrag = null; });
ui.panel.addEventListener("pointerdown", (event) => {
  if (event.pointerType === "mouse" || event.target.closest("#sheet-handle")) return;
  panelSwipe = { x: event.clientX, y: event.clientY };
});
ui.panel.addEventListener("pointerup", (event) => {
  if (!panelSwipe) return;
  const dx = event.clientX - panelSwipe.x;
  const dy = event.clientY - panelSwipe.y;
  panelSwipe = null;
  if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
  const expanded = ui.panel.classList.contains("is-expanded");
  selectPlanet(selectedIndex + (dx < 0 ? 1 : -1));
  if (expanded) setSheetExpanded(true);
  ui.panel.classList.remove("swipe-next", "swipe-previous");
  void ui.panel.offsetWidth;
  ui.panel.classList.add(dx < 0 ? "swipe-next" : "swipe-previous");
});
ui.panel.addEventListener("pointercancel", () => { panelSwipe = null; });
ui.panel.addEventListener("animationend", () => ui.panel.classList.remove("swipe-next", "swipe-previous"));
controls.addEventListener("start", () => { if (selectedIndex >= 0) userAdjusted = true; });
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
  const modalOpen = ui.quizModal.classList.contains("is-open") || ui.help.classList.contains("is-open");
  if (event.key === "Escape") {
    if (modalOpen) { setModal(ui.help, false); setModal(ui.quizModal, false); }
    else if (selectedIndex >= 0) closePanel();
  }
  // Setas no controle deslizante de velocidade devem mudar a velocidade, não o planeta.
  if (modalOpen || event.target.closest("input, textarea, select")) return;
  if (event.key === "ArrowRight") selectPlanet(selectedIndex < 0 ? 0 : selectedIndex + 1);
  if (event.key === "ArrowLeft") selectPlanet(selectedIndex < 0 ? planets.length - 1 : selectedIndex - 1);
});

window.addEventListener("resize", () => {
  const wasPortrait = camera.aspect < 1;
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, maxPixelRatio));
  if (selectedIndex < 0 && wasPortrait !== camera.aspect < 1) overviewPosition(desiredCamera);
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

  const area = visibleArea();
  const ease = prefersReducedMotion ? 1 : 1 - Math.pow(0.001, delta);
  viewOffset.x += (innerWidth / 2 - (area.left + area.right) / 2 - viewOffset.x) * ease;
  viewOffset.y += (innerHeight / 2 - (area.top + area.bottom) / 2 - viewOffset.y) * ease;
  camera.setViewOffset(innerWidth, innerHeight, viewOffset.x, viewOffset.y, innerWidth, innerHeight);

  if (selectedIndex >= 0 && cameraFollowing) {
    const selected = planetObjects[selectedIndex].mesh;
    selected.getWorldPosition(focusPosition);
    if (userAdjusted) {
      // O usuário girou ou deu zoom: acompanhamos o planeta sem desfazer o ângulo escolhido.
      targetStep.subVectors(focusPosition, controls.target).multiplyScalar(ease);
      controls.target.add(targetStep);
      camera.position.add(targetStep);
    } else {
      const radius = planets[selectedIndex].radius;
      const freeHeight = Math.max(0.3, (area.bottom - area.top) / innerHeight);
      const freeWidth = Math.max(0.3, (area.right - area.left) / innerWidth);
      const fit = Math.min(2.4, Math.max(1, 0.75 / freeHeight, 0.9 / (camera.aspect * freeWidth)));
      // Olhamos de um ângulo de 3/4 voltado para o Sol, para ver o lado de dia do planeta.
      const angle = planetObjects[selectedIndex].angle;
      cameraDirection.set(-Math.sin(angle) * 0.8 - Math.cos(angle) * 0.45, 0, Math.cos(angle) * 0.8 - Math.sin(angle) * 0.45).normalize();
      const distance = Math.max(10, radius * 4.2) * fit;
      desiredCamera.set(focusPosition.x + cameraDirection.x * distance, (radius * 1.25 + 2.5) * fit, focusPosition.z + cameraDirection.z * distance);
      controls.target.lerp(focusPosition, ease);
      camera.position.lerp(desiredCamera, ease * 0.72);
    }
  } else if (selectedIndex < 0 && desiredCamera.lengthSq() > 0) {
    camera.position.lerp(desiredCamera, prefersReducedMotion ? 1 : 0.035);
    if (camera.position.distanceTo(desiredCamera) < 0.1) desiredCamera.set(0, 0, 0);
  }

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

render();
