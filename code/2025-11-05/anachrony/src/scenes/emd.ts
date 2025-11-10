import p5 from "p5";

import type { Scene } from "../libs/scene-manager";
import * as utils from "../utils/utils";

import emdUrl from "../assets/images/emd.png";

export const createEmdScene = (p: p5): Scene => {
  let emdImg: p5.Image;

  return {
    setup: async () => {
      console.log("EMD scene setup");
      emdImg = await utils.loadImage(p, emdUrl, 1);
    },

    draw: () => {
      p.background(0);

      p.push();
      p.imageMode(p.CENTER);
      p.image(
        emdImg,
        p.width * 0.5,
        p.height * 0.5,
        emdImg.width * 0.25,
        emdImg.height * 0.25
      );
      p.pop();
    },

    cleanup: () => {
      console.log("Menu cleanup");
    },
  };
};
