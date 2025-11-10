import p5 from "p5";

import * as mediaPipe from "../libs/media-pipe";
import * as utils from "../utils/utils";

import type { Scene } from "../libs/scene-manager";

import itrUrl1 from "../assets/images/itr-1.png";
import itrUrl2 from "../assets/images/itr-2.png";
import itrUrl3 from "../assets/images/itr-3.png";
import itrUrl4 from "../assets/images/itr-4.png";
import itrUrl from "../assets/images/itr.png";

const NOTCH = 0.05;

export const createIntroScene = (p: p5): Scene => {
  let itrImg: p5.Image;
  let itrImg1: p5.Image;
  let itrImg2: p5.Image;
  let itrImg3: p5.Image;
  let itrImg4: p5.Image;
  let currentImg: p5.Image;

  let buttonPosition = 0;
  let lastNotchAngle: number | null = 0;

  const handleRotateButton = (
    angle: number,
    buttonPosition: number,
    lastNotchAngle: number | null,
    min: number,
    max: number
  ) => {
    if (lastNotchAngle === null) {
      return { buttonPosition, lastNotchAngle: angle };
    }

    console.log(lastNotchAngle, angle);

    const currentAngle = angle;
    const angleDiff = currentAngle - lastNotchAngle;
    let correctedDiff = angleDiff;
    if (Math.abs(angleDiff) > 0.5) {
      if (angleDiff > 0) {
        correctedDiff = angleDiff - 1;
      } else {
        correctedDiff = angleDiff + 1;
      }
    }

    if (Math.abs(correctedDiff) >= NOTCH) {
      const direction = correctedDiff > 0 ? 1 : -1;

      buttonPosition += direction;
      lastNotchAngle += direction * NOTCH;

      while (lastNotchAngle > 1) lastNotchAngle -= 1;
      while (lastNotchAngle < 0) lastNotchAngle += 1;
    }

    if (buttonPosition < min) {
      buttonPosition = min;
      lastNotchAngle = angle;
    }
    if (buttonPosition > max) {
      buttonPosition = max;
      lastNotchAngle = angle;
    }

    return { buttonPosition, lastNotchAngle };
  };

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
          currentImg = itrImg;
          break;
        case 1:
          currentImg = itrImg1;
          break;
        case 2:
          currentImg = itrImg2;
          break;
        case 3:
          currentImg = itrImg3;
          break;
        case 4:
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
        const circleX = 928;
        const circleY = 995;
        const circleRadius = 150;

        const handX = hand.x * p.width;
        const handY = hand.y * p.height;
        const distance = Math.sqrt(
          Math.pow(handX - circleX, 2) + Math.pow(handY - circleY, 2)
        );

        if (distance < circleRadius) {
          const buttonRotation = handleRotateButton(
            hand.angle,
            buttonPosition,
            lastNotchAngle,
            0,
            4
          );

          buttonPosition = buttonRotation.buttonPosition;
          lastNotchAngle = buttonRotation.lastNotchAngle;

          console.log("Button position:", buttonPosition);
          p.fill("green");
        } else {
          p.fill("red");
          lastNotchAngle = null;
        }

        p.circle(hand.x * p.width, hand.y * p.height, hand.z * 100 + 20);
      });
    },

    cleanup: () => {
      console.log("Intro cleanup");
    },
  };
};
