import p5 from "p5";
import type { Scene } from "../libs/scene-manager";
import * as utils from "../utils/utils";

import itrUrl2 from "../assets/images/itr-2.png";
import itrUrl from "../assets/images/itr.png";

export const createIntroScene = (p: p5): Scene => {
  let itrImg: p5.Image;
  let itrImg2: p5.Image;
  let currentImg: p5.Image;

  return {
    setup: async () => {
      console.log("Intro setup");
      itrImg = await utils.loadImage(p, itrUrl, 1);
      itrImg2 = await utils.loadImage(p, itrUrl2, 1);

      currentImg = itrImg;
    },

    draw: () => {
      p.push();

      if (p.key === "2") {
        currentImg = itrImg2;
      } else if (p.key === "1") {
        currentImg = itrImg;
      }

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
      console.log("Intro cleanup");
    },
  };
};
