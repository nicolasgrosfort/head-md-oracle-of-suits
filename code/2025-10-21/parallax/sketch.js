/** biome-ignore-all lint/correctness/noUnusedVariables: <> */

let faceMesh;
let video;
let noseX = 0;
let noseY = 0;
let faces = [];

function setup() {
	createCanvas(windowWidth, windowHeight, WEBGL);

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
	}
}

function draw() {
	background(220);

	push();
	fill(150, 0, 150);
	box(100);
	pop();

	// Utiliser la position du nez au lieu de la souris
	const camX = map(noseX, 0, width, -250, 250);
	const camY = map(noseY, 0, height, -250, 250);
	const camZ = height / 2 / tan(PI / 6);

	camera(camX, camY, camZ, 0, 0, 0, 0, 1, 0);
}
