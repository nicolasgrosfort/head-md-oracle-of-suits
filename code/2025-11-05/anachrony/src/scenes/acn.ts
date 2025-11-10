import p5 from "p5";
import type { Scene } from "../libs/scene-manager";
import * as utils from "../utils/utils";

import ancUrl from "../assets/images/acn.png";

export const createAncientChinaScene = (p: p5): Scene => {
  let acnImg: p5.Image;

  return {
    setup: async () => {
      console.log("Ancient China setup");
      acnImg = await utils.loadImage(p, ancUrl, 1);
    },

    draw: () => {
      p.push();
      p.imageMode(p.CENTER);
      p.image(
        acnImg,
        p.width * 0.5,
        p.height * 0.5,
        acnImg.width * 0.25,
        acnImg.height * 0.25
      );
      p.pop();
    },

    cleanup: () => {
      console.log("Ancient China cleanup");
    },
  };
};
