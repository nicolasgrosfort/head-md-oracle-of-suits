import p5 from "p5";

import type { Scene } from "../libs/scene-manager";
import * as utils from "../utils/utils";

import emdUrl1 from "../assets/images/emd-1.png";
import emdUrl from "../assets/images/emd.png";

export const createEmdScene = (p: p5): Scene => {
  let emdImg: p5.Image;
  let emdImg1: p5.Image;
  let currentImg: p5.Image;

  return {
    setup: async () => {
      console.log("EMD scene setup");

      emdImg = await utils.loadImage(p, emdUrl, 1);
      emdImg1 = await utils.loadImage(p, emdUrl1, 1);

      currentImg = emdImg;
    },

    draw: () => {
      if (p.key === "1") {
        currentImg = emdImg1;
      } else if (p.key === "0") {
        currentImg = emdImg;
      }

      p.push();
      p.imageMode(p.CENTER);
      p.image(
        currentImg,
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
