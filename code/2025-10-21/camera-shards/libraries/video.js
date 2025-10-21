/** biome-ignore-all lint/correctness/noUnusedVariables: <> */

class Video {
	constructor(videoWidth = 640, videoHeight = 480) {
		this.videoWidth = videoWidth;
		this.videoHeight = videoHeight;
		this.video = createCapture(VIDEO);
		this.video.size(this.videoWidth, this.videoHeight);
		this.video.hide();

		// Créer un graphics buffer pour le flou
		this.blurredBuffer = createGraphics(width, height);
	}

	draw() {
		const { drawWidth, drawHeight, drawX, drawY } = this.getCoverDimensions();

		// Dessiner la vidéo dans le buffer
		this.blurredBuffer.push();
		this.blurredBuffer.translate(this.blurredBuffer.width, 0);
		this.blurredBuffer.scale(-1, 1);
		this.blurredBuffer.image(this.video, drawX, drawY, drawWidth, drawHeight);
		this.blurredBuffer.pop();

		// Appliquer le flou au buffer
		this.blurredBuffer.filter(BLUR, 5);

		// Afficher le buffer flouté sur le canvas principal
		image(this.blurredBuffer, 0, 0);
	}

	getCoverDimensions() {
		const videoAspect = this.videoWidth / this.videoHeight;
		const canvasAspect = width / height;

		let drawWidth, drawHeight, drawX, drawY;

		if (canvasAspect > videoAspect) {
			drawWidth = width;
			drawHeight = width / videoAspect;
			drawX = 0;
			drawY = (height - drawHeight) / 2;
		} else {
			drawHeight = height;
			drawWidth = height * videoAspect;
			drawX = (width - drawWidth) / 2;
			drawY = 0;
		}

		return { drawWidth, drawHeight, drawX, drawY };
	}

	getVideo() {
		return this.video;
	}

	canvasToVideoCoords(canvasX, canvasY) {
		const { drawWidth, drawHeight, drawX, drawY } = this.getCoverDimensions();

		const mirroredX = width - canvasX;

		const relativeX = mirroredX - drawX;
		const relativeY = canvasY - drawY;

		const videoX = (relativeX / drawWidth) * this.videoWidth;
		const videoY = (relativeY / drawHeight) * this.videoHeight;

		return { videoX, videoY };
	}
}
