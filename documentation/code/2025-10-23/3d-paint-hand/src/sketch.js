const CONFIG = {
  video: {
    width: 640,
    height: 480,
  },
};

let drawingPoints = [];
let isDrawing = false;
let previousFingerTip = null;

// Variables pour la caméra
let camDistance = 800;
let camAngleX = -30;
let camAngleY = -45;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);

  angleMode(DEGREES);

  colorMode(HSL);
  textFont("Monospace");

  setupVideo();
  setupCamera();

  setupFace();
  setupHands();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  background(360, 100, 0, 1);

  // Configurer les lumières
  ambientLight(60); // Lumière ambiante douce

  // Lumière directionnelle principale
  directionalLight(255, 255, 255, -1, 0.5, -0.5);

  // Lumières ponctuelles colorées pour plus de profondeur
  pointLight(180, 100, 50, 200, -200, 200); // Lumière cyan
  pointLight(300, 100, 50, -200, 200, -200); // Lumière magenta

  // Lumière de remplissage
  pointLight(150, 150, 150, 0, 400, 0);

  // Configurer la caméra avec les angles
  let camX = camDistance * cos(camAngleY) * cos(camAngleX);
  let camY = camDistance * sin(camAngleX);
  let camZ = camDistance * sin(camAngleY) * cos(camAngleX);
  camera(camX, camY, camZ, 0, 0, 0, 0, 1, 0);

  if (!handsDetections || !handsDetections.multiHandLandmarks) return;

  // Axes de référence 3D avec matériau émissif
  push();
  strokeWeight(3);
  // Axe X (rouge)
  stroke(0, 100, 50);
  emissiveMaterial(0, 100, 50);
  line(-300, 0, 0, 300, 0, 0);
  // Axe Y (vert)
  stroke(120, 100, 50);
  emissiveMaterial(120, 100, 50);
  line(0, -300, 0, 0, 300, 0);
  // Axe Z (bleu)
  stroke(240, 100, 50);
  emissiveMaterial(240, 100, 50);
  line(0, 0, -300, 0, 0, 300);
  pop();

  // Dessiner les sphères aux points avec matériau spéculaire
  for (const point of drawingPoints) {
    push();
    translate(point.x, point.y, point.z);

    // Matériau avec reflets
    ambientMaterial(200, 100, 50);
    specularMaterial(250);
    shininess(50);

    noStroke();
    sphere(5);
    pop();
  }

  // Dessiner les lignes entre les points avec tubes cylindriques
  if (drawingPoints.length > 1) {
    for (let i = 0; i < drawingPoints.length - 1; i++) {
      const p1 = drawingPoints[i];
      const p2 = drawingPoints[i + 1];

      push();
      // Calculer la position et l'orientation du cylindre
      let dx = p2.x - p1.x;
      let dy = p2.y - p1.y;
      let dz = p2.z - p1.z;
      let distance = sqrt(dx * dx + dy * dy + dz * dz);

      translate((p1.x + p2.x) / 2, (p1.y + p2.y) / 2, (p1.z + p2.z) / 2);

      // Orienter le cylindre
      let angleXZ = atan2(dz, dx);
      let angleY = atan2(sqrt(dx * dx + dz * dz), dy);
      rotateZ(angleXZ);
      rotateY(angleY + 90);

      // Matériau métallique
      ambientMaterial(0, 0, 30);
      specularMaterial(200);
      shininess(100);

      noStroke();
      cylinder(2, distance);
      pop();
    }
  }

  // Suivre l'index (landmark 8)
  for (const landmarks of handsDetections.multiHandLandmarks) {
    const fingerTip = landmarks[8];

    if (fingerTip) {
      const x = map(fingerTip.x, 0, 1, -300, 300);
      const y = map(fingerTip.y, 0, 1, -300, 300);
      const z = map(fingerTip.z, -0.2, 0.2, -300, 300);

      // Afficher la position actuelle du doigt avec matériau brillant
      push();
      translate(x, y, z);

      // Effet de "pinceau" brillant
      if (isDrawing) {
        ambientMaterial(120, 100, 70);
        emissiveMaterial(120, 100, 30);
        specularMaterial(255);
        shininess(100);
      } else {
        ambientMaterial(0, 0, 60);
        specularMaterial(150);
        shininess(50);
      }

      noStroke();
      sphere(15);

      // Ajouter un halo lumineux quand on dessine
      if (isDrawing) {
        ambientMaterial(120, 100, 90, 0.3);
        sphere(25);
      }
      pop();

      // Ajouter le point si on dessine (avec un peu d'espacement)
      if (isDrawing) {
        if (
          drawingPoints.length === 0 ||
          dist(
            x,
            y,
            z,
            drawingPoints[drawingPoints.length - 1].x,
            drawingPoints[drawingPoints.length - 1].y,
            drawingPoints[drawingPoints.length - 1].z
          ) > 5
        ) {
          drawingPoints.push({ x, y, z });
        }
      }
    }
  }

  // Afficher les instructions (en 2D par-dessus)
  push();
  camera(0, 0, height / 2 / tan(PI / 6), 0, 0, 0, 0, 1, 0);
  translate(-width / 2, -height / 2, 0);
  fill(0);
  noStroke();
  textAlign(LEFT, TOP);
  text(
    `ESPACE: ${isDrawing ? "✓ Dessine" : "○ Pause"} | C: Effacer | Points: ${
      drawingPoints.length
    }\nFlèches: Rotation | Molette: Zoom`,
    10,
    10
  );
  pop();
}

function keyPressed() {
  if (key === " ") {
    isDrawing = !isDrawing;
  }

  if (key === "c" || key === "C") {
    drawingPoints = [];
  }

  // Rotation de la caméra
  if (keyCode === LEFT_ARROW) {
    camAngleY -= 5;
  }
  if (keyCode === RIGHT_ARROW) {
    camAngleY += 5;
  }
  if (keyCode === UP_ARROW) {
    camAngleX -= 5;
  }
  if (keyCode === DOWN_ARROW) {
    camAngleX += 5;
  }
}

function mouseWheel(event) {
  // Zoom avec la molette
  camDistance += event.delta * 0.5;
  camDistance = constrain(camDistance, 200, 2000);
  return false;
}
