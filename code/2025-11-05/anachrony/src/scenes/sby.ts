import p5 from "p5";
import type { Scene } from "../libs/scene-manager";
import * as utils from "../utils/utils";

import sbyUrl1 from "../assets/images/sby-1.png";

export const createStandbyScene = (p: p5): Scene => {
  let sbyImg1: p5.Image;

  return {
    setup: async () => {
      console.log("Standby setup");
      sbyImg1 = await utils.loadImage(p, sbyUrl1, 1);
    },

    draw: () => {
      p.push();
      p.imageMode(p.CENTER);
      p.image(
        sbyImg1,
        p.width * 0.5,
        p.height * 0.5,
        sbyImg1.width * 0.25,
        sbyImg1.height * 0.25
      );
      p.pop();
    },

    cleanup: () => {
      console.log("Standby cleanup");
    },
  };
};
