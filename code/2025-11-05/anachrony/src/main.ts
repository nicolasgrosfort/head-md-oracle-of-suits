import p5 from "p5";

import * as audio from "./libs/audio";
import * as cardodex from "./libs/cardodex";
import * as mediaPipe from "./libs/media-pipe";
import * as sceneManager from "./libs/scene-manager";
import * as config from "./utils/config";

import { createAncientChinaScene } from "./scenes/acn";
import { createEmdScene } from "./scenes/emd";
import { createIntroScene } from "./scenes/itr";
import { createJokerScene } from "./scenes/jkr";
import { createEdoJapanScene } from "./scenes/jpn";
import { createMmkScene } from "./scenes/mmk";
import { createStandbyScene } from "./scenes/sby";

let displayVideo = false;
let displayHand = false;
let displayFace = false;
let displayPose = false;

const FRAME_TO_SWITCH_OFF = 1000;
let frameWithoutHand = 0;

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
    sceneManager.addScene("sby", createStandbyScene(p));
    sceneManager.addScene("jpn", createEdoJapanScene(p));

    await cardodex.initialize(p);
    await mediaPipe.initialize(p, {
      enableGestures: true,
      enableFace: true,
      enablePose: true,
    });

    await sceneManager.switchTo("sby");
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

    mediaPipe.drawVideo(p, {
      hide: !displayVideo,
      opacity: 0.5,
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

    if (!mediaPipe.anyHand()) frameWithoutHand++;
    else frameWithoutHand = 0;

    if (frameWithoutHand >= FRAME_TO_SWITCH_OFF) {
      sceneManager.switchTo("sby");
    }
  };

  p.mousePressed = async () => {
    audio.toggle();
  };

  p.keyPressed = async () => {
    switch (p.key) {
      case "s": {
        await sceneManager.switchTo("sby");
        break;
      }
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
        await sceneManager.switchTo("jpn");
        break;
      }
      case "f": {
        await sceneManager.switchTo("jkr");
        break;
      }

      // Debugging
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
