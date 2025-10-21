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

	// Vérifier si au moins un shard est survolé
	let anyHovered = false;
	for (const shard of shards) {
		if (shard.isHovered(mouseX, mouseY)) {
			anyHovered = true;
			break;
		}
	}

	// Dessiner tous les shards
	// Si un shard est survolé : seul celui-ci réagit au pinch
	// Si aucun n'est survolé : tous réagissent au pinch
	for (const shard of shards) {
		const isHovered = shard.isHovered(mouseX, mouseY);
		const shouldApplyPinch = anyHovered ? isHovered : true;
		shard.draw(pinchScale, shouldApplyPinch);
	}

	// Afficher un indicateur si le hand tracking est actif
	if (handTracker?.ready()) {
		displayPinchIndicator(pinchScale);
	}
}

function displayPinchIndicator(pinchScale) {
	push();
	fill(0, 0, 0);
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
	// Créer un shard carré
	const captureSize = random(10, 50);
	const displaySize = captureSize * random(2, 5);

	const { videoX, videoY } = video.canvasToVideoCoords(x, y);

	const captureX = constrain(videoX - captureSize / 2, 0, 640 - captureSize);
	const captureY = constrain(videoY - captureSize / 2, 0, 480 - captureSize);

	const shard = new VideoShard(
		video.getVideo(),
		captureX,
		captureY,
		captureSize,
		captureSize, // Même taille en hauteur = carré
		displaySize,
		displaySize, // Même taille en hauteur = carré
		x,
		y,
	);

	shards.push(shard);
}

function mousePressed() {
	createShard(mouseX, mouseY);
}
