// let rightEyeToggle = false;

let hasTouchedBody = false;

const CONFIG = {
  video: {
    width: 640,
    height: 480,
  },
};

function setup() {
  createCanvas(windowWidth, windowHeight);

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
  drawVideo(20);

  background(360, 100, 100, 0.8);

  textAlign(LEFT, CENTER);
  fill(0);

  noStroke();

  // display text "right eye" on the righ eye position
  if (rightEyeToggle && rightEye) {
    text("Right Eye", rightEye.x * width, rightEye.y * height);
  }

  // display text "left eye" on the left eye position
  if (leftEyeToggle && leftEye) {
    text("Left Eye", leftEye.x * width, leftEye.y * height);
  }

  if ((!hasTouchedBody && rightEyeToggle) || leftEyeToggle) {
    hasTouchedBody = true;
  }

  if (!hasTouchedBody) {
    textAlign(CENTER, CENTER);
    text("show me where your eyes are", width / 2, height / 2);
  }
}
