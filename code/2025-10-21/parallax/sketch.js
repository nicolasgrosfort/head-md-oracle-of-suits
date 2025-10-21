/** biome-ignore-all lint/correctness/noUnusedVariables: <> */

function setup() {
	createCanvas(windowWidth, windowHeight, WEBGL);
}

function draw() {
	background(220);

	push();
	fill(150, 0, 150);
	box(100);
	pop();

	const camX = map(mouseX, 0, width, -250, 250);
	const camY = map(mouseY, 0, height, -250, 250);
	const camZ = height / 2 / tan(PI / 6);

	camera(camX, camY, camZ, 0, 0, 0, 0, 1, 0);
}
