import p5 from "p5";

import * as audio from "../libs/audio";
import * as mediaPipe from "../libs/media-pipe";
import * as sceneManager from "../libs/scene-manager";
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
  let lastAngle: number | null = null;
  let frameDuringButton = 0;

  const MAX_FRAME_DURING_BUTTON = 100;
  const MAX_ZONE_RADIUS = 200;
  const MIN_ZONE_RADIUS = 50;

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

        const handX = hand.x * p.width;
        const handY = hand.y * p.height;

        const isOnButton = utils.isInsideCircle(
          handX,
          handY,
          circleX,
          circleY,
          MAX_ZONE_RADIUS
        );

        if (isOnButton) {
          if (lastAngle === null) {
            lastAngle = hand.angle;
          }

          const currentStep = Math.round(hand.angle / 30) * 30;
          const lastStep =
            lastAngle !== null ? Math.round(lastAngle / 30) * 30 : currentStep;

          if (currentStep !== lastStep) {
            const stepDiff = (currentStep - lastStep) / 30;

            if (stepDiff > 0) {
              if (buttonPosition < 3) {
                audio.clac.start();
                buttonPosition++;
                frameDuringButton = 0;
              }
            } else if (stepDiff < 0) {
              if (buttonPosition > 0) {
                audio.clac.start();
                buttonPosition--;
                frameDuringButton = 0;
              }
            }

            lastAngle = hand.angle;
          }

          frameDuringButton += 1;
          const zoneRadius = p.map(
            frameDuringButton,
            MAX_FRAME_DURING_BUTTON,
            0,
            MIN_ZONE_RADIUS,
            MAX_ZONE_RADIUS
          );

          if (frameDuringButton >= MAX_FRAME_DURING_BUTTON) {
            frameDuringButton = 0;
            switch (buttonPosition) {
              case 0:
                sceneManager.switchTo("mmk");
                audio.portal.start();
                break;
              case 1:
                sceneManager.switchTo("emd");
                audio.portal.start();
                break;
              case 2:
                sceneManager.switchTo("acn");
                audio.portal.start();
                break;
              case 3:
                sceneManager.switchTo("jkr");
                audio.portal.start();
                break;
            }
          }

          p.fill(255, 80);
          p.stroke(0);
          p.circle(circleX, circleY, zoneRadius * 2);
        } else {
          lastAngle = null;
          frameDuringButton = 0;

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
