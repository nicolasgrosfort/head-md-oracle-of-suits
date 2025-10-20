/** biome-ignore-all lint/correctness/noUnusedVariables: <> */

let capture;
let hands;
let results;

// États du jeu
let gameState = "WAITING"; // WAITING, COUNTDOWN, FROZEN, SHOWING_WINNER
let countdownStart = 0;
const countdownDuration = 3000; // 3 secondes
let currentCountdown = 3;
let frozenResults = null;
let winner = null;

function setup() {
	createCanvas(windowWidth, windowHeight);

	capture = createCapture(VIDEO);
	capture.size(640, 480);
	capture.hide();

	// Configuration de MediaPipe Hands
	hands = new Hands({
		locateFile: (file) => {
			return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
		},
	});

	hands.setOptions({
		maxNumHands: 2, // Nombre max de mains à détecter
		modelComplexity: 1, // 0 (rapide) ou 1 (précis)
		minDetectionConfidence: 0.5, // Seuil de confiance pour détecter
		minTrackingConfidence: 0.5, // Seuil de confiance pour suivre
	});

	hands.onResults(onResults);
	detectHands();
}

function draw() {
	background(0);

	// Gestion des états du jeu
	const numHands = results?.multiHandLandmarks?.length || 0;

	// Machine à états
	if (numHands !== 2) {
		// Si pas exactement 2 mains, réinitialiser
		if (gameState !== "WAITING") {
			resetGame();
		}
		gameState = "WAITING";
	} else if (numHands === 2) {
		// Exactement 2 mains détectées
		if (gameState === "WAITING") {
			// Démarrer le countdown
			gameState = "COUNTDOWN";
			countdownStart = millis();
		} else if (gameState === "COUNTDOWN") {
			// Vérifier le countdown
			const elapsed = millis() - countdownStart;
			currentCountdown = 3 - floor(elapsed / 1000);

			if (elapsed >= countdownDuration) {
				// Countdown terminé, figer le jeu
				gameState = "FROZEN";
				frozenResults = captureFinalGestures();
				winner = determineWinner(frozenResults);
			}
		}
	}

	// Affichage selon l'état
	if (gameState === "FROZEN") {
		// Afficher l'image figée et le gagnant
		drawFrozenGame();
	} else {
		// Afficher le jeu en direct
		drawLiveGame();
	}

	// Afficher les instructions et le compte à rebours
	drawGameUI();
}

function resetGame() {
	frozenResults = null;
	winner = null;
	currentCountdown = 3;
}

function captureFinalGestures() {
	const player1 = results.multiHandLandmarks[0];
	const player2 = results.multiHandLandmarks[1];

	return {
		player1: {
			hand: player1,
			gesture: detectRockPaperScissors(player1),
		},
		player2: {
			hand: player2,
			gesture: detectRockPaperScissors(player2),
		},
	};
}

function determineWinner(frozenResults) {
	const gesture1 = frozenResults.player1.gesture.gesture;
	const gesture2 = frozenResults.player2.gesture.gesture;

	// Extraire le type de geste (enlever les emojis)
	const type1 = gesture1.includes("CAILLOU")
		? "ROCK"
		: gesture1.includes("FEUILLE")
			? "PAPER"
			: gesture1.includes("CISEAUX")
				? "SCISSORS"
				: "UNKNOWN";

	const type2 = gesture2.includes("CAILLOU")
		? "ROCK"
		: gesture2.includes("FEUILLE")
			? "PAPER"
			: gesture2.includes("CISEAUX")
				? "SCISSORS"
				: "UNKNOWN";

	if (type1 === type2) {
		return "ÉGALITÉ! 🤝";
	}

	if (
		(type1 === "ROCK" && type2 === "SCISSORS") ||
		(type1 === "SCISSORS" && type2 === "PAPER") ||
		(type1 === "PAPER" && type2 === "ROCK")
	) {
		return "JOUEUR 1 GAGNE! 🎉";
	}

	if (
		(type2 === "ROCK" && type1 === "SCISSORS") ||
		(type2 === "SCISSORS" && type1 === "PAPER") ||
		(type2 === "PAPER" && type1 === "ROCK")
	) {
		return "JOUEUR 2 GAGNE! 🎉";
	}

	return "ERREUR";
}

function drawLiveGame() {
	// Afficher la vidéo en miroir
	push();
	translate(width, 0);
	scale(-1, 1);
	//image(capture, 0, 0, width, height);
	pop();

	// Analyser et afficher les gestes détectés
	if (results?.multiHandLandmarks) {
		for (let i = 0; i < results.multiHandLandmarks.length; i++) {
			const hand = results.multiHandLandmarks[i];

			// Dessiner les landmarks de la main
			drawHandLandmarks(hand);

			// Détecter le geste avec probabilités
			const gestureResult = detectRockPaperScissors(hand);

			// Afficher le résultat à côté de la main (simplifié)
			displayGestureResultSimple(hand, gestureResult, i + 1);
		}
	}
}

function drawFrozenGame() {
	// Afficher les résultats figés
	if (frozenResults) {
		// Joueur 1
		drawHandLandmarks(frozenResults.player1.hand);
		displayGestureResultSimple(frozenResults.player1.hand, frozenResults.player1.gesture, 1);

		// Joueur 2
		drawHandLandmarks(frozenResults.player2.hand);
		displayGestureResultSimple(frozenResults.player2.hand, frozenResults.player2.gesture, 2);

		// Afficher le gagnant au centre
		push();
		fill(255, 215, 0);
		stroke(0);
		strokeWeight(4);
		textAlign(CENTER, CENTER);
		textSize(80);
		textStyle(BOLD);
		text(winner, width / 2, height / 2);

		// Instructions pour rejouer
		textSize(30);
		fill(255);
		text("Retirez une main pour recommencer", width / 2, height / 2 + 80);
		pop();
	}
}

function drawGameUI() {
	push();
	textAlign(CENTER, TOP);

	if (gameState === "WAITING") {
		// Attente de 2 joueurs
		fill(255, 100, 100);
		textSize(40);
		textStyle(BOLD);
		text("🖐️ EN ATTENTE DE 2 JOUEURS 🖐️", width / 2, 50);

		textSize(20);
		fill(200);
		const numHands = results?.multiHandLandmarks?.length || 0;
		text(`Mains détectées: ${numHands}/2`, width / 2, 110);
	} else if (gameState === "COUNTDOWN") {
		// Countdown en cours
		fill(255, 200, 0);
		textSize(200);
		textStyle(BOLD);
		text(
			currentCountdown > 0 ? currentCountdown : "GO!",
			width / 2,
			height / 3,
		);

		textSize(30);
		fill(255);
		text("Faites votre geste!", width / 2, height / 3 + 220);
	}

	pop();
}

function onResults(res) {
	results = res;
}

async function detectHands() {
	if (capture.loadedmetadata) {
		await hands.send({ image: capture.elt });
	}
	requestAnimationFrame(detectHands);
}

// Fonction principale de détection des gestes
function detectRockPaperScissors(hand) {
	const fingerStates = analyzeFingers(hand);

	// Calculer les scores pour chaque geste
	const rockScore = calculateRockScore(fingerStates);
	const paperScore = calculatePaperScore(fingerStates);
	const scissorsScore = calculateScissorsScore(fingerStates);

	// Normaliser les scores en probabilités (0-100%)
	const total = rockScore + paperScore + scissorsScore;
	const rockProb = (rockScore / total) * 100;
	const paperProb = (paperScore / total) * 100;
	const scissorsProb = (scissorsScore / total) * 100;

	// Déterminer le geste le plus probable
	let gesture = "UNKNOWN";
	let confidence = 0;

	if (rockProb > paperProb && rockProb > scissorsProb) {
		gesture = "CAILLOU 🪨";
		confidence = rockProb;
	} else if (paperProb > rockProb && paperProb > scissorsProb) {
		gesture = "FEUILLE 📄";
		confidence = paperProb;
	} else if (scissorsProb > rockProb && scissorsProb > paperProb) {
		gesture = "CISEAUX ✂️";
		confidence = scissorsProb;
	}

	return {
		gesture,
		confidence,
		probabilities: {
			rock: rockProb,
			paper: paperProb,
			scissors: scissorsProb,
		},
	};
}

// Analyser l'état de chaque doigt
function analyzeFingers(hand) {
	const wrist = hand[0];

	// Analyse du pouce (axe X car horizontal)
	const thumbTip = hand[4];
	const thumbBase = hand[2];
	const thumbExtended =
		abs(thumbTip.x - wrist.x) > abs(thumbBase.x - wrist.x) * 1.2;

	// Analyse de l'index
	const indexTip = hand[8];
	const indexMid = hand[6];
	const indexExtended = indexTip.y < indexMid.y - 0.02;

	// Analyse du majeur
	const middleTip = hand[12];
	const middleMid = hand[10];
	const middleExtended = middleTip.y < middleMid.y - 0.02;

	// Analyse de l'annulaire
	const ringTip = hand[16];
	const ringMid = hand[14];
	const ringExtended = ringTip.y < ringMid.y - 0.02;

	// Analyse de l'auriculaire
	const pinkyTip = hand[20];
	const pinkyMid = hand[18];
	const pinkyExtended = pinkyTip.y < pinkyMid.y - 0.02;

	return {
		thumb: thumbExtended,
		index: indexExtended,
		middle: middleExtended,
		ring: ringExtended,
		pinky: pinkyExtended,
	};
}

// Calculer le score pour "Caillou" (poing fermé)
function calculateRockScore(fingerStates) {
	let score = 100;

	// Tous les doigts doivent être fermés
	if (fingerStates.thumb) score -= 25;
	if (fingerStates.index) score -= 25;
	if (fingerStates.middle) score -= 25;
	if (fingerStates.ring) score -= 15;
	if (fingerStates.pinky) score -= 15;

	return max(score, 0);
}

// Calculer le score pour "Feuille" (main ouverte)
function calculatePaperScore(fingerStates) {
	let score = 0;

	// Tous les doigts doivent être ouverts
	if (fingerStates.thumb) score += 20;
	if (fingerStates.index) score += 20;
	if (fingerStates.middle) score += 20;
	if (fingerStates.ring) score += 20;
	if (fingerStates.pinky) score += 20;

	return score;
}

// Calculer le score pour "Ciseaux" (index et majeur ouverts, autres fermés)
function calculateScissorsScore(fingerStates) {
	let score = 0;

	// Index et majeur ouverts = bon
	if (fingerStates.index) score += 40;
	if (fingerStates.middle) score += 40;

	// Autres doigts fermés = bon
	if (!fingerStates.thumb) score += 10;
	if (!fingerStates.ring) score += 10;
	if (!fingerStates.pinky) score += 10;

	// Pénalité si index ou majeur fermés
	if (!fingerStates.index) score -= 30;
	if (!fingerStates.middle) score -= 30;

	return max(score, 0);
}

// Nouvelle fonction simplifiée : Afficher seulement Joueur, Posture et %
function displayGestureResultSimple(hand, gestureResult, playerNumber) {
	// Position de la main (utiliser le poignet)
	const wrist = hand[0];
	const x = width - wrist.x * width;
	const y = wrist.y * height;

	push();

	// Fond semi-transparent compact
	fill(0, 0, 0, 200);
	stroke(playerNumber === 1 ? color(100, 200, 255) : color(255, 100, 200));
	strokeWeight(2);
	noStroke();
	rectMode(CENTER);
	const boxWidth = 200;
	const boxHeight = 70;
	rect(x, y - 60, boxWidth, boxHeight, 8);

	// Couleur du joueur
	const playerColor = playerNumber === 1 ? color(100, 200, 255) : color(255, 100, 200);

	// Ligne 1 : Joueur X
	fill(playerColor);
	textAlign(CENTER, CENTER);
	textSize(16);
	textStyle(BOLD);
	text(`JOUEUR ${playerNumber}`, x, y - 80);

	// Ligne 2 : Posture
	fill(255);
	textSize(24);
	textStyle(BOLD);
	text(gestureResult.gesture, x, y - 55);

	// Ligne 3 : Pourcentage
	fill(200);
	textSize(14);
	textStyle(NORMAL);
	text(`(${gestureResult.confidence.toFixed(0)}%)`, x, y - 30);

	pop();
}

// Ancienne fonction : Afficher le résultat en position fixe (gardée pour compatibilité)
function displayGestureResultFixed(gestureResult, playerNumber) {
	// Position fixe selon le numéro du joueur
	// Joueur 1 = en haut à gauche, Joueur 2 = en haut à droite
	const padding = 20;
	const boxWidth = 250;
	const boxHeight = 140;

	let x, y;
	if (playerNumber === 1) {
		// Haut à gauche
		x = padding + boxWidth / 2;
		y = padding + boxHeight / 2;
	} else {
		// Haut à droite
		x = width - padding - boxWidth / 2;
		y = padding + boxHeight / 2;
	}

	push();

	// Fond semi-transparent pour la lisibilité
	fill(0, 0, 0, 200);
	strokeWeight(3);
	rectMode(CENTER);
	rect(x, y, boxWidth, boxHeight, 10);

	// Numéro du joueur
	fill(playerNumber === 1 ? color(100, 200, 255) : color(255, 100, 200));
	textAlign(CENTER, CENTER);
	textSize(18);
	textStyle(BOLD);
	text(`JOUEUR ${playerNumber}`, x, y - boxHeight / 2 + 25);

	// Nom du geste (plus gros)
	fill(255);
	textSize(28);
	textStyle(BOLD);
	text(gestureResult.gesture, x, y - 20);

	// Barre de confiance
	textSize(14);
	textStyle(NORMAL);
	text(`Confiance: ${gestureResult.confidence.toFixed(0)}%`, x, y + 15);

	// Barre de progression
	const barWidth = 200;
	const barHeight = 10;

	// Fond de la barre
	fill(50);
	noStroke();
	rect(x, y + 40, barWidth, barHeight, 5);

	// Barre de confiance colorée
	const confidenceWidth = map(gestureResult.confidence, 0, 100, 0, barWidth);

	if (gestureResult.confidence > 70) {
		fill(0, 255, 0);
	} else if (gestureResult.confidence > 40) {
		fill(255, 200, 0);
	} else {
		fill(255, 100, 0);
	}

	rectMode(CORNER);
	rect(x - barWidth / 2, y + 40 - barHeight / 2, confidenceWidth, barHeight, 5);

	// Afficher les probabilités détaillées (petit texte)
	textSize(11);
	fill(200);
	textAlign(CENTER);
	rectMode(CENTER);
	text(
		`🪨 ${gestureResult.probabilities.rock.toFixed(0)}%  ` +
			`📄 ${gestureResult.probabilities.paper.toFixed(0)}%  ` +
			`✂️ ${gestureResult.probabilities.scissors.toFixed(0)}%`,
		x,
		y + 60,
	);

	pop();
}

// Ancienne fonction : Afficher le résultat à côté de la main (gardée pour compatibilité)
function displayGestureResult(hand, gestureResult, playerNumber = 0) {
	// Position de la main (utiliser le poignet)
	const wrist = hand[0];
	const x = width - wrist.x * width;
	const y = wrist.y * height;

	push();

	// Fond semi-transparent pour la lisibilité
	fill(0, 0, 0, 180);
	noStroke();
	rectMode(CENTER);
	rect(x, y - 80, 180, 120, 10);

	// Numéro du joueur (si spécifié)
	if (playerNumber > 0) {
		fill(playerNumber === 1 ? color(100, 200, 255) : color(255, 100, 200));
		textAlign(CENTER, CENTER);
		textSize(16);
		textStyle(BOLD);
		text(`JOUEUR ${playerNumber}`, x, y - 130);
	}

	// Nom du geste
	fill(255);
	textAlign(CENTER, CENTER);
	textSize(20);
	textStyle(BOLD);
	text(gestureResult.gesture, x, y - 100);

	// Barre de confiance
	textSize(14);
	textStyle(NORMAL);
	text(`Confiance: ${gestureResult.confidence.toFixed(0)}%`, x, y - 70);

	// Barre de progression
	const barWidth = 150;
	const barHeight = 8;

	// Fond de la barre
	fill(50);
	rect(x, y - 50, barWidth, barHeight, 4);

	// Barre de confiance colorée
	const confidenceWidth = map(gestureResult.confidence, 0, 100, 0, barWidth);

	if (gestureResult.confidence > 70) {
		fill(0, 255, 0);
	} else if (gestureResult.confidence > 40) {
		fill(255, 200, 0);
	} else {
		fill(255, 100, 0);
	}

	rectMode(CORNER);
	rect(x - barWidth / 2, y - 50 - barHeight / 2, confidenceWidth, barHeight, 4);

	// Afficher les probabilités détaillées (petit texte)
	textSize(10);
	fill(200);
	textAlign(CENTER);
	text(
		`🪨 ${gestureResult.probabilities.rock.toFixed(0)}%  ` +
			`📄 ${gestureResult.probabilities.paper.toFixed(0)}%  ` +
			`✂️ ${gestureResult.probabilities.scissors.toFixed(0)}%`,
		x,
		y - 30,
	);

	pop();
}

// Dessiner les landmarks de la main
function drawHandLandmarks(landmarks) {
	// Dessiner les connexions
	stroke(0, 255, 0);
	strokeWeight(2);
	noFill();

	const connections = [
		[0, 1],
		[1, 2],
		[2, 3],
		[3, 4], // Pouce
		[0, 5],
		[5, 6],
		[6, 7],
		[7, 8], // Index
		[0, 9],
		[9, 10],
		[10, 11],
		[11, 12], // Majeur
		[0, 13],
		[13, 14],
		[14, 15],
		[15, 16], // Annulaire
		[0, 17],
		[17, 18],
		[18, 19],
		[19, 20], // Auriculaire
		[5, 9],
		[9, 13],
		[13, 17], // Paume
	];

	for (const [a, b] of connections) {
		const x1 = width - landmarks[a].x * width;
		const y1 = landmarks[a].y * height;
		const x2 = width - landmarks[b].x * width;
		const y2 = landmarks[b].y * height;
		line(x1, y1, x2, y2);
	}

	// Dessiner les points
	fill(255, 0, 100);
	noStroke();
	for (const landmark of landmarks) {
		const x = width - landmark.x * width;
		const y = landmark.y * height;
		circle(x, y, 6);
	}
}
