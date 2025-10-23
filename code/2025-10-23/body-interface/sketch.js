// let rightEyeToggle = false;

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
  // drawVideo(10);
  // drawFaceDetections();
  // drawHandsDetections();
  background(360, 100, 100, 1);

  noStroke();
  if (rightEyeToggle) {
    fill(0, 255, 0);
    text("Right eye is ON", 10, 30);
  } else {
    fill(0, 255, 0);
    text("Right eye is OFF", 10, 30);
  }

  if (leftEyeToggle) {
    fill(240, 100, 50);
    text("Left eye is ON", 10, 60);
  } else {
    fill(240, 100, 50);
    text("Left eye is OFF", 10, 60);
  }

  // display text "right eye" on the righ eye position
  if (rightEyeToggle && rightEye) {
    fill(0, 255, 0);
    text("Right Eye", rightEye.x * width, rightEye.y * height);
  }

  // display text "left eye" on the left eye position
  if (leftEyeToggle && leftEye) {
    fill(240, 100, 50);
    text("Left Eye", leftEye.x * width, leftEye.y * height);
  }
}
