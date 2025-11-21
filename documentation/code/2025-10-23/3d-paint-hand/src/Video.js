let video = null;

function setupVideo(selfieMode = true) {
  video = createCapture(VIDEO, { flipped: selfieMode });
  video.size(640, 480);
  video.hide();
}

function drawVideo(pixelSize = 1) {
  const transform = getVideoTransform();
  if (!transform) return;

  if (pixelSize <= 1) {
    image(
      video,
      transform.offsetX,
      transform.offsetY,
      transform.drawWidth,
      transform.drawHeight
    );
  } else {
    video.loadPixels();

    const cols = Math.floor(video.width / pixelSize);
    const rows = Math.floor(video.height / pixelSize);

    noStroke();

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const pixelX = x * pixelSize + Math.floor(pixelSize / 2);
        const pixelY = y * pixelSize + Math.floor(pixelSize / 2);
        const index = (pixelX + pixelY * video.width) * 4;

        const r = video.pixels[index];
        const g = video.pixels[index + 1];
        const b = video.pixels[index + 2];

        colorMode(RGB);
        const c = color(r, g, b);
        colorMode(HSL);

        fill(c);

        const screenX = transform.offsetX + x * pixelSize * transform.scaleX;
        const screenY = transform.offsetY + y * pixelSize * transform.scaleY;
        const rectWidth = pixelSize * transform.scaleX;
        const rectHeight = pixelSize * transform.scaleY;

        rect(screenX, screenY, rectWidth, rectHeight);
      }
    }
  }
}

function getVideoTransform() {
  if (!isVideoReady()) return null;

  const videoRatio = video.width / video.height;
  const canvasRatio = width / height;

  let drawWidth,
    drawHeight,
    offsetX = 0,
    offsetY = 0;

  // cover: fill entire canvas (crop if necessary)
  if (videoRatio > canvasRatio) {
    drawHeight = height;
    drawWidth = height * videoRatio;
    offsetX = (width - drawWidth) / 2;
  } else {
    drawWidth = width;
    drawHeight = width / videoRatio;
    offsetY = (height - drawHeight) / 2;
  }

  return {
    drawWidth,
    drawHeight,
    offsetX,
    offsetY,
    scaleX: drawWidth / video.width,
    scaleY: drawHeight / video.height,
  };
}

function isVideoReady() {
  return video && video.loadedmetadata;
}
