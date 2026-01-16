import p5 from "p5";

import type { Scene } from "../libs/scene-manager";
import * as magnifier from "../libs/magnifier";
import * as mediaPipe from "../libs/media-pipe";
import * as config from "../utils/config";
import * as utils from "../utils/utils";

import emdUrl1 from "../assets/images/emd-1.png";
import emdUrl2 from "../assets/images/emd-2.png";

export const createEmdScene = (p: p5): Scene => {
  let emdImg1: p5.Image;
  let emdImg2: p5.Image;
  let currentImg: p5.Image;

  let isAnyHand = false;
  let handX = 0;
  let handY = 0;

  const drawScene = (pg: p5 | p5.Graphics, _isMagnifier?: boolean) => {
    pg.push();
    pg.imageMode(pg.CENTER);
    pg.image(
      currentImg,
      pg.width * 0.5,
      pg.height * 0.5,
      currentImg.width * 0.25,
      currentImg.height * 0.25
    );
    pg.pop();
  };

  return {
    setup: async () => {
      console.log("EMD scene setup");

      emdImg1 = await utils.loadImage(p, emdUrl1, 1);
      emdImg2 = await utils.loadImage(p, emdUrl2, 1);

      currentImg = emdImg1;

      magnifier.create(p, "emd", {
        zoomFactor: 2,
        size: 300,
        strokeWeight: 4,
        strokeColor: config.color.black,
      });
    },

    draw: () => {
      if (p.key === "1") {
        currentImg = emdImg1;
      } else if (p.key === "2") {
        currentImg = emdImg2;
      }

      mediaPipe.onHandMove((hand) => {
        isAnyHand = true;
        handX = hand.x * config.sketch.width;
        handY = hand.y * config.sketch.height;
      });

      drawScene(p, false);

      const magnifierGraphics = magnifier.getGraphics("emd");
      if (magnifierGraphics) {
        drawScene(magnifierGraphics, true);
      }

      if (isAnyHand && magnifierGraphics) {
        magnifier.draw(p, "emd", handX, handY, magnifierGraphics);
      }

      isAnyHand = false;
    },

    cleanup: () => {
      console.log("Menu cleanup");
      magnifier.remove("emd");
    },
  };
};
