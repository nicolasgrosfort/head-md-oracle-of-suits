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

	// Vérifier si au moins un shard est survolé et récupérer son ID
	let anyHovered = false;
	let hoveredShardId = null;
	for (const shard of shards) {
		if (shard.isHovered(mouseX, mouseY)) {
			anyHovered = true;
			hoveredShardId = shard.id;
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
		displayPinchIndicator(pinchScale, anyHovered, hoveredShardId);
	}
}

function displayPinchIndicator(pinchScale, anyHovered, hoveredShardId) {
	// Définir les mêmes seuils que dans VideoShard
	const neutralZoneMin = 1.0;
	const neutralZoneMax = 1.5;

	// Déterminer l'état
	let state = "NEUTRE";
	let stateColor = color(200, 200, 200); // Gris

	if (pinchScale > neutralZoneMax) {
		state = "GRANDIR ↑";
		stateColor = color(0, 255, 0); // Vert
	} else if (pinchScale < neutralZoneMin) {
		state = "RÉTRÉCIR ↓";
		stateColor = color(255, 0, 0); // Rouge
	}

	// Déterminer le mode (tous ou sélectionné)
	let mode = "";
	let modeIcon = "";
	if (anyHovered && hoveredShardId !== null) {
		mode = `Shard #${hoveredShardId}`;
		modeIcon = "🎯";
	} else {
		mode = "Tous les shards";
		modeIcon = "🌐";
	}

	push();
	// Style terminal : texte blanc, pas de fond, typo monospace
	fill(255); // Blanc
	noStroke();
	textAlign(LEFT, TOP);
	textSize(12); // Même taille pour tout
	textStyle(NORMAL);
	textFont("monospace"); // Police à chasse fixe (terminal)

	const x = 15;
	let y = 15;
	const lineHeight = 16;

	// Afficher les infos style terminal
	text(`> STATE: ${state}`, x, y);
	y += lineHeight;
	text(`> PINCH: ${pinchScale.toFixed(2)}`, x, y);
	y += lineHeight;
	text(`> MODE:  ${mode}`, x, y);

	pop();
}

function createShard(x, y) {
	// Créer un shard carré
	const captureSize = random(25, 50);
	const displaySize = captureSize * random(2, 4);

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
