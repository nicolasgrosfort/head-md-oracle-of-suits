/** biome-ignore-all lint/correctness/noUnusedVariables: <> */

const CONFIG = {
	drawGrid: false,
	amountOfBoxes: 200,
	collisionDistance: 100, // Distance de collision avec les cubes
};

let cam;
let cameraAngleY = 0; // Rotation horizontale (gauche/droite)
let cameraAngleX = 0; // Rotation verticale (haut/bas)
let camX = 0;
let camY = 0; // Hauteur de la caméra (peut maintenant changer)
let camZ = 500; // Distance initiale de l'objet

const boxes = []; // Array pour stocker les positions et propriétés des boîtes
let osc; // Oscillateur pour générer le son

// Fonction pour vérifier la collision entre la caméra et un cube
function checkCollision(box) {
	// Calculer la distance entre la caméra et le centre du cube
	const distance = dist(camX, camY, camZ, box.x, box.y, box.z);
	// Collision si la distance est inférieure à la somme des rayons
	// (rayon du cube = size/2, rayon du joueur = collisionDistance)
	return distance < box.size / 2 + CONFIG.collisionDistance;
}

// Fonction pour jouer un son aléatoire lors de la capture d'un cube
function playCaptureSound() {
	// Créer un oscillateur si ce n'est pas déjà fait
	if (!osc) {
		osc = new p5.Oscillator();
		osc.setType("sine"); // Type d'onde: sine, triangle, square, sawtooth
		osc.start();
		osc.amp(0); // Commencer avec une amplitude de 0 (silence)
	}

	// Fréquence aléatoire entre 200 et 800 Hz pour varier les sons
	const freq = random(200, 800);
	osc.freq(freq);

	// Envelope pour créer un "bip" court
	osc.amp(0.3, 0.01); // Monter à 0.3 en 0.01 seconde
	osc.amp(0, 0.15); // Descendre à 0 en 0.15 seconde
}

function setup() {
	createCanvas(windowWidth, windowHeight, WEBGL);

	// Setup a camera
	cam = createCamera();
	cam.setPosition(camX, camY, camZ);
	updateCameraLookAt();

	// Capturer le pointeur pour un contrôle FPS
	requestPointerLock();

	// Créer plusieurs boîtes dispersées aléatoirement
	for (let i = 0; i < CONFIG.amountOfBoxes; i++) {
		boxes.push({
			x: random(-1000, 1000),
			y: random(-500, 500),
			z: random(-1000, 1000),
			size: random(50, 150),
			rotX: random(TWO_PI),
			rotY: random(TWO_PI),
			rotZ: random(TWO_PI),
			color: color(random(0, 255), random(0, 255), random(0, 255)),
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
	background(0); // Environnement totalement noir

	const rotationSpeed = 0.03;
	const moveSpeed = 5;
	const mouseSensitivity = 0.002;

	// Configurer la lampe torche (spotlight) qui suit la caméra
	// Direction de la lampe = direction du regard
	const spotDirX = -sin(cameraAngleY) * cos(cameraAngleX);
	const spotDirY = -sin(cameraAngleX);
	const spotDirZ = -cos(cameraAngleY) * cos(cameraAngleX);

	// Lumière ambiante très faible
	//ambientLight(10, 10, 10);

	// Spotlight qui suit la caméra
	//pointLight(255, 255, 200, camX, camY, camZ); // Lumière ponctuelle à la position de la caméra
	spotLight(
		250,
		250,
		250,
		camX,
		camY,
		camZ,
		spotDirX,
		spotDirY,
		spotDirZ,
		PI / 10,
		100,
	); // Lampe torche

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

	// Vérifier et gérer les collisions avec les cubes
	for (let i = boxes.length - 1; i >= 0; i--) {
		if (checkCollision(boxes[i])) {
			// Jouer le son de capture
			playCaptureSound();
			// Supprimer le cube du tableau
			boxes.splice(i, 1);
		}
	}

	// Dessiner toutes les boîtes restantes
	for (let i = 0; i < boxes.length; i++) {
		push();
		translate(boxes[i].x, boxes[i].y, boxes[i].z);
		rotateX(boxes[i].rotX);
		rotateY(boxes[i].rotY);
		rotateZ(boxes[i].rotZ);
		fill(boxes[i].color);
		stroke(0);
		strokeWeight(1);
		specularMaterial(boxes[i].color); // Matériau qui réagit à la lumière
		box(boxes[i].size);
		pop();
	}

	if (CONFIG.drawGrid) {
		// Dessiner un sol de référence (grille) - maintenant visible avec la lampe
		push();
		translate(0, 200, 0); // Sol plus bas
		rotateX(HALF_PI);
		stroke(80, 80, 80);
		strokeWeight(1);
		noFill();
		for (let x = -2000; x <= 2000; x += 200) {
			line(x, -2000, x, 2000);
		}
		for (let z = -2000; z <= 2000; z += 200) {
			line(-2000, z, 2000, z);
		}
		pop();
	}
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
