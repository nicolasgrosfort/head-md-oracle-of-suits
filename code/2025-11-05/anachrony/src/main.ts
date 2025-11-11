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

new p5((p: p5) => {
  p.setup = async () => {
    p.createCanvas(config.sketch.width, config.sketch.height);
    p.textFont("Monospace");
    p.pixelDensity(1);

    sceneManager.addScene("itr", createIntroScene(p));
    sceneManager.addScene("mmk", createMmkScene(p));
    sceneManager.addScene("emd", createEmdScene(p));
    sceneManager.addScene("acn", createAncientChinaScene(p));
    sceneManager.addScene("jkr", createJokerScene(p));

    audio.load();

    await mediaPipe.initialize(p);
    await sceneManager.switchTo("itr");
  };

  p.draw = () => {
    p.frameRate(60);

    mediaPipe.detect();

    if (!sceneManager.sceneIsReady() || !audio.isSongLoaded) {
      p.background(0);
      p.fill(255);
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(32);
      p.text("Loading...", p.width / 2, p.height / 2);
      return;
    }

    sceneManager.draw();
    mediaPipe.drawVideo(p, { hide: true, opacity: 0.2 });
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
    }
  };
});
