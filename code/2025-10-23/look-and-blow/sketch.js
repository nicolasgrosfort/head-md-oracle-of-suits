// the blendshapes we are going to track
let leftEyeBlink = 0.0;
let rightEyeBlink = 0.0;
let jawOpen = 0.0;
let mouthPucker = 0.0;

// pointer position
let pointerX = 0;
let pointerY = 0;

// circle size
let circleSize = 10;
const minCircleSize = 10;
const maxCircleSize = 400;

// smoothing factors
const positionSmoothing = 0.3;
const sizeSmoothing = 0.15;

// grid settings
const gridSpacing = 15;
let gridCircles = [];

// Grid circle class
class GridCircle {
  constructor(x, y) {
    this.homeX = x;
    this.homeY = y;
    this.x = x;
    this.y = y;
    this.size = 10;
  }

  update(pointerX, pointerY, pointerRadius, pushForce) {
    // Calculate distance from pointer
    const dx = this.x - pointerX;
    const dy = this.y - pointerY;
    const distance = sqrt(dx * dx + dy * dy);

    // Check if pointer is close enough to push
    const influenceRadius = pointerRadius + 10;
    if (distance < influenceRadius) {
      // Calculate push strength (stronger when closer)
      const pushStrength = map(distance, 0, influenceRadius, 1, 0);

      // Apply push force (multiplied by mouthPucker effect)
      const force = pushStrength * pushForce;
      const pushX = (dx / distance) * force * 30;
      const pushY = (dy / distance) * force * 30;

      this.x += pushX;
      this.y += pushY;
    }

    // Return to home position with spring effect
    const returnSpeed = 0.1;
    this.x = lerp(this.x, this.homeX, returnSpeed);
    this.y = lerp(this.y, this.homeY, returnSpeed);
  }

  display() {
    fill(100, 150, 255);
    noStroke();
    circle(this.x, this.y, this.size);

    // Optional: draw a subtle line to home position
    // stroke(100, 150, 255, 50);
    // strokeWeight(1);
    // line(this.x, this.y, this.homeX, this.homeY);
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  setupFace();
  setupVideo();

  pointerX = width / 2;
  pointerY = height / 2;

  // Create grid of circles
  createGrid();
}

function createGrid() {
  gridCircles = [];
  for (let x = gridSpacing * 0.5; x < width; x += gridSpacing) {
    for (let y = gridSpacing * 0.5; y < height; y += gridSpacing) {
      gridCircles.push(new GridCircle(x, y));
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  createGrid();
}

function draw() {
  getFaceLandmarks();

  background(255);

  leftEyeBlink = getBlendshapeScore("eyeBlinkLeft");
  rightEyeBlink = getBlendshapeScore("eyeBlinkRight");
  jawOpen = getBlendshapeScore("jawOpen");
  mouthPucker = getBlendshapeScore("mouthPucker");

  // get the iris positions
  const faces = getFaceLandmarks();
  if (faces && faces.length > 0) {
    const landmarks = faces[0];

    // Left iris center is landmark 468
    // Right iris center is landmark 473
    const leftIris = landmarks[468];
    const rightIris = landmarks[473];

    if (leftIris && rightIris) {
      // Average both iris positions
      const avgX = (leftIris.x + rightIris.x) / 2;
      const avgY = (leftIris.y + rightIris.y) / 2;

      // Map normalized coordinates (0-1) to screen coordinates
      const targetX = map(avgX, 0.65, 0.45, 0, width);
      const targetY = map(avgY, 0.45, 0.65, 0, height);

      // Smooth position with lerp
      pointerX = lerp(pointerX, targetX, positionSmoothing);
      pointerY = lerp(pointerY, targetY, positionSmoothing);
    }
  }

  // Map mouthPucker (0-1) to circle size and smooth it
  const targetSize = map(mouthPucker, 0, 1, minCircleSize, maxCircleSize);
  circleSize = lerp(circleSize, targetSize, sizeSmoothing);

  // Calculate push force based on mouthPucker (1 = normal, up to 3 = strong push)
  const pushForce = map(mouthPucker, 0, 1, 1, 3);

  // Update and display grid circles
  for (let circle of gridCircles) {
    circle.update(pointerX, pointerY, circleSize / 2, pushForce);
    circle.display();
  }

  // Draw the pointer with variable size
  fill(255, 0, 0, 150);
  noStroke();
  // circle(pointerX, pointerY, circleSize);

  // Optional: draw a crosshair
  stroke(255, 0, 0);
  strokeWeight(2);
  const crosshairSize = circleSize * 0.75;
  // line(pointerX - crosshairSize, pointerY, pointerX + crosshairSize, pointerY);
  // line(pointerX, pointerY - crosshairSize, pointerX, pointerY + crosshairSize);

  // Debug info
  fill(0);
  noStroke();
  textSize(16);
  text(
    `Eyes Blink: L=${leftEyeBlink.toFixed(2)} R=${rightEyeBlink.toFixed(2)}`,
    10,
    20
  );
  text(`Jaw Open: ${jawOpen.toFixed(2)}`, 10, 40);
  text(`Pointer: ${pointerX.toFixed(0)}, ${pointerY.toFixed(0)}`, 10, 60);
  text(
    `Mouth Pucker: ${mouthPucker.toFixed(2)} | Size: ${circleSize.toFixed(
      0
    )} | Force: ${pushForce.toFixed(1)}x`,
    10,
    80
  );
}
