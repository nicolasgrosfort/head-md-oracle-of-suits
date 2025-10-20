/** biome-ignore-all lint/correctness/noUnusedVariables: <> */

const CONFIG = {
	showVideo: false,
};

let capture;
let hands;
let results;
let rectSize = 100; // Taille initiale du rectangle
let cubeRotationX = 0; // Rotation du cube sur l'axe X
let cubeRotationY = 0; // Rotation du cube sur l'axe Y

function setup() {
	createCanvas(640, 480, WEBGL);

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

	// Dessiner la vidéo et les mains en 2D
	push();
	// Revenir en mode 2D pour la vidéo
	translate(-width / 2, -height / 2);

	push();
	translate(width, 0);
	scale(-1, 1);
	CONFIG.showVideo && image(capture, 0, 0, width, height);
	pop();

	if (results?.multiHandLandmarks) {
		if (results.multiHandLandmarks.length === 2) {
			// Deux mains : contrôler la taille
			rectSize = getRectSize(results.multiHandLandmarks);
		} else if (results.multiHandLandmarks.length === 1) {
			// Une seule main : contrôler la rotation
			const hand = results.multiHandLandmarks[0];
			// Utiliser la paume (landmark 0) pour contrôler la rotation
			const palm = hand[0];

			// Convertir la position normalisée en angles de rotation
			// X de la main contrôle la rotation Y du cube (gauche/droite)
			// Y de la main contrôle la rotation X du cube (haut/bas)
			cubeRotationY = map(palm.x, 0, 1, -PI, PI);
			cubeRotationX = map(palm.y, 0, 1, -PI, PI);
		}

		for (const landmarks of results.multiHandLandmarks) {
			drawHand(landmarks);
		}
	}

	// Texte en 2D
	fill(0);
	noStroke();
	text(`FPS: ${floor(frameRate())}`, 10, 20);
	text(`Taille: ${floor(rectSize)}`, 10, 40);
	text(`Mains détectées: ${results?.multiHandLandmarks?.length || 0}`, 10, 60);
	if (results?.multiHandLandmarks?.length === 1) {
		text(`Mode: Rotation`, 10, 80);
	} else if (results?.multiHandLandmarks?.length === 2) {
		text(`Mode: Taille`, 10, 80);
	}
	pop();

	// Dessiner le cube au centre en 3D
	push();
	// Utiliser la rotation contrôlée par la main
	rotateX(cubeRotationX);
	rotateY(cubeRotationY);

	// Style du cube
	fill(100, 150, 255, 200);
	stroke(50, 100, 200);
	strokeWeight(2);

	// Dessiner le cube avec la taille calculée
	box(rectSize);
	pop();
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

function getRectSize(multiHandLandmarks) {
	const hand1 = multiHandLandmarks[0];
	const hand2 = multiHandLandmarks[1];

	// Index tip est le landmark numéro 8
	const index1 = hand1[8];
	const index2 = hand2[8];

	// Convertir les coordonnées normalisées en pixels
	const x1 = width - index1.x * width;
	const y1 = index1.y * height;
	const x2 = width - index2.x * width;
	const y2 = index2.y * height;

	// Calculer la distance entre les deux index
	const distance = dist(x1, y1, x2, y2);

	// Ajuster la taille du rectangle (minimum 50, maximum 400)
	return constrain(distance, 50, 400);
}
