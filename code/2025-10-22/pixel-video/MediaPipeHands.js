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

let videoElement;
let detections = null;

if (!window.hands) {
  window.hands = new Hands({
    locateFile: (file) =>
      `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
  });
}

const hands = window.hands;

window.initHands = (opts = {}) => {
  const defaults = {
    maxNumHands: 2,
    modelComplexity: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.5,
    selfieMode: true,
  };
  window.hands.setOptions(Object.assign({}, defaults, opts));
  return window.hands;
};

function setupCamera() {
  cam = new Camera(video.elt, {
    onFrame: async () => {
      await hands.send({ image: video.elt });
    },
    width: video.width,
    height: video.height,
  });

  cam.start();
}

function setupHands() {
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
  detections = results;
}
