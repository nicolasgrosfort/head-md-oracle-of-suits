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
	}

	draw() {
		push();
		translate(this.x + this.displayW, this.y);
		scale(-1, 1);

		image(
			this.sourceVideo,
			0,
			0,
			this.displayW,
			this.displayH,
			this.captureX,
			this.captureY,
			this.captureW,
			this.captureH,
		);

		noFill();
		stroke(255);
		strokeWeight(2);
		rect(0, 0, this.displayW, this.displayH);

		pop();
	}
}
