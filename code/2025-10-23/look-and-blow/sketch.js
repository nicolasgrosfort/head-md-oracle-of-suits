// the blendshapes we are going to track
let leftEyeBlink = 0.0;
let rightEyeBlink = 0.0;
let jawOpen = 0.0;

// pointer position
let pointerX = 0;
let pointerY = 0;

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
      pointerX = map(avgX, 0.65, 0.45, 0, width);
      pointerY = map(avgY, 0.45, 0.65, 0, height);

      const targetX = pointerX;
      const targetY = pointerY;

      pointerX = lerp(pointerX, targetX, 0.3);
      pointerY = lerp(pointerY, targetY, 0.3);
    }
  }

  // Draw the pointer
  fill(255, 0, 0);
  noStroke();
  circle(pointerX, pointerY, 20);

  // Optional: draw a crosshair
  stroke(255, 0, 0);
  strokeWeight(2);
  line(pointerX - 15, pointerY, pointerX + 15, pointerY);
  line(pointerX, pointerY - 15, pointerX, pointerY + 15);

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
}
