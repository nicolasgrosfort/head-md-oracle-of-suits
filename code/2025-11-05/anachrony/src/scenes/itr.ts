import p5 from "p5";

import * as mediaPipe from "../libs/media-pipe";
import * as utils from "../utils/utils";

import type { Scene } from "../libs/scene-manager";

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

      mediaPipe.onHandMove((hand) => {
        p.fill(255, 0, 0);
        p.circle(hand.x * p.width, hand.y * p.height, hand.z * 500 + 20);
      });
    },

    cleanup: () => {
      console.log("Intro cleanup");
    },
  };
};
