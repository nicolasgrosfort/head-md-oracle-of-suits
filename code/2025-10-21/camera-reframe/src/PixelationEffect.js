/** biome-ignore-all lint/correctness/noUnusedVariables: <> */

/**
 * PixelationEffect class
 * Applies a pixelation/censorship effect to a rectangular area of an image
 * Used for creating blur/privacy effects on specific regions
 */

class PixelationEffect {
	constructor(pixelSize = 20) {
		this.pixelSize = pixelSize;
	}

	/**
	 * Set pixel size for the effect
	 */
	setPixelSize(size) {
		this.pixelSize = size;
	}

	/**
	 * Apply pixelation effect to a rectangular region of an image
	 * @param {p5.Image} img - The image to pixelate
	 * @param {Object} rect - Rectangle coordinates {x, y, width, height} in screen space
	 * @param {Object} videoDimensions - Video display dimensions {drawWidth, drawHeight, drawX, drawY}
	 */
	apply(img, rect, videoDimensions) {
		const { drawWidth, drawHeight, drawX, drawY } = videoDimensions;

		// Convert screen coordinates (with mirroring) to source image coordinates
		// 1. Reverse mirror to get actual position in displayed space
		const screenX = width - rect.x - rect.width;
		const screenY = rect.y - rect.height / 2;

		// 2. Convert from screen space to image source space (640x480)
		const scaleX = img.width / drawWidth;
		const scaleY = img.height / drawHeight;

		const imgX = (screenX - drawX) * scaleX;
		const imgY = (screenY - drawY) * scaleY;
		const imgWidth = rect.width * scaleX;
		const imgHeight = rect.height * scaleY;

		// Pixel size in image source space
		const imgPixelSize = this.pixelSize * scaleX;

		img.loadPixels();

		// Process the area in blocks
		for (let y = imgY; y < imgY + imgHeight; y += imgPixelSize) {
			for (let x = imgX; x < imgX + imgWidth; x += imgPixelSize) {
				// Calculate average color of the block
				const avgColor = this.calculateBlockAverage(img, x, y, imgPixelSize);

				// Apply average color to entire block
				if (avgColor) {
					this.fillBlock(img, x, y, imgPixelSize, avgColor);
				}
			}
		}

		img.updatePixels();
	}

	/**
	 * Calculate average color of a block
	 */
	calculateBlockAverage(img, startX, startY, blockSize) {
		let r = 0,
			g = 0,
			b = 0,
			count = 0;

		for (let dy = 0; dy < blockSize; dy++) {
			for (let dx = 0; dx < blockSize; dx++) {
				const px = Math.floor(startX + dx);
				const py = Math.floor(startY + dy);

				// Check image bounds
				if (px >= 0 && px < img.width && py >= 0 && py < img.height) {
					const index = (py * img.width + px) * 4;
					r += img.pixels[index];
					g += img.pixels[index + 1];
					b += img.pixels[index + 2];
					count++;
				}
			}
		}

		// Return average
		if (count > 0) {
			return {
				r: Math.floor(r / count),
				g: Math.floor(g / count),
				b: Math.floor(b / count),
			};
		}

		return null;
	}

	/**
	 * Fill a block with a single color
	 */
	fillBlock(img, startX, startY, blockSize, color) {
		for (let dy = 0; dy < blockSize; dy++) {
			for (let dx = 0; dx < blockSize; dx++) {
				const px = Math.floor(startX + dx);
				const py = Math.floor(startY + dy);

				if (px >= 0 && px < img.width && py >= 0 && py < img.height) {
					const index = (py * img.width + px) * 4;
					img.pixels[index] = color.r;
					img.pixels[index + 1] = color.g;
					img.pixels[index + 2] = color.b;
				}
			}
		}
	}
}
