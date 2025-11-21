import p5 from "p5";
import type { Scene } from "../libs/scene-manager";
import * as utils from "../utils/utils";

import ancUrl1 from "../assets/images/acn-1.png";
import ancUrl2 from "../assets/images/acn-2.png";

export const createAncientChinaScene = (p: p5): Scene => {
  let acnImg1: p5.Image;
  let acnImg2: p5.Image;
  let currentImg: p5.Image;

  return {
    setup: async () => {
      console.log("Ancient China setup");

      acnImg1 = await utils.loadImage(p, ancUrl1, 1);
      acnImg2 = await utils.loadImage(p, ancUrl2, 1);
      currentImg = acnImg1;
    },

    draw: () => {
      if (p.key === "1") {
        currentImg = acnImg1;
      } else if (p.key === "2") {
        currentImg = acnImg2;
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
      console.log("Ancient China cleanup");
    },
  };
};
