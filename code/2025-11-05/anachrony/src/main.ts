import p5 from "p5";

import * as mediaPipe from "./libs/media-pipe";
import * as sceneManager from "./libs/scene-manager";
import * as config from "./utils/config";

import { createIntroScene } from "./scenes/intro";
import { createMmkScene } from "./scenes/mmk";

new p5((p: p5) => {
  p.setup = async () => {
    p.createCanvas(config.sketch.width, config.sketch.height);
    p.pixelDensity(1);
    p.textFont("Monospace");

    sceneManager.addScene("intro", createIntroScene(p));
    sceneManager.addScene("mmk", createMmkScene(p));

    await mediaPipe.initialize(p);
    await sceneManager.switchTo("intro");
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
    if (p.key === " ") {
      await sceneManager.switchTo("intro");
    } else if (p.key === "m") {
      await sceneManager.switchTo("mmk");
    }
  };
});
