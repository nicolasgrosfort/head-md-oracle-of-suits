const STROKE_WIDTH = 200;
const margin = STROKE_WIDTH * 0.75;

let right = {};
let left = {};

let prevLeftX = 0,
  prevLeftY = 0;
let prevRightX = 0,
  prevRightY = 0;
let leftVx = 0,
  leftVy = 0;
let rightVx = 0,
  rightVy = 0;

// Ball properties
const ballConfig = {
  radius: STROKE_WIDTH * 0.3,
  gravity: 0.8,
  damping: 0.6,
  velocityMultiplier: 0.6,
  friction: 0.98,
};

let balls = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSL);
  textFont("Monospace");
  setupHands();
  setupVideo();
  addNewBall();
}

function addNewBall() {
  balls.push({
    x: random(margin + 100, width - margin - 100),
    y: 50,
    vx: random(-2, 2),
    vy: 0,
  });
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

  const leftX = leftIndex?.x * width || width * 0.3;
  const leftY = leftIndex?.y * height || height * 0.75;

  const rightX = rightIndex?.x * width || width * 0.7;
  const rightY = rightIndex?.y * height || height * 0.75;

  // Calculate hand velocities
  leftVx = leftX - prevLeftX;
  leftVy = leftY - prevLeftY;
  rightVx = rightX - prevRightX;
  rightVy = rightY - prevRightY;

  // Store current positions for next frame
  prevLeftX = leftX;
  prevLeftY = leftY;
  prevRightX = rightX;
  prevRightY = rightY;

  bezier(
    margin,
    height * 0.75,
    leftX,
    leftY,
    rightX,
    rightY,
    width - margin,
    height * 0.75
  );

  strokeWeight(STROKE_WIDTH * 0.05);
  stroke(132, 95, 58);
  fill(312, 85, 45);

  circle(leftX, leftY, STROKE_WIDTH * 0.5 + STROKE_WIDTH * 0.05);
  circle(rightX, rightY, STROKE_WIDTH * 0.5 + STROKE_WIDTH * 0.05);

  drawCoordinates(
    `[${rightX.toFixed(1)}, ${rightY.toFixed(1)}]`,
    rightX + STROKE_WIDTH * 0.4,
    rightY,
    "left"
  );
  drawCoordinates(
    `[${leftX.toFixed(1)}, ${leftY.toFixed(1)}]`,
    leftX - STROKE_WIDTH * 0.4,
    leftY,
    "right"
  );

  // Update and draw all balls
  for (let i = balls.length - 1; i >= 0; i--) {
    updateBall(
      balls[i],
      margin,
      height * 0.75,
      leftX,
      leftY,
      rightX,
      rightY,
      width - margin,
      height * 0.75
    );
    drawBall(balls[i]);

    // Remove balls that go off screen
    if (
      balls[i].y > height + 100 ||
      balls[i].x < -100 ||
      balls[i].x > width + 100
    ) {
      balls.splice(i, 1);
    }
  }

  // Always keep at least one ball
  if (balls.length === 0) {
    addNewBall();
  }

  // make sure we have detections to draw
  if (detections) {
    const handsInfos = detections.multiHandedness;
    const handsPositions = detections.multiHandLandmarks;

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

function updateBall(ball, x0, y0, x1, y1, x2, y2, x3, y3) {
  // Apply gravity
  ball.vy += ballConfig.gravity;

  // Apply friction
  ball.vx *= ballConfig.friction;
  ball.vy *= ballConfig.friction;

  // Update position
  ball.x += ball.vx;
  ball.y += ball.vy;

  // Check collision with bezier curve
  let closestPoint = getClosestPointOnBezier(
    ball.x,
    ball.y,
    x0,
    y0,
    x1,
    y1,
    x2,
    y2,
    x3,
    y3
  );
  let distance = dist(ball.x, ball.y, closestPoint.x, closestPoint.y);

  if (distance < ballConfig.radius + STROKE_WIDTH * 0.5) {
    // Calculate normal vector
    let nx = ball.x - closestPoint.x;
    let ny = ball.y - closestPoint.y;
    let len = sqrt(nx * nx + ny * ny);
    if (len > 0) {
      nx /= len;
      ny /= len;
    }

    // Move ball outside of curve
    ball.x = closestPoint.x + nx * (ballConfig.radius + STROKE_WIDTH * 0.5);
    ball.y = closestPoint.y + ny * (ballConfig.radius + STROKE_WIDTH * 0.5);

    // Calculate curve velocity at collision point
    let t = closestPoint.t;
    let curveVx = lerp(leftVx, rightVx, t);
    let curveVy = lerp(leftVy, rightVy, t);

    // Reflect velocity with damping
    let dot = ball.vx * nx + ball.vy * ny;
    ball.vx = (ball.vx - 2 * dot * nx) * ballConfig.damping;
    ball.vy = (ball.vy - 2 * dot * ny) * ballConfig.damping;

    // Add curve velocity (slingshot effect)
    ball.vx += curveVx * ballConfig.velocityMultiplier;
    ball.vy += curveVy * ballConfig.velocityMultiplier;
  }
}

function getClosestPointOnBezier(px, py, x0, y0, x1, y1, x2, y2, x3, y3) {
  let minDist = Infinity;
  let closest = { x: x0, y: y0, t: 0 }; // Add t: 0

  // Sample the bezier curve
  for (let t = 0; t <= 1; t += 0.01) {
    let x = bezierPoint(x0, x1, x2, x3, t);
    let y = bezierPoint(y0, y1, y2, y3, t);
    let d = dist(px, py, x, y);

    if (d < minDist) {
      minDist = d;
      closest = { x, y, t }; // Store t value
    }
  }

  return closest;
}

function drawBall(ball) {
  noStroke();
  fill(60, 95, 65);
  circle(ball.x, ball.y, ballConfig.radius * 2);

  // Add a highlight for 3D effect
  fill(60, 95, 85, 0.6);
  circle(
    ball.x - ballConfig.radius * 0.3,
    ball.y - ballConfig.radius * 0.3,
    ballConfig.radius * 0.8
  );

  drawCoordinates(
    `[${ball.x.toFixed(1)}, ${ball.y.toFixed(1)}]`,
    ball.x + ballConfig.radius + 10,
    ball.y
  );
}

function drawCoordinates(label, x, y, align = "left") {
  fill(0);
  noStroke();
  textAlign(align === "left" ? LEFT : RIGHT, CENTER);
  text(label, x, y);
}
