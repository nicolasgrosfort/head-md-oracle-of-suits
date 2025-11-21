import p5 from "p5";

import type { Scene } from "../libs/scene-manager";
import * as utils from "../utils/utils";

import emdUrl1 from "../assets/images/emd-1.png";
import emdUrl2 from "../assets/images/emd-2.png";

export const createEmdScene = (p: p5): Scene => {
  let emdImg1: p5.Image;
  let emdImg2: p5.Image;
  let currentImg: p5.Image;

  return {
    setup: async () => {
      console.log("EMD scene setup");

      emdImg1 = await utils.loadImage(p, emdUrl1, 1);
      emdImg2 = await utils.loadImage(p, emdUrl2, 1);

      currentImg = emdImg1;
    },

    draw: () => {
      if (p.key === "1") {
        currentImg = emdImg1;
      } else if (p.key === "2") {
        currentImg = emdImg2;
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
      console.log("Menu cleanup");
    },
  };
};
