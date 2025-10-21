/** biome-ignore-all lint/correctness/noUnusedVariables: <> */

let video;
let handTracker;
const shards = [];

function setup() {
	createCanvas(windowWidth, windowHeight);
	video = new Video(640, 480);

	// Initialiser le hand tracker
	handTracker = new HandTracker(video.getVideo());
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
}

function draw() {
	background(255);

	video.draw();

	// Obtenir le scale du pinch si le tracker est prêt
	const pinchScale = handTracker?.ready()
		? handTracker.getPinchScale(0.5, 2.0)
		: null;

	// Dessiner tous les shards avec le pinch scale
	for (const shard of shards) {
		shard.draw(pinchScale);
	}

	// Afficher un indicateur si le hand tracking est actif
	if (handTracker?.ready()) {
		displayPinchIndicator(pinchScale);
	}
}

function displayPinchIndicator(pinchScale) {
	push();
	fill(0, 255, 0, 100);
	noStroke();
	const size = map(pinchScale, 0.5, 2.0, 20, 80);
	circle(50, 50, size);

	fill(255);
	textAlign(CENTER, CENTER);
	textSize(12);
	text(pinchScale.toFixed(2), 50, 50);
	pop();
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
