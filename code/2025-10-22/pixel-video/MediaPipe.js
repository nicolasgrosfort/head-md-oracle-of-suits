const FINGER_TIPS = {
  thumb: 4,
  index: 8,
  middle: 12,
  ring: 16,
  pinky: 20,
};

const HAND_CONNECTIONS = [
  // wrist to thumb
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  // wrist to index
  [0, 5],
  [5, 6],
  [6, 7],
  [7, 8],
  // middle
  [0, 9],
  [9, 10],
  [10, 11],
  [11, 12],
  // ring
  [0, 13],
  [13, 14],
  [14, 15],
  [15, 16],
  // pinky
  [0, 17],
  [17, 18],
  [18, 19],
  [19, 20],
];

let handsDetections = null;
let faceDetections = null;

let useHands = false;
let useFace = false;

if (!window.hands) {
  window.hands = new Hands({
    locateFile: (file) =>
      `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
  });
}

if (!window.faceMesh) {
  window.faceMesh = new FaceMesh({
    locateFile: (file) =>
      `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
  });
}

const hands = window.hands;
const faceMesh = window.faceMesh;

function setupCamera() {
  cam = new Camera(video.elt, {
    onFrame: async () => {
      if (useHands) await hands.send({ image: video.elt });
      if (useFace) await faceMesh.send({ image: video.elt });
    },
    width: video.width,
    height: video.height,
  });

  cam.start();
}

function setupHands() {
  useHands = true;

  hands.setOptions({
    maxNumHands: 2,
    modelComplexity: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.5,
    selfieMode: true,
  });

  hands.onResults(onHandsResults);
}

function onHandsResults(results) {
  handsDetections = results;
}

function setupFace() {
  useFace = true;

  faceMesh.setOptions({
    maxNumFaces: 1,
    refineLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
    selfieMode: true,
  });

  faceMesh.onResults(onFaceResults);
}

function onFaceResults(results) {
  faceDetections = results;
}

// * DRAW

function drawHandsDetections() {
  if (!handsDetections || !handsDetections.multiHandLandmarks) return;

  const transform = getVideoTransform();
  if (!transform) return;

  for (const landmarks of handsDetections.multiHandLandmarks) {
    fill(0);
    noStroke();
    for (const landmark of landmarks) {
      const x = transform.offsetX + landmark.x * transform.drawWidth;
      const y = transform.offsetY + landmark.y * transform.drawHeight;
      circle(x, y, 8);
    }

    stroke(0);
    strokeWeight(2);
    for (const connection of HAND_CONNECTIONS) {
      const start = landmarks[connection[0]];
      const end = landmarks[connection[1]];
      const startX = transform.offsetX + start.x * transform.drawWidth;
      const startY = transform.offsetY + start.y * transform.drawHeight;
      const endX = transform.offsetX + end.x * transform.drawWidth;
      const endY = transform.offsetY + end.y * transform.drawHeight;
      line(startX, startY, endX, endY);
    }
  }
}

function drawFaceDetections() {
  if (!faceDetections || !faceDetections.multiFaceLandmarks) return;

  const transform = getVideoTransform();
  if (!transform) return;

  for (const landmarks of faceDetections.multiFaceLandmarks) {
    fill(0);
    noStroke();

    for (const landmark of landmarks) {
      const x = transform.offsetX + landmark.x * transform.drawWidth;
      const y = transform.offsetY + landmark.y * transform.drawHeight;
      circle(x, y, 4);
    }

    const faceOval = [
      10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379,
      378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127,
      162, 21, 54, 103, 67, 109,
    ];

    stroke(0);
    strokeWeight(2);
    noFill();

    beginShape();
    for (const idx of faceOval) {
      const landmark = landmarks[idx];
      const x = transform.offsetX + landmark.x * transform.drawWidth;
      const y = transform.offsetY + landmark.y * transform.drawHeight;
      vertex(x, y);
    }
    endShape(CLOSE);
  }
}
