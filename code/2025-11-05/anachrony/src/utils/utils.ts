import type {
  FaceLandmarkerResult,
  GestureRecognizerResult,
  PoseLandmarkerResult,
} from "@mediapipe/tasks-vision";
import type p5 from "p5";
import type { Screens } from "./types";

const LANDMARK_RADIUS = 8;

export const drawVideo = (
  p: p5,
  video: p5.Element | null,
  options: { hide: boolean }
) => {
  if (options.hide) return;
  if (video) {
    p.push();
    p.translate(p.width, 0);
    p.scale(-1, 1);
    p.image(video as any, 0, 0, p.width, p.height);
    p.pop();
  }
};

export const drawHands = (
  p: p5,
  handResults: GestureRecognizerResult | null,
  options: {
    hide?: boolean;
    drawLandmarks?: boolean;
    drawGestures?: boolean;
  } = {
    hide: false,
    drawLandmarks: true,
    drawGestures: false,
  }
) => {
  if (options.hide) return;

  if (options.drawLandmarks && handResults?.landmarks) {
    for (let i = 0; i < handResults.landmarks.length; i++) {
      const landmarks = handResults.landmarks[i];

      p.fill(255, 0, 0);
      p.noStroke();
      for (const landmark of landmarks) {
        const x = p.width - landmark.x * p.width;
        const y = landmark.y * p.height;
        p.circle(x, y, LANDMARK_RADIUS);
      }

      if (options.drawGestures && handResults.gestures?.[i]?.[0]) {
        const gesture = handResults.gestures[i][0];
        const wrist = landmarks[0];
        const x = p.width - wrist.x * p.width;
        const y = wrist.y * p.height;

        p.fill(255);
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
      p.fill(0, 0, 255);
      p.noStroke();
      const faceContour = [
        10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365,
        379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234,
        127, 162, 21, 54, 103, 67, 109,
      ];
      for (const idx of faceContour) {
        const landmark = faceLandmarks[idx];
        const x = p.width - landmark.x * p.width;
        const y = landmark.y * p.height;
        p.circle(x, y, LANDMARK_RADIUS);
      }
    }

    if (options?.drawEyes) {
      p.fill(0, 0, 255);
      const leftEye = [362, 385, 387, 263, 373, 380];
      const rightEye = [33, 160, 158, 133, 153, 144];
      for (const idx of [...leftEye, ...rightEye]) {
        const landmark = faceLandmarks[idx];
        const x = p.width - landmark.x * p.width;
        const y = landmark.y * p.height;
        p.circle(x, y, LANDMARK_RADIUS);
      }
    }

    if (options?.drawNose) {
      p.fill(0, 0, 255);
      const nose = [1, 2, 98, 327];
      for (const idx of nose) {
        const landmark = faceLandmarks[idx];
        const x = p.width - landmark.x * p.width;
        const y = landmark.y * p.height;
        p.circle(x, y, LANDMARK_RADIUS);
      }
    }

    if (options?.drawMouth) {
      p.fill(0, 0, 255);
      const mouth = [
        61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 146, 91, 181, 84, 17,
        314, 405, 321, 375, 78,
      ];
      for (const idx of mouth) {
        const landmark = faceLandmarks[idx];
        const x = p.width - landmark.x * p.width;
        const y = landmark.y * p.height;
        p.circle(x, y, LANDMARK_RADIUS);
      }
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
      p.fill(255, 0, 255);
      p.noStroke();

      // Excluded: 0-10 (face), 17-22 (wrists and hands)
      for (let i = 11; i < poseLandmarks.length; i++) {
        if (i >= 17 && i <= 22) continue;
        const landmark = poseLandmarks[i];
        const x = p.width - landmark.x * p.width;
        const y = landmark.y * p.height;
        p.circle(x, y, LANDMARK_RADIUS);
      }
    }

    if (options.drawConnections !== false) {
      p.stroke(255, 0, 255);
      p.strokeWeight(LANDMARK_RADIUS * 0.5);
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

export const drawScreens = (p: p5, screens: Screens, content?: p5.Image) => {
  if (!content) return;

  for (const screen of Object.values(screens)) {
    p.push();

    p.drawingContext.save();
    p.drawingContext.beginPath();
    p.drawingContext.rect(screen.x, screen.y, screen.width, screen.height);
    p.drawingContext.clip();

    p.image(content as any, 0, 0, p.width, p.height);

    p.drawingContext.restore();
    p.pop();

    p.noFill();
    p.stroke(0);
    p.strokeWeight(2);
    p.rect(screen.x, screen.y, screen.width, screen.height);
  }
};
