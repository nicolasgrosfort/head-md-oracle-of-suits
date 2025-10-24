// Variables globales pour MediaPipe
let handTracker = null;
let hands = [];
let handVideo = null;
let isHandTrackingReady = false;

/**
 * Initialise le tracking des mains avec MediaPipe
 * @param {Object} options - Options de configuration
 * @returns {Object} Instance du tracker de mains
 */
function createHandTracker(options = {}) {
	const config = {
		maxHands: options.maxHands || 2,
		modelComplexity: options.modelComplexity || 1,
		minDetectionConfidence: options.minDetectionConfidence || 0.5,
		minTrackingConfidence: options.minTrackingConfidence || 0.5,
		selfieMode:
			options.selfieMode !== undefined ? options.selfieMode : true,
	};

	// Créer la capture vidéo
	handVideo = createCapture(VIDEO);
	handVideo.size(640, 480);
	handVideo.hide();

	// Initialiser MediaPipe Hands
	const hands_instance = new Hands({
		locateFile: (file) => {
			return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
		},
	});

	hands_instance.setOptions({
		maxNumHands: config.maxHands,
		modelComplexity: 1,
		minDetectionConfidence: config.minDetectionConfidence,
		minTrackingConfidence: config.minTrackingConfidence,
		selfieMode: true,
	});

	hands_instance.onResults(onHandsResults);

	handTracker = {
		hands: hands_instance,
		config: config,
		isReady: false,
	};

	// Attendre que la vidéo soit prête avant de démarrer la détection
	handVideo.elt.addEventListener("loadeddata", () => {
		console.log("Vidéo prête, démarrage du tracking...");
		// Démarrer la détection une fois que la vidéo est prête
		setTimeout(() => {
			detectHands();
		}, 500); // Petit délai pour s'assurer que tout est prêt
	});

	return handTracker;
}

/**
 * Fonction de callback appelée quand des mains sont détectées
 */
function onHandsResults(results) {
	hands = [];
	isHandTrackingReady = true;
	handTracker.isReady = true;

	if (results.multiHandLandmarks && results.multiHandedness) {
		for (let i = 0; i < results.multiHandLandmarks.length; i++) {
			const landmarks = results.multiHandLandmarks[i];
			const handedness = results.multiHandedness[i];

			// Inverser gauche/droite si flipHorizontal est activé (effet miroir)
			let handLabel = handedness.label;
			if (handTracker.config.flipHorizontal) {
				handLabel = handLabel === "Left" ? "Right" : "Left";
			}

			const handData = {
				landmarks: landmarks,
				handedness: handLabel, // "Left" ou "Right" (corrigé pour l'effet miroir)
				score: handedness.score,
				index: i,
			};

			// Ajouter des fonctions helper pour accéder facilement aux landmarks
			handData.thumb = getLandmarksByFinger(landmarks, "thumb");
			handData.indexFinger = getLandmarksByFinger(landmarks, "index");
			handData.middleFinger = getLandmarksByFinger(landmarks, "middle");
			handData.ringFinger = getLandmarksByFinger(landmarks, "ring");
			handData.pinky = getLandmarksByFinger(landmarks, "pinky");
			handData.wrist = landmarks[0];
			handData.palm = landmarks[0];

			hands.push(handData);
		}
	}
}

/**
 * Récupère les landmarks d'un doigt spécifique
 */
function getLandmarksByFinger(landmarks, finger) {
	const fingerIndices = {
		thumb: [1, 2, 3, 4],
		index: [5, 6, 7, 8],
		middle: [9, 10, 11, 12],
		ring: [13, 14, 15, 16],
		pinky: [17, 18, 19, 20],
	};

	const indices = fingerIndices[finger];
	return indices.map((i) => landmarks[i]);
}

/**
 * Détecte les mains en continu
 */
async function detectHands() {
	if (handVideo?.elt && handTracker) {
		// Vérifier que la vidéo a des données valides
		if (handVideo.elt.readyState >= 2 && handVideo.elt.videoWidth > 0) {
			try {
				await handTracker.hands.send({ image: handVideo.elt });
			} catch (error) {
				console.error("Erreur lors de la détection:", error);
			}
		}
		requestAnimationFrame(detectHands);
	}
}

/**
 * Retourne le tableau des mains détectées
 * À utiliser dans draw()
 * @returns {Array} Tableau des mains détectées
 */
function getHands() {
	return hands;
}

/**
 * Retourne true si au moins une main est détectée
 * @returns {boolean}
 */
function handsDetected() {
	return hands.length > 0;
}

/**
 * Retourne le nombre de mains détectées
 * @returns {number}
 */
function getHandCount() {
	return hands.length;
}

/**
 * Dessine les landmarks d'une main
 * @param {Object} hand - Objet main
 * @param {number} size - Taille des points (défaut: 5)
 * @param {string|Array} color - Couleur des points (défaut: rouge)
 */
function drawHand(hand, size = 5, color = [255, 0, 0]) {
	if (!hand || !hand.landmarks) return;

	push();
	fill(color);
	noStroke();

	// Dessiner tous les landmarks
	for (const landmark of hand.landmarks) {
		const pos = landmarkToCanvas(landmark);
		circle(pos.x, pos.y, size);
	}

	pop();
}

/**
 * Dessine les connexions entre les landmarks d'une main
 * @param {Object} hand - Objet main
 * @param {number} thickness - Épaisseur des lignes (défaut: 2)
 * @param {string|Array} color - Couleur des lignes (défaut: blanc)
 */
function drawHandConnections(hand, thickness = 2, color = [255, 255, 255]) {
	if (!hand || !hand.landmarks) return;

	const connections = [
		// Pouce
		[0, 1],
		[1, 2],
		[2, 3],
		[3, 4],
		// Index
		[0, 5],
		[5, 6],
		[6, 7],
		[7, 8],
		// Majeur
		[0, 9],
		[9, 10],
		[10, 11],
		[11, 12],
		// Annulaire
		[0, 13],
		[13, 14],
		[14, 15],
		[15, 16],
		// Auriculaire
		[0, 17],
		[17, 18],
		[18, 19],
		[19, 20],
		// Paume
		[5, 9],
		[9, 13],
		[13, 17],
	];

	push();
	stroke(color);
	strokeWeight(thickness);
	noFill();

	for (const [start, end] of connections) {
		const startLandmark = hand.landmarks[start];
		const endLandmark = hand.landmarks[end];

		const p1 = landmarkToCanvas(startLandmark);
		const p2 = landmarkToCanvas(endLandmark);

		line(p1.x, p1.y, p2.x, p2.y);
	}

	pop();
}

/**
 * Dessine une main avec les landmarks et les connexions
 * @param {Object} hand - Objet main
 * @param {Object} options - Options de dessin
 */
function drawHandSkeleton(hand, options = {}) {
	const config = {
		pointSize: options.pointSize || 5,
		pointColor: options.pointColor || [255, 0, 0],
		lineThickness: options.lineThickness || 2,
		lineColor: options.lineColor || [255, 255, 255],
		showConnections: options.showConnections !== false,
		showPoints: options.showPoints !== false,
	};

	if (config.showConnections) {
		drawHandConnections(hand, config.lineThickness, config.lineColor);
	}
	if (config.showPoints) {
		drawHand(hand, config.pointSize, config.pointColor);
	}
}

/**
 * Convertit un landmark en coordonnées canvas
 * @param {Object} landmark - Landmark MediaPipe
 * @returns {Object} {x, y, z}
 */
function landmarkToCanvas(landmark) {
	let x = landmark.x * width;
	const y = landmark.y * height;

	// Si flipHorizontal est activé, inverser la coordonnée X
	if (handTracker?.config.flipHorizontal) {
		x = width - x;
	}

	return {
		x: x,
		y: y,
		z: landmark.z,
	};
}

/**
 * Calcule la distance entre deux landmarks
 * @param {Object} landmark1 - Premier landmark
 * @param {Object} landmark2 - Deuxième landmark
 * @returns {number} Distance en pixels
 */
function landmarkDistance(landmark1, landmark2) {
	const p1 = landmarkToCanvas(landmark1);
	const p2 = landmarkToCanvas(landmark2);
	return dist(p1.x, p1.y, p2.x, p2.y);
}

/**
 * Détecte si le pouce et l'index sont en position "pinch" (pincé)
 * @param {Object} hand - Objet main
 * @param {number} threshold - Distance maximale en pixels (défaut: 30)
 * @returns {boolean}
 */
function isPinching(hand, threshold = 30) {
	if (!hand || !hand.thumb || !hand.indexFinger) return false;

	const thumbTip = hand.thumb[3]; // Bout du pouce
	const indexTip = hand.indexFinger[3]; // Bout de l'index

	const distance = landmarkDistance(thumbTip, indexTip);
	return distance < threshold;
}

/**
 * Détecte si un doigt est levé
 * @param {Object} hand - Objet main
 * @param {string} fingerName - Nom du doigt ('thumb', 'index', 'middle', 'ring', 'pinky')
 * @returns {boolean}
 */
function isFingerUp(hand, fingerName) {
	if (!hand) return false;

	const finger = hand[`${fingerName}Finger`] || hand[fingerName];
	if (!finger) return false;

	const tip = finger[3];
	const pip = finger[2];

	// Pour le pouce, vérifier la position horizontale
	if (fingerName === "thumb") {
		const mcp = finger[1];
		if (hand.handedness === "Right") {
			return tip.x < mcp.x;
		} else {
			return tip.x > mcp.x;
		}
	}

	// Pour les autres doigts, vérifier la position verticale
	return tip.y < pip.y;
}

/**
 * Compte le nombre de doigts levés
 * @param {Object} hand - Objet main
 * @returns {number}
 */
function countFingersUp(hand) {
	if (!hand) return 0;

	let count = 0;
	const fingers = ["thumb", "index", "middle", "ring", "pinky"];

	for (const finger of fingers) {
		if (isFingerUp(hand, finger)) {
			count++;
		}
	}

	return count;
}

/**
 * Affiche la vidéo de la caméra
 * @param {number} x - Position X (défaut: 0)
 * @param {number} y - Position Y (défaut: 0)
 * @param {number} w - Largeur (défaut: largeur du canvas)
 * @param {number} h - Hauteur (défaut: hauteur du canvas)
 * @param {boolean} selfieMode - Mode selfie (défaut: true)
 */
function showHandVideo(x = 0, y = 0, w = null, h = null, selfieMode = true) {
	if (!handVideo) return;

	// Vérifier si la vidéo est prête
	if (!handVideo.elt || handVideo.elt.readyState < 2) {
		return; // La vidéo n'est pas encore prête
	}

	const videoWidth = w || width;
	const videoHeight = h || height;

	push();
	if (selfieMode || handTracker?.config.selfieMode) {
		translate(x + videoWidth, y);
		scale(-1, 1);
		image(handVideo, 0, 0, videoWidth, videoHeight);
	} else {
		image(handVideo, x, y, videoWidth, videoHeight);
	}
	pop();
}

/**
 * Cache la vidéo de la caméra
 */
function hideHandVideo() {
	if (handVideo) {
		handVideo.hide();
	}
}

/**
 * Retourne true si le système de tracking est prêt
 * @returns {boolean}
 */
function isHandTrackerReady() {
	return isHandTrackingReady;
}

/**
 * Récupère une main spécifique par son index
 * @param {number} index - Index de la main (0 ou 1)
 * @returns {Object|null}
 */
function getHand(index = 0) {
	return hands[index] || null;
}

/**
 * Récupère la main gauche
 * @returns {Object|null}
 */
function getLeftHand() {
	return hands.find((h) => h.handedness === "Left") || null;
}

/**
 * Récupère la main droite
 * @returns {Object|null}
 */
function getRightHand() {
	return hands.find((h) => h.handedness === "Right") || null;
}

/**
 * Calcule l'angle entre deux points
 * @param {Object} p1 - Premier point {x, y}
 * @param {Object} p2 - Deuxième point {x, y}
 * @returns {number} Angle en radians
 */
function angleBetweenPoints(p1, p2) {
	const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
	return angle; // en radians
}

// Constantes pour les indices des landmarks
const HAND_LANDMARKS = {
	WRIST: 0,
	THUMB_CMC: 1,
	THUMB_MCP: 2,
	THUMB_IP: 3,
	THUMB_TIP: 4,
	INDEX_FINGER_MCP: 5,
	INDEX_FINGER_PIP: 6,
	INDEX_FINGER_DIP: 7,
	INDEX_FINGER_TIP: 8,
	MIDDLE_FINGER_MCP: 9,
	MIDDLE_FINGER_PIP: 10,
	MIDDLE_FINGER_DIP: 11,
	MIDDLE_FINGER_TIP: 12,
	RING_FINGER_MCP: 13,
	RING_FINGER_PIP: 14,
	RING_FINGER_DIP: 15,
	RING_FINGER_TIP: 16,
	PINKY_MCP: 17,
	PINKY_PIP: 18,
	PINKY_DIP: 19,
	PINKY_TIP: 20,
};
