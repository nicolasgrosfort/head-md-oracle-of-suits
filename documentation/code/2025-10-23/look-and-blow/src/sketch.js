// the blendshapes we are going to track
let leftEyeBlink = 0.0;
let rightEyeBlink = 0.0;
let jawOpen = 0.0;
let mouthPucker = 0.0;

// pointer position
let pointerX = 0;
let pointerY = 0;

// circle size
let circleSize = 1;
const minCircleSize = 1;
const maxCircleSize = 400;

// smoothing factors
const positionSmoothing = 0.3;
const sizeSmoothing = 0.15;

// grid settings
const gridSpacing = 10;
let gridCircles = [];

// mouth pucker threshold to start blowing
const blowThreshold = 0.5;

// Track if user has started blowing
let hasStartedBlowing = false;

// Audio for white noise
let noise;
let audioStarted = false;

// Grid circle class
class GridCircle {
  constructor(x, y) {
    this.homeX = x;
    this.homeY = y;
    this.x = x;
    this.y = y;
    this.size = 10;
    this.velocityX = 0;
    this.velocityY = 0;
    this.friction = 0.75;
    this.isOffScreen = false;
  }

  update(pointerX, pointerY, pointerRadius, pushForce, canBlow) {
    if (this.isOffScreen) return;

    if (canBlow) {
      const dx = this.x - pointerX;
      const dy = this.y - pointerY;
      const distance = sqrt(dx * dx + dy * dy);

      const influenceRadius = pointerRadius + 10;
      if (distance < influenceRadius && distance > 0) {
        const pushStrength = map(distance, 0, influenceRadius, 1, 0);
        const randomDistance = random(0.5, 2);
        const force = pushStrength * pushForce * randomDistance;
        const pushX = (dx / distance) * force * 30;
        const pushY = (dy / distance) * force * 30;

        this.velocityX += pushX;
        this.velocityY += pushY;
      }
    }

    this.x += this.velocityX;
    this.y += this.velocityY;

    this.velocityX *= this.friction;
    this.velocityY *= this.friction;

    const margin = 100;
    if (
      this.x < -margin ||
      this.x > width + margin ||
      this.y < -margin ||
      this.y > height + margin
    ) {
      this.isOffScreen = true;
    }
  }

  display() {
    if (this.isOffScreen) return;

    fill(0, 0, 0);
    noStroke();
    rectMode(CENTER);
    rect(this.x, this.y, this.size, this.size);
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  startAudio();

  textFont("Monospace");

  setupFace();
  setupVideo();

  pointerX = width / 2;
  pointerY = height / 2;

  createGrid();
}

function createGrid() {
  gridCircles = [];
  for (let x = gridSpacing * 0.5; x < width; x += gridSpacing * 0.5) {
    for (let y = gridSpacing * 0.5; y < height; y += gridSpacing * 0.5) {
      gridCircles.push(new GridCircle(x, y));
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  createGrid();
}

function startAudio() {
  if (!audioStarted) {
    userStartAudio();

    // Create and start white noise
    noise = new p5.Noise("white");
    noise.start();
    noise.amp(0);

    audioStarted = true;
    console.log("Audio context started!");
  }
}

function draw() {
  getFaceLandmarks();

  background(255);
  drawVideo(5);

  leftEyeBlink = getBlendshapeScore("eyeBlinkLeft");
  rightEyeBlink = getBlendshapeScore("eyeBlinkRight");
  jawOpen = getBlendshapeScore("jawOpen");
  mouthPucker = getBlendshapeScore("mouthPucker");

  const faces = getFaceLandmarks();
  if (faces && faces.length > 0) {
    const landmarks = faces[0];

    const leftIris = landmarks[468];
    const rightIris = landmarks[473];

    if (leftIris && rightIris) {
      const avgX = (leftIris.x + rightIris.x) / 2;
      const avgY = (leftIris.y + rightIris.y) / 2;

      const targetX = map(avgX, 0.65, 0.45, 0, width);
      const targetY = map(avgY, 0.4, 0.6, 0, height);

      pointerX = lerp(pointerX, targetX, positionSmoothing);
      pointerY = lerp(pointerY, targetY, positionSmoothing);
    }
  }

  const canBlow = mouthPucker > blowThreshold;

  if (canBlow) {
    hasStartedBlowing = true;
  }

  const targetSize = map(
    mouthPucker,
    blowThreshold,
    1,
    minCircleSize,
    maxCircleSize
  );
  circleSize = lerp(circleSize, targetSize, sizeSmoothing);

  const pushForce = map(mouthPucker, 0, 1, 1, 5);

  // Control white noise volume based on mouthPucker (only if audio started)
  if (audioStarted && noise) {
    if (canBlow) {
      const maxNoiseVolume = 0.2;
      let intensity = constrain(
        (mouthPucker - blowThreshold) / (1 - blowThreshold),
        0,
        1
      );
      intensity = pow(intensity, 1.5); // ou 2 pour une montée plus douce
      const noiseVolume = intensity * maxNoiseVolume;
      noise.amp(noiseVolume, 0.1);
    } else {
      noise.amp(0, 0.2);
    }
  }

  for (let circle of gridCircles) {
    circle.update(pointerX, pointerY, circleSize / 2, pushForce, canBlow);
    circle.display();
  }

  // Show instruction message
  if (!hasStartedBlowing || !audioStarted) {
    fill(0, 0, 0, 150);
    noStroke();
    rect(0, height / 2 - 100, width, 200);

    fill(255);
    textAlign(CENTER, CENTER);
    textSize(16);

    if (!hasStartedBlowing) {
      text("blow on your screen", width / 2, height / 2);
    }

    textAlign(LEFT, TOP);
  }

  // Debug info
  fill(0);
  noStroke();
  textSize(16);
  textAlign(LEFT, TOP);
  text(`Audio Started: ${audioStarted ? "YES" : "NO"}`, 10, 20);
  text(`Mouth Pucker: ${mouthPucker.toFixed(2)}`, 10, 40);
  text(`Can Blow: ${canBlow ? "YES" : "NO"}`, 10, 60);
  text(`Push Force: ${pushForce.toFixed(1)}x`, 10, 80);

  if (audioStarted && canBlow) {
    const noiseVolume = map(mouthPucker, blowThreshold, 1, 0, 0.5);
    text(`Noise Volume: ${noiseVolume.toFixed(2)}`, 10, 100);
  } else {
    text(`Noise Volume: 0.00`, 10, 100);
  }

  const remainingBalls = gridCircles.filter((c) => !c.isOffScreen).length;
  text(`Remaining: ${remainingBalls}/${gridCircles.length}`, 10, 120);
}
