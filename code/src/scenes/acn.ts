import p5 from "p5";
import type { Scene } from "../libs/scene-manager";
import * as magnifier from "../libs/magnifier";
import * as mediaPipe from "../libs/media-pipe";
import * as config from "../utils/config";
import * as utils from "../utils/utils";

import ancUrl1 from "../assets/images/acn-1.png";
import ancUrl2 from "../assets/images/acn-2.png";

export const createAncientChinaScene = (p: p5): Scene => {
  let acnImg1: p5.Image;
  let acnImg2: p5.Image;
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
      console.log("Ancient China setup");

      acnImg1 = await utils.loadImage(p, ancUrl1, 1);
      acnImg2 = await utils.loadImage(p, ancUrl2, 1);
      currentImg = acnImg1;

      magnifier.create(p, "acn", {
        zoomFactor: 2,
        size: 300,
        strokeWeight: 4,
        strokeColor: config.color.black,
      });
    },

    draw: () => {
      if (p.key === "1") {
        currentImg = acnImg1;
      } else if (p.key === "2") {
        currentImg = acnImg2;
      }

      mediaPipe.onHandMove((hand) => {
        isAnyHand = true;
        handX = hand.x * config.sketch.width;
        handY = hand.y * config.sketch.height;
      });

      drawScene(p, false);

      const magnifierGraphics = magnifier.getGraphics("acn");
      if (magnifierGraphics) {
        drawScene(magnifierGraphics, true);
      }

      if (isAnyHand && magnifierGraphics) {
        magnifier.draw(p, "acn", handX, handY, magnifierGraphics);
      }

      isAnyHand = false;
    },

    cleanup: () => {
      console.log("Ancient China cleanup");
      magnifier.remove("acn");
    },
  };
};
