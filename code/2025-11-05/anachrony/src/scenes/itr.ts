import p5 from "p5";
import type { Scene } from "../libs/scene-manager";
import * as utils from "../utils/utils";

import itrUrl from "../assets/images/itr.png";

export const createIntroScene = (p: p5): Scene => {
  let itrImg: p5.Image;

  return {
    setup: async () => {
      console.log("Intro setup");
      itrImg = await utils.loadImage(p, itrUrl, 1);
    },

    draw: () => {
      p.push();
      p.imageMode(p.CENTER);
      p.image(
        itrImg,
        p.width * 0.5,
        p.height * 0.5,
        itrImg.width * 0.25,
        itrImg.height * 0.25
      );
      p.pop();
    },

    cleanup: () => {
      console.log("Intro cleanup");
    },
  };
};
