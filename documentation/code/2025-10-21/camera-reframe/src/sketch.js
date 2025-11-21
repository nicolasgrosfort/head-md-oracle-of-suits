/** biome-ignore-all lint/correctness/noUnusedVariables: <> */

/**
 * Camera Reframe - Interactive Video Censorship with Hand Tracking
 *
 * This sketch uses MediaPipe Hands to track both hands and creates
 * a pixelation effect between the index fingers, simulating censorship.
 * Features:
 * - Grayscale video with adjustable saturation
 * - Film grain effect for vintage look
 * - Cover mode video display (fills screen without stretching)
 * - Smooth hand tracking with interpolation
 *
 * Libraries required:
 * - p5.js
 * - MediaPipe Hands
 * - MediaPipe Camera Utils
 */

let videoProcessor;
let handTracker;
let filmGrain;
let pixelationEffect;
let font;

// Configuration
const CONFIG = {
	video: {
		width: 640,
		height: 480,
	},
	saturation: 0.4, // 0 = grayscale, 1 = full color
	grain: {
		patternSize: 128,
		sampleSize: 3,
		alpha: 0.15, // 0.05-0.3 recommended
	},
	pixelation: {
		minSize: 5, // Minimum pixel size (far from camera)
		maxSize: 50, // Maximum pixel size (close to camera)
	},
	hands: {
		maxNumHands: 2,
		smoothing: 0.5,
	},
};

/**
 * Preload assets
 */
function preload() {
	font = loadFont(
		"https://cdnjs.cloudflare.com/ajax/libs/topcoat/0.8.0/font/SourceCodePro-Regular.otf",
	);
}

/**
 * Handle window resize
 */
function windowResized() {
	resizeCanvas(windowWidth, windowHeight);

	// Recreate grain effect with new dimensions
	filmGrain = new FilmGrainEffect(
		0,
		0,
		windowWidth,
		windowHeight,
		CONFIG.grain.patternSize,
		CONFIG.grain.sampleSize,
		CONFIG.grain.alpha,
	);
}

/**
 * Setup - Initialize all components
 */
function setup() {
	createCanvas(windowWidth, windowHeight);

	textFont(font);
	textSize(16);

	// Initialize video processor
	videoProcessor = new VideoProcessor(CONFIG.video.width, CONFIG.video.height);
	const video = videoProcessor.initialize();
	videoProcessor.setSaturation(CONFIG.saturation);

	// Initialize hand tracker
	handTracker = new HandTracker(video, {
		maxNumHands: CONFIG.hands.maxNumHands,
		smoothing: CONFIG.hands.smoothing,
	});

	// Initialize film grain effect
	filmGrain = new FilmGrainEffect(
		0,
		0,
		windowWidth,
		windowHeight,
		CONFIG.grain.patternSize,
		CONFIG.grain.sampleSize,
		CONFIG.grain.alpha,
	);

	// Initialize pixelation effect (start with min size)
	pixelationEffect = new PixelationEffect(CONFIG.pixelation.minSize);
}

/**
 * Main draw loop
 */
function draw() {
	// Draw video with processing
	const { img, drawWidth, drawHeight, drawX, drawY } = videoProcessor.draw();

	// Update hand tracker with video dimensions for coordinate conversion
	handTracker.setVideoDimensions({ drawWidth, drawHeight, drawX, drawY });

	// Update pixelation size based on hand depth
	updatePixelationSize();

	// Calculate pixelation rectangle if both hands are detected
	const pixelationRect = calculatePixelationRect();

	// Apply pixelation effect if rectangle exists
	if (pixelationRect) {
		applyPixelation(img, pixelationRect, {
			drawWidth,
			drawHeight,
			drawX,
			drawY,
		});
	}

	// Update and display film grain
	filmGrain.update();
	filmGrain.display();

	// Draw hand visualization
	drawHandIndicators();

	// Draw pixelation rectangle outline
	if (pixelationRect) {
		drawPixelationOutline(pixelationRect);
	}
}

/**
 * Update pixelation size based on hand depth
 * Closer to camera = larger pixels (more blur)
 * Further from camera = smaller pixels (less blur)
 */
function updatePixelationSize() {
	const depth = handTracker.getAverageIndexDepth();

	if (depth === null) {
		return; // No hands detected
	}

	// Debug: log depth values
	console.log("Depth:", depth);

	// MediaPipe z values typically range from -0.3 (close) to 0.3 (far)
	// Adjust range for better sensitivity
	const normalizedDepth = constrain(map(depth, -0.1, 0.01, 0, 1), 0, 1);

	// Invert: close to camera (low z) = large pixels
	const invertedDepth = 1 - normalizedDepth;

	// Map to pixel size range
	const pixelSize = map(
		invertedDepth,
		0,
		1,
		CONFIG.pixelation.minSize,
		CONFIG.pixelation.maxSize,
	);

	console.log("Pixel size:", Math.round(pixelSize));

	// Update pixelation effect
	pixelationEffect.setPixelSize(pixelSize);
}

/**
 * Calculate pixelation rectangle from both index fingers
 */
function calculatePixelationRect() {
	const leftHand = handTracker.getLeftHand();
	const rightHand = handTracker.getRightHand();

	if (!leftHand || !rightHand) {
		return null;
	}

	const leftPos = handTracker.getFingerScreenPosition(leftHand, "index");
	const rightPos = handTracker.getFingerScreenPosition(rightHand, "index");

	if (!leftPos || !rightPos) {
		return null;
	}

	const rectX = leftPos.x;
	const rectY = rightPos.y + (leftPos.y - rightPos.y) / 2;
	const rectWidth = rightPos.x - leftPos.x;
	const rectHeight = Math.abs(rightPos.y - leftPos.y);

	return {
		x: rectX,
		y: rectY,
		width: rectWidth,
		height: rectHeight,
	};
}

/**
 * Apply pixelation effect to image
 */
function applyPixelation(img, rect, videoDimensions) {
	// Need to redraw the mirrored image with pixelation
	push();
	translate(width, 0);
	scale(-1, 1);

	pixelationEffect.apply(img, rect, videoDimensions);

	const { drawWidth, drawHeight, drawX, drawY } = videoDimensions;
	image(img, drawX, drawY, drawWidth, drawHeight);

	pop();
}

/**
 * Draw hand indicators (circles on fingers)
 */
function drawHandIndicators() {
	const leftHand = handTracker.getLeftHand();
	const rightHand = handTracker.getRightHand();

	// Draw left hand index
	if (leftHand) {
		const pos = handTracker.getFingerScreenPosition(leftHand, "index");
		if (pos) {
			drawFingerIndicator(pos, `[${round(pos.x)}, ${round(pos.y)}]`, "RIGHT");
		}
	}

	// Draw right hand index
	if (rightHand) {
		const pos = handTracker.getFingerScreenPosition(rightHand, "index");
		if (pos) {
			drawFingerIndicator(pos, `[${round(pos.x)}, ${round(pos.y)}]`, "LEFT");
		}
	}
}

/**
 * Draw a single finger indicator
 */
function drawFingerIndicator(pos, label, align) {
	// Draw circle
	noFill();
	stroke(255);
	strokeWeight(4);
	circle(pos.x, pos.y, 40);

	// Draw label
	noStroke();
	fill(255);
	textAlign(align === "RIGHT" ? RIGHT : LEFT, CENTER);
	text(label, pos.x + (align === "RIGHT" ? -40 : 40), pos.y);
}

/**
 * Draw pixelation rectangle outline
 */
function drawPixelationOutline(pixelRect) {
	noFill();
	stroke(255, 255, 255);
	strokeWeight(4);
	rectMode(CENTER);
	rect(
		pixelRect.x + pixelRect.width / 2,
		pixelRect.y,
		pixelRect.width,
		pixelRect.height,
	);
}
