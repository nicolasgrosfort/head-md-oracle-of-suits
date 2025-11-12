import p5 from "p5";

import * as audio from "./libs/audio";
import * as mediaPipe from "./libs/media-pipe";
import * as sceneManager from "./libs/scene-manager";
import * as config from "./utils/config";

import { createAncientChinaScene } from "./scenes/acn";
import { createEmdScene } from "./scenes/emd";
import { createIntroScene } from "./scenes/itr";
import { createJokerScene } from "./scenes/jkr";
import { createMmkScene } from "./scenes/mmk";

let displayVideo = false;
let displayHand = false;
let displayFace = false;
let displayPose = false;
let displayCroppedZone = false;
let videoSourceMode: mediaPipe.VideoSourceMode = "full";

const drawCroppedZone = (p: p5) => {
  if (!displayCroppedZone) return;

  const crop = config.video.crop;
  p.push();
  p.noFill();
  p.stroke(0, 255, 0);
  p.strokeWeight(2);
  p.rect(crop.x, crop.y, crop.width, crop.height);
  p.pop();
};

new p5((p: p5) => {
  p.setup = async () => {
    p.createCanvas(config.sketch.width, config.sketch.height);
    p.frameRate(config.video.frameRate);
    p.textFont("Monospace");
    p.pixelDensity(1);

    audio.load();

    sceneManager.addScene("itr", createIntroScene(p));
    sceneManager.addScene("mmk", createMmkScene(p));
    sceneManager.addScene("emd", createEmdScene(p));
    sceneManager.addScene("acn", createAncientChinaScene(p));
    sceneManager.addScene("jkr", createJokerScene(p));

    await mediaPipe.initialize(p, {
      enableGestures: true,
      enableFace: true,
      enablePose: false,
    });
    await sceneManager.switchTo("itr");
  };

  p.draw = () => {
    if (!sceneManager.sceneIsReady() || !audio.isSongLoaded) {
      p.background(0);
      p.fill(255);
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(32);
      p.text("Loading...", p.width / 2, p.height / 2);
      return;
    }

    mediaPipe.detect({
      videoCrop: {
        x: config.video.crop.x,
        y: config.video.crop.y,
        width: config.video.crop.width,
        height: config.video.crop.height,
      },
    });

    sceneManager.draw();

    mediaPipe.drawVideo(p, {
      hide: !displayVideo,
      opacity: 0.8,
      source: videoSourceMode,
    });

    mediaPipe.drawFace(p, {
      hide: !displayFace,
      drawEyes: true,
      drawNose: true,
      drawMouth: true,
      drawOutline: true,
    });

    mediaPipe.drawHands(p, {
      hide: !displayHand,
      drawLandmarks: true,
      drawConnections: true,
    });

    mediaPipe.drawBody(p, {
      hide: !displayPose,
      drawLandmarks: true,
      drawConnections: true,
    });

    drawCroppedZone(p);
  };

  p.mousePressed = async () => {
    audio.toggle();
  };

  p.keyPressed = async () => {
    switch (p.key) {
      case "i": {
        await sceneManager.switchTo("itr");
        break;
      }
      case "e": {
        await sceneManager.switchTo("emd");
        break;
      }
      case "m": {
        await sceneManager.switchTo("mmk");
        break;
      }
      case "a": {
        await sceneManager.switchTo("acn");
        break;
      }
      case "j": {
        await sceneManager.switchTo("jkr");
        break;
      }

      // Debugging
      case "Z": {
        displayCroppedZone = !displayCroppedZone;
        break;
      }
      case "C": {
        videoSourceMode = videoSourceMode === "full" ? "crop" : "full";
        break;
      }
      case "V": {
        displayVideo = !displayVideo;
        break;
      }
      case "H": {
        displayHand = !displayHand;
        break;
      }
      case "F": {
        displayFace = !displayFace;
        break;
      }
      case "P": {
        displayPose = !displayPose;
        break;
      }
    }
  };
});
