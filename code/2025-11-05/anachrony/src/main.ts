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

let displayCamera = false;
let displayHand = false;
let displayFace = false;
let displayPose = false;

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
      videoCrop: {
        x: 0.25,
        y: 0.25,
        width: 0.5,
        height: 0.5,
      },
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

    mediaPipe.detect();

    sceneManager.draw();

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

    mediaPipe.drawVideo(p, { hide: !displayCamera, opacity: 0.4 });
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
      case "C": {
        displayCamera = !displayCamera;
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
