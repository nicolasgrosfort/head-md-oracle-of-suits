/** biome-ignore-all lint/correctness/noUnusedVariables: <> */

let video;
let font;
let hands;

// MediaPipe landmarks indices
const LANDMARKS = {
	THUMB_TIP: 4,
	INDEX_TIP: 8,
};

// Structure pour stocker les données des mains
const handsData = {
	left: null,
	right: null,
};

function preload() {
	font = loadFont(
		"https://cdnjs.cloudflare.com/ajax/libs/topcoat/0.8.0/font/SourceCodePro-Regular.otf",
	);
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
}

function setup() {
	createCanvas(windowWidth, windowHeight);

	textFont(font);
	textSize(16);

	video = createCapture(VIDEO);
	video.size(640, 480);
	video.hide();

	hands = new Hands({
		locateFile: (file) => {
			return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
		},
	});

	hands.setOptions({
		maxNumHands: 2, // Détecter jusqu'à 2 mains
		modelComplexity: 1,
		minDetectionConfidence: 0.5,
		minTrackingConfidence: 0.5,
	});

	hands.onResults(onHandsResults);

	// Start detection
	const camera = new Camera(video.elt, {
		onFrame: async () => {
			await hands.send({ image: video.elt });
		},
		width: 640,
		height: 480,
	});

	camera.start();
}

// Fonction utilitaire pour calculer les dimensions de la vidéo en mode cover
function getVideoCoverDimensions() {
	const videoAspect = video.width / video.height;
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

// Fonction pour convertir les coordonnées normalisées en coordonnées écran
function normalizedToScreen(normalizedX, normalizedY) {
	const { drawWidth, drawHeight, drawX, drawY } = getVideoCoverDimensions();

	return {
		x: width - (normalizedX * drawWidth + drawX), // Miroir
		y: normalizedY * drawHeight + drawY,
	};
}

// Fonction pour lisser une position
function smoothPosition(current, target, smoothing = 0.5) {
	if (!current) {
		return { x: target.x, y: target.y };
	}
	return {
		x: lerp(current.x, target.x, smoothing),
		y: lerp(current.y, target.y, smoothing),
	};
}

// Fonction pour dessiner la vidéo en noir et blanc
function drawGrayscaleVideo() {
	push();
	translate(width, 0);
	scale(-1, 1);

	video.loadPixels();
	const img = createImage(video.width, video.height);
	img.loadPixels();

	for (let i = 0; i < video.pixels.length; i += 4) {
		const gray =
			(video.pixels[i] + video.pixels[i + 1] + video.pixels[i + 2]) / 3;
		img.pixels[i] = gray;
		img.pixels[i + 1] = gray;
		img.pixels[i + 2] = gray;
		img.pixels[i + 3] = 255;
	}
	img.updatePixels();

	const { drawWidth, drawHeight, drawX, drawY } = getVideoCoverDimensions();
	image(img, drawX, drawY, drawWidth, drawHeight);
	pop();
}

// Fonction pour dessiner un doigt
function drawFinger(finger, color = 255, size = 80) {
	if (!finger?.smooth) return;

	const pos = normalizedToScreen(finger.smooth.x, finger.smooth.y);

	noFill();
	stroke(color);
	strokeWeight(4);
	circle(pos.x, pos.y, size);
}

function draw() {
	// Dessiner la vidéo en noir et blanc
	drawGrayscaleVideo();

	// Dessiner les doigts détectés pour chaque main
	if (handsData.left) {
		drawFinger(handsData.left.index, 255, 60);
		drawFinger(handsData.left.thumb, 255, 60);
	}

	if (handsData.right) {
		drawFinger(handsData.right.index, 255, 60);
		drawFinger(handsData.right.thumb, 255, 60);
	}
}

function onHandsResults(results) {
	// Réinitialiser les mains
	handsData.left = null;
	handsData.right = null;

	if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
		return;
	}

	// Traiter chaque main détectée
	for (let i = 0; i < results.multiHandLandmarks.length; i++) {
		const landmarks = results.multiHandLandmarks[i];
		const handedness = results.multiHandedness[i].label; // "Left" ou "Right"

		// Note: MediaPipe inverse left/right en mode miroir
		const handKey = handedness === "Left" ? "right" : "left";

		// Extraire les positions du pouce et de l'index
		const thumbPos = landmarks[LANDMARKS.THUMB_TIP];
		const indexPos = landmarks[LANDMARKS.INDEX_TIP];

		// Initialiser ou mettre à jour les données de la main
		if (!handsData[handKey]) {
			handsData[handKey] = {
				thumb: {
					x: thumbPos.x,
					y: thumbPos.y,
					smooth: { x: thumbPos.x, y: thumbPos.y },
				},
				index: {
					x: indexPos.x,
					y: indexPos.y,
					smooth: { x: indexPos.x, y: indexPos.y },
				},
			};
		} else {
			// Mettre à jour avec lissage
			handsData[handKey].thumb.x = thumbPos.x;
			handsData[handKey].thumb.y = thumbPos.y;
			handsData[handKey].thumb.smooth = smoothPosition(
				handsData[handKey].thumb.smooth,
				thumbPos,
				0.5,
			);

			handsData[handKey].index.x = indexPos.x;
			handsData[handKey].index.y = indexPos.y;
			handsData[handKey].index.smooth = smoothPosition(
				handsData[handKey].index.smooth,
				indexPos,
				0.5,
			);
		}
	}
}
