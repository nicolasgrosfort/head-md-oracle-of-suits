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
    this.friction = 0.75; // very low friction so balls keep moving
    this.isOffScreen = false;
  }

  update(pointerX, pointerY, pointerRadius, pushForce, canBlow) {
    // Skip if already off screen
    if (this.isOffScreen) return;

    // Only apply push force if canBlow is true
    if (canBlow) {
      // Calculate distance from pointer
      const dx = this.x - pointerX;
      const dy = this.y - pointerY;
      const distance = sqrt(dx * dx + dy * dy);

      // Check if pointer is close enough to push
      const influenceRadius = pointerRadius + 10;
      if (distance < influenceRadius && distance > 0) {
        // Calculate push strength (stronger when closer)
        const pushStrength = map(distance, 0, influenceRadius, 1, 0);

        // Random distance multiplier for each ball (0.5 to 2)
        const randomDistance = random(0.5, 2);

        // Apply push force with random distance
        const force = pushStrength * pushForce * randomDistance;
        const pushX = (dx / distance) * force * 30;
        const pushY = (dy / distance) * force * 30;

        // Add to velocity instead of directly to position for more natural motion
        this.velocityX += pushX;
        this.velocityY += pushY;
      }
    }

    // Apply velocity to position
    this.x += this.velocityX;
    this.y += this.velocityY;

    // Apply friction
    this.velocityX *= this.friction;
    this.velocityY *= this.friction;

    // Check if ball is off screen and mark as off screen (don't respawn)
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
    // Don't display if off screen
    if (this.isOffScreen) return;

    fill(0, 0, 0);
    noStroke();
    // circle(this.x, this.y, this.size);
    rectMode(CENTER);
    rect(this.x, this.y, this.size, this.size);
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);

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

function draw() {
  getFaceLandmarks();

  background(255);
  drawVideo(5);

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
      const targetY = map(avgY, 0.4, 0.6, 0, height);

      // Smooth position with lerp
      pointerX = lerp(pointerX, targetX, positionSmoothing);
      pointerY = lerp(pointerY, targetY, positionSmoothing);
    }
  }

  // Check if mouthPucker is above threshold
  const canBlow = mouthPucker > blowThreshold;

  // Track if user has started blowing
  if (canBlow) {
    hasStartedBlowing = true;
  }

  // Map mouthPucker (0-1) to circle size and smooth it
  const targetSize = map(
    mouthPucker,
    blowThreshold,
    1,
    minCircleSize,
    maxCircleSize
  );
  circleSize = lerp(circleSize, targetSize, sizeSmoothing);

  // Calculate push force based on mouthPucker (1 = normal, up to 5 = strong push)
  const pushForce = map(mouthPucker, 0, 1, 1, 5);

  // Update and display grid circles
  for (let circle of gridCircles) {
    circle.update(pointerX, pointerY, circleSize / 2, pushForce, canBlow);
    circle.display();
  }

  // Show instruction message if user hasn't started blowing
  if (!hasStartedBlowing) {
    // Semi-transparent overlay
    fill(0, 0, 0, 150);
    noStroke();
    rect(0, height / 2 - 80, width, 160);

    // Main message
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(16);
    text("blow on your screen ", width / 2, height / 2 - 20);

    // Reset text align for debug info
    textAlign(LEFT, TOP);
  }

  // Debug info
  fill(0);
  noStroke();
  textSize(16);
  textAlign(LEFT, TOP);
  text(`Mouth Pucker: ${mouthPucker.toFixed(2)}`, 10, 20);
  text(`Can Blow: ${canBlow ? "YES" : "NO"}`, 10, 40);
  text(`Push Force: ${pushForce.toFixed(1)}x`, 10, 60);

  // Count remaining balls
  const remainingBalls = gridCircles.filter((c) => !c.isOffScreen).length;
  text(`Remaining: ${remainingBalls}/${gridCircles.length}`, 10, 80);

  // Count moving balls
  const movingBalls = gridCircles.filter((c) => {
    if (c.isOffScreen) return false;
    const speed = sqrt(c.velocityX * c.velocityX + c.velocityY * c.velocityY);
    return speed > 0.1;
  }).length;
  text(`Moving: ${movingBalls}`, 10, 100);
}
