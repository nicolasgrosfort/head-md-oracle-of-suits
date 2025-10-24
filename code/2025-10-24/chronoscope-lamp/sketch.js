function setup() {
	createCanvas(windowWidth, windowHeight);
	createHandTracker({
		maxHands: 1,
		selfieMode: true,
	});
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
}	

function draw() {
	
	showHandVideo()
	background(0, 200);
	
	if (hands.length > 0) {
		for (let i = 0; i < hands.length; i++) {
			let hand = hands[i];

			let angle = angleBetweenPoints(hand.indexFinger[0], hand.thumb[0]) -0.5;
			angle = constrain(angle, 0, 2);

			const rawAngle = angle;
			const rawPalmX = hand.palm.x;
			const rawPalmY = hand.palm.y;

			angle = lerp(angle, rawAngle, 0.95);
			hand.palm.x = lerp(hand.palm.x, rawPalmX, 0.95);
			hand.palm.y = lerp(hand.palm.y, rawPalmY, 0.95);

			const size = map(angle, 0, PI / 2, 10, 500);
			
			fill(255);
			circle(hand.palm.x * width, hand.palm.y * height, size);
		}
	} else {
		textAlign(CENTER, CENTER);
		textSize(24);
		fill(255);
		text("No hands detected", width / 2, height / 2);
	}
}
