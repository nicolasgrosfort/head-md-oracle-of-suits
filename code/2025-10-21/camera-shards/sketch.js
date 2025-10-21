/** biome-ignore-all lint/correctness/noUnusedVariables: <> */

// Global variables
let video;
let handTracker;
const shards = [];

/**
 * Setup - Initialize canvas, video, and hand tracking
 */
function setup() {
	createCanvas(windowWidth, windowHeight);
	video = new Video(640, 480);
	handTracker = new HandTracker(video.getVideo());
}

/**
 * Handle window resize
 */
function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
}

/**
 * Main draw loop
 */
function draw() {
	background(255);

	// Draw background video with blur effect
	video.draw();

	// Get pinch scale if hand tracking is ready
	const pinchScale = handTracker?.ready()
		? handTracker.getPinchScale(0.5, 2.0)
		: null;

	// Check if any shard is hovered and get its ID
	let anyHovered = false;
	let hoveredShardId = null;
	for (const shard of shards) {
		if (shard.isHovered(mouseX, mouseY)) {
			anyHovered = true;
			hoveredShardId = shard.id;
			break;
		}
	}

	// Draw all shards
	// If a shard is hovered: only that one reacts to pinch
	// If none are hovered: all shards react to pinch
	for (const shard of shards) {
		const isHovered = shard.isHovered(mouseX, mouseY);
		const shouldApplyPinch = anyHovered ? isHovered : true;
		shard.draw(pinchScale, shouldApplyPinch);
	}

	// Display info indicator when hand tracking is active
	if (handTracker?.ready()) {
		displayPinchIndicator(pinchScale, anyHovered, hoveredShardId);
	}
}

/**
 * Display pinch state indicator (terminal style)
 * @param {number} pinchScale - Current pinch scale value
 * @param {boolean} anyHovered - Whether any shard is hovered
 * @param {number} hoveredShardId - ID of hovered shard (if any)
 */
function displayPinchIndicator(pinchScale, anyHovered, hoveredShardId) {
	// Define same thresholds as VideoShard
	const neutralZoneMin = 1.0;
	const neutralZoneMax = 1.5;

	// Determine current state
	let state = "NEUTRAL";
	if (pinchScale > neutralZoneMax) {
		state = "GROW ↑";
	} else if (pinchScale < neutralZoneMin) {
		state = "SHRINK ↓";
	}

	// Determine mode (all or selected)
	let mode = "";
	if (anyHovered && hoveredShardId !== null) {
		mode = `Shard #${hoveredShardId}`;
	} else {
		mode = "All shards";
	}

	// Terminal-style display
	push();
	fill(255);
	noStroke();
	textAlign(LEFT, TOP);
	textSize(12);
	textStyle(NORMAL);
	textFont("monospace");

	const x = 15;
	let y = 15;
	const lineHeight = 16;

	text(`> STATE: ${state}`, x, y);
	y += lineHeight;
	text(`> PINCH: ${pinchScale.toFixed(2)}`, x, y);
	y += lineHeight;
	text(`> MODE:  ${mode}`, x, y);

	pop();
}

/**
 * Create a new video shard at given position
 * @param {number} x - X position on canvas
 * @param {number} y - Y position on canvas
 */
function createShard(x, y) {
	// Random square size for capture and display
	const captureSize = random(25, 50);
	const displaySize = captureSize * random(2, 4);

	// Convert canvas coordinates to video coordinates
	const { videoX, videoY } = video.canvasToVideoCoords(x, y);

	// Constrain capture area within video bounds
	const captureX = constrain(videoX - captureSize / 2, 0, 640 - captureSize);
	const captureY = constrain(videoY - captureSize / 2, 0, 480 - captureSize);

	// Create square shard (same width and height)
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

/**
 * Mouse press handler - Create shard at click position
 */
function mousePressed() {
	createShard(mouseX, mouseY);
}
