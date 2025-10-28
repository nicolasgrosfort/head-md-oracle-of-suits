let pg; // Buffer pour la scène principale
let zoomPg; // Buffer pour la vue zoomée
let cam; // Caméra pour la scène principale

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  zoomPg = createGraphics(300, 300, WEBGL); // Taille du cercle de zoom

  cam = createCamera();
  setCamera(cam);
}

function draw() {
  background(255);

  // Dessiner la scène principale
  push();
  orbitControl();
  drawScene(this);
  pop();

  // Paramètres du zoom
  let zoomFactor = 2;
  let zoomSize = 200;

  // Convertir la position de la souris en coordonnées normalisées (-1 à 1)
  let mouseXNorm = map(mouseX, 0, width, 1, -1);
  let mouseYNorm = map(mouseY, 0, height, 1, -1);

  // Créer la vue zoomée
  zoomPg.push();

  // Copier les paramètres de la caméra principale
  zoomPg.camera(
    cam.eyeX,
    cam.eyeY,
    cam.eyeZ,
    cam.centerX,
    cam.centerY,
    cam.centerZ,
    cam.upX,
    cam.upY,
    cam.upZ
  );

  // Calculer la distance de la caméra au centre
  let camDistance = dist(
    cam.eyeX,
    cam.eyeY,
    cam.eyeZ,
    cam.centerX,
    cam.centerY,
    cam.centerZ
  );

  // Calculer l'offset basé sur la position de la souris
  // Plus sensible car directement lié à la position écran et à la distance de la caméra
  let offsetX = mouseXNorm * camDistance * 2;
  let offsetY = mouseYNorm * camDistance * 2;

  // Translater vers la zone survolée
  zoomPg.translate(offsetX, offsetY, 0);

  // Appliquer le zoom
  zoomPg.scale(zoomFactor);

  drawScene(zoomPg);
  zoomPg.pop();

  // Créer le masque circulaire
  let maskGraphics = createGraphics(zoomSize, zoomSize);
  maskGraphics.fill(255);
  maskGraphics.circle(zoomSize / 2, zoomSize / 2, zoomSize);

  // Appliquer le masque
  let masked = zoomPg.get();
  masked.mask(maskGraphics);

  // Afficher le cercle à la position de la souris
  push();
  translate(-width / 2 + mouseX, -height / 2 + mouseY, 100);
  texture(masked);
  noStroke();
  circle(0, 0, zoomSize);

  // Ajouter un contour au cercle
  noFill();
  stroke(0);
  strokeWeight(3);
  circle(0, 0, zoomSize);
  pop();
}

function drawScene(renderer) {
  renderer.push();
  renderer.background(255);
  renderer.box(100);
  renderer.translate(150, 0, 0);
  renderer.sphere(50);
  renderer.translate(-300, 0, 0);
  renderer.cone(40, 80);
  renderer.pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
