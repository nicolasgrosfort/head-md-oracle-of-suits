/** biome-ignore-all lint/correctness/noUnusedVariables: <> */

const colorStack = [];
let currentcolorHue = 0;

// * P5

function setup() {
	createCanvas(windowWidth, windowHeight);
	colorMode(HSB);
}

function draw() {
	drawColorIndicator();

	if (mouseIsPressed && frameCount % 2 === 0) {
		const width = random(50, 200);
		const height = random(10, 50);
		const x = mouseX;
		const y = mouseY;
		const saturation = map(mouseY, 0, windowHeight, 0, 100);
		const rotation = random(-10, 10);

		stroke(255);
		strokeWeight(2);
		fill(currentcolorHue, saturation, 100, 1);

		push();
		translate(x, y);
		rotate(radians(rotation)); // Convertir les degrés en radians
		rect(-width * 0.5, -height * 0.5, width, height);
		pop();
	}
}

// * EVENTS

function mouseMoved() {
	currentcolorHue = map(mouseX, 0, width, 0, 360);
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
}

// * CUSTOM

function drawColorIndicator() {
	noStroke();
	fill(currentcolorHue, 100, 100);
	rect(0, height - 2, width, 2);
}
