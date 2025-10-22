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
  drawVideo(1);
  drawFaceDetections();
  drawHandsDetections();
  // background(132, 95, 58, 0.8);
}
