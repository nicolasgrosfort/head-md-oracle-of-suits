/** biome-ignore-all lint/complexity/noStaticOnlyClass: <> */
/** biome-ignore-all lint/correctness/noUnusedVariables: <> */

/**
 * FilmGrainEffect class
 * Creates a realistic film grain effect using pre-generated noise patterns
 * Provides better performance than per-pixel noise generation
 */

class Effects {
	static counter = 0;
}

class FilmGrainEffect {
	static counter = 0;
	static index = 0;

	/**
	 * Create a film grain effect
	 * @param {number} x - X position
	 * @param {number} y - Y position
	 * @param {number} w - Width
	 * @param {number} h - Height
	 * @param {number} patternSize - Size of noise tile (64, 128, 256)
	 * @param {number} sampleSize - Number of different patterns (2-5 recommended)
	 * @param {number} patternAlpha - Opacity (0.05-0.3)
	 */
	constructor(x, y, w, h, patternSize, sampleSize = 1, patternAlpha = 0.1) {
		this.id = `FilmGrain_${Effects.counter++}`;
		this.reset(x, y, w, h, patternSize, sampleSize, patternAlpha);
	}

	/**
	 * Reset effect with new parameters
	 */
	reset(x, y, w, h, patternSize, sampleSize = 1, patternAlpha = 0.1) {
		this.samples = [];
		this.currentSampleSet = [];
		this.patternRefreshInterval = 4; // Frames between pattern changes
		FilmGrainEffect.counter = 0;
		FilmGrainEffect.index = 0;
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.p = patternSize;
		this.s = sampleSize;
		this.a = map(patternAlpha, 0, 1, 0, 255);

		// Pre-generate all noise patterns
		for (let i = 0; i < sampleSize; i++) {
			this.samples.push(
				this.pattern(this.x, this.y, this.w, this.h, this.p, this.a),
			);
		}
	}

	/**
	 * Generate a noise pattern
	 */
	pattern(x, y, w, h, patternSize, patternAlpha) {
		// Create new p5 graphics canvas
		const pg = createGraphics(patternSize, patternSize);
		pg.pixelDensity(1);

		// Generate random noise
		pg.loadPixels();
		for (let _y = 0; _y < patternSize; _y += 1) {
			for (let _x = 0; _x < patternSize; _x += 1) {
				const i = (_x + _y * patternSize) * 4;
				const value = (Math.random() * 255) | 0;
				pg.pixels[i] = value;
				pg.pixels[i + 1] = value;
				pg.pixels[i + 2] = value;
				pg.pixels[i + 3] = patternAlpha;
			}
		}
		pg.updatePixels();

		// Calculate positions for noise tiles and store them
		const xlen = w / patternSize;
		const ylen = h / patternSize;

		const samples = [];
		for (let i = 0; i < ylen; i++) {
			for (let j = 0; j < xlen; j++) {
				const _x = x + patternSize * j;
				const _y = y + patternSize * i;
				samples.push({
					canvas: pg,
					x: _x,
					y: _y,
					w: patternSize,
					h: patternSize,
				});
			}
		}

		return samples;
	}

	/**
	 * Update effect (cycle through patterns)
	 */
	update() {
		if (FilmGrainEffect.counter++ === this.patternRefreshInterval) {
			FilmGrainEffect.counter = 0;
			FilmGrainEffect.index++;
			if (!this.samples[FilmGrainEffect.index]) {
				FilmGrainEffect.index = 0;
			}
		}
		this.currentSampleSet = this.samples[FilmGrainEffect.index];
	}

	/**
	 * Display the grain effect
	 */
	display() {
		for (const sample of this.currentSampleSet) {
			image(sample.canvas, sample.x, sample.y, sample.w, sample.h);
		}
	}
}
