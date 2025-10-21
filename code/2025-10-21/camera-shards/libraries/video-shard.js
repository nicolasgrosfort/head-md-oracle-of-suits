/** biome-ignore-all lint/correctness/noUnusedVariables: <> */

// Global counter for unique shard IDs
let shardIdCounter = 0;

/**
 * VideoShard class - Represents a captured fragment of the main video
 * Each shard can be independently scaled using pinch gestures
 */
class VideoShard {
	/**
	 * Create a new video shard
	 * @param {p5.Element} sourceVideo - Source video element to capture from
	 * @param {number} captureX - X position in source video
	 * @param {number} captureY - Y position in source video
	 * @param {number} captureW - Width of capture area
	 * @param {number} captureH - Height of capture area
	 * @param {number} displayW - Display width on canvas
	 * @param {number} displayH - Display height on canvas
	 * @param {number} displayX - Optional X position on canvas
	 * @param {number} displayY - Optional Y position on canvas
	 */
	constructor(
		sourceVideo,
		captureX,
		captureY,
		captureW,
		captureH,
		displayW,
		displayH,
		displayX = null,
		displayY = null,
	) {
		// Source video reference
		this.sourceVideo = sourceVideo;

		// Capture area in source video
		this.captureX = captureX;
		this.captureY = captureY;
		this.captureW = captureW;
		this.captureH = captureH;

		// Display size on canvas
		this.displayW = displayW;
		this.displayH = displayH;

		// Position on canvas (centered on given point or random)
		if (displayX !== null && displayY !== null) {
			this.x = displayX - displayW / 2;
			this.y = displayY - displayH / 2;
		} else {
			this.x = random(0, width - displayW);
			this.y = random(0, height - displayH);
		}

		// Unique parallax factor for each shard (affects pinch sensitivity)
		this.parallaxFactor = random(0.1, 2);

		// Current scale (persistent across frames)
		this.currentScale = 1.0;

		// Previous pinch value (to detect changes)
		this.lastPinchScale = null;

		// Unique ID for this shard
		this.id = shardIdCounter++;
	}

	/**
	 * Check if mouse is hovering over this shard
	 * @param {number} mx - Mouse X position
	 * @param {number} my - Mouse Y position
	 * @returns {boolean} True if mouse is over shard
	 */
	isHovered(mx, my) {
		return (
			mx >= this.x &&
			mx <= this.x + this.displayW &&
			my >= this.y &&
			my <= this.y + this.displayH
		);
	}

	/**
	 * Draw the shard with current scale
	 * @param {number} pinchScale - Current pinch scale value (0.5-2.0)
	 * @param {boolean} isHovered - Whether this shard is currently hovered
	 */
	draw(pinchScale = null, isHovered = false) {
		// Apply pinch scaling when hovered
		if (isHovered && pinchScale !== null) {
			// Define dead zone thresholds (no change zone)
			const neutralZoneMin = 1.0; // Below: shrink
			const neutralZoneMax = 1.5; // Above: grow

			// Continuous change speed (modulated by parallax factor)
			const changeSpeed = 0.01 * this.parallaxFactor;

			if (pinchScale > neutralZoneMax) {
				// Growth zone: continuously increase scale
				const intensity =
					(pinchScale - neutralZoneMax) / (2.0 - neutralZoneMax);
				this.currentScale += changeSpeed * intensity;
			} else if (pinchScale < neutralZoneMin) {
				// Shrink zone: continuously decrease scale
				const intensity =
					(neutralZoneMin - pinchScale) / (neutralZoneMin - 0.5);
				this.currentScale -= changeSpeed * intensity;
			}
			// Else: dead zone, no change

			// Clamp scale between limits
			this.currentScale = constrain(this.currentScale, 0.1, 5.0);
			this.lastPinchScale = pinchScale;
		} else if (!isHovered) {
			// Reset pinch tracking when not hovered
			this.lastPinchScale = null;
		}

		const displayScale = this.currentScale;

		// Draw the shard
		push();
		translate(this.x + this.displayW / 2, this.y + this.displayH / 2);
		scale(-displayScale, displayScale); // Mirror horizontally

		// Draw captured video portion
		image(
			this.sourceVideo,
			-this.displayW / 2,
			-this.displayH / 2,
			this.displayW,
			this.displayH,
			this.captureX,
			this.captureY,
			this.captureW,
			this.captureH,
		);

		// White border
		noFill();
		stroke(255);
		strokeWeight(2 / displayScale); // Adjust stroke weight for scale
		rect(-this.displayW / 2, -this.displayH / 2, this.displayW, this.displayH);

		// Display shard ID in center
		fill(255);
		noStroke();
		textAlign(CENTER, CENTER);
		textSize(16 / displayScale); // Scale-adjusted text size
		scale(-1, 1); // Un-mirror text for readability
		text(this.id, 0, 0);

		pop();
	}
}
