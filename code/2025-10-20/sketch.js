/** biome-ignore-all lint/correctness/noUnusedVariables: <> */

const CONFIG = {
	showVideo: false,
	drawManipulationZone: true,
	drawPalmPosition: true,
	drawHandLandmarks: false,
};

let capture;
let hands;
let results;
let rectSize = 100; // Taille initiale du rectangle
let targetRectSize = 100; // Taille cible pour l'effet spring
let rectVelocity = 0; // Vélocité du redimensionnement
let cubeRotationX = 0; // Rotation du cube sur l'axe X
let cubeRotationY = 0; // Rotation du cube sur l'axe Y
let rotationVelocityX = 0; // Vélocité de rotation sur l'axe X
let rotationVelocityY = 0; // Vélocité de rotation sur l'axe Y
let previousPalmX = null; // Position précédente de la paume en X
let previousPalmY = null; // Position précédente de la paume en Y
let previousDistance = null; // Distance précédente entre les doigts
const rotationSpeed = 0.1; // Vitesse de rotation
const zoomSpeed = 0.5; // Vitesse de zoom
const inertia = 0.95; // Coefficient d'inertie (0.95 = 95% de conservation de la vélocité)
// Constantes pour l'effet spring du zoom
const springK = 0.15; // Constante de ressort (rigidité)
const springDamp = 0.8; // Amortissement du ressort
const springMass = 0.5; // Masse pour la simulation

function setup() {
	createCanvas(windowWidth, windowHeight, WEBGL);

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
	background(255);

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
		// Identifier les mains gauche et droite
		let leftHand = null;
		let rightHand = null;

		if (results.multiHandedness) {
			for (let i = 0; i < results.multiHandLandmarks.length; i++) {
				const handedness = results.multiHandedness[i].label;
				// Note: MediaPipe retourne "Left" pour la main droite à cause du miroir
				if (handedness === "Left") {
					// C'est la main droite (inversée par le miroir)
					rightHand = results.multiHandLandmarks[i];
				} else if (handedness === "Right") {
					// C'est la main gauche (inversée par le miroir)
					leftHand = results.multiHandLandmarks[i];
				}
			}
		}

		// Vérifier si les mains sont dans la zone
		const rightHandInZone = rightHand && isHandInManipulationZone(rightHand);
		const leftHandInZone = leftHand && isHandInManipulationZone(leftHand);

		// Main droite : contrôler le zoom avec pinch (seulement si dans la zone)
		if (rightHandInZone) {
			const currentDistance = getPinchDistance(rightHand);

			if (previousDistance !== null) {
				// Calculer le changement de distance
				const deltaDistance = currentDistance - previousDistance;

				// Mettre à jour la taille CIBLE au lieu de la taille directe
				targetRectSize += deltaDistance * zoomSpeed;

				// Contraindre la taille cible entre 50 et 400
				targetRectSize = constrain(targetRectSize, 50, 400);
			}

			// Sauvegarder la distance actuelle
			previousDistance = currentDistance;
		} else {
			// Pas de main droite ou hors de la zone, réinitialiser
			previousDistance = null;
		}

		// Main gauche : contrôler la rotation (seulement si dans la zone)
		if (leftHandInZone) {
			const palm = leftHand[0];

			if (previousPalmX !== null && previousPalmY !== null) {
				// Calculer le déplacement de la main
				const deltaX = palm.x - previousPalmX;
				const deltaY = palm.y - previousPalmY;

				// Ajouter à la vélocité au lieu d'incrémenter directement
				rotationVelocityY += deltaX * rotationSpeed * 10;
				rotationVelocityX -= deltaY * rotationSpeed * 10;
			}

			// Sauvegarder la position actuelle pour la prochaine frame
			previousPalmX = palm.x;
			previousPalmY = palm.y;
		} else {
			// Pas de main gauche ou hors de la zone, réinitialiser
			previousPalmX = null;
			previousPalmY = null;
		}

		// Appliquer l'inertie à la vélocité de rotation
		rotationVelocityX *= inertia;
		rotationVelocityY *= inertia;

		// Appliquer la vélocité à la rotation
		cubeRotationX += rotationVelocityX;
		cubeRotationY -= rotationVelocityY;

		if (CONFIG.drawHandLandmarks) {
			for (const landmarks of results.multiHandLandmarks) {
				drawHand(landmarks);
			}
		}
	} else {
		// Pas de résultats, réinitialiser
		previousPalmX = null;
		previousPalmY = null;
		previousDistance = null;
	}

	// Appliquer l'effet spring au redimensionnement du cube
	updateSizeSpring();

	// Dessiner la zone de manipulation
	drawManipulationZone();

	// Dessiner la position des paumes pour debug
	if (results?.multiHandLandmarks) {
		for (let i = 0; i < results.multiHandLandmarks.length; i++) {
			const hand = results.multiHandLandmarks[i];
			const palm = hand[0];
			const handX = width - palm.x * width;
			const handY = palm.y * height;

			// Dessiner un cercle à la position de la paume
			const inZone = isHandInManipulationZone(hand);
			fill(inZone ? color(0, 255, 0, 150) : color(255, 0, 0, 150));
			noStroke();
			circle(handX, handY, 30);
		}
	}

	// Dessiner un indicateur de position de la lumière
	push();
	fill(255, 255, 0, 200);
	noStroke();
	circle(mouseX, mouseY, 15);
	fill(255, 255, 0, 100);
	circle(mouseX, mouseY, 30);
	pop();

	// Texte en 2D
	fill(0);
	noStroke();
	text(`FPS: ${floor(frameRate())}`, 10, 20);
	text(`Taille: ${floor(rectSize)}`, 10, 40);
	text(`Mains détectées: ${results?.multiHandLandmarks?.length || 0}`, 10, 60);
	text(`Lumière: (${mouseX}, ${mouseY})`, 10, 80);

	// Afficher les modes actifs avec statut de zone
	let y = 100;
	if (results?.multiHandedness) {
		let leftHand = null;
		let rightHand = null;

		for (let i = 0; i < results.multiHandLandmarks.length; i++) {
			const handedness = results.multiHandedness[i].label;
			if (handedness === "Left") {
				rightHand = results.multiHandLandmarks[i];
			} else if (handedness === "Right") {
				leftHand = results.multiHandLandmarks[i];
			}
		}

		if (rightHand) {
			const inZone = isHandInManipulationZone(rightHand);
			fill(inZone ? color(0, 200, 0) : color(200, 0, 0));
			text(
				`Main droite: Zoom ${inZone ? "✓ DANS LA ZONE" : "✗ Hors zone"}`,
				10,
				y,
			);
			y += 20;
		}

		if (leftHand) {
			const inZone = isHandInManipulationZone(leftHand);
			fill(inZone ? color(0, 200, 0) : color(200, 0, 0));
			text(
				`Main gauche: Rotation ${inZone ? "✓ DANS LA ZONE" : "✗ Hors zone"}`,
				10,
				y,
			);
			y += 20;
		}
	}
	pop();

	// Dessiner le cube au centre en 3D
	push();

	// Ajouter l'éclairage qui suit la souris
	// Convertir la position de la souris en coordonnées 3D
	const lightX = mouseX - width / 2;
	const lightY = mouseY - height / 2;
	const lightZ = 200; // Distance de la lumière en profondeur

	// Lumière ambiante douce
	ambientLight(0, 255, 255);

	// Lumière directionnelle qui suit la souris
	pointLight(255, 0, 255, lightX, lightY, lightZ);

	// Lumière d'appoint pour ne pas avoir de zones trop sombres
	pointLight(255, 255, 0, -200, 0, 100);

	// Utiliser la rotation contrôlée par la main
	rotateX(cubeRotationX);
	rotateY(cubeRotationY);

	// Style du cube
	fill(100, 150, 255);
	stroke(50, 100, 200);
	strokeWeight(2);

	// Dessiner le cube avec la taille calculée
	specularMaterial(120);
	box(rectSize);
	pop();
}

function updateSizeSpring() {
	// Simulation de ressort pour le redimensionnement du cube
	// f = -k * (position - restPosition)
	const force = -springK * (rectSize - targetRectSize);

	// a = f / m
	const accel = force / springMass;

	// Appliquer l'accélération à la vélocité avec amortissement
	rectVelocity = springDamp * (rectVelocity + accel);

	// Mettre à jour la position (taille)
	rectSize += rectVelocity;

	// Contraindre la taille entre 50 et 400
	rectSize = constrain(rectSize, 50, 400);
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

function getHandsDistance(multiHandLandmarks) {
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

	// Calculer et retourner la distance entre les deux index
	return dist(x1, y1, x2, y2);
}

function getPinchDistance(hand) {
	// Pouce tip = landmark 4, Index tip = landmark 8
	const thumb = hand[4];
	const index = hand[8];

	// Convertir les coordonnées normalisées en pixels
	const x1 = width - thumb.x * width;
	const y1 = thumb.y * height;
	const x2 = width - index.x * width;
	const y2 = index.y * height;

	// Calculer et retourner la distance entre le pouce et l'index
	return dist(x1, y1, x2, y2);
}

function isHandInManipulationZone(hand) {
	// Utiliser la paume (landmark 0) pour détecter la position de la main
	const palm = hand[0];

	// Convertir les coordonnées normalisées en pixels
	const handX = width - palm.x * width;
	const handY = palm.y * height;

	// Définir la zone de manipulation (1/3 de la hauteur et largeur, centrée)
	const zoneWidth = width / 3;
	const zoneHeight = height / 3;
	const zoneX = width / 2 - zoneWidth / 2;
	const zoneY = height / 2 - zoneHeight / 2;

	// Vérifier si la main est dans la zone
	return (
		handX > zoneX &&
		handX < zoneX + zoneWidth &&
		handY > zoneY &&
		handY < zoneY + zoneHeight
	);
}

function drawManipulationZone() {
	// Dessiner la zone de manipulation en 2D
	const zoneWidth = width / 3;
	const zoneHeight = height / 3;

	push();
	noFill();
	stroke(100, 200, 255, 150);
	strokeWeight(3);
	rectMode(CENTER);
	rect(width / 2, height / 2, zoneWidth, zoneHeight);

	// Ajouter des coins pour mieux visualiser
	stroke(100, 200, 255, 200);
	strokeWeight(5);
	const cornerSize = 20;
	const halfW = zoneWidth / 2;
	const halfH = zoneHeight / 2;
	const centerX = width / 2;
	const centerY = height / 2;

	// Coin haut gauche
	line(
		centerX - halfW,
		centerY - halfH,
		centerX - halfW + cornerSize,
		centerY - halfH,
	);
	line(
		centerX - halfW,
		centerY - halfH,
		centerX - halfW,
		centerY - halfH + cornerSize,
	);

	// Coin haut droit
	line(
		centerX + halfW,
		centerY - halfH,
		centerX + halfW - cornerSize,
		centerY - halfH,
	);
	line(
		centerX + halfW,
		centerY - halfH,
		centerX + halfW,
		centerY - halfH + cornerSize,
	);

	// Coin bas gauche
	line(
		centerX - halfW,
		centerY + halfH,
		centerX - halfW + cornerSize,
		centerY + halfH,
	);
	line(
		centerX - halfW,
		centerY + halfH,
		centerX - halfW,
		centerY + halfH - cornerSize,
	);

	// Coin bas droit
	line(
		centerX + halfW,
		centerY + halfH,
		centerX + halfW - cornerSize,
		centerY + halfH,
	);
	line(
		centerX + halfW,
		centerY + halfH,
		centerX + halfW,
		centerY + halfH - cornerSize,
	);

	pop();
}
