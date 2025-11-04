let mainGraphics;
let loupeSize = 250;
let zoomFactor = 6;

const pxd = 8;

let cards = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(pxd);

  for (let i = 0; i < 100; i++) {
    cards.push({
      x: random(width),
      y: random(height),
      width: 20,
      height: 35,
      rotationY: random(TWO_PI),
      rotationSpeed: random(-0.005, 0.005),
      floatOffset: random(TWO_PI),
      floatSpeed: random(0.01, 0.01),
      floatAmplitude: random(5, 15),
      speedX: random(-0.1, 0.1),
      speedY: random(-0.1, 0.1),
      label: `Carte ${i + 1}`,
    });
  }

  mainGraphics = createGraphics(windowWidth, windowHeight);
  mainGraphics.pixelDensity(pxd);
}

function draw() {
  drawScene(mainGraphics);
  image(mainGraphics, 0, 0);

  let hoveredCard = getHoveredCard();

  drawMagnifier();

  if (hoveredCard) {
    displayLabel(hoveredCard);
  }
}

function displayLabel(card) {
  push();

  let labelX = mouseX;
  let labelY = mouseY - loupeSize / 2 - 30;

  fill(0, 0, 0, 200);
  noStroke();
  textSize(16);
  textAlign(CENTER, CENTER);
  let padding = 10;
  let labelWidth = textWidth(card.label) + padding * 2;
  let labelHeight = 30;

  rect(
    labelX - labelWidth / 2,
    labelY - labelHeight / 2,
    labelWidth,
    labelHeight,
    5
  );

  fill(255);
  text(card.label, labelX, labelY);

  stroke(255);
  strokeWeight(2);
  line(labelX, labelY + labelHeight / 2, mouseX, mouseY - loupeSize / 2);

  pop();
}

function getHoveredCard() {
  for (let card of cards) {
    let apparentWidth = abs(cos(card.rotationY)) * card.width;
    let floatY = card.y + sin(card.floatOffset) * card.floatAmplitude;

    if (
      mouseX > card.x - apparentWidth / 2 &&
      mouseX < card.x + apparentWidth / 2 &&
      mouseY > floatY - card.height / 2 &&
      mouseY < floatY + card.height / 2
    ) {
      return card;
    }
  }
  return null;
}

function drawScene(pg) {
  pg.background(0);

  for (let card of cards) {
    // Mise à jour position
    card.x += card.speedX;
    card.y += card.speedY;

    if (card.x < 0 || card.x > pg.width) {
      card.speedX *= -1;
    }
    if (card.y < 0 || card.y > pg.height) {
      card.speedY *= -1;
    }

    // Mise à jour rotation et flottement
    card.rotationY += card.rotationSpeed;
    card.floatOffset += card.floatSpeed;

    // Dessiner la carte
    drawCard(pg, card);
  }
}

function drawCard(pg, card) {
  pg.push();

  // Position avec flottement
  let floatY = card.y + sin(card.floatOffset) * card.floatAmplitude;
  pg.translate(card.x, floatY);

  // Calculer la largeur apparente avec la rotation (perspective simple)
  let apparentWidth = cos(card.rotationY) * card.width;

  // Couleur de la carte (recto/verso)
  let cardColor = abs(cos(card.rotationY)) > 0.5 ? 255 : 255;

  // Carte - utiliser abs() pour éviter les dimensions négatives
  pg.fill(cardColor);
  pg.stroke(0);
  pg.strokeWeight(2);
  pg.rectMode(CENTER); // Utiliser le mode CENTER pour éviter les problèmes
  pg.rect(0, 0, abs(apparentWidth), card.height, 5);

  pg.pop();
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
