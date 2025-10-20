/** biome-ignore-all lint/correctness/noUnusedVariables: <> */

// --- paramètres visuels & physiques ---
const PIX = 5; // taille d'un pixel-carré
const W = 200; // largeur du carré
const H = 200; // hauteur du carré
const ANG = 0; // angle du carré en degrés
const ORIGIN = { x: 360, y: 360 }; // pivot/position du centre du carré

const RADIUS = 10; // rayon d'influence de la souris (plus petit)
const RADIUS_VARIATION = 0; // variation aléatoire du rayon
const IMPULSE = 10; // force de l'impulsion (souffle) - augmentée pour projeter plus loin
const IMPULSE_RANDOM_FACTOR = 0.5; // facteur de variation aléatoire de l'impulsion (0 à 1)
const SPRING_K = 0.01; // raideur du ressort (retour à la position d'origine)
const DAMPING = 0.9; // amortissement des vitesses (0..1)
const JITTER_FORCE = 0.01; // petite force de bruit quand un pixel est loin
const RETURN_NOISE_DIST = 1; // à partir de quelle distance on ajoute du jitter

const parts = [];
let tStart;

function setup() {
	createCanvas(windowWidth, windowHeight);
	noStroke();
	rectMode(CENTER);
	tStart = millis();

	// Pré-calcul rotation
	const a = radians(ANG);
	const cosA = cos(a),
		sinA = sin(a);

	// Grille de pixels locale -> monde (rotation + translation)
	for (let y = -H / 2 + PIX / 2; y <= H / 2 - PIX / 2; y += PIX) {
		for (let x = -W / 2 + PIX / 2; x <= W / 2 - PIX / 2; x += PIX) {
			const wx = ORIGIN.x + x * cosA - y * sinA;
			const wy = ORIGIN.y + x * sinA + y * cosA;
			parts.push({
				x: wx,
				y: wy, // position courante
				ox: wx,
				oy: wy, // position d'origine (home)
				vx: 0,
				vy: 0, // vitesse
				size: PIX, // taille uniforme pour former un carré solide
			});
		}
	}
	background(0);
}

function draw() {
	background(0);
	const dt = 1; // p5 tourne à ~60fps, dt=1 frame

	// rayon dynamique avec variation aléatoire
	const currentRadius = RADIUS + noise(frameCount * 0.05) * RADIUS_VARIATION;

	// vitesse de la souris (pour moduler l'impulsion)
	const mouseSpeed = dist(mouseX, mouseY, pmouseX, pmouseY);

	// mise à jour des particules
	for (const p of parts) {
		// 1) Impulsion au passage de la souris (souffle)
		//    On pousse les pixels situés dans un disque autour du curseur.
		const d = dist(mouseX, mouseY, p.x, p.y);
		if (d < currentRadius) {
			// direction "loin de la souris"
			let dx = p.x - mouseX;
			let dy = p.y - mouseY;
			const mag = sqrt(dx * dx + dy * dy) || 1;
			dx /= mag;
			dy /= mag;

			// impulsion modulée par la proximité + vitesse du pointeur
			const proximity = 1 - d / currentRadius; // 0..1
			const speedFactor = constrain(mouseSpeed / 10, 0, 2); // 0..~2

			// variation aléatoire de l'impulsion pour chaque pixel
			const randomFactor =
				1 + random(-IMPULSE_RANDOM_FACTOR, IMPULSE_RANDOM_FACTOR);
			const kick =
				IMPULSE * proximity * (0.6 + 0.4 * speedFactor) * randomFactor;

			p.vx += dx * kick;
			p.vy += dy * kick;

			// léger jitter pour l'aspect “granule qui s'effiloche”
			const n = noise(p.x * 0.02, p.y * 0.02, frameCount * 0.02) - 0.5;
			p.vx += n * 1.5;
			p.vy += (noise(p.y * 0.02, p.x * 0.02, frameCount * 0.02) - 0.5) * 1.5;
		}

		// 2) Force de rappel (ressort) vers la position d'origine
		const rx = p.ox - p.x;
		const ry = p.oy - p.y;
		p.vx += rx * SPRING_K * dt;
		p.vy += ry * SPRING_K * dt;

		// 3) Petit bruit quand le pixel est assez loin de "home"
		const distHome = abs(rx) + abs(ry);
		if (distHome > RETURN_NOISE_DIST) {
			const n2 = noise(p.ox * 0.01, p.oy * 0.01, frameCount * 0.01) - 0.5;
			const orthoX = -ry,
				orthoY = rx; // vecteur orthogonal approximatif
			const norm = max(1, sqrt(orthoX * orthoX + orthoY * orthoY));
			p.vx += (orthoX / norm) * n2 * JITTER_FORCE;
			p.vy += (orthoY / norm) * n2 * JITTER_FORCE;
		}

		// 4) Amortissement + intégration
		p.vx *= DAMPING;
		p.vy *= DAMPING;
		p.x += p.vx * dt;
		p.y += p.vy * dt;

		// 5) Rendu (pixel carré)
		fill(120, 255, 200, 230);
		rect(p.x, p.y, p.size, p.size);
	}

	// (facultatif) halo discret autour du curseur
	noFill();
	stroke(120, 255, 200, 60);
	circle(mouseX, mouseY, currentRadius * 2);
	noStroke();
}

// Support tactile basique: utiliser le premier doigt comme "souris"
function touchMoved() {
	return false; // empêche le scroll sur mobile
}
