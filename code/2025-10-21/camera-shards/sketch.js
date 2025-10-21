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

function createRandomShards(x, y) {
	const captureSize = random(20, 200);
	const displaySize = random(100, 300);

	const captureX = random(x);
	const captureY = random(y);

	const shard = new VideoShard(
		video.getVideo(),
		captureX,
		captureY,
		captureSize,
		captureSize,
		displaySize,
		displaySize,
	);

	shards.push(shard);
}

function mouseMoved() {
	createRandomShards(mouseX, mouseY);
}
