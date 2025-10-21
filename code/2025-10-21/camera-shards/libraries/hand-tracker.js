/** biome-ignore-all lint/correctness/noUnusedVariables: <> */

/**
 * HandTracker - Détection de gestes de main avec MediaPipe
 * Calcule la distance de pinch entre le pouce et l'index
 */
class HandTracker {
	constructor(videoElement) {
		this.videoElement = videoElement;
		this.hands = null;
		this.camera = null;
		this.pinchDistance = 0.5; // Distance normalisée entre 0 et 1
		this.smoothedPinchDistance = 0.5; // Distance lissée avec lerp
		this.smoothingFactor = 0.1; // Plus c'est petit, plus c'est lisse (0.05-0.2)
		this.isReady = false;

		this.initMediaPipe();
	}

	async initMediaPipe() {
		// Attendre que MediaPipe soit chargé
		if (typeof Hands === "undefined") {
			console.log("Waiting for MediaPipe to load...");
			setTimeout(() => this.initMediaPipe(), 100);
			return;
		}

		// Initialiser MediaPipe Hands
		this.hands = new Hands({
			locateFile: (file) => {
				return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
			},
		});

		this.hands.setOptions({
			maxNumHands: 1,
			modelComplexity: 1,
			minDetectionConfidence: 0.5,
			minTrackingConfidence: 0.5,
		});

		this.hands.onResults((results) => this.onResults(results));

		// Attendre que la vidéo soit prête
		const checkVideo = () => {
			if (this.videoElement.elt && this.videoElement.elt.readyState === 4) {
				this.startCamera();
			} else {
				setTimeout(checkVideo, 100);
			}
		};
		checkVideo();
	}

	async startCamera() {
		this.camera = new Camera(this.videoElement.elt, {
			onFrame: async () => {
				if (this.hands) {
					await this.hands.send({ image: this.videoElement.elt });
				}
			},
			width: 640,
			height: 480,
		});

		await this.camera.start();
		this.isReady = true;
		console.log("Hand tracking ready!");
	}

	onResults(results) {
		let targetPinchDistance;

		if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
			const landmarks = results.multiHandLandmarks[0];

			// Index du pouce (tip) : 4
			// Index de l'index (tip) : 8
			const thumb = landmarks[4];
			const index = landmarks[8];

			// Calculer la distance euclidienne
			const dx = thumb.x - index.x;
			const dy = thumb.y - index.y;
			const dz = thumb.z - index.z;
			const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

			// Normaliser la distance (typiquement entre 0.01 et 0.3)
			// On mappe vers une plage utilisable (0 = pinch fermé, 1 = pinch ouvert)
			targetPinchDistance = constrain(map(distance, 0.01, 0.2, 0, 1), 0, 1);
		} else {
			// Pas de main détectée : valeur par défaut au milieu
			targetPinchDistance = 0.5;
		}

		// Appliquer le lissage avec lerp
		this.pinchDistance = targetPinchDistance;
		this.smoothedPinchDistance = lerp(
			this.smoothedPinchDistance,
			targetPinchDistance,
			this.smoothingFactor
		);
	}

	/**
	 * Retourne la distance de pinch normalisée (0 = fermé, 1 = ouvert)
	 * @param {boolean} smoothed - Si true, retourne la valeur lissée
	 */
	getPinchDistance(smoothed = true) {
		return smoothed ? this.smoothedPinchDistance : this.pinchDistance;
	}

	/**
	 * Retourne un scale factor basé sur le pinch (entre min et max)
	 * @param {number} minScale - Scale minimum (pinch fermé)
	 * @param {number} maxScale - Scale maximum (pinch ouvert)
	 * @param {boolean} smoothed - Si true, utilise la valeur lissée
	 */
	getPinchScale(minScale = 0.5, maxScale = 2.0, smoothed = true) {
		const distance = smoothed ? this.smoothedPinchDistance : this.pinchDistance;
		return map(distance, 0, 1, minScale, maxScale);
	}

	/**
	 * Change le facteur de lissage (0.01 = très lisse, 0.5 = réactif)
	 */
	setSmoothingFactor(factor) {
		this.smoothingFactor = constrain(factor, 0.01, 1.0);
	}

	/**
	 * Vérifie si le tracker est prêt
	 */
	ready() {
		return this.isReady;
	}
}
