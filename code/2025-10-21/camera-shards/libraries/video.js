/** biome-ignore-all lint/correctness/noUnusedVariables: <> */

class Video {
	constructor(videoWidth = 640, videoHeight = 480) {
		this.videoWidth = videoWidth;
		this.videoHeight = videoHeight;
		this.video = createCapture(VIDEO);
		this.video.size(this.videoWidth, this.videoHeight);
		this.video.hide();
	}

	draw() {
		push();
		translate(width, 0);
		scale(-1, 1);

		const { drawWidth, drawHeight, drawX, drawY } = this.getCoverDimensions();
		image(this.video, drawX, drawY, drawWidth, drawHeight);

		pop();
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
}
