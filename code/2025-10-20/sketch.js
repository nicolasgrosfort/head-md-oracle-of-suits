/** biome-ignore-all lint/correctness/noUnusedVariables: <> */

let capture;
let hands;
let results;

function setup() {
	createCanvas(640, 480);

	capture = createCapture(VIDEO);
	capture.size(640, 480);
	capture.hide();

	hands = new Hands({
		locateFile: (file) => {
			return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
		},
	});

	hands.setOptions({
		maxNumHands: 2,
		modelComplexity: 1,
		minDetectionConfidence: 0.5,
		minTrackingConfidence: 0.5,
	});

	hands.onResults(onResults);

	detectHands();
}

function draw() {
	background(220);

	push();
	translate(width, 0);
	scale(-1, 1);
	image(capture, 0, 0, width, height);
	pop();

	if (results?.multiHandLandmarks) {
		for (const landmarks of results.multiHandLandmarks) {
			drawHand(landmarks);
		}
	}

	fill(0);
	noStroke();
	text(`FPS: ${floor(frameRate())}`, 10, 20);
}

function onResults(res) {
	results = res;
}

async function detectHands() {
	if (capture.loadedmetadata) {
		await hands.send({ image: capture.elt });
	}
	requestAnimationFrame(detectHands);
}

function drawHand(landmarks) {
	// Draw connections between landmarks
	stroke(0, 255, 0);
	strokeWeight(2);
	noFill();

	const connections = [
		[0, 1],
		[1, 2],
		[2, 3],
		[3, 4], // Thumb
		[0, 5],
		[5, 6],
		[6, 7],
		[7, 8], // Index
		[0, 9],
		[9, 10],
		[10, 11],
		[11, 12], // Middle
		[0, 13],
		[13, 14],
		[14, 15],
		[15, 16], // Ring
		[0, 17],
		[17, 18],
		[18, 19],
		[19, 20], // Pinky
		[5, 9],
		[9, 13],
		[13, 17], // Palm
	];

	for (const connection of connections) {
		const point1 = landmarks[connection[0]];
		const point2 = landmarks[connection[1]];

		const x1 = width - point1.x * width;
		const y1 = point1.y * height;
		const x2 = width - point2.x * width;
		const y2 = point2.y * height;

		line(x1, y1, x2, y2);
	}

	// Draw landmarks
	fill(255, 0, 0);
	noStroke();

	for (const landmark of landmarks) {
		const x = width - landmark.x * width;
		const y = landmark.y * height;
		circle(x, y, 8);
	}
}
