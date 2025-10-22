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
  setupHands();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  drawVideo();
  background(132, 95, 58, 0.8);
}
