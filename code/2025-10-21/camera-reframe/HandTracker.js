/** biome-ignore-all lint/correctness/noUnusedVariables: <> */

/**
 * HandTracker class
 * Manages hand detection using MediaPipe Hands library
 * Tracks index finger and thumb positions for both hands with smooth interpolation
 */

// MediaPipe landmarks indices
const LANDMARKS = {
	THUMB_TIP: 4,
	INDEX_TIP: 8,
};

class HandTracker {
	constructor(video, options = {}) {
		this.video = video;

		// Default options
		this.options = {
			maxNumHands: 2,
			modelComplexity: 1,
			minDetectionConfidence: 0.5,
			minTrackingConfidence: 0.5,
			smoothing: 0.5,
			...options,
		};

		// Store hand data: left and right hands
		this.handsData = {
			left: null,
			right: null,
		};

		// Video dimensions for coordinate conversion
		this.videoDimensions = null;

		// Initialize MediaPipe Hands
		this.initializeHands();
	}

	/**
	 * Initialize MediaPipe Hands library
	 */
	initializeHands() {
		this.hands = new Hands({
			locateFile: (file) => {
				return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
			},
		});

		this.hands.setOptions(this.options);
		this.hands.onResults((results) => this.onHandsResults(results));

		// Start camera
		const camera = new Camera(this.video.elt, {
			onFrame: async () => {
				await this.hands.send({ image: this.video.elt });
			},
			width: this.video.width,
			height: this.video.height,
		});

		camera.start();
	}

	/**
	 * Handle MediaPipe results
	 */
	onHandsResults(results) {
		// Reset hands data
		this.handsData.left = null;
		this.handsData.right = null;

		if (
			!results.multiHandLandmarks ||
			results.multiHandLandmarks.length === 0
		) {
			return;
		}

		// Process each detected hand
		for (let i = 0; i < results.multiHandLandmarks.length; i++) {
			const landmarks = results.multiHandLandmarks[i];
			const handedness = results.multiHandedness[i].label; // "Left" or "Right"

			// Note: MediaPipe inverts left/right in mirror mode
			const handKey = handedness === "Left" ? "right" : "left";

			// Extract thumb and index finger positions
			const thumbPos = landmarks[LANDMARKS.THUMB_TIP];
			const indexPos = landmarks[LANDMARKS.INDEX_TIP];

			// Initialize or update hand data
			if (!this.handsData[handKey]) {
				this.handsData[handKey] = this.createHandData(thumbPos, indexPos);
			} else {
				this.updateHandData(this.handsData[handKey], thumbPos, indexPos);
			}
		}
	}

	/**
	 * Create initial hand data structure
	 */
	createHandData(thumbPos, indexPos) {
		return {
			thumb: {
				x: thumbPos.x,
				y: thumbPos.y,
				smooth: { x: thumbPos.x, y: thumbPos.y },
			},
			index: {
				x: indexPos.x,
				y: indexPos.y,
				smooth: { x: indexPos.x, y: indexPos.y },
			},
		};
	}

	/**
	 * Update hand data with smoothing
	 */
	updateHandData(handData, thumbPos, indexPos) {
		// Update thumb
		handData.thumb.x = thumbPos.x;
		handData.thumb.y = thumbPos.y;
		handData.thumb.smooth = this.smoothPosition(
			handData.thumb.smooth,
			thumbPos,
			this.options.smoothing,
		);

		// Update index
		handData.index.x = indexPos.x;
		handData.index.y = indexPos.y;
		handData.index.smooth = this.smoothPosition(
			handData.index.smooth,
			indexPos,
			this.options.smoothing,
		);
	}

	/**
	 * Smooth position interpolation
	 */
	smoothPosition(current, target, smoothing = 0.5) {
		if (!current) {
			return { x: target.x, y: target.y };
		}
		return {
			x: lerp(current.x, target.x, smoothing),
			y: lerp(current.y, target.y, smoothing),
		};
	}

	/**
	 * Set video dimensions for coordinate conversion
	 */
	setVideoDimensions(dimensions) {
		this.videoDimensions = dimensions;
	}

	/**
	 * Convert normalized coordinates (0-1) to screen coordinates
	 * Takes into account mirroring and cover mode scaling
	 */
	normalizedToScreen(normalizedX, normalizedY) {
		if (!this.videoDimensions) {
			console.warn("Video dimensions not set");
			return { x: 0, y: 0 };
		}

		const { drawWidth, drawHeight, drawX, drawY } = this.videoDimensions;

		return {
			x: width - (normalizedX * drawWidth + drawX), // Mirror effect
			y: normalizedY * drawHeight + drawY,
		};
	}

	/**
	 * Get left hand data
	 */
	getLeftHand() {
		return this.handsData.left;
	}

	/**
	 * Get right hand data
	 */
	getRightHand() {
		return this.handsData.right;
	}

	/**
	 * Check if both hands are detected
	 */
	bothHandsDetected() {
		return this.handsData.left !== null && this.handsData.right !== null;
	}

	/**
	 * Get screen position for a finger
	 */
	getFingerScreenPosition(hand, finger = "index") {
		if (!hand || !hand[finger] || !hand[finger].smooth) {
			return null;
		}
		return this.normalizedToScreen(
			hand[finger].smooth.x,
			hand[finger].smooth.y,
		);
	}
}
