/** biome-ignore-all lint/correctness/noUnusedVariables: <> */

import {
	FaceLandmarker,
	FilesetResolver,
	GestureRecognizer,
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest";

let videoElement;
let gestureRecognizer;
let faceLandmarker;
let detections = null;
let faceDetections = null;
const selfieMode = true;
let showVideo = true;
let isProcessing = false;
let isFaceProcessing = false;
let zoomLevel = 1.0;
let targetZoom = 1.0;
const zoomSpeed = 0.1;
let currentFilter = 0;
let filters = []; // Will be initialized in setup
let filterNames = [];
let wasEyesClosed = false;
let rotationAngle = 0;
let targetRotation = 0;
const rotationSpeed = 0.1;

// expose p5 functions to global scope
window.setup = setup;
window.draw = draw;
window.keyPressed = keyPressed;

async function setup() {
	createCanvas(640, 480).parent("canvas-container");

	// Initialize filters array with p5 constants (must be done after p5 is loaded)
	filters = [null, GRAY, INVERT, POSTERIZE, BLUR];
	filterNames = ["Normal", "Noir & Blanc", "Inversé", "Posterize", "Flou"];

	// hidden video capture used by MediaPipe
	videoElement = createCapture(VIDEO, { flipped: selfieMode });
	videoElement.size(640, 480);
	videoElement.hide();

	// Initialize MediaPipe Vision
	const vision = await FilesetResolver.forVisionTasks(
		"https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm",
	);

	// Initialize Gesture Recognizer
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

	// Initialize Face Landmarker
	faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
		baseOptions: {
			modelAssetPath:
				"https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
			delegate: "GPU",
		},
		runningMode: "VIDEO",
		outputFaceBlendshapes: true,
		outputFacialTransformationMatrixes: false,
		numFaces: 1,
	});

	// Start processing video frames
	processVideo();
	processFace();
}

function keyPressed() {
	if (key === "v" || key === "V") {
		showVideo = !showVideo;
	}
}

async function processVideo() {
	if (
		!gestureRecognizer ||
		!videoElement ||
		videoElement.elt.readyState !== 4
	) {
		requestAnimationFrame(processVideo);
		return;
	}

	// Ensure video has valid dimensions
	if (videoElement.elt.videoWidth === 0 || videoElement.elt.videoHeight === 0) {
		requestAnimationFrame(processVideo);
		return;
	}

	if (!isProcessing) {
		isProcessing = true;
		const nowInMs = Date.now();
		detections = gestureRecognizer.recognizeForVideo(videoElement.elt, nowInMs);
		isProcessing = false;
	}

	requestAnimationFrame(processVideo);
}

const HAND_CONNECTIONS = [
	[0, 1],
	[1, 2],
	[2, 3],
	[3, 4],
	[0, 5],
	[5, 6],
	[6, 7],
	[7, 8],
	[0, 9],
	[9, 10],
	[10, 11],
	[11, 12],
	[0, 13],
	[13, 14],
	[14, 15],
	[15, 16],
	[0, 17],
	[17, 18],
	[18, 19],
	[19, 20],
];

function drawConnections(landmarks) {
	stroke(0, 255, 0);
	for (const pair of HAND_CONNECTIONS) {
		const a = landmarks[pair[0]];
		const b = landmarks[pair[1]];
		if (!a || !b) continue;
		const ax = selfieMode ? (1 - a.x) * width : a.x * width;
		const ay = a.y * height;
		const bx = selfieMode ? (1 - b.x) * width : b.x * width;
		const by = b.y * height;
		line(ax, ay, bx, by);
	}
}

function drawLandmarks(landmarks) {
	noStroke();
	fill(255, 0, 0);
	for (const lm of landmarks) {
		const x = selfieMode ? (1 - lm.x) * width : lm.x * width;
		const y = lm.y * height;
		circle(x, y, 6);
	}
}

function drawGestureLabel(label, landmarks) {
	// position label near top of the hand bounding area
	let minY = Infinity;
	let minX = Infinity;
	let maxX = -Infinity;
	for (const lm of landmarks) {
		const x = selfieMode ? (1 - lm.x) * width : lm.x * width;
		const y = lm.y * height;
		if (y < minY) minY = y;
		if (x < minX) minX = x;
		if (x > maxX) maxX = x;
	}

	const x = constrain((minX + maxX) / 2, 10, width - 10);
	const y = max(16, minY - 10);

	push();
	textAlign(CENTER, BOTTOM);
	textSize(20);
	stroke(0, 200);
	strokeWeight(6);
	fill(255);
	text(label, x, y);
	pop();
}

async function processFace() {
	if (!faceLandmarker || !videoElement || videoElement.elt.readyState !== 4) {
		requestAnimationFrame(processFace);
		return;
	}

	if (videoElement.elt.videoWidth === 0 || videoElement.elt.videoHeight === 0) {
		requestAnimationFrame(processFace);
		return;
	}

	if (!isFaceProcessing) {
		isFaceProcessing = true;
		const nowInMs = Date.now();
		faceDetections = faceLandmarker.detectForVideo(videoElement.elt, nowInMs);
		isFaceProcessing = false;
	}

	requestAnimationFrame(processFace);
}

function checkEyesOpen(blendshapes) {
	const leftEyeBlink =
		blendshapes.find((b) => b.categoryName === "eyeBlinkLeft")?.score || 0;
	const rightEyeBlink =
		blendshapes.find((b) => b.categoryName === "eyeBlinkRight")?.score || 0;

	const threshold = 0.3;
	const leftOpen = leftEyeBlink < threshold;
	const rightOpen = rightEyeBlink < threshold;

	return { leftOpen, rightOpen, bothOpen: leftOpen && rightOpen };
}

function checkMouthOpen(blendshapes) {
	const jawOpen =
		blendshapes.find((b) => b.categoryName === "jawOpen")?.score || 0;
	const mouthOpen = jawOpen > 0.2;

	return { open: mouthOpen, openness: jawOpen };
}

function drawFaceLandmarks(landmarks) {
	// Draw key points only (eyes, nose, mouth)
	const keyIndices = [
		// Left eye
		33, 133, 160, 159, 158, 157, 173,
		// Right eye
		263, 362, 387, 386, 385, 384, 398,
		// Mouth
		61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291,
	];

	noStroke();
	fill(0, 255, 255);
	for (const idx of keyIndices) {
		const lm = landmarks[idx];
		if (!lm) continue;
		const x = selfieMode ? (1 - lm.x) * width : lm.x * width;
		const y = lm.y * height;
		circle(x, y, 3);
	}
}

function getHeadRotation(landmarks) {
	// Use face landmarks to calculate head rotation
	// Landmarks: 234 (left temple), 454 (right temple)
	// 10 (nose top), 152 (chin)

	if (!landmarks || landmarks.length < 468) {
		return { yaw: 0, pitch: 0, roll: 0 };
	}

	const leftTemple = landmarks[234];
	const rightTemple = landmarks[454];
	const noseTop = landmarks[10];
	const chin = landmarks[152];

	// Calculate yaw (left-right turn) from temple positions
	const leftX = selfieMode ? 1 - leftTemple.x : leftTemple.x;
	const rightX = selfieMode ? 1 - rightTemple.x : rightTemple.x;
	const templeDistance = rightX - leftX;

	// Normalize: average distance is around 0.3-0.4
	// When turning left, distance increases; when turning right, it decreases
	const yaw = map(templeDistance, 0.2, 0.5, 0.5, -0.5, true);

	return { yaw, pitch: 0, roll: 0 };
}

function draw() {
	background(0);

	// Update zoom level smoothly
	zoomLevel = lerp(zoomLevel, targetZoom, zoomSpeed);

	// Update rotation smoothly
	rotationAngle = lerp(rotationAngle, targetRotation, rotationSpeed);

	// Check if eyes are closed and toggle filter
	let eyesClosed = false;
	if (
		faceDetections &&
		faceDetections.faceBlendshapes &&
		faceDetections.faceBlendshapes[0]
	) {
		const blendshapes = faceDetections.faceBlendshapes[0].categories;
		const eyeState = checkEyesOpen(blendshapes);
		eyesClosed = !eyeState.bothOpen;

		// Detect transition from open to closed (falling edge)
		if (eyesClosed && !wasEyesClosed) {
			currentFilter = (currentFilter + 1) % filters.length;
		}
		wasEyesClosed = eyesClosed;
	}

	push();

	// Apply zoom and rotation transformations
	translate(width / 2, height / 2);
	rotate(rotationAngle);
	scale(zoomLevel);
	translate(-width / 2, -height / 2);

	if (showVideo && videoElement && videoElement.loadedmetadata) {
		image(videoElement, 0, 0, width, height);

		// Apply current filter
		if (filters[currentFilter] !== null) {
			filter(filters[currentFilter]);
		}
	} else {
		fill(30);
		rect(0, 0, width, height);
	}

	pop();

	// Draw overlays AFTER pop() so they're not affected by zoom or filter
	push();

	// Draw face detection
	if (faceDetections && faceDetections.faceLandmarks) {
		for (let i = 0; i < faceDetections.faceLandmarks.length; i++) {
			const landmarks = faceDetections.faceLandmarks[i];

			// Apply zoom and rotation to landmarks
			push();
			translate(width / 2, height / 2);
			rotate(rotationAngle);
			scale(zoomLevel);
			translate(-width / 2, -height / 2);
			drawFaceLandmarks(landmarks);
			pop();

			// Check eye and mouth state
			if (faceDetections.faceBlendshapes && faceDetections.faceBlendshapes[i]) {
				const blendshapes = faceDetections.faceBlendshapes[i].categories;
				const eyeState = checkEyesOpen(blendshapes);
				const mouthState = checkMouthOpen(blendshapes);

				// Get head rotation from LANDMARKS instead of blendshapes
				const headRotation = getHeadRotation(landmarks);

				// Update target zoom and rotation based on mouth state
				if (mouthState.open) {
					// Zoom proportionally to mouth openness (1.0 to 2.0)
					targetZoom = map(mouthState.openness, 0.2, 0.8, 1.0, 2.0, true);

					// Rotate proportionally to head turn when mouth is open
					targetRotation = map(
						headRotation.yaw,
						-0.5,
						0.5,
						-PI / 2,
						PI / 2,
						true,
					);
				} else {
					targetZoom = 1.0;
					targetRotation = 0;
				}

				drawFaceStatus(eyeState, mouthState, headRotation);
			}
		}
	}

	// draw hand landmarks and gesture labels
	if (detections && detections.landmarks) {
		strokeWeight(2);
		for (let i = 0; i < detections.landmarks.length; i++) {
			const landmarks = detections.landmarks[i];

			// Apply zoom and rotation to hand landmarks
			push();
			translate(width / 2, height / 2);
			rotate(rotationAngle);
			scale(zoomLevel);
			translate(-width / 2, -height / 2);
			drawConnections(landmarks);
			drawLandmarks(landmarks);
			pop();

			let gesture = "None";
			if (
				detections.gestures &&
				detections.gestures[i] &&
				detections.gestures[i].length > 0
			) {
				const topGesture = detections.gestures[i][0];
				gesture = `${topGesture.categoryName} (${(topGesture.score * 100).toFixed(0)}%)`;
			}
			drawGestureLabel(gesture, landmarks);
		}
	}

	pop();
}

function drawFaceStatus(eyeState, mouthState, headRotation) {
	return;
}
