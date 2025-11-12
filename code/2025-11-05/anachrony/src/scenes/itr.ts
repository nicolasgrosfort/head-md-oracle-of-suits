import p5 from "p5";

import * as audio from "../libs/audio";
import * as mediaPipe from "../libs/media-pipe";
import * as sceneManager from "../libs/scene-manager";
import * as config from "../utils/config";
import * as utils from "../utils/utils";

import itrUrl1 from "../assets/images/itr-1.png";
import itrUrl2 from "../assets/images/itr-2.png";
import itrUrl3 from "../assets/images/itr-3.png";
import itrUrl4 from "../assets/images/itr-4.png";
import itrUrl from "../assets/images/itr.png";

import loader0Url from "../assets/images/loader-0.png";
import loader1Url from "../assets/images/loader-1.png";
import loader2Url from "../assets/images/loader-2.png";
import loader3Url from "../assets/images/loader-3.png";
import loader4Url from "../assets/images/loader-4.png";

import btn1Url from "../assets/images/btn-1.png";
import btn2Url from "../assets/images/btn-2.png";
import btn3Url from "../assets/images/btn-3.png";
import btn4Url from "../assets/images/btn-4.png";

import planetMmkUrl from "../assets/images/planet-mmk.png";

import baseButtonUrl from "../assets/images/base-button.png";

export const createIntroScene = (p: p5): sceneManager.Scene => {
  let itrImg: p5.Image;
  let itrImg1: p5.Image;
  let itrImg2: p5.Image;
  let itrImg3: p5.Image;
  let itrImg4: p5.Image;
  let currentImg: p5.Image;

  let loaderImgs: p5.Image[] = [];
  let currentLoader = 0;

  let btnImgs: p5.Image[] = [];
  let currentBtn = 0;

  let baseButtonImg: p5.Image;

  let planetMmkImg: p5.Image;

  let buttonPosition = 0;
  let isOnButton = false;
  let lastAngle: number | null = null;
  let frameDuringButton = 0;

  // const MIN_ZONE_RADIUS = 50;
  const MAX_ZONE_RADIUS = 200;
  const ORIGINAL_CIRCLE_X = 1022;
  const ORIGINAL_CIRCLE_Y = 1055;
  const MAX_SCALE = 1.1;

  let scale = 1;
  let circleX = 1022;
  let circleY = 1055;
  let wasOnButton = false;

  return {
    setup: async () => {
      console.log("Intro setup");

      itrImg = await utils.loadImage(p, itrUrl, 1);
      itrImg1 = await utils.loadImage(p, itrUrl1, 1);
      itrImg2 = await utils.loadImage(p, itrUrl2, 1);
      itrImg3 = await utils.loadImage(p, itrUrl3, 1);
      itrImg4 = await utils.loadImage(p, itrUrl4, 1);
      currentImg = itrImg;

      loaderImgs = [];
      loaderImgs.push(await utils.loadImage(p, loader0Url, 1));
      loaderImgs.push(await utils.loadImage(p, loader1Url, 1));
      loaderImgs.push(await utils.loadImage(p, loader2Url, 1));
      loaderImgs.push(await utils.loadImage(p, loader3Url, 1));
      loaderImgs.push(await utils.loadImage(p, loader4Url, 1));
      currentLoader = 0;

      btnImgs = [];
      btnImgs.push(await utils.loadImage(p, btn1Url, 1));
      btnImgs.push(await utils.loadImage(p, btn2Url, 1));
      btnImgs.push(await utils.loadImage(p, btn3Url, 1));
      btnImgs.push(await utils.loadImage(p, btn4Url, 1));
      currentBtn = 0;

      baseButtonImg = await utils.loadImage(p, baseButtonUrl, 1);

      planetMmkImg = await utils.loadImage(p, planetMmkUrl, 1);
    },

    draw: () => {
      // p.translate(p.width / 2, p.height / 2);
      // p.scale(scale);
      // p.translate(-p.width / 2, -p.height / 2);

      p.push();

      switch (buttonPosition) {
        case 0:
          currentImg = itrImg1;
          currentBtn = 0;
          break;
        case 1:
          currentImg = itrImg2;
          currentBtn = 1;
          break;
        case 2:
          currentImg = itrImg3;
          currentBtn = 2;
          break;
        case 3:
          currentImg = itrImg4;
          currentBtn = 3;
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

      utils.image(
        p,
        loaderImgs[currentLoader + (isOnButton ? 1 : 0)],
        623,
        815
      );

      utils.image(
        p,
        loaderImgs[currentLoader + (isOnButton ? 1 : 0)],
        1303,
        815,
        { flipX: true }
      );

      p.push();
      p.translate(
        832 + (planetMmkImg.width / 2) * 0.25,
        166 + (planetMmkImg.height / 2) * 0.25
      );
      p.scale(scale);
      p.translate(
        (-planetMmkImg.width / 2) * 0.25,
        (-planetMmkImg.height / 2) * 0.25
      );
      utils.image(p, planetMmkImg, 0, 0);
      p.pop();

      // DEBUG: Dessiner les zones de détection
      // p.push();
      // p.noFill();
      // p.strokeWeight(3);

      // // Zone originale en vert
      // p.stroke(0, 255, 0, 200);
      // p.circle(ORIGINAL_CIRCLE_X, ORIGINAL_CIRCLE_Y, MAX_ZONE_RADIUS * 2);

      // // Zone actuelle en rouge (déplacée avec la main)
      // p.stroke(255, 0, 0, 200);
      // p.circle(circleX, circleY, MAX_ZONE_RADIUS * 2);

      // // Ligne entre les deux centres si différents
      // if (circleX !== ORIGINAL_CIRCLE_X || circleY !== ORIGINAL_CIRCLE_Y) {
      //   p.stroke(255, 255, 0, 200);
      //   p.strokeWeight(2);
      //   p.line(ORIGINAL_CIRCLE_X, ORIGINAL_CIRCLE_Y, circleX, circleY);
      // }

      // // Crosshair au centre de la zone actuelle
      // p.stroke(255, 0, 0);
      // p.strokeWeight(2);
      // p.line(circleX - 15, circleY, circleX + 15, circleY);
      // p.line(circleX, circleY - 15, circleX, circleY + 15);

      // // Crosshair au centre de la zone originale
      // p.stroke(0, 255, 0);
      // p.line(
      //   ORIGINAL_CIRCLE_X - 15,
      //   ORIGINAL_CIRCLE_Y,
      //   ORIGINAL_CIRCLE_X + 15,
      //   ORIGINAL_CIRCLE_Y
      // );
      // p.line(
      //   ORIGINAL_CIRCLE_X,
      //   ORIGINAL_CIRCLE_Y - 15,
      //   ORIGINAL_CIRCLE_X,
      //   ORIGINAL_CIRCLE_Y + 15
      // );

      // p.pop();

      // END DEBUG

      mediaPipe.onHandMove((hand) => {
        const handX = hand.x * p.width;
        const handY = hand.y * p.height;

        isOnButton = utils.isInsideCircle(
          handX,
          handY,
          circleX,
          circleY,
          MAX_ZONE_RADIUS
        );

        if (isOnButton) {
          if (!wasOnButton) {
            circleX = handX;
            circleY = handY;
            audio.loader.start();
            lastAngle = hand.angle;
            wasOnButton = true;
          }

          if (lastAngle === null) {
            audio.loader.start();
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
                audio.loader.start();
                buttonPosition++;
                frameDuringButton = 0;
              }
            } else if (stepDiff < 0) {
              if (buttonPosition > 0) {
                audio.clac.start();
                audio.loader.start();
                buttonPosition--;
                frameDuringButton = 0;
              }
            }

            lastAngle = hand.angle;
          }

          frameDuringButton += 1;

          utils.image(p, baseButtonImg, 888, 966);

          const zoneRadius = p.map(
            frameDuringButton,
            config.frame.toTravel,
            0,
            50,
            MAX_ZONE_RADIUS
          );

          scale = p.map(
            frameDuringButton,
            0,
            config.frame.toTravel,
            1,
            MAX_SCALE
          );

          const loaderSetp = p.map(
            frameDuringButton,
            0,
            config.frame.toTravel,
            0,
            loaderImgs.length - 1
          );

          currentLoader = Math.min(
            loaderImgs.length - 1,
            Math.floor(loaderSetp)
          );

          if (frameDuringButton >= config.frame.toTravel) {
            frameDuringButton = 0;

            audio.loader.stop();
            audio.portal.start();

            switch (buttonPosition) {
              case 0:
                sceneManager.switchTo("mmk");
                break;
              case 1:
                sceneManager.switchTo("emd");

                break;
              case 2:
                sceneManager.switchTo("acn");

                break;
              case 3:
                sceneManager.switchTo("jkr");

                break;
            }
          }

          p.fill(255, 80);
          p.stroke(0);
          p.circle(ORIGINAL_CIRCLE_X, ORIGINAL_CIRCLE_Y, zoneRadius * 2);
        } else {
          if (wasOnButton) {
            circleX = ORIGINAL_CIRCLE_X;
            circleY = ORIGINAL_CIRCLE_Y;
            wasOnButton = false;
          }

          lastAngle = null;
          frameDuringButton = 0;
          currentLoader = 0;
          scale = 1;

          audio.loader.stop();

          p.fill("black");
          p.circle(hand.x * p.width, hand.y * p.height, 20);
        }
      });

      utils.image(p, btnImgs[currentBtn], 926, 991);
    },

    cleanup: () => {
      console.log("Intro cleanup");
    },
  };
};
