let overlay;

function setup() {
  textFont("Monospace");

  createCanvas(windowWidth, windowHeight);
  noStroke();

  overlay = createGraphics(windowWidth, windowHeight);
  overlay.noStroke();

  createHandTracker({
    maxHands: 2,
    selfieMode: true,
  });
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  overlay = createGraphics(windowWidth, windowHeight);
  overlay.noStroke();
}

function draw() {
  drawScene();

  overlay.clear();
  overlay.fill(0);
  overlay.noStroke();
  overlay.rect(0, 0, overlay.width, overlay.height);

  if (hands.length > 0) {
    for (let i = 0; i < hands.length; i++) {
      const hand = hands[i];

      let angle = angleBetweenPoints(hand.indexFinger[0], hand.thumb[0]) - 0.5;
      angle = constrain(angle, 0, 2);

      const rawAngle = angle;
      const rawPalmX = hand.palm.x;
      const rawPalmY = hand.palm.y;

      angle = lerp(angle, rawAngle, 0.95);
      const palmX = lerp(hand.palm.x, rawPalmX, 0.95);
      const palmY = lerp(hand.palm.y, rawPalmY, 0.95);

      const size = map(angle, 0, PI / 2, 10, 500);

      overlay.erase();
      overlay.circle(palmX * width, palmY * height, size);
      overlay.noErase();
      overlay.stroke(255);
      overlay.noFill();
      overlay.circle(palmX * width, palmY * height, size);
    }
  }

  image(overlay, 0, 0);

  if (hands.length <= 0) {
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(24);
    text("Your hands are flashlights 🔦", width / 2, height / 2);
  }
}

function drawScene() {
  showHandVideo();

  background(0, 0, 0, 200);

  push();
  translate(width / 2, height / 2);
  fill(80, 160, 255);
  circle(160 * sin(frameCount * 0.01), 0, 120);

  fill(255, 130, 80);
  rotate(frameCount * 0.01);
  rect(-60, -60, 120, 120, 16);
  pop();

  fill(160, 255, 140);
  triangle(80, height - 80, 200, height - 180, 320, height - 60);
}
