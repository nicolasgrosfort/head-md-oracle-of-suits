import p5 from "p5";

import * as audio from "../libs/audio";
import * as interactionZone from "../libs/interaction-zone";
import * as magnifier from "../libs/magnifier";
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

import planetAcnUrl from "../assets/images/planet-acn.png";
import planetEmdUrl from "../assets/images/planet-emd.png";
import planetJpnUrl from "../assets/images/planet-jpn.png";
import planetMmkUrl from "../assets/images/planet-mmk.png";

import card1Url from "../assets/images/card-1.png";
import card5Url from "../assets/images/card-5.png";

import card1VisibleUrl from "../assets/images/card-1-visible.png";
import card5VisibleUrl from "../assets/images/card-5-visible.png";

import baseButtonUrl from "../assets/images/base-button.png";

export const createIntroScene = (p: p5): sceneManager.Scene => {
  let itrImg: p5.Image;
  let itrImg1: p5.Image;
  let itrImg2: p5.Image;
  let itrImg3: p5.Image;
  let itrImg4: p5.Image;
  let currentImg: p5.Image;

  let card1Img: p5.Image;
  let card5Img: p5.Image;

  let card1VisibleImg: p5.Image;
  let card5VisibleImg: p5.Image;

  const card1X = 611;
  const card5X = 1232;

  const card1Y = 1144;
  const card5Y = 911;

  let loaderImgs: p5.Image[] = [];
  let currentLoader = 0;

  let btnImgs: p5.Image[] = [];
  let currentBtn = 0;

  let baseButtonImg: p5.Image;

  let planetImgs: p5.Image[] = [];
  let currentPlanet = 0;

  let buttonPosition = 0;
  let isOnButton = false;
  let lastAngle: number | null = null;

  const MIN_ZONE_RADIUS = 50;
  const MAX_ZONE_RADIUS = 200;
  const ORIGINAL_CIRCLE_X = 1022;
  const ORIGINAL_CIRCLE_Y = 1055;
  const MAX_PLANET_SCALE = 1.1;

  let scale = 1;

  const drawScene = (pg: p5 | p5.Graphics, isMagnifier?: boolean) => {
    pg.push();

    pg.background(0);

    switch (buttonPosition) {
      case 0:
        currentImg = itrImg1;
        currentBtn = 0;
        currentPlanet = 0;
        break;
      case 1:
        currentImg = itrImg2;
        currentBtn = 1;
        currentPlanet = 1;
        break;
      case 2:
        currentImg = itrImg3;
        currentBtn = 2;
        currentPlanet = 2;
        break;
      case 3:
        currentImg = itrImg4;
        currentBtn = 3;
        currentPlanet = 3;
        break;
    }

    utils.image(pg, currentImg, 0, 0);

    if (isMagnifier) {
      utils.image(pg, card1VisibleImg, card1X, card1Y);
      utils.image(pg, card5VisibleImg, card5X, card5Y);
    } else {
      utils.image(pg, card1Img, card1X, card1Y);
      utils.image(pg, card5Img, card5X, card5Y);
    }

    utils.image(pg, loaderImgs[currentLoader + (isOnButton ? 1 : 0)], 623, 815);

    utils.image(
      pg,
      loaderImgs[currentLoader + (isOnButton ? 1 : 0)],
      1303,
      815,
      { flipX: true }
    );

    pg.push();
    pg.translate(
      832 + (planetImgs[currentPlanet].width / 2) * 0.25,
      166 + (planetImgs[currentPlanet].height / 2) * 0.25
    );
    pg.scale(scale);
    pg.translate(
      (-planetImgs[currentPlanet].width / 2) * 0.25,
      (-planetImgs[currentPlanet].height / 2) * 0.25
    );
    utils.image(pg, planetImgs[currentPlanet], 0, 0);
    pg.pop();

    utils.image(pg, baseButtonImg, 889, 967);
    utils.image(pg, btnImgs[currentBtn], 926, 991);

    pg.pop();
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

      card1Img = await utils.loadImage(p, card1Url, 1);
      card5Img = await utils.loadImage(p, card5Url, 1);

      card1VisibleImg = await utils.loadImage(p, card1VisibleUrl, 1);
      card5VisibleImg = await utils.loadImage(p, card5VisibleUrl, 1);

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

      planetImgs = [];
      planetImgs.push(await utils.loadImage(p, planetMmkUrl, 1));
      planetImgs.push(await utils.loadImage(p, planetAcnUrl, 1));
      planetImgs.push(await utils.loadImage(p, planetEmdUrl, 1));
      planetImgs.push(await utils.loadImage(p, planetJpnUrl, 1));
      currentPlanet = 0;

      baseButtonImg = await utils.loadImage(p, baseButtonUrl, 1);

      // Créer la zone d'interaction pour le bouton
      interactionZone.create("button", {
        x: ORIGINAL_CIRCLE_X,
        y: ORIGINAL_CIRCLE_Y,
        width: 0, // Le cercle sera centré sur x,y
        height: 0,
        minRadius: MIN_ZONE_RADIUS,
        maxRadius: MAX_ZONE_RADIUS,
        requiredFrames: config.frame.toTravel,
        onProgress: (progress) => {
          scale = p.map(progress, 0, 1, 1, MAX_PLANET_SCALE);
          currentLoader = Math.min(
            loaderImgs.length - 1,
            Math.floor(progress * (loaderImgs.length - 1))
          );
        },
        onComplete: () => {
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
        },
        onExit: () => {
          scale = 1;
          currentLoader = 0;
        },
      });

      magnifier.create(p, "itr", {
        zoomFactor: 2,
        size: 250,
        strokeWeight: 3,
        strokeColor: [255, 255, 255],
      });
    },

    draw: () => {
      drawScene(p, false);

      const magnifierGraphics = magnifier.getGraphics("itr");
      if (magnifierGraphics) {
        drawScene(magnifierGraphics, true);
      }

      mediaPipe.onHandMove((hand) => {
        const handX = hand.x * p.width;
        const handY = hand.y * p.height;

        // Gestion de la rotation
        if (interactionZone.isActive("button")) {
          if (lastAngle === null) {
            lastAngle = hand.angle;
          } else {
            const currentStep = Math.round(hand.angle / 30) * 30;
            const lastStep = Math.round(lastAngle / 30) * 30;

            if (currentStep !== lastStep) {
              const stepDiff = (currentStep - lastStep) / 30;

              if (stepDiff > 0 && buttonPosition < 3) {
                audio.clac.start();
                buttonPosition++;
                interactionZone.reset("button");
              } else if (stepDiff < 0 && buttonPosition > 0) {
                audio.clac.start();
                buttonPosition--;
                interactionZone.reset("button");
              }

              lastAngle = hand.angle;
            }
          }
        } else {
          lastAngle = null;
        }

        // Mise à jour de la zone d'interaction
        interactionZone.update("button", handX, handY);
        isOnButton = interactionZone.isActive("button");

        // Afficher un petit cercle quand pas sur le bouton
        if (!isOnButton && magnifierGraphics) {
          magnifier.draw(p, "itr", handX, handY, magnifierGraphics);
        }
      });

      // Dessiner la zone d'interaction
      interactionZone.draw(p, "button", true);
    },

    cleanup: () => {
      console.log("Intro cleanup");
      interactionZone.remove("button");
      magnifier.remove("itr");
    },
  };
};
