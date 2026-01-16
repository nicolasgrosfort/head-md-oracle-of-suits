import p5 from "p5";

import * as interactionZone from "../libs/interaction-zone";
import * as magnifier from "../libs/magnifier";
import * as mediaPipe from "../libs/media-pipe";
import type { Scene } from "../libs/scene-manager";
import * as sceneManager from "../libs/scene-manager";
import * as config from "../utils/config";
import * as utils from "../utils/utils";

import loader0Url from "../assets/images/loader-0.png";
import loader1Url from "../assets/images/loader-1.png";
import loader2Url from "../assets/images/loader-2.png";
import loader3Url from "../assets/images/loader-3.png";
import loader4Url from "../assets/images/loader-4.png";

import emdUrl1 from "../assets/images/emd-1.png";
import vesselUrl from "../assets/images/vessel.png";

export const createEmdScene = (p: p5): Scene => {
  let emdImg1: p5.Image;
  let vessel: p5.Image;
  let loaderImgs: p5.Image[] = [];

  let isAnyHand = false;
  let handX = 0;
  let handY = 0;

  let isOnVessel = false;
  let vesselX = 875;
  let vesselY = 250;

  let currentLoader = 0;

  const drawScene = (pg: p5 | p5.Graphics, isMagnifier?: boolean) => {
    pg.background("#708AB1");
    utils.image(pg, vessel, vesselX, vesselY);
    utils.image(pg, emdImg1, 0, 0);

    if (isOnVessel && !isMagnifier) {
      interactionZone.draw(p, "vessel", true);
    }

    utils.image(
      pg,
      loaderImgs[currentLoader + (isOnVessel ? 1 : 0)],
      623,
      config.screens.center.height - 80
    );

    utils.image(
      pg,
      loaderImgs[currentLoader + (isOnVessel ? 1 : 0)],
      1303,
      config.screens.center.height - 80,
      { flipX: true }
    );
  };

  return {
    setup: async () => {
      console.log("EMD scene setup");

      emdImg1 = await utils.loadImage(p, emdUrl1, 1);
      vessel = await utils.loadImage(p, vesselUrl, 1);

      loaderImgs = [];
      loaderImgs.push(await utils.loadImage(p, loader0Url, 1));
      loaderImgs.push(await utils.loadImage(p, loader1Url, 1));
      loaderImgs.push(await utils.loadImage(p, loader2Url, 1));
      loaderImgs.push(await utils.loadImage(p, loader3Url, 1));
      loaderImgs.push(await utils.loadImage(p, loader4Url, 1));
      currentLoader = 0;

      magnifier.create(p, "emd", {
        zoomFactor: 2,
        size: 300,
        strokeWeight: 4,
        strokeColor: config.color.black,
      });

      interactionZone.create("vessel", {
        x: vesselX,
        y: vesselY,
        width: vessel.width * 0.25,
        height: vessel.height * 0.25,
        requiredFrames: config.frame.toTravel,
        onProgress: (progress) => {
          currentLoader = Math.min(
            loaderImgs.length - 1,
            Math.floor(progress * (loaderImgs.length - 1))
          );
        },
        onComplete: () => {
          console.log("Vessel interaction complete");
          sceneManager.switchTo("itr");
        },
        onExit: () => {
          currentLoader = 0;
        },
      });
    },

    draw: () => {
      mediaPipe.onHandMove((hand) => {
        isAnyHand = true;
        handX = hand.x * config.sketch.width;
        handY = hand.y * config.sketch.height;

        interactionZone.update("vessel", handX, handY);
        isOnVessel = interactionZone.isActive("vessel");
      });

      if (!isAnyHand) {
        handX = 0;
        handY = 0;
        interactionZone.reset("vessel", true);
        isOnVessel = false;
      }

      drawScene(p, false);

      const magnifierGraphics = magnifier.getGraphics("emd");
      if (magnifierGraphics) {
        drawScene(magnifierGraphics, true);
      }

      if (isAnyHand && !isOnVessel && magnifierGraphics) {
        magnifier.draw(p, "emd", handX, handY, magnifierGraphics);
      }

      isAnyHand = false;

      const canvasContent = p.get();

      p.background(0);
      utils.drawScreens(p, config.screens, canvasContent);
    },

    cleanup: () => {
      console.log("Menu cleanup");
      interactionZone.remove("vessel");
      magnifier.remove("emd");
    },
  };
};
