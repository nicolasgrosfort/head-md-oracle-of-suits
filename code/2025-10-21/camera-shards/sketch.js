/** biome-ignore-all lint/correctness/noUnusedVariables: <> */

let video;
const shards = [];

function setup() {
	createCanvas(windowWidth, windowHeight);
	video = new Video(640, 480);
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
}

function draw() {
	background(255);

	video.draw();

	for (const shard of shards) {
		shard.draw();
	}
}

function createShard(x, y) {
	const captureSize = random(10, 100);
	const displaySize = random(100, 200);

	const { videoX, videoY } = video.canvasToVideoCoords(x, y);

	const captureX = constrain(videoX - captureSize / 2, 0, 640 - captureSize);
	const captureY = constrain(videoY - captureSize / 2, 0, 480 - captureSize);

	const shard = new VideoShard(
		video.getVideo(),
		captureX,
		captureY,
		captureSize,
		captureSize,
		displaySize,
		displaySize,
		x,
		y,
	);

	shards.push(shard);
}

function mousePressed() {
	createShard(mouseX, mouseY);
}
