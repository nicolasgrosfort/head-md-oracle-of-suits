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

		// Facteur de parallaxe unique pour chaque shard (entre 0.5 et 2.0)
		this.parallaxFactor = random(0.5, 2.0);

		// Scale de base
		this.baseScale = 1.0;
	}

	draw() {
		// Calculer le scale basé sur la position Y de la souris
		// mouseY normalisé entre -1 et 1
		const mouseYNormalized = (mouseY / height) * 2 - 1;

		// Appliquer le parallax : plus le facteur est élevé, plus l'effet est prononcé
		// Range: 0.8 à 1.2 (modulé par le parallaxFactor)
		const parallaxScale = 1.0 + mouseYNormalized * 0.2 * this.parallaxFactor;
		const currentScale = this.baseScale * parallaxScale;

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
