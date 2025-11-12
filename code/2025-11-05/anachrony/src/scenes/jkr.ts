import p5 from "p5";
import type { Scene } from "../libs/scene-manager";
import * as utils from "../utils/utils";

import jkrUrl1 from "../assets/images/jkr-1.png";
import jkrUrl2 from "../assets/images/jkr-2.png";

export const createJokerScene = (p: p5): Scene => {
  let jkrImg1: p5.Image;
  let jkrImg2: p5.Image;
  let currentImg: p5.Image;

  return {
    setup: async () => {
      console.log("Joker setup");
      jkrImg1 = await utils.loadImage(p, jkrUrl1, 1);
      jkrImg2 = await utils.loadImage(p, jkrUrl2, 1);
      currentImg = jkrImg1;
    },

    draw: () => {
      if (p.key === "1") {
        currentImg = jkrImg1;
      } else if (p.key === "2") {
        currentImg = jkrImg2;
      }

      p.push();
      p.imageMode(p.CENTER);
      p.image(
        currentImg,
        p.width * 0.5,
        p.height * 0.5,
        currentImg.width * 0.25,
        currentImg.height * 0.25
      );
      p.pop();
    },

    cleanup: () => {
      console.log("Joker cleanup");
    },
  };
};
