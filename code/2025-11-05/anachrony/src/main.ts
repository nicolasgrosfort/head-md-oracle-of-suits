import p5 from "p5";

import * as mediaPipe from "./libs/media-pipe";
import * as sceneManager from "./libs/scene-manager";
import * as config from "./utils/config";

import { createEmdScene } from "./scenes/emd";
import { createIntroScene } from "./scenes/itr";
import { createMmkScene } from "./scenes/mmk";

new p5((p: p5) => {
  p.setup = async () => {
    p.createCanvas(config.sketch.width, config.sketch.height);
    p.pixelDensity(1);
    p.textFont("Monospace");

    sceneManager.addScene("itr", createIntroScene(p));
    sceneManager.addScene("mmk", createMmkScene(p));
    sceneManager.addScene("emd", createEmdScene(p));

    await mediaPipe.initialize(p);
    await sceneManager.switchTo("itr");
  };

  p.draw = () => {
    if (!sceneManager.sceneIsReady()) {
      p.background(0);
      p.fill(255);
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(32);
      p.text("Loading...", p.width / 2, p.height / 2);
      return;
    }

    mediaPipe.detect();
    sceneManager.draw();
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
    }
  };
});
