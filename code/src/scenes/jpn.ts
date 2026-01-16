import p5 from "p5";
import type { Scene } from "../libs/scene-manager";
import * as magnifier from "../libs/magnifier";
import * as mediaPipe from "../libs/media-pipe";
import * as config from "../utils/config";
import * as utils from "../utils/utils";

import jpnUrl1 from "../assets/images/jpn-1.png";

export const createEdoJapanScene = (p: p5): Scene => {
  let jpnImg1: p5.Image;

  let isAnyHand = false;
  let handX = 0;
  let handY = 0;

  const drawScene = (pg: p5 | p5.Graphics, _isMagnifier?: boolean) => {
    pg.push();
    pg.imageMode(pg.CENTER);
    pg.image(
      jpnImg1,
      pg.width * 0.5,
      pg.height * 0.5,
      jpnImg1.width * 0.25,
      jpnImg1.height * 0.25
    );
    pg.pop();
  };

  return {
    setup: async () => {
      console.log("Edo Japan setup");

      jpnImg1 = await utils.loadImage(p, jpnUrl1, 1);

      magnifier.create(p, "jpn", {
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

      const magnifierGraphics = magnifier.getGraphics("jpn");
      if (magnifierGraphics) {
        drawScene(magnifierGraphics, true);
      }

      if (isAnyHand && magnifierGraphics) {
        magnifier.draw(p, "jpn", handX, handY, magnifierGraphics);
      }

      isAnyHand = false;
    },

    cleanup: () => {
      console.log("Edo Japan cleanup");
      magnifier.remove("jpn");
    },
  };
};
