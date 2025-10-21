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
function drawGrayscaleVideo(pixelationRect = null) {
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

	// Appliquer la pixelisation sur l'image source si une zone est définie
	if (pixelationRect) {
		applyPixelationToImage(
			img,
			pixelationRect,
			drawWidth,
			drawHeight,
			drawX,
			drawY,
		);
	}

	image(img, drawX, drawY, drawWidth, drawHeight);

	pop();
}

// Fonction pour pixeliser une région rectangulaire sur l'image source
function applyPixelationToImage(
	img,
	pixelRect,
	drawWidth,
	drawHeight,
	drawX,
	drawY,
) {
	const pixelSize = 20; // Taille des "gros pixels" à l'écran

	// Convertir les coordonnées écran (avec miroir) en coordonnées de l'image source
	// 1. Inverser le miroir pour obtenir la position réelle dans l'espace affiché
	const screenX = width - pixelRect.x - pixelRect.width;
	const screenY = pixelRect.y - pixelRect.height / 2;

	// 2. Convertir de l'espace écran vers l'espace de l'image source (640x480)
	const scaleX = img.width / drawWidth;
	const scaleY = img.height / drawHeight;

	const imgX = (screenX - drawX) * scaleX;
	const imgY = (screenY - drawY) * scaleY;
	const imgWidth = pixelRect.width * scaleX;
	const imgHeight = pixelRect.height * scaleY;

	// Taille des pixels dans l'espace de l'image source
	const imgPixelSize = pixelSize * scaleX;

	img.loadPixels();

	// Parcourir la zone par blocs
	for (let y = imgY; y < imgY + imgHeight; y += imgPixelSize) {
		for (let x = imgX; x < imgX + imgWidth; x += imgPixelSize) {
			// Calculer la couleur moyenne du bloc
			let r = 0,
				g = 0,
				b = 0,
				count = 0;

			for (let dy = 0; dy < imgPixelSize; dy++) {
				for (let dx = 0; dx < imgPixelSize; dx++) {
					const px = Math.floor(x + dx);
					const py = Math.floor(y + dy);

					// Vérifier les limites de l'image
					if (px >= 0 && px < img.width && py >= 0 && py < img.height) {
						const index = (py * img.width + px) * 4;
						r += img.pixels[index];
						g += img.pixels[index + 1];
						b += img.pixels[index + 2];
						count++;
					}
				}
			}

			// Calculer la moyenne
			if (count > 0) {
				r = Math.floor(r / count);
				g = Math.floor(g / count);
				b = Math.floor(b / count);

				// Appliquer la couleur moyenne à tout le bloc
				for (let dy = 0; dy < imgPixelSize; dy++) {
					for (let dx = 0; dx < imgPixelSize; dx++) {
						const px = Math.floor(x + dx);
						const py = Math.floor(y + dy);

						if (px >= 0 && px < img.width && py >= 0 && py < img.height) {
							const index = (py * img.width + px) * 4;
							img.pixels[index] = r;
							img.pixels[index + 1] = g;
							img.pixels[index + 2] = b;
						}
					}
				}
			}
		}
	}

	img.updatePixels();
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
	// Calculer le rectangle de pixelisation si les deux mains sont détectées
	let pixelationRect = null;

	if (handsData.left && handsData.right) {
		const leftIndexPos = normalizedToScreen(
			handsData.left.index.smooth.x,
			handsData.left.index.smooth.y,
		);
		const rightIndexPos = normalizedToScreen(
			handsData.right.index.smooth.x,
			handsData.right.index.smooth.y,
		);

		const rectX = leftIndexPos.x;
		const rectY = rightIndexPos.y + (leftIndexPos.y - rightIndexPos.y) / 2;
		const rectWidth = rightIndexPos.x - leftIndexPos.x;
		const rectHeight = Math.abs(rightIndexPos.y - leftIndexPos.y);

		pixelationRect = {
			x: rectX,
			y: rectY,
			width: rectWidth,
			height: rectHeight,
		};
	}

	// Dessiner la vidéo en noir et blanc avec pixelisation
	drawGrayscaleVideo(pixelationRect);

	// Dessiner les doigts détectés pour chaque main
	if (handsData.left) {
		drawFinger(handsData.left.index, 255, 40);
	}

	if (handsData.right) {
		drawFinger(handsData.right.index, 255, 40);
	}

	// Dessiner le rectangle de censure
	if (pixelationRect) {
		noFill();
		stroke(255, 255, 255);
		strokeWeight(4);
		rectMode(CENTER);
		rect(
			pixelationRect.x + pixelationRect.width / 2,
			pixelationRect.y,
			pixelationRect.width,
			pixelationRect.height,
		);
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
