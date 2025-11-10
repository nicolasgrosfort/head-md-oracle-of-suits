import p5 from "p5";
import type { Scene } from "../libs/scene-manager";
import * as utils from "../utils/utils";

import jkrUrl from "../assets/images/jkr.png";

export const createJokerScene = (p: p5): Scene => {
  let jkrImg: p5.Image;

  return {
    setup: async () => {
      console.log("Joker setup");
      jkrImg = await utils.loadImage(p, jkrUrl, 1);
    },

    draw: () => {
      p.push();
      p.imageMode(p.CENTER);
      p.image(
        jkrImg,
        p.width * 0.5,
        p.height * 0.5,
        jkrImg.width * 0.25,
        jkrImg.height * 0.25
      );
      p.pop();
    },

    cleanup: () => {
      console.log("Joker cleanup");
    },
  };
};
