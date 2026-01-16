import p5 from "p5";

import * as magnifier from "../libs/magnifier";
import * as mediaPipe from "../libs/media-pipe";
import type { Scene } from "../libs/scene-manager";
import * as config from "../utils/config";
import * as utils from "../utils/utils";

import emdUrl1 from "../assets/images/emd-1.png";

export const createEmdScene = (p: p5): Scene => {
  let emdImg1: p5.Image;

  let isAnyHand = false;
  let handX = 0;
  let handY = 0;

  const drawScene = (pg: p5 | p5.Graphics, _isMagnifier?: boolean) => {
    pg.push();
    utils.image(pg, emdImg1, 0, 0);
    pg.pop();
  };

  return {
    setup: async () => {
      console.log("EMD scene setup");

      emdImg1 = await utils.loadImage(p, emdUrl1, 1);

      magnifier.create(p, "emd", {
        zoomFactor: 2,
        size: 300,
        strokeWeight: 4,
        strokeColor: config.color.black,
      });
    },

    draw: () => {
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

      const canvasContent = p.get();
      p.background(0);
      utils.drawScreens(p, config.screens, canvasContent);
    },

    cleanup: () => {
      console.log("Menu cleanup");
      magnifier.remove("emd");
    },
  };
};
