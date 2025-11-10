import p5 from "p5";
import type { Scene } from "../libs/scene-manager";

export const createIntroScene = (p: p5): Scene => {
  return {
    setup: async () => {
      console.log("Intro scene setup");
    },

    draw: () => {
      p.background(0);

      p.fill(255);
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(64);
      p.text("ORACLE OF SUITS", p.width / 2, 300);

      p.textSize(32);
      p.text("Appuyez sur M pour commencer", p.width / 2, 400);
    },

    cleanup: () => {
      console.log("Menu cleanup");
    },
  };
};
