import {
  FaceLandmarker,
  FilesetResolver,
  HandLandmarker,
  PoseLandmarker,
  type FaceLandmarkerResult,
  type HandLandmarkerResult,
  type PoseLandmarkerResult,
} from "@mediapipe/tasks-vision";

import type p5 from "p5";

import * as config from "../utils/config.js";
import * as utils from "../utils/utils.js";

type InitializeOptions = {
  enableGestures?: boolean;
  enableFace?: boolean;
  enablePose?: boolean;
};

type Hand = {
  x: number;
  y: number;
  z: number;
  angle: number;
};

let handLandmarker: HandLandmarker | null = null;
let faceLandmarker: FaceLandmarker | null = null;
let poseLandmarker: PoseLandmarker | null = null;

let video: p5.Element | null = null;
let crop: p5.Graphics | null = null;

let isAnyFace = false;
let isAnyPose = false;
let isAnyHand = false;
let isReady = false;

let lastGestureResults: HandLandmarkerResult | null = null;
let lastFaceResults: FaceLandmarkerResult | null = null;
let lastPoseResults: PoseLandmarkerResult | null = null;

let smoothedHand: Hand | null = null;
let smoothedThumbTip: { x: number; y: number } | null = null;
let smoothedPinkyTip: { x: number; y: number } | null = null;

const SMOOTHING_FACTOR = 0.2;
const ANGLE_SMOOTHING_FACTOR = 0.15;

const HAND = {
  WRIST: 0,
  MIDDLE_FINGER_TIP: 20,
  THUMB_TIP: 4,
  PINKY_TIP: 20,
};

export const initialize = async (
  p: p5,
  options: InitializeOptions = {
    enableGestures: true,
    enableFace: false,
    enablePose: false,
  }
) => {
  video = p.createCapture({
    video: {
      width: { ideal: config.video.width },
      height: { ideal: config.video.height },
      frameRate: { ideal: config.video.frameRate },
      aspectRatio: { ideal: 16 / 9 },
      facingMode: "user",
    },
    audio: false,
  });

  video.size(config.video.width, config.video.height);
  video.hide();

  crop = p.createGraphics(config.video.width, config.video.height);

  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  );

  if (options.enableGestures !== false) {
    handLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
        delegate: "GPU",
      },
      runningMode: "IMAGE",
      numHands: 1,
      minHandDetectionConfidence: 0.5,
      minHandPresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
  }

  if (options.enableFace !== false) {
    faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
        delegate: "GPU",
      },
      runningMode: "IMAGE",
      numFaces: 1,
      minFaceDetectionConfidence: 0.5,
      minFacePresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
  }

  if (options.enablePose !== false) {
    poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
        delegate: "GPU",
      },
      runningMode: "IMAGE",
      numPoses: 1,
      minPoseDetectionConfidence: 0.5,
      minPosePresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
  }

  isReady = true;
};

export const detect = () => {
  if (!isReady || !video || !crop) {
    return;
  }

  const videoElement = video.elt;

  if (videoElement.readyState >= 2) {
    const cropCanvas = (crop as any).canvas as HTMLCanvasElement;

    crop.clear();
    crop.image(
      video,
      0,
      0,
      crop.width,
      crop.height,
      crop.width * 0.5 - 400 * 0.5 - 25,
      275,
      400,
      crop.height - 575
    );

    if (handLandmarker) {
      lastGestureResults = handLandmarker.detect(cropCanvas);
      isAnyHand = lastGestureResults?.landmarks?.length > 0;
    }

    if (faceLandmarker) {
      lastFaceResults = faceLandmarker.detect(cropCanvas);
      isAnyFace = lastFaceResults?.faceLandmarks?.length > 0;
    }

    if (poseLandmarker) {
      lastPoseResults = poseLandmarker.detect(cropCanvas);
      isAnyPose = lastPoseResults?.landmarks?.length > 0;
    }
  }
};

export const drawHands = (
  p: p5,
  options: {
    hide?: boolean;
    drawLandmarks?: boolean;
    drawGestures?: boolean;
    drawConnections?: boolean;
  } = {
    hide: false,
    drawLandmarks: true,
    drawConnections: true,
  }
) => {
  if (options.hide) return;

  const handResults = getGestureResults();
  if (!handResults) return;

  if (handResults?.landmarks) {
    for (let i = 0; i < handResults.landmarks.length; i++) {
      const landmarks = handResults.landmarks[i];

      if (options.drawLandmarks) {
        p.fill(config.landmark.color);
        p.noStroke();
        for (const landmark of landmarks) {
          const x = p.width - landmark.x * p.width;
          const y = landmark.y * p.height;
          p.circle(x, y, config.landmark.radius);
        }
      }

      if (options.drawConnections) {
        p.stroke(config.landmark.color);
        p.strokeWeight(config.landmark.radius * 0.5);

        const connections = [
          // Thumb
          [0, 1],
          [1, 2],
          [2, 3],
          [3, 4],
          // Index
          [0, 5],
          [5, 6],
          [6, 7],
          [7, 8],
          // Middle
          [0, 9],
          [9, 10],
          [10, 11],
          [11, 12],
          // Ring
          [0, 13],
          [13, 14],
          [14, 15],
          [15, 16],
          // Pinky
          [0, 17],
          [17, 18],
          [18, 19],
          [19, 20],
          // Palm
          [5, 9],
          [9, 13],
          [13, 17],
        ];

        for (const [start, end] of connections) {
          const p1 = landmarks[start];
          const p2 = landmarks[end];
          const x1 = p.width - p1.x * p.width;
          const y1 = p1.y * p.height;
          const x2 = p.width - p2.x * p.width;
          const y2 = p2.y * p.height;
          p.line(x1, y1, x2, y2);
        }
      }
    }
  }
};

export const drawFace = (
  p: p5,
  options: {
    hide?: boolean;
    drawOutline?: boolean;
    drawEyes?: boolean;
    drawNose?: boolean;
    drawMouth?: boolean;
  } = {
    hide: false,
    drawOutline: true,
    drawEyes: true,
    drawNose: true,
    drawMouth: true,
  }
) => {
  if (options.hide) return;

  const faceResults = getFaceResults();
  if (!faceResults) return;

  if (faceResults?.faceLandmarks?.[0]) {
    const faceLandmarks = faceResults.faceLandmarks[0];

    if (options?.drawOutline) {
      const faceContour = [
        10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365,
        379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234,
        127, 162, 21, 54, 103, 67, 109,
      ];

      p.fill(config.landmark.color);
      p.noStroke();
      for (const idx of faceContour) {
        const landmark = faceLandmarks[idx];
        const x = p.width - landmark.x * p.width;
        const y = landmark.y * p.height;
        p.circle(x, y, config.landmark.radius);
      }

      p.noFill();
      p.stroke(config.landmark.color);
      p.strokeWeight(config.landmark.radius * 0.5);
      p.beginShape();
      for (const idx of faceContour) {
        const landmark = faceLandmarks[idx];
        const x = p.width - landmark.x * p.width;
        const y = landmark.y * p.height;
        p.vertex(x, y);
      }
      p.endShape(p.CLOSE);
    }

    if (options?.drawEyes) {
      p.fill(config.landmark.color);
      p.noStroke();
      const leftEye = [362, 385, 387, 263, 373, 380];
      const rightEye = [33, 160, 158, 133, 153, 144];

      for (const idx of [...leftEye, ...rightEye]) {
        const landmark = faceLandmarks[idx];
        const x = p.width - landmark.x * p.width;
        const y = landmark.y * p.height;
        p.circle(x, y, config.landmark.radius);
      }

      p.noFill();
      p.stroke(config.landmark.color);
      p.strokeWeight(config.landmark.radius * 0.5);

      p.beginShape();
      for (const idx of leftEye) {
        const landmark = faceLandmarks[idx];
        const x = p.width - landmark.x * p.width;
        const y = landmark.y * p.height;
        p.vertex(x, y);
      }
      p.endShape(p.CLOSE);

      p.beginShape();
      for (const idx of rightEye) {
        const landmark = faceLandmarks[idx];
        const x = p.width - landmark.x * p.width;
        const y = landmark.y * p.height;
        p.vertex(x, y);
      }
      p.endShape(p.CLOSE);
    }

    if (options?.drawNose) {
      const nose = [1, 98, 2, 327];

      p.fill(config.landmark.color);
      p.noStroke();
      for (const idx of nose) {
        const landmark = faceLandmarks[idx];
        const x = p.width - landmark.x * p.width;
        const y = landmark.y * p.height;
        p.circle(x, y, config.landmark.radius);
      }

      p.noFill();
      p.stroke(config.landmark.color);
      p.strokeWeight(config.landmark.radius * 0.5);
      p.beginShape();
      for (const idx of nose) {
        const landmark = faceLandmarks[idx];
        const x = p.width - landmark.x * p.width;
        const y = landmark.y * p.height;
        p.vertex(x, y);
      }
      p.endShape(p.CLOSE);
    }

    if (options?.drawMouth) {
      const mouthOuter = [
        61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 409, 270, 269, 267,
        0, 37, 39, 40, 185,
      ];

      p.fill(config.landmark.color);
      p.noStroke();
      for (const idx of mouthOuter) {
        const landmark = faceLandmarks[idx];
        const x = p.width - landmark.x * p.width;
        const y = landmark.y * p.height;
        p.circle(x, y, config.landmark.radius);
      }

      p.noFill();
      p.stroke(config.landmark.color);
      p.strokeWeight(config.landmark.radius * 0.5);
      p.beginShape();
      for (const idx of mouthOuter) {
        const landmark = faceLandmarks[idx];
        const x = p.width - landmark.x * p.width;
        const y = landmark.y * p.height;
        p.vertex(x, y);
      }
      p.endShape(p.CLOSE);
    }
  }
};

export const drawBody = (
  p: p5,
  options: {
    hide?: boolean;
    drawLandmarks?: boolean;
    drawConnections?: boolean;
  } = {
    hide: false,
    drawLandmarks: true,
    drawConnections: true,
  }
) => {
  if (options.hide) return;

  const poseResults = getPoseResults();
  if (!poseResults) return;

  if (poseResults?.landmarks?.[0]) {
    const poseLandmarks = poseResults.landmarks[0];

    if (options.drawLandmarks !== false) {
      p.fill(config.landmark.color);
      p.noStroke();

      // Excluded: 0-10 (face), 17-22 (wrists and hands)
      for (let i = 11; i < poseLandmarks.length; i++) {
        if (i >= 17 && i <= 22) continue;
        const landmark = poseLandmarks[i];
        const x = p.width - landmark.x * p.width;
        const y = landmark.y * p.height;
        p.circle(x, y, config.landmark.radius);
      }
    }

    if (options.drawConnections !== false) {
      p.stroke(config.landmark.color);
      p.strokeWeight(config.landmark.radius * 0.5);
      const connections = [
        [11, 12],
        [11, 13],
        [13, 15],
        [12, 14],
        [14, 16], // Arms
        [11, 23],
        [12, 24],
        [23, 24], // Torso
        [23, 25],
        [25, 27],
        [24, 26],
        [26, 28], // Legs
      ];
      for (const [start, end] of connections) {
        const p1 = poseLandmarks[start];
        const p2 = poseLandmarks[end];
        const x1 = p.width - p1.x * p.width;
        const y1 = p1.y * p.height;
        const x2 = p.width - p2.x * p.width;
        const y2 = p2.y * p.height;
        p.line(x1, y1, x2, y2);
      }
    }
  }
};

export const drawVideo = (
  p: p5,
  options: { hide?: boolean; opacity?: number } = {
    hide: false,
    opacity: 1,
  }
) => {
  if (options.hide === true) return;

  if (video) {
    p.push();
    p.translate(p.width, 0);
    p.scale(-1, 1);

    const opacity = options.opacity !== undefined ? options.opacity : 1.0;
    p.tint(255, 255 * opacity);

    p.image(crop ? crop : video, 0, 0, p.width, p.height);
    p.pop();
  }
};

export const onHandMove = (callback: (hand: Hand) => void) => {
  let hand: Hand;

  const TRANSLATE = { x: 1, y: 1 };
  const SCALE = { x: 1.5, y: 1.5 };

  const gestureResults = getGestureResults();
  if (!gestureResults) {
    return;
  }

  const { landmarks } = gestureResults;
  if (landmarks.length === 0) {
    return;
  }

  const mergedResults = landmarks.map((landmark) => ({
    landmark,
  }));

  const closestResult = mergedResults.reduce((closest, current) => {
    const currentZ = current.landmark[HAND.WRIST].z;
    const closestZ = closest.landmark[HAND.WRIST].z;
    return currentZ > closestZ ? current : closest;
  });

  const allLandmarks = closestResult.landmark;
  let sumX = 0;
  let sumY = 0;
  let sumZ = 0;

  for (const landmark of allLandmarks) {
    sumX += landmark.x;
    sumY += landmark.y;
    sumZ += landmark.z;
  }

  const avgX = sumX / allLandmarks.length;
  const avgY = sumY / allLandmarks.length;
  const avgZ = sumZ / allLandmarks.length;

  const pinkyTip = closestResult.landmark[HAND.PINKY_TIP];
  const thumbTip = closestResult.landmark[HAND.THUMB_TIP];

  // Lisser les positions des doigts
  if (smoothedThumbTip === null) {
    smoothedThumbTip = { x: thumbTip.x, y: thumbTip.y };
  } else {
    smoothedThumbTip = {
      x:
        smoothedThumbTip.x +
        (thumbTip.x - smoothedThumbTip.x) * ANGLE_SMOOTHING_FACTOR,
      y:
        smoothedThumbTip.y +
        (thumbTip.y - smoothedThumbTip.y) * ANGLE_SMOOTHING_FACTOR,
    };
  }

  if (smoothedPinkyTip === null) {
    smoothedPinkyTip = { x: pinkyTip.x, y: pinkyTip.y };
  } else {
    smoothedPinkyTip = {
      x:
        smoothedPinkyTip.x +
        (pinkyTip.x - smoothedPinkyTip.x) * ANGLE_SMOOTHING_FACTOR,
      y:
        smoothedPinkyTip.y +
        (pinkyTip.y - smoothedPinkyTip.y) * ANGLE_SMOOTHING_FACTOR,
    };
  }

  // Calculer l'angle avec les valeurs lissées
  const angle = utils.getAngle(
    smoothedThumbTip.x,
    smoothedThumbTip.y,
    smoothedPinkyTip.x,
    smoothedPinkyTip.y
  );

  const xCentered = (1 - avgX - 0.5) * SCALE.x + 0.5 * TRANSLATE.x;
  const yCentered = (avgY - 0.5) * SCALE.y + 0.5 * TRANSLATE.y;

  hand = {
    x: xCentered,
    y: yCentered,
    z: avgZ,
    angle,
  };

  if (smoothedHand === null) {
    smoothedHand = hand;
  } else {
    smoothedHand = {
      x: smoothedHand.x + (hand.x - smoothedHand.x) * SMOOTHING_FACTOR,
      y: smoothedHand.y + (hand.y - smoothedHand.y) * SMOOTHING_FACTOR,
      z: smoothedHand.z + (hand.z - smoothedHand.z) * SMOOTHING_FACTOR,
      angle:
        smoothedHand.angle +
        (hand.angle - smoothedHand.angle) * SMOOTHING_FACTOR,
    };
  }

  callback(smoothedHand);
};

export const getGestureResults = () => lastGestureResults;
export const getFaceResults = () => lastFaceResults;
export const getPoseResults = () => lastPoseResults;
export const getVideo = () => video;

export const ready = () => isReady;
export const anyFace = () => isAnyFace;
export const anyPose = () => isAnyPose;
export const anyHand = () => isAnyHand;
