import {
  FaceLandmarker,
  FilesetResolver,
  GestureRecognizer,
  PoseLandmarker,
  type FaceLandmarkerResult,
  type GestureRecognizerResult,
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

type GestureCategory = "Open_Palm" | "Closed_Fist";
type Gesture = "open" | "close";

type Hand = {
  x: number;
  y: number;
  z: number;
  angle: number;
  gesture?: Gesture;
};

let gestureRecognizer: GestureRecognizer | null = null;
let faceLandmarker: FaceLandmarker | null = null;
let poseLandmarker: PoseLandmarker | null = null;

let video: p5.Element | null = null;
let isReady = false;

let lastGestureResults: GestureRecognizerResult | null = null;
let lastFaceResults: FaceLandmarkerResult | null = null;
let lastPoseResults: PoseLandmarkerResult | null = null;
let lastTimestamp = 0;

const HAND = {
  WRIST: 0,
  MIDDLE_FINGER_TIP: 20,
  THUMB_TIP: 4,
};

const GESTURES: Record<GestureCategory, Gesture> = {
  Open_Palm: "open",
  Closed_Fist: "close",
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
    video: true,
    audio: false,
  });
  video.size(640, 480);
  video.hide();

  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  );

  if (options.enableGestures !== false) {
    gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
        delegate: "GPU",
      },
      runningMode: "VIDEO",
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
      runningMode: "VIDEO",
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
          "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_heavy/float16/1/pose_landmarker_heavy.task",
        delegate: "GPU",
      },
      runningMode: "VIDEO",
      numPoses: 1,
      minPoseDetectionConfidence: 0.5,
      minPosePresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
  }

  isReady = true;
};

export const detect = () => {
  if (!isReady || !video) {
    return;
  }

  const videoElement = (video as any).elt as HTMLVideoElement;
  if (videoElement.readyState >= 2) {
    lastTimestamp += 1;

    if (gestureRecognizer) {
      lastGestureResults = gestureRecognizer.recognizeForVideo(
        videoElement,
        lastTimestamp
      );
    }

    if (faceLandmarker) {
      lastFaceResults = faceLandmarker.detectForVideo(
        videoElement,
        lastTimestamp
      );
    }

    if (poseLandmarker) {
      lastPoseResults = poseLandmarker.detectForVideo(
        videoElement,
        lastTimestamp
      );
    }
  }
};

export const drawHands = (
  p: p5,
  handResults: GestureRecognizerResult | null,
  options: {
    hide?: boolean;
    drawLandmarks?: boolean;
    drawGestures?: boolean;
    drawConnections?: boolean;
  } = {
    hide: false,
    drawLandmarks: true,
    drawGestures: false,
    drawConnections: true,
  }
) => {
  if (options.hide) return;

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

      if (options.drawGestures && handResults.gestures?.[i]?.[0]) {
        const gesture = handResults.gestures[i][0];
        const wrist = landmarks[0];
        const x = p.width - wrist.x * p.width;
        const y = wrist.y * p.height;

        p.fill(config.landmark.color);
        p.stroke(0);
        p.strokeWeight(2);
        p.textSize(16);
        p.textAlign(p.CENTER);
        p.text(
          `${gesture.categoryName} (${(gesture.score * 100).toFixed(0)}%)`,
          x,
          y - 30
        );
      }
    }
  }
};

export const drawFace = (
  p: p5,
  faceResults: FaceLandmarkerResult | null,
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
  poseResults: PoseLandmarkerResult | null,
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
  options: { hide?: boolean; opacity?: number } = { hide: false, opacity: 1 }
) => {
  if (options.hide === true) return;
  const video = getVideo();

  if (video) {
    p.push();
    p.translate(p.width, 0);
    p.scale(-1, 1);

    const opacity = options.opacity !== undefined ? options.opacity : 1.0;
    p.tint(255, 255 * opacity);

    p.image(video, 0, 0, p.width, p.height);
    p.pop();
  }
};

export const onHandMove = (callback: (hand: Hand) => void) => {
  let hand: Hand;

  const gestureResults = getGestureResults();
  if (!gestureResults) return;

  const { landmarks, gestures } = gestureResults;
  if (landmarks.length === 0 || gestures.length === 0) return;

  const mergedResults = landmarks.map((landmark, index) => ({
    landmark,
    gesture: gestures[index],
  }));

  const closestResult = mergedResults.reduce((closest, current) => {
    const currentZ = current.landmark[HAND.WRIST].z;
    const closestZ = closest.landmark[HAND.WRIST].z;
    return currentZ > closestZ ? current : closest;
  });

  const wrist = closestResult.landmark[HAND.WRIST];
  const middleFingerTip = closestResult.landmark[HAND.MIDDLE_FINGER_TIP];
  const thumbTip = closestResult.landmark[HAND.THUMB_TIP];

  const angle = utils.getAngle(
    thumbTip.x,
    thumbTip.y,
    middleFingerTip.x,
    middleFingerTip.y
  );

  const gestureCategory = closestResult.gesture[0]
    .categoryName as GestureCategory;
  const gesture = GESTURES[gestureCategory];

  hand = {
    x: 1 - wrist.x,
    y: wrist.y * 2,
    z: wrist.z,
    angle,
    gesture,
  };

  callback(hand);
};

export const getGestureResults = () => lastGestureResults;
export const getFaceResults = () => lastFaceResults;
export const getPoseResults = () => lastPoseResults;
export const getVideo = () => video;

export const ready = () => isReady;
