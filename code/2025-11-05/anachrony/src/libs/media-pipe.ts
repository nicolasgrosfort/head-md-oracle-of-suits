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

let gestureRecognizer: GestureRecognizer | null = null;
let faceLandmarker: FaceLandmarker | null = null;
let poseLandmarker: PoseLandmarker | null = null;

let video: p5.Element | null = null;
let isReady = false;

let lastGestureResults: GestureRecognizerResult | null = null;
let lastFaceResults: FaceLandmarkerResult | null = null;
let lastPoseResults: PoseLandmarkerResult | null = null;
let lastTimestamp = 0;

export const detect = () => {
  if (
    !isReady ||
    !gestureRecognizer ||
    !faceLandmarker ||
    !poseLandmarker ||
    !video
  ) {
    return;
  }

  const videoElement = (video as any).elt as HTMLVideoElement;
  if (videoElement.readyState >= 2) {
    lastTimestamp += 1;

    lastGestureResults = gestureRecognizer.recognizeForVideo(
      videoElement,
      lastTimestamp
    );
    lastFaceResults = faceLandmarker.detectForVideo(
      videoElement,
      lastTimestamp
    );
    lastPoseResults = poseLandmarker.detectForVideo(
      videoElement,
      lastTimestamp
    );
  }
};

export const initialize = async (p: p5) => {
  video = p.createCapture({
    video: true,
    audio: false,
  });
  video.size(640, 480);
  video.hide();

  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  );

  gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
      delegate: "GPU",
    },
    runningMode: "VIDEO",
    numHands: 2,
    minHandDetectionConfidence: 0.5,
    minHandPresenceConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });

  faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
      delegate: "GPU",
    },
    runningMode: "VIDEO",
    numFaces: 1,
    minFaceDetectionConfidence: 0.3,
    minFacePresenceConfidence: 0.3,
    minTrackingConfidence: 0.3,
  });

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

  isReady = true;
};

export const getGestureResults = () => lastGestureResults;
export const getFaceResults = () => lastFaceResults;
export const getPoseResults = () => lastPoseResults;
export const ready = () => isReady;
export const getVideo = () => video;
