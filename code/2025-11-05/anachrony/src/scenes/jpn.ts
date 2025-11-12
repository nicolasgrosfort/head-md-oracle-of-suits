import p5 from "p5";
import type { Scene } from "../libs/scene-manager";
import * as utils from "../utils/utils";

import jpnUrl1 from "../assets/images/jpn-1.png";

export const createEdoJapanScene = (p: p5): Scene => {
  let jpnImg1: p5.Image;

  return {
    setup: async () => {
      console.log("Edo Japan setup");

      jpnImg1 = await utils.loadImage(p, jpnUrl1, 1);
    },

    draw: () => {
      p.push();
      p.imageMode(p.CENTER);
      p.image(
        jpnImg1,
        p.width * 0.5,
        p.height * 0.5,
        jpnImg1.width * 0.25,
        jpnImg1.height * 0.25
      );
      p.pop();
    },

    cleanup: () => {
      console.log("Edo Japan cleanup");
    },
  };
};
