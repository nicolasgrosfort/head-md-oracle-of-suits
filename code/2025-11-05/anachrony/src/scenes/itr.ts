import p5 from "p5";

import * as mediaPipe from "../libs/media-pipe";
import * as utils from "../utils/utils";

import type { Scene } from "../libs/scene-manager";

import itrUrl1 from "../assets/images/itr-1.png";
import itrUrl2 from "../assets/images/itr-2.png";
import itrUrl3 from "../assets/images/itr-3.png";
import itrUrl4 from "../assets/images/itr-4.png";
import itrUrl from "../assets/images/itr.png";

export const createIntroScene = (p: p5): Scene => {
  let itrImg: p5.Image;
  let itrImg1: p5.Image;
  let itrImg2: p5.Image;
  let itrImg3: p5.Image;
  let itrImg4: p5.Image;
  let currentImg: p5.Image;

  let buttonPosition = 0;
  let lastAngle = 0;

  return {
    setup: async () => {
      console.log("Intro setup");

      itrImg = await utils.loadImage(p, itrUrl, 1);
      itrImg1 = await utils.loadImage(p, itrUrl1, 1);
      itrImg2 = await utils.loadImage(p, itrUrl2, 1);
      itrImg3 = await utils.loadImage(p, itrUrl3, 1);
      itrImg4 = await utils.loadImage(p, itrUrl4, 1);

      currentImg = itrImg;
    },

    draw: () => {
      p.push();

      switch (buttonPosition) {
        case 0:
          currentImg = itrImg1;
          break;
        case 1:
          currentImg = itrImg2;
          break;
        case 2:
          currentImg = itrImg3;
          break;
        case 3:
          currentImg = itrImg4;
          break;
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
        const circleX = 1022;
        const circleY = 1055;
        const circleRadius = 150;

        const handX = hand.x * p.width;
        const handY = hand.y * p.height;

        const isOnButton = utils.isInsideCircle(
          handX,
          handY,
          circleX,
          circleY,
          circleRadius
        );

        if (isOnButton) {
          const baseAngle = hand.angle - lastAngle;
          const stepButton = baseAngle / 30;

          buttonPosition = Math.max(0, Math.min(4, stepButton));

          p.fill(255, 80);
          p.stroke(0);
          p.circle(circleX, circleY, circleRadius * 2);
        } else {
          lastAngle = hand.angle;

          p.fill("black");
          p.circle(hand.x * p.width, hand.y * p.height, 20);
        }
      });
    },

    cleanup: () => {
      console.log("Intro cleanup");
    },
  };
};
