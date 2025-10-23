# Camera Reframe - Interactive Video Censorship

An interactive p5.js sketch that uses hand tracking to create real-time video censorship effects.

## Features

- **Hand Tracking**: Uses MediaPipe Hands to track both hands in real-time
- **Interactive Pixelation**: Creates a censorship effect between your index fingers
- **Film Grain Effect**: Adds authentic film grain for a vintage look
- **Grayscale Video**: Converts video to black and white (adjustable saturation)
- **Cover Mode**: Video fills the screen without stretching

## How to Use

1. Open `index-new.html` in a modern web browser
2. Allow camera access when prompted
3. Hold up both hands in front of the camera
4. Use your index fingers to define the corners of a rectangle
5. The area between your fingers will be pixelated/censored

## Project Structure

```bash
camera-reframe/
├── index-new.html          # Main HTML file
├── sketch-new.js           # Main p5.js sketch
├── HandTracker.js          # Hand detection and tracking
├── VideoProcessor.js       # Video processing and display
├── PixelationEffect.js     # Censorship/pixelation effect
├── FilmGrainEffect.js      # Film grain overlay
├── style.css               # Styles
└── libraries/              # p5.js libraries
```

## Classes

### HandTracker

Manages hand detection using MediaPipe Hands library.

- Tracks up to 2 hands simultaneously
- Provides smooth position interpolation
- Converts normalized coordinates to screen space

### VideoProcessor

Handles video capture and processing.

- Grayscale conversion with adjustable saturation
- Cover mode display (fills screen without stretching)
- Mirrored video for intuitive interaction

### PixelationEffect

Applies pixelation/censorship to rectangular areas.

- Configurable pixel size
- Handles coordinate transformation
- Efficient block-based processing

### FilmGrainEffect

Creates realistic film grain overlay.

- Pre-generated noise patterns for performance
- Animated grain effect
- Adjustable opacity and tile size

## Configuration

Edit the `CONFIG` object in `sketch-new.js`:

```javascript
const CONFIG = {
  video: {
    width: 640,
    height: 480,
  },
  saturation: 0, // 0 = grayscale, 1 = full color
  grain: {
    patternSize: 128,    // Tile size (64, 128, 256)
    sampleSize: 3,       // Number of patterns
    alpha: 0.15,         // Opacity (0.05-0.3)
  },
  pixelation: {
    size: 25,            // Size of pixelation blocks
  },
  hands: {
    maxNumHands: 2,
    smoothing: 0.5,      // 0-1, higher = smoother
  },
};
```

## Browser Requirements

- Modern browser with WebGL support
- Camera access
- Recommended: Chrome, Firefox, Edge (latest versions)

## Dependencies

- [p5.js](https://p5js.org/) - Creative coding library
- [MediaPipe Hands](https://google.github.io/mediapipe/solutions/hands.html) - Hand tracking
- MediaPipe Camera Utils - Camera handling

## License

MIT License - Feel free to use and modify!

## Author

Created for the MD1 Oracle of Suits course, 2025.
