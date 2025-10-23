/** biome-ignore-all lint/correctness/noUnusedVariables: <> */

const INDICATOR_SIZE = 25;
const BRUSH_SIZE = 50;
const STROKE_WEIGHT = 2;

const painting = [];

const palette = {
  index: "🚀",
  middle: "💃",
  ring: "🤓",
  pinky: "❤️",
};

let currentPalette = palette.index;

function setup() {
  createCanvas(windowWidth, windowHeight);
  setupHands();
  setupVideo();
}

function windowResized() {
  resizeCanvas(800, 600);
}

function draw() {
  drawVideo();
  background(255, 255, 255, 200);

  textSize(12);
  textFont("Monospace");
  textAlign(LEFT, TOP);
  fill(0);
  noStroke();
  text(`> current icon: ${currentPalette}`, 20, 20);

  for (const dot of painting) {
    textSize(BRUSH_SIZE);
    textAlign(CENTER, CENTER);
    text(dot.icon, dot.x, dot.y);
  }

  if (detections) {
    for (let i = 0; i < detections.multiHandLandmarks.length; i++) {
      const hand = detections.multiHandLandmarks[i];
      const label = detections.multiHandedness[i].label;

      if (label === "Right") handleRightHand(hand);
      if (label === "Left") handleLeftHand(hand);
    }
  }
}

function isPinching(hand, fingerIndex, threshold = 0.05) {
  const thumbTip = hand[FINGER_TIPS.thumb];
  const fingerTip = hand[fingerIndex];
  const distance = dist(thumbTip.x, thumbTip.y, fingerTip.x, fingerTip.y);
  return distance < threshold;
}

function handleRightHand(hand) {
  const isIndexPinching = isPinching(hand, FINGER_TIPS.index);

  if (isIndexPinching) {
    const tip = hand[FINGER_TIPS.index];
    const x = tip.x * width;
    const y = tip.y * height;
    const icon = currentPalette;

    painting.push({ x, y, icon });

    fill(0, 0, 0, 10);
    stroke(0);
    strokeWeight(STROKE_WEIGHT);

    circle(x, y, BRUSH_SIZE * 1.5);
  } else {
    // Calculer l'angle entre le pouce et l'index
    const thumbTip = hand[FINGER_TIPS.thumb];
    const indexTip = hand[FINGER_TIPS.index];
    const thumbX = thumbTip.x * width;
    const thumbY = thumbTip.y * height;
    const indexX = indexTip.x * width;
    const indexY = indexTip.y * height;

    const angle = atan2(indexY - thumbY, indexX - thumbX);

    noFill();
    stroke(0);
    strokeWeight(STROKE_WEIGHT);

    // thumb
    push();
    translate(thumbX, thumbY);
    rotate(angle + PI);
    arc(0, 0, BRUSH_SIZE, BRUSH_SIZE, -HALF_PI, HALF_PI);
    pop();

    // index
    push();
    translate(indexX, indexY);
    rotate(angle);
    arc(0, 0, BRUSH_SIZE, BRUSH_SIZE, -HALF_PI, HALF_PI);
    pop();
  }
}

function handleLeftHand(hand) {
  const isIndexPinching = isPinching(hand, FINGER_TIPS.index);
  const isMiddlePinching = isPinching(hand, FINGER_TIPS.middle);
  const isRingPinching = isPinching(hand, FINGER_TIPS.ring);
  const isPinkyPinching = isPinching(hand, FINGER_TIPS.pinky);

  currentPalette = isIndexPinching
    ? palette.index
    : isMiddlePinching
    ? palette.middle
    : isRingPinching
    ? palette.ring
    : isPinkyPinching
    ? palette.pinky
    : currentPalette;

  for (const finger in FINGER_TIPS) {
    const tip = hand[FINGER_TIPS[finger]];
    const x = tip.x * width;
    const y = tip.y * height;

    textSize(INDICATOR_SIZE);
    textAlign(CENTER, CENTER);
    stroke(STROKE_WEIGHT);
    fill(0, 0, 0, 10);

    if (finger === "thumb") {
      text(currentPalette, x, y);
      circle(x, y, INDICATOR_SIZE * 1.5);
    } else {
      text(palette[finger], x, y);
    }
  }
}
