/** biome-ignore-all lint/correctness/noUnusedVariables: <> */

let cam;
let cameraAngleY = 0; // Rotation horizontale (gauche/droite)
let cameraAngleX = 0; // Rotation verticale (haut/bas)
let camX = 0;
let camY = 0; // Hauteur de la caméra (peut maintenant changer)
let camZ = 500; // Distance initiale de l'objet

const boxes = []; // Array pour stocker les positions et propriétés des boîtes

function setup() {
	createCanvas(windowWidth, windowHeight, WEBGL);

	// Setup a camera
	cam = createCamera();
	cam.setPosition(camX, camY, camZ);
	updateCameraLookAt();

	// Capturer le pointeur pour un contrôle FPS
	requestPointerLock();

	// Créer plusieurs boîtes dispersées aléatoirement
	const numBoxes = 150; // Nombre de boîtes
	for (let i = 0; i < numBoxes; i++) {
		boxes.push({
			x: random(-2000, 2000),
			y: random(-1000, 1000),
			z: random(-2000, 2000),
			size: random(50, 200),
			rotX: random(TWO_PI),
			rotY: random(TWO_PI),
			rotZ: random(TWO_PI),
			color: color(random(100, 255), random(100, 255), random(100, 255)),
		});
	}
}

function updateCameraLookAt() {
	// La caméra regarde dans la direction de ses angles (horizontal et vertical)
	const lookX = camX - sin(cameraAngleY) * 100 * cos(cameraAngleX);
	const lookY = camY - sin(cameraAngleX) * 100;
	const lookZ = camZ - cos(cameraAngleY) * 100 * cos(cameraAngleX);

	cam.lookAt(lookX, lookY, lookZ);
}

function draw() {
	background(220);

	const rotationSpeed = 0.03;
	const moveSpeed = 5;
	const mouseSensitivity = 0.002;

	// Contrôle souris pour regarder autour (FPS style)
	if (document.pointerLockElement === canvas) {
		cameraAngleY -= movedX * mouseSensitivity;
		cameraAngleX -= movedY * mouseSensitivity;
		// Limiter l'angle vertical pour éviter le retournement
		cameraAngleX = constrain(cameraAngleX, -HALF_PI + 0.1, HALF_PI - 0.1);
		updateCameraLookAt();
	}

	// A ou Flèche gauche - pivoter la caméra à gauche (sur place)
	if (keyIsDown(65) || keyIsDown(LEFT_ARROW)) {
		cameraAngleY += rotationSpeed;
		updateCameraLookAt();
	}
	// D ou Flèche droite - pivoter la caméra à droite (sur place)
	if (keyIsDown(68) || keyIsDown(RIGHT_ARROW)) {
		cameraAngleY -= rotationSpeed;
		updateCameraLookAt();
	}
	// W ou Flèche haut - avancer dans la direction où on regarde (en 3D complet)
	if (keyIsDown(87) || keyIsDown(UP_ARROW)) {
		camX -= sin(cameraAngleY) * moveSpeed * cos(cameraAngleX);
		camY -= sin(cameraAngleX) * moveSpeed;
		camZ -= cos(cameraAngleY) * moveSpeed * cos(cameraAngleX);
		cam.setPosition(camX, camY, camZ);
		updateCameraLookAt();
	}
	// S ou Flèche bas - reculer dans la direction où on regarde (en 3D complet)
	if (keyIsDown(83) || keyIsDown(DOWN_ARROW)) {
		camX += sin(cameraAngleY) * moveSpeed * cos(cameraAngleX);
		camY += sin(cameraAngleX) * moveSpeed;
		camZ += cos(cameraAngleY) * moveSpeed * cos(cameraAngleX);
		cam.setPosition(camX, camY, camZ);
		updateCameraLookAt();
	}

	// Dessiner toutes les boîtes
	for (let i = 0; i < boxes.length; i++) {
		push();
		translate(boxes[i].x, boxes[i].y, boxes[i].z);
		rotateX(boxes[i].rotX);
		rotateY(boxes[i].rotY);
		rotateZ(boxes[i].rotZ);
		fill(boxes[i].color);
		box(boxes[i].size);
		pop();
	}

	// Dessiner un sol de référence (grille)
	push();
	rotateX(HALF_PI);
	stroke(150);
	noFill();
	for (let x = -1000; x <= 1000; x += 200) {
		line(x, -1000, x, 1000);
	}
	for (let z = -1000; z <= 1000; z += 200) {
		line(-1000, z, 1000, z);
	}
	pop();
}

// Capturer la souris quand on clique
function mousePressed() {
	requestPointerLock();
}

// Quitter le mode pointer lock avec Echap
function keyPressed() {
	if (keyCode === ESCAPE) {
		document.exitPointerLock();
	}
}
