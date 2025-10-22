let video = null;

function setupVideo(selfieMode = true) {
  // create a hidden video element that MediaPipe Camera util will use
  video = createCapture(VIDEO, { flipped: selfieMode });
  video.size(640, 480);
  video.hide();
}

function drawVideo() {
  const transform = getVideoTransform();
  if (!transform) return;

  image(
    video,
    transform.offsetX,
    transform.offsetY,
    transform.drawWidth,
    transform.drawHeight
  );
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

// move the video && video.loadedmetadata checks to here
function isVideoReady() {
  return video && video.loadedmetadata;
}
