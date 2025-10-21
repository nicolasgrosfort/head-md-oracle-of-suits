/** biome-ignore-all lint/correctness/noUnusedVariables: <> */

let video;
let font;
let hands;
let filmGrain; // Effet de grain

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

// Classes pour l'effet de grain
class Effects {
	static counter = 0;
}

class FilmGrainEffect {
	static counter = 0;
	static index = 0;

	constructor(x, y, w, h, patternSize, sampleSize = 1, patternAlpha = 0.1) {
		this.id = `FilmGrain_${Effects.counter++}`;
		this.reset(x, y, w, h, patternSize, sampleSize, patternAlpha);
	}

	reset(x, y, w, h, patternSize, sampleSize = 1, patternAlpha = 0.1) {
		this.samples = [];
		this.currentSampleSet = [];
		this.patternRefreshInterval = 4;
		FilmGrainEffect.counter = 0;
		FilmGrainEffect.index = 0;
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.p = patternSize;
		this.s = sampleSize;
		this.a = map(patternAlpha, 0, 1, 0, 255);
		for (let i = 0; i < sampleSize; i++) {
			this.samples.push(
				this.pattern(this.x, this.y, this.w, this.h, this.p, this.a),
			);
		}
	}

	pattern(x, y, w, h, patternSize, patternAlpha) {
		// créer un nouveau canvas p5
		const pg = createGraphics(patternSize, patternSize);
		pg.pixelDensity(1);

		// créer le bruit
		pg.loadPixels();
		for (let _y = 0; _y < patternSize; _y += 1) {
			for (let _x = 0; _x < patternSize; _x += 1) {
				const i = (_x + _y * patternSize) * 4;
				const value = (Math.random() * 255) | 0;
				pg.pixels[i] = value;
				pg.pixels[i + 1] = value;
				pg.pixels[i + 2] = value;
				pg.pixels[i + 3] = patternAlpha;
			}
		}
		pg.updatePixels();

		// calculer les positions des morceaux de bruit et les sauvegarder
		const xlen = w / patternSize;
		const ylen = h / patternSize;

		const samples = [];
		for (let i = 0; i < ylen; i++) {
			for (let j = 0; j < xlen; j++) {
				const _x = x + patternSize * j;
				const _y = y + patternSize * i;
				samples.push({
					canvas: pg,
					x: _x,
					y: _y,
					w: patternSize,
					h: patternSize,
				});
			}
		}

		return samples;
	}

	update() {
		if (FilmGrainEffect.counter++ === this.patternRefreshInterval) {
			FilmGrainEffect.counter = 0;
			FilmGrainEffect.index++;
			if (!this.samples[FilmGrainEffect.index]) {
				FilmGrainEffect.index = 0;
			}
		}
		this.currentSampleSet = this.samples[FilmGrainEffect.index];
	}

	display() {
		for (const sample of this.currentSampleSet) {
			image(sample.canvas, sample.x, sample.y, sample.w, sample.h);
		}
	}
}

function preload() {
	font = loadFont(
		"https://cdnjs.cloudflare.com/ajax/libs/topcoat/0.8.0/font/SourceCodePro-Regular.otf",
	);
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
	// Recréer le grain avec les nouvelles dimensions
	filmGrain = new FilmGrainEffect(
		0,
		0,
		windowWidth,
		windowHeight,
		128, // patternSize - taille des tuiles de grain
		3, // sampleSize - nombre de patterns différents
		0.15, // patternAlpha - opacité du grain (0.1 = subtil, 0.3 = fort)
	);
}

function setup() {
	createCanvas(windowWidth, windowHeight);

	textFont(font);
	textSize(16);

	video = createCapture(VIDEO);
	video.size(640, 480);
	video.hide();

	// Initialiser l'effet de grain
	filmGrain = new FilmGrainEffect(
		0,
		0,
		windowWidth,
		windowHeight,
		128, // patternSize - taille des tuiles de grain
		3, // sampleSize - nombre de patterns différents
		0.15, // patternAlpha - opacité du grain (0.1 = subtil, 0.3 = fort)
	);

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

// Fonction pour dessiner la vidéo avec contrôle de saturation
function drawGrayscaleVideo(pixelationRect = null, saturation = 0) {
	// saturation: 0 = noir et blanc, 1 = couleur complète
	push();
	translate(width, 0);
	scale(-1, 1);

	video.loadPixels();
	const img = createImage(video.width, video.height);
	img.loadPixels();

	for (let i = 0; i < video.pixels.length; i += 4) {
		const r = video.pixels[i];
		const g = video.pixels[i + 1];
		const b = video.pixels[i + 2];

		// Calculer le niveau de gris
		const gray = (r + g + b) / 3;

		// Interpoler entre gris et couleur originale selon le niveau de saturation
		img.pixels[i] = lerp(gray, r, saturation);
		img.pixels[i + 1] = lerp(gray, g, saturation);
		img.pixels[i + 2] = lerp(gray, b, saturation);
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
	const pixelSize = 25; // Taille des "gros pixels" à l'écran

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
function drawFinger(
	finger,
	color = 255,
	size = 80,
	label = "",
	align = "RIGHT",
) {
	if (!finger?.smooth) return;

	const pos = normalizedToScreen(finger.smooth.x, finger.smooth.y);

	noFill();
	stroke(color);
	strokeWeight(4);
	circle(pos.x, pos.y, size);

	stroke(color);
	strokeWeight(1);
	fill(color);
	textAlign(align === "RIGHT" ? RIGHT : LEFT, CENTER);
	text(label, pos.x + (align === "RIGHT" ? -size : size), pos.y);
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

	// Dessiner la vidéo avec contrôle de saturation
	// saturation: 0 = noir et blanc, 0.5 = mi-couleur, 1 = couleur complète
	const saturation = 0.5; // Changez cette valeur entre 0 et 1
	drawGrayscaleVideo(pixelationRect, saturation);

	// Mettre à jour et afficher le grain de film
	filmGrain.update();
	filmGrain.display();

	// Dessiner les doigts détectés pour chaque main
	if (handsData.left) {
		const textPosition = normalizedToScreen(
			handsData.left.index.smooth.x,
			handsData.left.index.smooth.y,
		);
		drawFinger(
			handsData.left.index,
			255,
			40,
			`[${round(textPosition.x)}, ${round(textPosition.y)}]`,
			"RIGHT",
		);
	}

	if (handsData.right) {
		const textPosition = normalizedToScreen(
			handsData.right.index.smooth.x,
			handsData.right.index.smooth.y,
		);
		drawFinger(
			handsData.right.index,
			255,
			40,
			`[${round(textPosition.x)}, ${round(textPosition.y)}]`,
			"LEFT",
		);
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
