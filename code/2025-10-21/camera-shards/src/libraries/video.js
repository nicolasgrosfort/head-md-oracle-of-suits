/** biome-ignore-all lint/correctness/noUnusedVariables: <> */

/**
 * Video class - Manages main video capture with blur effect
 * Displays video in cover mode (fills screen without stretching)
 */
class Video {
	constructor(videoWidth = 640, videoHeight = 480) {
		this.videoWidth = videoWidth;
		this.videoHeight = videoHeight;

		// Create and setup video capture
		this.video = createCapture(VIDEO);
		this.video.size(this.videoWidth, this.videoHeight);
		this.video.hide();

		// Create graphics buffer for blur effect (isolated from shards)
		this.blurredBuffer = createGraphics(width, height);
	}

	/**
	 * Draw the main video with blur effect
	 * Uses a separate buffer to avoid affecting shards
	 */
	draw() {
		const { drawWidth, drawHeight, drawX, drawY } = this.getCoverDimensions();

		// Clear and draw video into the buffer with mirror effect
		this.blurredBuffer.clear();
		this.blurredBuffer.push();
		this.blurredBuffer.translate(this.blurredBuffer.width, 0);
		this.blurredBuffer.scale(-1, 1); // Mirror horizontally
		this.blurredBuffer.image(this.video, drawX, drawY, drawWidth, drawHeight);
		this.blurredBuffer.pop();

		// Apply blur filter to the buffer
		this.blurredBuffer.filter(BLUR, 5);

		// Display the blurred buffer on main canvas
		image(this.blurredBuffer, 0, 0);
	}

	/**
	 * Calculate video dimensions in cover mode
	 * Fills screen while maintaining aspect ratio
	 * @returns {Object} Drawing dimensions and position
	 */
	getCoverDimensions() {
		const videoAspect = this.videoWidth / this.videoHeight;
		const canvasAspect = width / height;

		let drawWidth, drawHeight, drawX, drawY;

		if (canvasAspect > videoAspect) {
			// Canvas wider than video: fit to width
			drawWidth = width;
			drawHeight = width / videoAspect;
			drawX = 0;
			drawY = (height - drawHeight) / 2;
		} else {
			// Canvas taller than video: fit to height
			drawHeight = height;
			drawWidth = height * videoAspect;
			drawX = (width - drawWidth) / 2;
			drawY = 0;
		}

		return { drawWidth, drawHeight, drawX, drawY };
	}

	/**
	 * Get the raw video element (for shards to use)
	 * @returns {p5.Element} Video capture element
	 */
	getVideo() {
		return this.video;
	}

	/**
	 * Convert canvas coordinates to video coordinates
	 * Accounts for cover mode scaling and mirror effect
	 * @param {number} canvasX - X position on canvas
	 * @param {number} canvasY - Y position on canvas
	 * @returns {Object} Video coordinates {videoX, videoY}
	 */
	canvasToVideoCoords(canvasX, canvasY) {
		const { drawWidth, drawHeight, drawX, drawY } = this.getCoverDimensions();

		// Apply mirror transformation
		const mirroredX = width - canvasX;

		// Calculate relative position within video display area
		const relativeX = mirroredX - drawX;
		const relativeY = canvasY - drawY;

		// Map to video source coordinates
		const videoX = (relativeX / drawWidth) * this.videoWidth;
		const videoY = (relativeY / drawHeight) * this.videoHeight;

		return { videoX, videoY };
	}
}
