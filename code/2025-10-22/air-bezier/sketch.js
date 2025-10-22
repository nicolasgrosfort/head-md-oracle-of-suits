const STROKE_WIDTH = 100;
const margin = STROKE_WIDTH * 0.75;

let right = {};
let left = {};

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSL);
  setupHands();
  setupVideo();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  background(132, 95, 58);

  noFill();
  stroke(312, 85, 45);
  strokeWeight(STROKE_WIDTH);

  let leftIndex = left[FINGER_TIPS.index];
  let rightIndex = right[FINGER_TIPS.index];

  const leftX = leftIndex?.x * width;
  const leftY = leftIndex?.y * height;

  const rightX = rightIndex?.x * width;
  const rightY = rightIndex?.y * height;

  bezier(
    margin,
    height * 0.5,
    leftX,
    leftY,
    rightX,
    rightY,
    width - margin,
    height * 0.5
  );

  strokeWeight(STROKE_WIDTH * 0.1);
  stroke(132, 95, 58);
  fill(312, 85, 45);
  circle(leftX, leftY, STROKE_WIDTH * 0.5);
  circle(rightX, rightY, STROKE_WIDTH * 0.5);

  // make sure we have detections to draw
  if (detections) {
    const handsInfos = detections.multiHandedness;
    const handsPositions = detections.multiHandLandmarks;

    console.log(detections);

    // for each detected hand
    for (let i = 0; i < handsPositions.length; i++) {
      const hand = handsPositions[i];
      const handInfo = handsInfos[i];

      const label = handInfo.label; // "Left" or "Right"

      if (label === "Right") {
        right = hand;
      } else if (label === "Left") {
        left = hand;
      }

      // drawHand(hand);
    }
  }
}

function drawIndex(landmarks) {
  // get the index fingertip landmark
  let mark = landmarks[FINGER_TIPS.index];

  noStroke();
  // set fill color for index fingertip
  fill(0, 255, 255);

  // adapt the coordinates (0..1) to video coordinates
  let x = mark.x * width;
  let y = mark.y * height;
  circle(x, y, 20);
}

function drawThumb(landmarks) {
  // get the thumb fingertip landmark
  let mark = landmarks[FINGER_TIPS.thumb];

  noStroke();
  // set fill color for thumb fingertip
  fill(255, 255, 0);

  // adapt the coordinates (0..1) to video coordinates
  let x = mark.x * width;
  let y = mark.y * height;
  circle(x, y, 20);
}

function drawTips(landmarks) {
  noStroke();
  // set fill color for fingertips
  fill(0, 0, 255);

  // fingertip indices
  const tips = [4, 8, 12, 16, 20];

  for (let tipIndex of tips) {
    let mark = landmarks[tipIndex];
    // adapt the coordinates (0..1) to video coordinates
    let x = mark.x * width;
    let y = mark.y * height;
    circle(x, y, 10);
  }
}

function drawLandmarks(landmarks) {
  noStroke();
  // set fill color for landmarks
  fill(255, 0, 0);

  for (let mark of landmarks) {
    // adapt the coordinates (0..1) to video coordinates
    let x = mark.x * width;
    let y = mark.y * height;
    circle(x, y, 6);
  }
}

function drawConnections(landmarks) {
  // set stroke color for connections
  stroke(0, 255, 0);

  // iterate through each connection
  for (let connection of HAND_CONNECTIONS) {
    // get the two landmarks to connect
    const a = landmarks[connection[0]];
    const b = landmarks[connection[1]];
    // skip if either landmark is missing
    if (!a || !b) continue;
    // landmarks are normalized [0..1], (x,y) with origin top-left
    let ax = a.x * width;
    let ay = a.y * height;
    let bx = b.x * width;
    let by = b.y * height;
    line(ax, ay, bx, by);
  }
}

function drawHand(hand) {
  drawIndex(hand);
  // draw the thumb finger
  drawThumb(hand);
  // draw fingertip points
  drawTips(hand);
  // draw connections
  drawConnections(hand);
  // draw all landmarks
  drawLandmarks(hand);
}
