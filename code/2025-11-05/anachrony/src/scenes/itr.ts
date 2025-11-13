import p5 from "p5";

import * as audio from "../libs/audio";
import * as cardTracker from "../libs/card-tracker";
import * as cardodex from "../libs/cardodex";
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

import card1FullUrl from "../assets/images/card-1-full.png";
import card5FullUrl from "../assets/images/card-5-full.png";

import baseButtonUrl from "../assets/images/base-button.png";

const cardPrompts: Record<string, Omit<cardodex.PromptData, "image">> = {
  card1: {
    title: "Rock'n Pop",
    description:
      "In Hanafuda, the January “Hikari” card shows a crane and rising sun — symbols of luck and long life.",
    date: "1980",
    type: "France",
  },
  card5: {
    title: "Justo Rodero",
    description:
      "In the 17th century, the Ace of Diamonds stood for both wealth and deceit — hence the saying “an ace up your sleeve.”",
    date: "1955",
    type: "Spain",
  },
};

export const createIntroScene = (p: p5): sceneManager.Scene => {
  let itrImg1: p5.Image;
  let itrImg2: p5.Image;
  let itrImg3: p5.Image;
  let itrImg4: p5.Image;
  let currentImg: p5.Image;

  let card1Img: p5.Image;
  let card5Img: p5.Image;

  let card1VisibleImg: p5.Image;
  let card5VisibleImg: p5.Image;

  let card1FullImg: p5.Image;
  let card5FullImg: p5.Image;

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

  let monitor = {
    scene: "",
    progress: "",
    year: "",
  };

  const MIN_ZONE_RADIUS = 50;
  const MAX_ZONE_RADIUS = 200;
  const ORIGINAL_CIRCLE_X = 1022;
  const ORIGINAL_CIRCLE_Y = 1055;
  const MAX_PLANET_SCALE = 1.15;

  let planetBaseScale = 1;
  let planetAnimationOffset = 0;

  const drawScene = (pg: p5 | p5.Graphics, isMagnifier?: boolean) => {
    pg.push();

    pg.background(0);

    switch (buttonPosition) {
      case 0:
        currentImg = itrImg1;
        currentBtn = 0;
        currentPlanet = 0;
        monitor.scene = "MMK";
        monitor.year = "1500";
        monitor.progress = utils.formatProgress(
          cardTracker.getCountByScene("mmk"),
          4
        );
        break;
      case 1:
        currentImg = itrImg2;
        currentBtn = 1;
        currentPlanet = 1;
        monitor.scene = "ACN";
        monitor.year = "1400";
        monitor.progress = utils.formatProgress(
          cardTracker.getCountByScene("acn"),
          4
        );
        break;
      case 2:
        currentImg = itrImg3;
        currentBtn = 2;
        currentPlanet = 2;
        monitor.scene = "EMD";
        monitor.year = "1700";
        monitor.progress = utils.formatProgress(
          cardTracker.getCountByScene("emd"),
          4
        );
        break;
      case 3:
        currentImg = itrImg4;
        currentBtn = 3;
        currentPlanet = 3;
        monitor.scene = "JPN";
        monitor.year = "1600";
        monitor.progress = utils.formatProgress(
          cardTracker.getCountByScene("jpn"),
          4
        );
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

    planetAnimationOffset = p.sin(p.frameCount * 0.1) * 0.01;
    const finalPlanetScale = planetBaseScale + planetAnimationOffset;

    pg.push();
    pg.translate(
      832 + (planetImgs[currentPlanet].width / 2) * 0.25,
      166 + (planetImgs[currentPlanet].height / 2) * 0.25
    );
    pg.scale(finalPlanetScale);
    pg.translate(
      (-planetImgs[currentPlanet].width / 2) * 0.25,
      (-planetImgs[currentPlanet].height / 2) * 0.25
    );
    utils.image(pg, planetImgs[currentPlanet], 0, 0);
    pg.pop();

    utils.image(pg, baseButtonImg, 889, 967);
    utils.image(pg, btnImgs[currentBtn], 926, 991);

    pg.pop();

    cardodex.monitor(p, monitor, "starship");
  };

  return {
    setup: async () => {
      console.log("Intro setup");

      itrImg1 = await utils.loadImage(p, itrUrl1, 1);
      itrImg2 = await utils.loadImage(p, itrUrl2, 1);
      itrImg3 = await utils.loadImage(p, itrUrl3, 1);
      itrImg4 = await utils.loadImage(p, itrUrl4, 1);
      currentImg = itrImg1;

      card1Img = await utils.loadImage(p, card1Url, 1);
      card5Img = await utils.loadImage(p, card5Url, 1);

      card1VisibleImg = await utils.loadImage(p, card1VisibleUrl, 1);
      card5VisibleImg = await utils.loadImage(p, card5VisibleUrl, 1);

      card1FullImg = await utils.loadImage(p, card1FullUrl, 1);
      card5FullImg = await utils.loadImage(p, card5FullUrl, 1);

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

      interactionZone.create("button", {
        x: ORIGINAL_CIRCLE_X,
        y: ORIGINAL_CIRCLE_Y,
        minRadius: MIN_ZONE_RADIUS,
        maxRadius: MAX_ZONE_RADIUS,
        requiredFrames: config.frame.toTravel,
        onProgress: (progress) => {
          planetBaseScale = p.map(progress, 0, 1, 1, MAX_PLANET_SCALE);
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
          planetBaseScale = 1;
          currentLoader = 0;
        },
      });

      magnifier.create(p, "itr", {
        zoomFactor: 2,
        size: 300,
        strokeWeight: 4,
        strokeColor: config.color.black,
      });
    },

    draw: () => {
      drawScene(p, false);

      const magnifierGraphics = magnifier.getGraphics("itr");
      if (magnifierGraphics) {
        drawScene(magnifierGraphics, true);
      }

      let isAnyHand = false;

      mediaPipe.onHandMove((hand) => {
        isAnyHand = true;
        const handX = hand.x * p.width;
        const handY = hand.y * p.height;

        [card1FullImg, card5FullImg].forEach((cardVisibleImg, index) => {
          const cardX = index === 0 ? card1X : card5X;
          const cardY = index === 0 ? card1Y : card5Y;
          const cardWidth = cardVisibleImg.width;
          const cardHeight = cardVisibleImg.height;

          if (
            handX >= cardX &&
            handX <= cardX + cardWidth &&
            handY >= cardY &&
            handY <= cardY + cardHeight
          ) {
            const cardId = index === 0 ? "card1" : "card5";
            cardodex.setPrompt({
              ...cardPrompts[cardId],
              image: cardVisibleImg,
            });
          }
        });

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
                interactionZone.reset("button", true);
              } else if (stepDiff < 0 && buttonPosition > 0) {
                audio.clac.start();
                buttonPosition--;
                interactionZone.reset("button", true);
              }

              lastAngle = hand.angle;
            }
          }
        } else {
          lastAngle = null;
        }

        interactionZone.update("button", handX, handY);
        isOnButton = interactionZone.isActive("button");

        if (!isOnButton && magnifierGraphics) {
          magnifier.draw(p, "itr", handX, handY, magnifierGraphics);
        }
      });

      if (!isAnyHand) {
        interactionZone.reset("button");
        isOnButton = false;
        lastAngle = null;
      }

      cardodex.draw(p);
      interactionZone.draw(p, "button", true);
    },

    cleanup: () => {
      console.log("Intro cleanup");

      interactionZone.remove("button");
      magnifier.remove("itr");

      cardodex.clear();
    },
  };
};
