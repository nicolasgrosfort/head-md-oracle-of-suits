let pg; // Buffer pour la scène principale
let zoomPg; // Buffer pour la vue zoomée
let cam; // Caméra pour la scène principale

const Z_MAX = 50;

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
  let zoomFactor = 8;
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
  let offsetX = mouseXNorm * camDistance * zoomFactor;
  let offsetY = mouseYNorm * camDistance * zoomFactor;

  // Translater vers la zone survolée
  const zoomX = -(mouseX - width * 0.5) * zoomFactor;
  const zoomY = -(mouseY - height * 0.5) * zoomFactor;
  zoomPg.translate(zoomX, zoomY, Z_MAX);

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
  translate(-width * 0.5 + mouseX, -height * 0.5 + mouseY, Z_MAX);
  texture(masked);
  noStroke();
  circle(0, 0, zoomSize);

  // Ajouter un contour au cercle
  noFill();
  stroke(0);
  strokeWeight(2);
  circle(0, 0, zoomSize);
  pop();
}

function drawScene(renderer) {
  renderer.push();
  renderer.background(255);

  // Utiliser une échelle basée sur la taille de la fenêtre
  let scaleX = width * 0.15;
  let scaleY = height * 0.15;

  // Sphères de différentes tailles
  renderer.push();
  renderer.translate(scaleX * 0.5, -scaleY * 0.4, 20);
  renderer.fill(255, 100, 100);
  renderer.sphere(8);
  renderer.pop();

  renderer.push();
  renderer.translate(-scaleX * 0.8, scaleY * 0.27, -10);
  renderer.fill(100, 255, 100);
  renderer.sphere(12);
  renderer.pop();

  renderer.push();
  renderer.translate(scaleX * 0.33, scaleY * 0.6, 30);
  renderer.fill(100, 100, 255);
  renderer.sphere(6);
  renderer.pop();

  // Éléments aux extrémités
  // Coin supérieur gauche
  renderer.push();
  renderer.translate(-scaleX * 1.8, -scaleY * 1.5, 0);
  renderer.fill(255, 180, 100);
  renderer.sphere(10);
  renderer.pop();

  // Coin supérieur droit
  renderer.push();
  renderer.translate(scaleX * 1.9, -scaleY * 1.6, 15);
  renderer.fill(180, 100, 255);
  renderer.box(12);
  renderer.pop();

  // Coin inférieur gauche
  renderer.push();
  renderer.translate(-scaleX * 1.7, scaleY * 1.7, -20);
  renderer.fill(100, 255, 180);
  renderer.cone(8, 18);
  renderer.pop();

  // Coin inférieur droit
  renderer.push();
  renderer.translate(scaleX * 2, scaleY * 1.8, 10);
  renderer.fill(255, 100, 180);
  renderer.cylinder(6, 15);
  renderer.pop();

  // Bord gauche milieu
  renderer.push();
  renderer.translate(-scaleX * 1.9, 0, 5);
  renderer.fill(200, 255, 100);
  renderer.torus(8, 2);
  renderer.pop();

  // Bord droit milieu
  renderer.push();
  renderer.translate(scaleX * 2.1, scaleY * 0.1, -10);
  renderer.fill(100, 200, 255);
  renderer.box(10);
  renderer.pop();

  // Bord haut milieu
  renderer.push();
  renderer.translate(scaleX * 0.2, -scaleY * 1.7, 20);
  renderer.fill(255, 200, 200);
  renderer.sphere(7);
  renderer.pop();

  // Bord bas milieu
  renderer.push();
  renderer.translate(-scaleX * 0.15, scaleY * 1.9, -15);
  renderer.fill(200, 200, 255);
  renderer.cylinder(5, 12);
  renderer.pop();

  // Cônes variés
  renderer.push();
  renderer.translate(-scaleX * 0.53, -scaleY * 0.6, 0);
  renderer.fill(255, 255, 100);
  renderer.cone(6, 15);
  renderer.pop();

  renderer.push();
  renderer.translate(scaleX * 0.8, scaleY * 0.47, -20);
  renderer.fill(255, 150, 200);
  renderer.cone(4, 10);
  renderer.pop();

  // Cylindres
  renderer.push();
  renderer.translate(-scaleX, -scaleY * 0.2, 10);
  renderer.fill(150, 200, 255);
  renderer.cylinder(5, 20);
  renderer.pop();

  renderer.push();
  renderer.translate(scaleX * 0.27, -scaleY * 0.8, -15);
  renderer.fill(200, 150, 100);
  renderer.cylinder(3, 12);
  renderer.pop();

  // Torus (anneaux)
  renderer.push();
  renderer.translate(-scaleX * 0.27, scaleY * 0.8, 25);
  renderer.fill(255, 200, 100);
  renderer.torus(10, 3);
  renderer.pop();

  renderer.push();
  renderer.translate(scaleX * 1.07, -scaleY * 0.27, 0);
  renderer.fill(100, 200, 200);
  renderer.torus(7, 2);
  renderer.pop();

  // Plus d'éléments dispersés
  renderer.push();
  renderer.translate(-scaleX * 0.6, scaleY * 0.3, 35);
  renderer.fill(150, 255, 150);
  renderer.box(8);
  renderer.pop();

  renderer.push();
  renderer.translate(scaleX * 0.9, -scaleY * 0.15, -25);
  renderer.fill(255, 150, 150);
  renderer.sphere(5);
  renderer.pop();

  renderer.push();
  renderer.translate(-scaleX * 1.3, -scaleY * 1.2, 12);
  renderer.fill(180, 220, 255);
  renderer.cone(5, 14);
  renderer.pop();

  renderer.push();
  renderer.translate(scaleX * 1.4, scaleY * 1.1, -8);
  renderer.fill(255, 220, 180);
  renderer.torus(6, 2);
  renderer.pop();

  renderer.pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
