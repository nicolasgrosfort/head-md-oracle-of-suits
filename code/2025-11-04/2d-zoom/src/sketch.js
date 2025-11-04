let mainGraphics;
let loupeSize = 200;
let zoomFactor = 8;

const pxd = 8;

let circles = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(pxd);

  for (let i = 0; i < 100; i++) {
    circles.push({
      x: random(width),
      y: random(height),
      size: random(10, 50),
      color: [random(255), random(255), random(255)],
      speedX: random(-1, 1),
      speedY: random(-1, 1),
      label: `Circle ${i + 1}`,
    });
  }

  mainGraphics = createGraphics(windowWidth, windowHeight);
  mainGraphics.pixelDensity(pxd);
}

function draw() {
  drawScene(mainGraphics);
  image(mainGraphics, 0, 0);

  let hoveredCircle = getHoveredCircle();

  drawMagnifier();

  if (hoveredCircle) {
    displayLabel(hoveredCircle);
  }
}

function displayLabel(circle) {
  push();

  let labelX = mouseX;
  let labelY = mouseY - loupeSize / 2 - 30;

  fill(0, 0, 0, 200);
  noStroke();
  textSize(16);
  textAlign(CENTER, CENTER);
  let padding = 10;
  let labelWidth = textWidth(circle.label) + padding * 2;
  let labelHeight = 30;

  rect(
    labelX - labelWidth / 2,
    labelY - labelHeight / 2,
    labelWidth,
    labelHeight,
    5
  );

  fill(255);
  text(circle.label, labelX, labelY);

  stroke(255);
  strokeWeight(2);
  line(labelX, labelY + labelHeight / 2, mouseX, mouseY - loupeSize / 2);

  pop();
}

function getHoveredCircle() {
  for (let circle of circles) {
    let distance = dist(mouseX, mouseY, circle.x, circle.y);
    if (distance < circle.size / 2) {
      return circle;
    }
  }
  return null;
}

function drawScene(pg) {
  pg.background(220);

  for (let circle of circles) {
    circle.x += circle.speedX;
    circle.y += circle.speedY;

    if (circle.x < 0 || circle.x > pg.width) {
      circle.speedX *= -1;
    }
    if (circle.y < 0 || circle.y > pg.height) {
      circle.speedY *= -1;
    }

    pg.fill(circle.color);
    pg.noStroke();
    pg.circle(circle.x, circle.y, circle.size);
  }

  pg.fill(255, 0, 0);
  pg.rect(100, 100, 150, 100);

  pg.fill(0, 255, 0);
  pg.rect(400, 300, 100, 150);

  pg.fill(0, 0, 255);
  pg.rect(600, 500, 120, 80);
}

function drawMagnifier() {
  let copySize = loupeSize / zoomFactor;
  let sx = mouseX - copySize / 2;
  let sy = mouseY - copySize / 2;

  push();
  let zoomedRegion = mainGraphics.get(sx, sy, copySize, copySize);

  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.arc(mouseX, mouseY, loupeSize / 2, 0, TWO_PI);
  drawingContext.clip();

  image(
    zoomedRegion,
    mouseX - loupeSize / 2,
    mouseY - loupeSize / 2,
    loupeSize,
    loupeSize
  );

  drawingContext.restore();

  noFill();
  stroke(50);
  strokeWeight(4);
  circle(mouseX, mouseY, loupeSize);
  pop();
}
