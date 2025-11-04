let mainGraphics;
let loupeGraphics;
let loupeSize = 250;
let zoomFactor = 4;
let pxd = 8;
let blr = 4;

let cards = [];

let cardImages = []; // Tableau pour stocker les images

function preload() {
  const imageUrls = [
    "https://picsum.photos/200/300?random=1",
    "https://picsum.photos/200/300?random=2",
    "https://picsum.photos/200/300?random=3",
    "https://picsum.photos/200/300?random=4",
    "https://picsum.photos/200/300?random=5",
  ];

  for (let url of imageUrls) {
    cardImages.push(loadImage(url));
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);

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
      imageIndex: floor(random(cardImages.length)),
    });
  }

  mainGraphics = createGraphics(windowWidth, windowHeight);
  mainGraphics.pixelDensity(1);

  loupeGraphics = createGraphics(windowWidth, windowHeight);
  loupeGraphics.pixelDensity(pxd);
}

function draw() {
  drawScene(mainGraphics, false); // Version normale
  drawScene(loupeGraphics, true); // Version pour la loupe

  image(mainGraphics, 0, 0);

  filter(BLUR, blr);

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

function drawScene(pg, isLoupeVersion) {
  pg.background(0);

  for (let card of cards) {
    // Mise à jour position (seulement pour la version principale)
    if (!isLoupeVersion) {
      card.x += card.speedX;
      card.y += card.speedY;

      if (card.x < 0 || card.x > pg.width) {
        card.speedX *= -1;
      }
      if (card.y < 0 || card.y > pg.height) {
        card.speedY *= -1;
      }

      card.rotationY += card.rotationSpeed;
      card.floatOffset += card.floatSpeed;
    }

    // Dessiner la carte
    drawCard(pg, card, isLoupeVersion);
  }
}

function drawCard(pg, card, isLoupeVersion) {
  pg.push();

  let floatY = card.y + sin(card.floatOffset) * card.floatAmplitude;
  pg.translate(card.x, floatY);

  let apparentWidth = cos(card.rotationY) * card.width;

  // Afficher l'image seulement si la carte est de face
  if (cos(card.rotationY) > 0 && cardImages[card.imageIndex]) {
    // Créer un masque avec les coins arrondis
    pg.push();
    pg.drawingContext.save();

    // Créer le chemin arrondi
    let w = abs(apparentWidth);
    let h = card.height;
    let r = 5; // Rayon des coins

    pg.drawingContext.beginPath();
    pg.drawingContext.moveTo(-w / 2 + r, -h / 2);
    pg.drawingContext.lineTo(w / 2 - r, -h / 2);
    pg.drawingContext.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
    pg.drawingContext.lineTo(w / 2, h / 2 - r);
    pg.drawingContext.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
    pg.drawingContext.lineTo(-w / 2 + r, h / 2);
    pg.drawingContext.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
    pg.drawingContext.lineTo(-w / 2, -h / 2 + r);
    pg.drawingContext.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
    pg.drawingContext.closePath();
    pg.drawingContext.clip();

    pg.imageMode(CENTER);

    // Appliquer un tint différent selon la version
    if (isLoupeVersion) {
      pg.tint(255, 200, 200);
    } else {
      pg.tint(255);
    }

    // Dessiner l'image
    pg.image(cardImages[card.imageIndex], 0, 0, w, h);

    pg.noTint();
    pg.drawingContext.restore();
    pg.pop();
  } else {
    // Verso de la carte (gris)
    pg.fill(230);
    pg.noStroke();
    pg.rectMode(CENTER);
    pg.rect(0, 0, abs(apparentWidth), card.height, 5);
  }

  // Bordure de la carte (par-dessus l'image)
  pg.noFill();
  pg.stroke(255);
  pg.strokeWeight(2);
  pg.rectMode(CENTER);
  pg.rect(0, 0, abs(apparentWidth), card.height, 5);

  pg.pop();
}

function drawMagnifier() {
  let copySize = loupeSize / zoomFactor;
  let sx = mouseX - copySize / 2;
  let sy = mouseY - copySize / 2;

  push();
  // Utiliser loupeGraphics au lieu de mainGraphics
  let zoomedRegion = loupeGraphics.get(sx, sy, copySize, copySize);

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
