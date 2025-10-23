let leftEyeBlink = 0.0;
let rightEyeBlink = 0.0;
let jawOpen = 0.0;

let h = 360;
let s = 100;
let l = 100;

let leftLightOn = true;
let rightLightOn = true;
let previousLeftBlink = 0.0;
let previousRightBlink = 0.0;
let blinkThreshold = 0.5; // Seuil de détection du clignotement
let bothEyesClosedThreshold = 0.8; // Seuil pour détecter les deux yeux fermés

let leftColorIndex = 0;
let rightColorIndex = 0;
let colors = [
  [255, 0, 255], // Magenta
  [255, 0, 0], // Rouge
  [0, 255, 0], // Vert
  [0, 0, 255], // Bleu
  [255, 255, 0], // Jaune
  [0, 255, 255], // Cyan
  [255, 128, 0], // Orange
  [255, 255, 255], // Blanc
];

let cameraRotationY;
let cameraRotationX;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);

  // Initialiser les rotations de la caméra
  cameraRotationY = QUARTER_PI;
  cameraRotationX = -QUARTER_PI + atan(1 / sqrt(2));

  setupVideo();
  setupFace();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  getFaceLandmarks();

  leftEyeBlink = getBlendshapeScore("eyeBlinkLeft");
  rightEyeBlink = getBlendshapeScore("eyeBlinkRight");
  jawOpen = getBlendshapeScore("jawOpen");

  // Récupérer la direction du regard
  let eyeLookLeft = getBlendshapeScore("eyeLookInLeft");
  let eyeLookRight = getBlendshapeScore("eyeLookOutLeft");
  let eyeLookUp = getBlendshapeScore("eyeLookUpLeft");
  let eyeLookDown = getBlendshapeScore("eyeLookDownLeft");

  // Ajuster la rotation de la caméra en fonction du regard
  // Rotation horizontale (gauche/droite)
  let targetRotationY = QUARTER_PI + ((eyeLookRight - eyeLookLeft) * PI) / 3;
  cameraRotationY = lerp(cameraRotationY, targetRotationY, 0.1);

  // Rotation verticale (haut/bas)
  let baseRotationX = -QUARTER_PI + atan(1 / sqrt(2));
  let targetRotationX = baseRotationX + ((eyeLookDown - eyeLookUp) * PI) / 4;
  cameraRotationX = lerp(cameraRotationX, targetRotationX, 0.1);

  // Détecter si les deux yeux sont fermés
  if (
    leftEyeBlink >= bothEyesClosedThreshold &&
    rightEyeBlink >= bothEyesClosedThreshold
  ) {
    leftLightOn = false;
    rightLightOn = false;
  } else {
    // Si les yeux s'ouvrent, rallumer les lumières
    if (leftEyeBlink < blinkThreshold) {
      leftLightOn = true;
    }
    if (rightEyeBlink < blinkThreshold) {
      rightLightOn = true;
    }

    // Détection clignotement œil gauche seul (changement de couleur)
    if (
      previousLeftBlink < blinkThreshold &&
      leftEyeBlink >= blinkThreshold &&
      rightEyeBlink < blinkThreshold
    ) {
      leftColorIndex = (leftColorIndex + 1) % colors.length;
    }

    // Détection clignotement œil droit seul (changement de couleur)
    if (
      previousRightBlink < blinkThreshold &&
      rightEyeBlink >= blinkThreshold &&
      leftEyeBlink < blinkThreshold
    ) {
      rightColorIndex = (rightColorIndex + 1) % colors.length;
    }
  }

  previousLeftBlink = leftEyeBlink;
  previousRightBlink = rightEyeBlink;

  background(0, 0, 0);

  push();
  scale(-1, 1);

  push();
  translate(-width / 2, -height / 2);

  drawVideo();
  const opacity = map(0.8, 0, 1, 0, 255);
  console.log(opacity);
  fill(0, opacity);
  // rect(0, 0, width, height);
  pop();
  pop();

  // Dessiner la vidéo et les mains en 2D
  push();
  // Revenir en mode 2D pour la vidéo
  translate(-width / 2, -height / 2);
  pop();

  // Vue isométrique avec rotation contrôlée par le regard
  ortho(-width / 2, width / 2, -height / 2, height / 2, 0, 2000);
  rotateX(cameraRotationX);
  rotateY(cameraRotationY);

  // Spotlight gauche
  if (leftLightOn) {
    let leftPos = createVector(-200, -100, 200);
    let leftDir = createVector(1, 0.36, -1);
    leftDir.normalize();
    let leftColor = colors[leftColorIndex];
    spotLight(
      leftColor[0],
      leftColor[1],
      leftColor[2],
      leftPos,
      leftDir,
      PI / 6,
      10
    );
  }

  // Spotlight droit
  if (rightLightOn) {
    let rightPos = createVector(200, -100, 200);
    let rightDir = createVector(-1, 0.36, -1);
    rightDir.normalize();
    let rightColor = colors[rightColorIndex];
    spotLight(
      rightColor[0],
      rightColor[1],
      rightColor[2],
      rightPos,
      rightDir,
      PI / 6,
      10
    );
  }

  ambientMaterial(255, 255, 255);
  box(100);
}

function drawVideo() {
  if (isVideoReady()) {
    image(videoElement, 0, 0);
  }
}
