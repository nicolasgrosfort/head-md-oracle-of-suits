/** biome-ignore-all lint/correctness/noUnusedVariables: <> */

// Compteur global pour les IDs
let shardIdCounter = 0;

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

		// Scale actuel du shard (mémorisé)
		this.currentScale = 1.0;

		// Scale précédent du pinch (pour détecter le changement)
		this.lastPinchScale = null;

		// ID unique pour chaque shard
		this.id = shardIdCounter++;
	}

	/**
	 * Vérifie si la souris est au-dessus du shard
	 */
	isHovered(mx, my) {
		return (
			mx >= this.x &&
			mx <= this.x + this.displayW &&
			my >= this.y &&
			my <= this.y + this.displayH
		);
	}

	draw(pinchScale = null, isHovered = false) {
		// Appliquer le pinch uniquement si le shard est survolé
		if (isHovered && pinchScale !== null) {
			// Calculer le delta depuis la dernière valeur
			if (this.lastPinchScale !== null) {
				const delta = pinchScale - this.lastPinchScale;
				// Appliquer le changement avec le facteur de parallaxe
				this.currentScale += delta * this.parallaxFactor * 0.5;
				// Limiter le scale entre 0.1 et 5.0
				this.currentScale = constrain(this.currentScale, 0.1, 5.0);
			}
			this.lastPinchScale = pinchScale;
		} else if (!isHovered) {
			// Réinitialiser le pinch précédent si on ne survole plus
			this.lastPinchScale = null;
		}

		const displayScale = this.currentScale;

		push();
		translate(this.x + this.displayW / 2, this.y + this.displayH / 2);
		scale(-displayScale, displayScale);

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

		// Bordure blanche toujours
		noFill();
		stroke(255);
		strokeWeight(2 / displayScale);
		rect(-this.displayW / 2, -this.displayH / 2, this.displayW, this.displayH);

		// Afficher l'ID au milieu
		fill(255);
		noStroke();
		textAlign(CENTER, CENTER);
		textSize(16 / displayScale); // Ajuster la taille du texte selon le scale
		scale(-1, 1); // Inverser pour que le texte soit lisible (à cause du miroir)
		text(this.id, 0, 0);

		pop();
	}
}
