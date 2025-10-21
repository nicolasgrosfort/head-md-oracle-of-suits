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
	const randomSize = () => random(10, 50);

	const size = {
		width: randomSize(),
		height: randomSize(),
	};

	const scaleFactor = random(2, 5);

	const { videoX, videoY } = video.canvasToVideoCoords(x, y);

	const captureX = constrain(videoX - size.width / 2, 0, 640 - size.width);
	const captureY = constrain(videoY - size.height / 2, 0, 480 - size.height);

	const shard = new VideoShard(
		video.getVideo(),
		captureX,
		captureY,
		size.width,
		size.height,
		size.width * scaleFactor,
		size.height * scaleFactor,
		x,
		y,
	);

	shards.push(shard);
}

function mousePressed() {
	createShard(mouseX, mouseY);
}
