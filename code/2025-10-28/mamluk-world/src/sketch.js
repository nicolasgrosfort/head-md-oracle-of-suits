let pg; // Buffer pour la scène principale
let zoomPg; // Buffer pour la vue zoomée
let cam; // Caméra pour la scène principale

let zoomFactor = 8; // Facteur de zoom
let zoomSize = 240;

let handX, handY;
let prevHandX = 0,
  prevHandY = 0;
let smoothingFactor = 0.2;

let words = [];

let isAnyHand = false;

const Z_MAX = 50;

const cardGameWords = [
  "Ace",
  "Deck",
  "Shuffle",
  "Joker",
  "Deal",
  "Hand",
  "Trick",
  "Trump",
  "Spade",
  "Heart",
  "Diamond",
  "Club",
  "Card",
  "Table",
  "Game",
  "Player",
  "Bet",
  "Ante",
  "Raise",
  "Fold",
  "Call",
  "Bluff",
  "Draw",
  "Discard",
  "Wild",
  "Stack",
  "Point",
  "Score",
  "Turn",
  "Round",
  "Suit",
  "Rank",
  "Face",
  "Cardboard",
  "Tableau",
  "Pinochle",
  "Bridge",
  "Poker",
  "Rummy",
  "Solitaire",
  "Tarot",
  "Canasta",
  "Whist",
  "Euchre",
  "Cribbage",
  "Go Fish",
  "Old Maid",
  "War",
  "Snap",
  "Baccarat",
  "Blackjack",
  "Texas Hold'em",
  "Omaha",
  "Seven Card Stud",
  "Cut",
  "Split",
  "High",
  "Low",
  "Pot",
  "Chips",
  "Casino",
  "Gamble",
  "Wager",
  "Odds",
  "Strategy",
  "Tactics",
  "Skill",
  "Luck",
  "Game Theory",
  "Session",
  "Tournament",
  "Cash Game",
  "Blind",
  "Straddle",
  "Check",
  "All-in",
  "Showdown",
  "Community Cards",
  "Flop",
  "Turn",
  "River",
  "Betting Round",
  "Action",
  "Table Stakes",
  "Pit Boss",
  "Dealer",
  "Croupier",
  "House",
  "Payout",
  "Rake",
  "Split Pot",
  "Side Pot",
  "Muck",
  "Burn",
  "Drawing Dead",
  "Outs",
  "Equity",
  "Range",
  "Nuts",
  "Value Bet",
  "Bluff Catcher",
  "Hero Call",
  "Fish",
  "Shark",
  "Tilt",
  "Variance",
  "Session",
  "Bankroll",
  "Chip Lead",
  "Bubble",
];

function preload() {
  // Charger une police pour WEBGL
  myFont = loadFont(
    "https://cdnjs.cloudflare.com/ajax/libs/topcoat/0.8.0/font/SourceCodePro-Regular.otf"
  );
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  zoomPg = createGraphics(300, 300, WEBGL); // Taille du cercle de zoom

  textFont(myFont);
  textAlign(CENTER, CENTER);

  zoomPg.textFont(myFont);
  zoomPg.textAlign(CENTER, CENTER);

  for (let i = 0; i < 100; i++) {
    const x = random(-width * 0.5, width * 0.5);
    const y = random(-height * 0.5, height * 0.5);
    const z = random(-10, 10);
    const size = random(4, 8);
    words.push({ x, y, z, text: random(cardGameWords), size });
  }

  cam = createCamera();
  setCamera(cam);

  createHandTracker({
    maxHands: 1,
    selfieMode: true,
  });
}

function draw() {
  background(255);

  updateHandData();

  // Dessiner la scène principale
  push();
  orbitControl();
  drawScene(this);
  pop();

  if (!isAnyHand) {
    return;
  }

  // Créer la vue zoomée
  zoomPg.push();

  // Copier les paramètres de la caméra principale
  zoomPg.camera(
    cam.eyeX,
    cam.eyeY,
    cam.eyeZ,
    cam.centerX,
    cam.centerY,
    cam.centerZ,
    cam.upX,
    cam.upY,
    cam.upZ
  );

  // Calculer la distance de la caméra au centre
  let camDistance = dist(
    cam.eyeX,
    cam.eyeY,
    cam.eyeZ,
    cam.centerX,
    cam.centerY,
    cam.centerZ
  );

  // Translater vers la zone survolée
  const zoomX = -(handX - width * 0.5) * zoomFactor;
  const zoomY = -(handY - height * 0.5) * zoomFactor;
  zoomPg.translate(zoomX, zoomY, Z_MAX);

  // Appliquer le zoom
  zoomPg.scale(zoomFactor);

  drawScene(zoomPg);
  zoomPg.pop();

  // Créer le masque circulaire
  let maskGraphics = createGraphics(zoomSize, zoomSize);
  maskGraphics.textFont(myFont);
  maskGraphics.textAlign(CENTER, CENTER);
  maskGraphics.fill(255);
  maskGraphics.circle(zoomSize / 2, zoomSize / 2, zoomSize);

  // Appliquer le masque
  let masked = zoomPg.get();
  masked.mask(maskGraphics);

  // Afficher le cercle à la position de la souris
  push();
  translate(-width * 0.5 + handX, -height * 0.5 + handY, Z_MAX);
  texture(masked);
  noStroke();
  circle(0, 0, zoomSize);

  // Ajouter un contour au cercle
  noFill();
  stroke(0);
  strokeWeight(2);
  circle(0, 0, zoomSize);
  pop();
}

function drawScene(renderer) {
  renderer.push();
  renderer.background(255);

  // add 100 random text insite the scene
  for (let i = 0; i < words.length; i++) {
    const { x, y, z, text, size } = words[i];
    renderer.push();
    renderer.translate(x, y, z);
    renderer.fill(0);
    renderer.textSize(size);
    renderer.text(text, 0, 0);
    renderer.pop();
  }

  // Utiliser une échelle basée sur la taille de la fenêtre
  let scaleX = width * 0.15;
  let scaleY = height * 0.15;

  // Sphères de différentes tailles
  renderer.push();
  renderer.translate(scaleX * 0.5, -scaleY * 0.4, 20);
  renderer.fill(255, 100, 100);
  renderer.sphere(8);
  renderer.pop();

  renderer.push();
  renderer.translate(-scaleX * 0.8, scaleY * 0.27, -10);
  renderer.fill(100, 255, 100);
  renderer.sphere(12);
  renderer.pop();

  renderer.push();
  renderer.translate(scaleX * 0.33, scaleY * 0.6, 30);
  renderer.fill(100, 100, 255);
  renderer.sphere(6);
  renderer.pop();

  // Éléments aux extrémités
  // Coin supérieur gauche
  renderer.push();
  renderer.translate(-scaleX * 1.8, -scaleY * 1.5, 0);
  renderer.fill(255, 180, 100);
  renderer.sphere(10);
  renderer.pop();

  // Coin supérieur droit
  renderer.push();
  renderer.translate(scaleX * 1.9, -scaleY * 1.6, 15);
  renderer.fill(180, 100, 255);
  renderer.box(12);
  renderer.pop();

  // Coin inférieur gauche
  renderer.push();
  renderer.translate(-scaleX * 1.7, scaleY * 1.7, -20);
  renderer.fill(100, 255, 180);
  renderer.cone(8, 18);
  renderer.pop();

  // Coin inférieur droit
  renderer.push();
  renderer.translate(scaleX * 2, scaleY * 1.8, 10);
  renderer.fill(255, 100, 180);
  renderer.cylinder(6, 15);
  renderer.pop();

  // Bord gauche milieu
  renderer.push();
  renderer.translate(-scaleX * 1.9, 0, 5);
  renderer.fill(200, 255, 100);
  renderer.torus(8, 2);
  renderer.pop();

  // Bord droit milieu
  renderer.push();
  renderer.translate(scaleX * 2.1, scaleY * 0.1, -10);
  renderer.fill(100, 200, 255);
  renderer.box(10);
  renderer.pop();

  // Bord haut milieu
  renderer.push();
  renderer.translate(scaleX * 0.2, -scaleY * 1.7, 20);
  renderer.fill(255, 200, 200);
  renderer.sphere(7);
  renderer.pop();

  // Bord bas milieu
  renderer.push();
  renderer.translate(-scaleX * 0.15, scaleY * 1.9, -15);
  renderer.fill(200, 200, 255);
  renderer.cylinder(5, 12);
  renderer.pop();

  // Cônes variés
  renderer.push();
  renderer.translate(-scaleX * 0.53, -scaleY * 0.6, 0);
  renderer.fill(255, 255, 100);
  renderer.cone(6, 15);
  renderer.pop();

  renderer.push();
  renderer.translate(scaleX * 0.8, scaleY * 0.47, -20);
  renderer.fill(255, 150, 200);
  renderer.cone(4, 10);
  renderer.pop();

  // Cylindres
  renderer.push();
  renderer.translate(-scaleX, -scaleY * 0.2, 10);
  renderer.fill(150, 200, 255);
  renderer.cylinder(5, 20);
  renderer.pop();

  renderer.push();
  renderer.translate(scaleX * 0.27, -scaleY * 0.8, -15);
  renderer.fill(200, 150, 100);
  renderer.cylinder(3, 12);
  renderer.pop();

  // Torus (anneaux)
  renderer.push();
  renderer.translate(-scaleX * 0.27, scaleY * 0.8, 25);
  renderer.fill(255, 200, 100);
  renderer.torus(10, 3);
  renderer.pop();

  renderer.push();
  renderer.translate(scaleX * 1.07, -scaleY * 0.27, 0);
  renderer.fill(100, 200, 200);
  renderer.torus(7, 2);
  renderer.pop();

  // Plus d'éléments dispersés
  renderer.push();
  renderer.translate(-scaleX * 0.6, scaleY * 0.3, 35);
  renderer.fill(150, 255, 150);
  renderer.box(8);
  renderer.pop();

  renderer.push();
  renderer.translate(scaleX * 0.9, -scaleY * 0.15, -25);
  renderer.fill(255, 150, 150);
  renderer.sphere(5);
  renderer.pop();

  renderer.push();
  renderer.translate(-scaleX * 1.3, -scaleY * 1.2, 12);
  renderer.fill(180, 220, 255);
  renderer.cone(5, 14);
  renderer.pop();

  renderer.push();
  renderer.translate(scaleX * 1.4, scaleY * 1.1, -8);
  renderer.fill(255, 220, 180);
  renderer.torus(6, 2);
  renderer.pop();

  renderer.pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function updateHandData() {
  if (hands.length > 0) {
    for (let i = 0; i < hands.length; i++) {
      const hand = hands[i];

      isAnyHand = true;

      let angle = angleBetweenPoints(hand.indexFinger[0], hand.thumb[0]) - 0.5;
      angle = constrain(angle, 0, 2);

      const rawPalmX = hand.palm.x;
      const rawPalmY = hand.palm.y;

      // Appliquer un lissage progressif
      const targetX = rawPalmX * width;
      const targetY = rawPalmY * height;

      // Si c'est la première frame, initialiser les valeurs
      if (prevHandX === 0 && prevHandY === 0) {
        handX = targetX;
        handY = targetY;
      } else {
        // Appliquer le lissage exponentiel
        handX = lerp(prevHandX, targetX, smoothingFactor);
        handY = lerp(prevHandY, targetY, smoothingFactor);
      }

      zoomFactor = map(angle, 0, PI / 2, 1, 16);
      zoomSize = map(angle, 0, PI / 2, 240, 480);

      // Sauvegarder les valeurs pour la prochaine frame
      prevHandX = handX;
      prevHandY = handY;
    }
  } else {
    isAnyHand = false;
  }
}
