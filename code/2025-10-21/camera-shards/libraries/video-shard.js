/** biome-ignore-all lint/correctness/noUnusedVariables: <> */

class VideoShard {
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
		this.sourceVideo = sourceVideo;

		this.captureX = captureX;
		this.captureY = captureY;
		this.captureW = captureW;
		this.captureH = captureH;

		this.displayW = displayW;
		this.displayH = displayH;

		if (displayX !== null && displayY !== null) {
			this.x = displayX - displayW / 2;
			this.y = displayY - displayH / 2;
		} else {
			this.x = random(0, width - displayW);
			this.y = random(0, height - displayH);
		}

		// Facteur de parallaxe unique pour chaque shard
		// Variation plus importante pour des vitesses très différentes
		this.parallaxFactor = random(0.1, 2);

		// Scale de base
		this.baseScale = 1.0;
	}

	draw(pinchScale = null) {
		let currentScale;

		if (pinchScale !== null) {
			// Mode pinch : utiliser le pinch pour contrôler le scale
			// Chaque shard réagit différemment selon son parallaxFactor
			const pinchNormalized = (pinchScale - 1) * this.parallaxFactor;
			currentScale = this.baseScale * (1 + pinchNormalized);
		} else {
			// Mode souris (fallback) : utiliser mouseY
			const mouseYNormalized = (mouseY / height) * 2 - 1;
			const parallaxScale = 1.0 + mouseYNormalized * 0.5 * this.parallaxFactor;
			currentScale = this.baseScale * parallaxScale;
		}

		push();
		translate(this.x + this.displayW / 2, this.y + this.displayH / 2);
		scale(-currentScale, currentScale);

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

		noFill();
		stroke(255);
		strokeWeight(2 / currentScale); // Ajuster l'épaisseur du trait
		rect(-this.displayW / 2, -this.displayH / 2, this.displayW, this.displayH);

		pop();
	}
}
