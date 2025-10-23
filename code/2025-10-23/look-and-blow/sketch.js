// the blendshapes we are going to track
let leftEyeBlink = 0.0;
let rightEyeBlink = 0.0;
let jawOpen = 0.0;
let mouthPucker = 0.0;

// pointer position
let pointerX = 0;
let pointerY = 0;

// circle size
let circleSize = 20;
const minCircleSize = 20;
const maxCircleSize = 100;

// smoothing factors
const positionSmoothing = 0.3;
const sizeSmoothing = 0.15;

function setup() {
  createCanvas(windowWidth, windowHeight);

  setupFace();
  setupVideo();

  pointerX = width / 2;
  pointerY = height / 2;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
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

  // Draw the pointer with variable size
  fill(255, 0, 0);
  noStroke();
  circle(pointerX, pointerY, circleSize);

  // Optional: draw a crosshair
  stroke(255, 0, 0);
  strokeWeight(2);
  const crosshairSize = circleSize * 0.75;
  line(pointerX - crosshairSize, pointerY, pointerX + crosshairSize, pointerY);
  line(pointerX, pointerY - crosshairSize, pointerX, pointerY + crosshairSize);

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
    `Mouth Pucker: ${mouthPucker.toFixed(2)} | Size: ${circleSize.toFixed(0)}`,
    10,
    80
  );
}
