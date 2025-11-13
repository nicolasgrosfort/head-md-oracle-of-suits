import p5 from "p5";

import * as audio from "../libs/audio";
import * as mediaPipe from "../libs/media-pipe";
import * as sceneManager from "../libs/scene-manager";
import * as utils from "../utils/utils";

import sbyUrl1 from "../assets/images/sby-1.png";

const FRAME_TO_SWITCH_ON = 2;

export const createStandbyScene = (p: p5): sceneManager.Scene => {
  let sbyImg1: p5.Image;
  let frameWithHand = 0;

  return {
    setup: async () => {
      console.log("Standby setup");
      sbyImg1 = await utils.loadImage(p, sbyUrl1, 1);
      frameWithHand = 0;
    },

    draw: () => {
      p.push();
      p.imageMode(p.CENTER);
      p.image(
        sbyImg1,
        p.width * 0.5,
        p.height * 0.5,
        sbyImg1.width * 0.25,
        sbyImg1.height * 0.25
      );
      p.pop();

      const isAnyHuman =
        mediaPipe.anyHand() || mediaPipe.anyFace() || mediaPipe.anyPose();

      if (isAnyHuman) frameWithHand++;
      else frameWithHand = 0;

      if (frameWithHand >= FRAME_TO_SWITCH_ON) {
        frameWithHand = 0;
        audio.unlock.start();
        sceneManager.switchTo("itr");
      }
    },

    cleanup: () => {
      console.log("Standby cleanup");
    },
  };
};
