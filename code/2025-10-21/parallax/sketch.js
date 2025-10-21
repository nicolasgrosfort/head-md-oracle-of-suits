/** biome-ignore-all lint/correctness/noUnusedVariables: <> */

let faceMesh;
let hands;
let video;

let noseX = 0;
let noseY = 0;
let noseZ = 0;

// Smoothed nose position to reduce jitter
let smoothNoseX = 0;
let smoothNoseY = 0;
let smoothNoseZ = 0;

let handX = 0;
let handY = 0;
let handZ = 0;
let handDetected = false;

// Smoothed hand position to reduce jitter
let smoothHandX = 0;
let smoothHandY = 0;
let smoothHandZ = 0;

let faces = [];
let handsResults = [];
const cubes = [];

const grid = {
	size: 100,
	stroke: [255, 255, 255],
};

const app = {
	background: [0, 0, 0],
};

const cube = {
	spacing: 100,
	stroke: [0, 0, 0],
	fill: [
		[255, 255, 0],
		[255, 0, 255],
		[0, 255, 255],
	],
	size: {
		min: 25,
		max: 50,
	},
	range: {
		x: 400,
		y: 300,
		z: 600,
	},
};

const handCalibration = {
	zMin: -0.5,
	zMax: 0.3,
	zMultiplier: 1.5,
	zOffset: 0,
};

const smoothing = {
	nose: 0.15, // Lower = smoother but more lag (0.1-0.3 recommended)
	hand: 0.2, // Lower = smoother but more lag
};

let myFont;

function preload() {
	// Charger une police pour WEBGL
	myFont = loadFont(
		"https://cdnjs.cloudflare.com/ajax/libs/topcoat/0.8.0/font/SourceCodePro-Regular.otf",
	);
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
}

function setup() {
	createCanvas(windowWidth, windowHeight, WEBGL);

	textFont(myFont);
	textSize(16);

	// Create cubes using 3D noise
	const noiseScale = 0.005; // Scale for noise sampling
	const noiseThreshold = 0.3; // Threshold to create cubes

	for (let x = -cube.range.x; x <= cube.range.x; x += cube.spacing) {
		for (let y = -cube.range.y; y <= cube.range.y; y += cube.spacing) {
			for (let z = -cube.range.z; z <= cube.range.z; z += cube.spacing) {
				// Sample 3D noise at this position
				const noiseValue = noise(
					x * noiseScale,
					y * noiseScale,
					z * noiseScale,
				);

				// Only create cube if noise value is above threshold
				if (noiseValue > noiseThreshold) {
					// Use noise to offset position slightly
					const offsetX = map(
						noise(x * noiseScale + 100, y * noiseScale, z * noiseScale),
						0,
						1,
						-30,
						30,
					);
					const offsetY = map(
						noise(x * noiseScale, y * noiseScale + 100, z * noiseScale),
						0,
						1,
						-30,
						30,
					);
					const offsetZ = map(
						noise(x * noiseScale, y * noiseScale, z * noiseScale + 100),
						0,
						1,
						-30,
						30,
					);

					// Use noise to determine size
					const sizeNoise = noise(
						x * noiseScale + 200,
						y * noiseScale + 200,
						z * noiseScale + 200,
					);
					const cubeSize = map(sizeNoise, 0, 1, cube.size.min, cube.size.max);

					cubes.push({
						x: x + offsetX,
						y: y + offsetY,
						z: z + offsetZ,
						size: cubeSize,
						fill: random(cube.fill),
						stroke: cube.stroke,
					});
				}
			}
		}
	}

	// Create video capture (hidden)
	video = createCapture(VIDEO);
	video.size(640, 480);
	video.hide();

	// Initialize MediaPipe Face Mesh
	faceMesh = new FaceMesh({
		locateFile: (file) => {
			return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
		},
	});

	faceMesh.setOptions({
		maxNumFaces: 1,
		refineLandmarks: true,
		minDetectionConfidence: 0.5,
		minTrackingConfidence: 0.5,
	});

	faceMesh.onResults(onFaceResults);

	// Initialize MediaPipe Hands
	hands = new Hands({
		locateFile: (file) => {
			return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
		},
	});

	hands.setOptions({
		maxNumHands: 1,
		modelComplexity: 1,
		minDetectionConfidence: 0.5,
		minTrackingConfidence: 0.5,
	});

	hands.onResults(onHandsResults);

	// Start detection
	const camera = new Camera(video.elt, {
		onFrame: async () => {
			await faceMesh.send({ image: video.elt });
			await hands.send({ image: video.elt });
		},
		width: 640,
		height: 480,
	});

	camera.start();
}

function draw() {
	background(app.background);

	// Apply smoothing to nose position
	smoothNoseX = lerp(smoothNoseX, noseX, smoothing.nose);
	smoothNoseY = lerp(smoothNoseY, noseY, smoothing.nose);
	smoothNoseZ = lerp(smoothNoseZ, noseZ, smoothing.nose);

	// Use smoothed nose position for camera
	const camX = map(smoothNoseX, 0, width, -250, 250);
	const camY = map(smoothNoseY, 0, height, -250, 250);

	// Calculate camZ based on nose depth
	// noseZ typically varies between -0.15 (close) and 0.05 (far)
	// Map this to modify camera distance
	const baseCamZ = height / 2 / tan(PI / 6);
	const camZ = map(smoothNoseZ, -0.15, 0.05, baseCamZ * 0.5, baseCamZ * 1.5);

	camera(camX, camY, camZ, 0, 0, 0, 0, 1, 0);

	// Apply smoothing to hand position
	if (handDetected) {
		smoothHandX = lerp(smoothHandX, handX, smoothing.hand);
		smoothHandY = lerp(smoothHandY, handY, smoothing.hand);
		smoothHandZ = lerp(smoothHandZ, handZ, smoothing.hand);
	}

	applyLights();

	drawCubes();
	drawGrid();
	drawDebugInfo();
}

function applyLights() {
	// Add ambient light for base illumination
	ambientLight(0, 0, 0);

	// Add bright point light that follows the hand
	if (handDetected) {
		pointLight(
			255,
			255,
			255, // Intense white light (values > 255 for more power)
			smoothHandX,
			smoothHandY,
			smoothHandZ,
		);
	}
}

function drawDebugInfo() {
	// Draw debug info in 2D overlay
	push();
	// Reset camera to draw in 2D
	camera(0, 0, height / 2 / tan(PI / 6), 0, 0, 0, 0, 1, 0);
	translate(-width / 2, -height / 2);

	fill(255);
	noStroke();
	textSize(14);
	textAlign(LEFT, TOP);

	if (handDetected) {
		text(`Hand Z raw: ${handsResults[0][8].z.toFixed(4)}`, 10, 20);
		text(`Hand Z mapped: ${handZ.toFixed(1)}`, 10, 40);
		text(
			`Hand position: X=${handX.toFixed(0)}, Y=${handY.toFixed(0)}, Z=${handZ.toFixed(0)}`,
			10,
			60,
		);
		text(
			`Light at hand: X=${smoothHandX.toFixed(0)}, Y=${smoothHandY.toFixed(0)}, Z=${smoothHandZ.toFixed(0)}`,
			10,
			80,
		);
		text("Point light intensity: 500 (white)", 10, 100);
	} else {
		text("No hand detected", 10, 20);
	}

	pop();
}

function drawWall(w, h, gridSize) {
	// Draw a grid on a plane
	stroke(grid.stroke);
	strokeWeight(1);
	noFill();

	// Horizontal lines
	for (let y = -h / 2; y <= h / 2; y += gridSize) {
		line(-w / 2, y, w / 2, y);
	}

	// Vertical lines
	for (let x = -w / 2; x <= w / 2; x += gridSize) {
		line(x, -h / 2, x, h / 2);
	}
}

function drawCubes() {
	// Use smoothed hand position for collision detection
	const handPos = { x: smoothHandX, y: smoothHandY, z: smoothHandZ };

	for (const c of cubes) {
		push();
		translate(c.x, c.y, c.z);

		// Check collision with hand and change stroke color
		if (handDetected && checkCollision(c, handPos)) {
			// Use material that reacts to light for collision
			fill(255, 0, 255);
			stroke(255);
			strokeWeight(1);
		} else {
			// Use material that reacts to light for normal cubes
			fill(c.fill[0], c.fill[1], c.fill[2]);
			strokeWeight(1);
			stroke(c.stroke);
		}

		box(c.size);
		pop();
	}
}

function drawGrid() {
	// Left wall
	push();
	translate(-width * 0.5, 0, 0);
	rotateY(HALF_PI);
	drawWall(width * 2, height, grid.size);
	pop();

	// Right wall
	push();
	translate(width * 0.5, 0, 0);
	rotateY(-HALF_PI);
	drawWall(width * 2, height, grid.size);
	pop();

	// Top wall
	push();
	translate(0, -height * 0.5, 0);
	rotateX(HALF_PI);
	drawWall(width, width * 2, grid.size);
	pop();

	// Bottom wall
	push();
	translate(0, height * 0.5, 0);
	rotateX(-HALF_PI);
	drawWall(width, width * 2, grid.size);
	pop();
}

function checkCollision(cubeObj, handPos) {
	// Simple box collision detection (AABB - Axis-Aligned Bounding Box)
	const halfSize = cubeObj.size / 2;

	return (
		handPos.x >= cubeObj.x - halfSize &&
		handPos.x <= cubeObj.x + halfSize &&
		handPos.y >= cubeObj.y - halfSize &&
		handPos.y <= cubeObj.y + halfSize &&
		handPos.z >= cubeObj.z - halfSize &&
		handPos.z <= cubeObj.z + halfSize
	);
}

function onFaceResults(results) {
	faces = results.multiFaceLandmarks;

	if (faces && faces.length > 0) {
		// Index 1 is the nose tip in the Face Mesh model
		const nose = faces[0][1];

		// Invert X because camera is mirrored
		noseX = (1 - nose.x) * width;
		noseY = nose.y * height;
		// Z represents depth (more negative = closer to camera)
		noseZ = nose.z;
	}
}

function onHandsResults(results) {
	handsResults = results.multiHandLandmarks;

	if (handsResults && handsResults.length > 0) {
		// Use index finger tip (landmark 8) for interaction
		const indexTip = handsResults[0][8];

		// Map hand position to 3D space
		// Invert X because camera is mirrored
		handX = map(1 - indexTip.x, 0, 1, -cube.range.x, cube.range.x);
		handY = map(indexTip.y, 0, 1, -cube.range.y, cube.range.y);

		// Calibrated Z mapping with increased amplitude
		const zRange = cube.range.z * 3; // Double the range for more amplitude
		handZ =
			map(
				indexTip.z,
				handCalibration.zMin,
				handCalibration.zMax,
				-zRange,
				zRange,
			) *
				handCalibration.zMultiplier +
			handCalibration.zOffset;

		handDetected = true;
	} else {
		handDetected = false;
	}
}
