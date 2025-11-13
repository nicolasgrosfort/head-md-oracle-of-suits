import p5 from "p5";

import * as config from "../utils/config";
import * as utils from "../utils/utils";

import disketUrl from "../assets/fonts/disket-mono-bold.ttf";
import recursiveUrl from "../assets/fonts/recursive-mono-lnr-st-med.woff2";

import leftScreenInfoUrl from "../assets/images/common/left-screen-info.png";
import rightScreenInfoUrl from "../assets/images/common/right-screen-info.png";

export type PromptData = {
  title: string;
  description: string;
  date?: string;
  type?: string;
  image: p5.Image;
};

interface Prompt {
  data?: PromptData;
  startTime?: number;
}

const promptState: Prompt = {
  data: undefined,
  startTime: undefined,
};

const PROMPT_DURATION = 8000;

let leftScreenInfoImg: p5.Image;
let rightScreenInfoImg: p5.Image;

let disket: p5.Font;
let recursive: p5.Font;

export const initialize = async (p: p5) => {
  leftScreenInfoImg = await utils.loadImage(p, leftScreenInfoUrl, 1);
  rightScreenInfoImg = await utils.loadImage(p, rightScreenInfoUrl, 1);

  disket = await p.loadFont(disketUrl);
  recursive = await p.loadFont(recursiveUrl);
};

export const setPrompt = (data: PromptData) => {
  promptState.data = data;
  promptState.startTime = Date.now();
};

export const draw = (p: p5) => {
  if (!promptState.data || !promptState.startTime) return;

  if (Date.now() - promptState.startTime > PROMPT_DURATION) {
    clear();
    return;
  }

  // *** RIGHT
  utils.image(
    p,
    rightScreenInfoImg,
    config.screens.right.x,
    config.screens.right.y
  );

  p.push();

  p.fill(config.color.black);
  p.noStroke();

  // TITLE
  p.textFont(disket);
  p.textSize(32);
  p.textLeading(36);
  p.textStyle(p.BOLD);
  p.textAlign(p.LEFT, p.TOP);
  p.text(
    promptState.data.title,
    config.screens.right.x + 60,
    config.screens.right.y + 60,
    270,
    238
  );

  // INFOS
  p.textFont(disket);
  p.textSize(24);
  p.textLeading(27);
  p.textStyle(p.BOLD);
  p.textAlign(p.LEFT, p.BOTTOM);
  p.text(
    `${promptState.data.date}\n${promptState.data.type}`,
    config.screens.right.x + 60,
    config.screens.right.y + 328,
    270,
    54
  );

  // CARD
  utils.image(
    p,
    promptState.data.image,
    config.screens.right.x +
      config.screens.right.width -
      promptState.data.image.width * 0.25 -
      40,
    config.screens.right.y + 40
  );

  // *** LEFT
  utils.image(
    p,
    leftScreenInfoImg,
    config.screens.left.x,
    config.screens.left.y
  );

  p.textFont(disket);
  p.textSize(50);
  p.textLeading(56);
  p.textStyle(p.BOLD);
  p.textAlign(p.LEFT, p.TOP);
  p.text(
    promptState.data.title,
    config.screens.left.x + 60,
    config.screens.left.y + 60,
    312,
    112
  );

  p.textFont(recursive);
  p.textSize(30);
  p.textStyle(p.NORMAL);
  p.textLeading(38);
  p.textAlign(p.LEFT, p.TOP);
  p.text(
    promptState.data.description,
    config.screens.left.x + 60,
    config.screens.left.y + 181,
    312,
    342
  );

  p.textFont(disket);
  p.textSize(24);
  p.textLeading(27);
  p.textStyle(p.BOLD);
  p.textAlign(p.LEFT, p.BOTTOM);
  p.text(
    `${promptState.data.date}`,
    config.screens.left.x + 60,
    config.screens.left.y + 563,
    146,
    27
  );

  p.textFont(disket);
  p.textSize(24);
  p.textLeading(27);
  p.textStyle(p.BOLD);
  p.textAlign(p.RIGHT, p.BOTTOM);
  p.text(
    `${promptState.data.type}`,
    config.screens.left.x + 146 + 20 + 60,
    config.screens.left.y + 563,
    146,
    27
  );

  p.pop();
};

export const monitor = (
  p: p5,
  data: {
    progress: string;
    scene: string;
    year: string;
  }
) => {
  // Boxes
  p.push();
  p.fill("#9FD5A3");
  p.stroke("#252525");
  p.rectMode(p.CORNER);
  p.strokeWeight(4);

  p.rect(
    config.screens.center.x + 296,
    config.screens.center.height - 20 - 60,
    148,
    60
  );

  p.rect(
    config.screens.center.x + 464,
    config.screens.center.height - 20 - 60,
    148,
    60
  );

  p.rect(
    config.screens.center.x + 632,
    config.screens.center.height - 20 - 60,
    148,
    60
  );

  p.pop();

  // Text
  p.fill(0);
  p.noStroke();

  p.textSize(32);
  p.textLeading(36);
  p.textFont(disket);
  p.textAlign(p.LEFT, p.CENTER);

  p.text(
    data.progress,
    config.screens.center.x + 296 + 18,
    config.screens.center.height - 31 - 36,
    112,
    36
  );

  p.textSize(50);
  p.textLeading(56);
  p.textFont(disket);
  p.textAlign(p.LEFT, p.CENTER);

  p.text(
    data.scene,
    config.screens.center.x + 464 + 22,
    config.screens.center.height - 20 - 56,
    105,
    56
  );

  p.textSize(32);
  p.textLeading(36);
  p.textFont(disket);
  p.textAlign(p.LEFT, p.CENTER);

  p.text(
    data.year,
    config.screens.center.x + 632 + 29,
    config.screens.center.height - 31 - 36,
    90,
    36
  );
};

export const clear = () => {
  promptState.data = undefined;
  promptState.startTime = undefined;
};
