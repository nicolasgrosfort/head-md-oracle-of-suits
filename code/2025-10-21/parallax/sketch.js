/** biome-ignore-all lint/correctness/noUnusedVariables: <> */

let faceMesh;
let video;

let noseX = 0;
let noseY = 0;
let noseZ = 0;

let faces = [];
const cubes = [];

const grid = {
	size: 50,
	stroke: [255, 255, 255],
};

const app = {
	background: [0, 0, 0],
};

const cube = {
	spacing: 150,
	stroke: [0, 0, 0],
	fill: [
		[255, 0, 255],
		[0, 255, 255],
		[255, 255, 0],
		[0, 255, 0],
		[255, 165, 0],
		[255, 192, 203],
	],
	size: {
		min: 20,
		max: 100,
	},
	range: {
		x: 300,
		y: 300,
		z: 600,
	},
};

function setup() {
	createCanvas(windowWidth, windowHeight, WEBGL);

	// Créer les cubes
	for (let x = -cube.range.x; x <= cube.range.x; x += cube.spacing) {
		for (let y = -cube.range.y; y <= cube.range.y; y += cube.spacing) {
			for (let z = -cube.range.z; z <= cube.range.z; z += cube.spacing) {
				cubes.push({
					x,
					y,
					z,
					size: random(cube.size.min, cube.size.max),
					fill: random(cube.fill),
					stroke: cube.stroke,
				});
			}
		}
	}

	// Créer la capture vidéo (cachée)
	video = createCapture(VIDEO);
	video.size(640, 480);
	video.hide();

	// Initialiser MediaPipe Face Mesh
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

	faceMesh.onResults(onResults);

	// Démarrer la détection
	const camera = new Camera(video.elt, {
		onFrame: async () => {
			await faceMesh.send({ image: video.elt });
		},
		width: 640,
		height: 480,
	});

	camera.start();
}

function onResults(results) {
	faces = results.multiFaceLandmarks;

	if (faces && faces.length > 0) {
		// Index 1 est le bout du nez dans le modèle Face Mesh
		const nose = faces[0][1];

		// Inverser X car la caméra est en miroir
		noseX = (1 - nose.x) * width;
		noseY = nose.y * height;
		// Z représente la profondeur (plus négatif = plus proche de la caméra)
		noseZ = nose.z;
	}
}

function drawWall(w, h, gridSize) {
	// Dessiner une grille sur un plan
	stroke(grid.stroke);
	strokeWeight(1);
	noFill();

	// Lignes horizontales
	for (let y = -h / 2; y <= h / 2; y += gridSize) {
		line(-w / 2, y, w / 2, y);
	}

	// Lignes verticales
	for (let x = -w / 2; x <= w / 2; x += gridSize) {
		line(x, -h / 2, x, h / 2);
	}
}

function drawCubes() {
	for (const c of cubes) {
		push();
		translate(c.x, c.y, c.z);
		fill(c.fill);
		stroke(c.stroke);
		box(c.size);
		pop();
	}
}

function drawGrid() {
	// Mur gauche
	push();
	translate(-width * 0.5, 0, 0);
	rotateY(HALF_PI);
	drawWall(width, height, grid.size);
	pop();

	// Mur droite
	push();
	translate(width * 0.5, 0, 0);
	rotateY(-HALF_PI);
	drawWall(width, height, grid.size);
	pop();

	// Mur haut
	push();
	translate(0, -height * 0.5, 0);
	rotateX(HALF_PI);
	drawWall(width, width, grid.size);
	pop();

	// Mur bas
	push();
	translate(0, height * 0.5, 0);
	rotateX(-HALF_PI);
	drawWall(width, width, grid.size);
	pop();
}

function draw() {
	background(app.background);

	// Utiliser la position du nez au lieu de la souris
	const camX = map(noseX, 0, width, -250, 250);
	const camY = map(noseY, 0, height, -250, 250);

	// Calculer camZ en fonction de la profondeur du nez
	// noseZ varie généralement entre -0.15 (proche) et 0.05 (loin)
	// On mappe cela pour modifier la distance de la caméra
	const baseCamZ = height / 2 / tan(PI / 6);
	const camZ = map(noseZ, -0.15, 0.05, baseCamZ * 0.5, baseCamZ * 1.5);

	camera(camX, camY, camZ, 0, 0, 0, 0, 1, 0);

	drawCubes();
	drawGrid();
}
