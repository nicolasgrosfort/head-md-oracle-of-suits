/** biome-ignore-all lint/correctness/noUnusedVariables: <> */

/**
 * VideoProcessor class
 * Handles video capture, grayscale conversion, saturation control,
 * and cover mode display (fills screen without stretching)
 */

class VideoProcessor {
	constructor(videoWidth = 640, videoHeight = 480) {
		this.videoWidth = videoWidth;
		this.videoHeight = videoHeight;
		this.video = null;
		this.saturation = 0; // 0 = grayscale, 1 = full color
	}

	/**
	 * Initialize video capture
	 */
	initialize() {
		this.video = createCapture(VIDEO);
		this.video.size(this.videoWidth, this.videoHeight);
		this.video.hide();
		return this.video;
	}

	/**
	 * Set saturation level (0-1)
	 * 0 = black and white, 1 = full color
	 */
	setSaturation(saturation) {
		this.saturation = constrain(saturation, 0, 1);
	}

	/**
	 * Calculate video dimensions in cover mode
	 * (fills screen while maintaining aspect ratio)
	 */
	getVideoCoverDimensions() {
		const videoAspect = this.videoWidth / this.videoHeight;
		const canvasAspect = width / height;

		let drawWidth, drawHeight, drawX, drawY;

		if (canvasAspect > videoAspect) {
			// Canvas is wider than video
			drawWidth = width;
			drawHeight = width / videoAspect;
			drawX = 0;
			drawY = (height - drawHeight) / 2;
		} else {
			// Canvas is taller than video
			drawHeight = height;
			drawWidth = height * videoAspect;
			drawX = (width - drawWidth) / 2;
			drawY = 0;
		}

		return { drawWidth, drawHeight, drawX, drawY };
	}

	/**
	 * Process video frame and create image with saturation control
	 */
	processFrame() {
		this.video.loadPixels();
		const img = createImage(this.videoWidth, this.videoHeight);
		img.loadPixels();

		for (let i = 0; i < this.video.pixels.length; i += 4) {
			const r = this.video.pixels[i];
			const g = this.video.pixels[i + 1];
			const b = this.video.pixels[i + 2];

			// Calculate grayscale value
			const gray = (r + g + b) / 3;

			// Interpolate between gray and original color based on saturation
			img.pixels[i] = lerp(gray, r, this.saturation);
			img.pixels[i + 1] = lerp(gray, g, this.saturation);
			img.pixels[i + 2] = lerp(gray, b, this.saturation);
			img.pixels[i + 3] = 255;
		}
		img.updatePixels();

		return img;
	}

	/**
	 * Draw processed video in cover mode with mirroring
	 */
	draw() {
		push();
		translate(width, 0);
		scale(-1, 1); // Mirror effect

		const img = this.processFrame();
		const { drawWidth, drawHeight, drawX, drawY } =
			this.getVideoCoverDimensions();

		image(img, drawX, drawY, drawWidth, drawHeight);

		pop();

		// Return dimensions for other effects
		return { img, drawWidth, drawHeight, drawX, drawY };
	}

	/**
	 * Get video element
	 */
	getVideo() {
		return this.video;
	}

	/**
	 * Get video dimensions
	 */
	getDimensions() {
		return {
			width: this.videoWidth,
			height: this.videoHeight,
		};
	}
}
