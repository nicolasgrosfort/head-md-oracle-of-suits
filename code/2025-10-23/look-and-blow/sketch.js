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
    this.velocityX = 0;
    this.velocityY = 0;
    this.friction = 0.5; // friction to slow down the balls
  }

  update(pointerX, pointerY, pointerRadius, pushForce) {
    // Calculate distance from pointer
    const dx = this.x - pointerX;
    const dy = this.y - pointerY;
    const distance = sqrt(dx * dx + dy * dy);

    // Check if pointer is close enough to push
    const influenceRadius = pointerRadius + 10;
    if (distance < influenceRadius && distance > 0) {
      // Calculate push strength (stronger when closer)
      const pushStrength = map(distance, 0, influenceRadius, 1, 0);

      // Random distance multiplier for each ball (0.5 to 1.5)
      const randomDistance = random(0.5, 1.5);

      // Apply push force with random distance
      const force = pushStrength * pushForce * randomDistance;
      const pushX = (dx / distance) * force * 30;
      const pushY = (dy / distance) * force * 30;

      // Add to velocity instead of directly to position for more natural motion
      this.velocityX += pushX;
      this.velocityY += pushY;
    }

    // Apply velocity to position
    this.x += this.velocityX;
    this.y += this.velocityY;

    // Apply friction
    this.velocityX *= this.friction;
    this.velocityY *= this.friction;

    // Return to home position with spring effect
    const returnSpeed = 0.05;
    const homeForceX = (this.homeX - this.x) * returnSpeed;
    const homeForceY = (this.homeY - this.y) * returnSpeed;

    this.velocityX += homeForceX;
    this.velocityY += homeForceY;
  }

  display() {
    fill(100, 150, 255);
    noStroke();
    circle(this.x, this.y, this.size);
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  setupFace();
  setupVideo();

  pointerX = width / 2;
  pointerY = height / 2;

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
}
