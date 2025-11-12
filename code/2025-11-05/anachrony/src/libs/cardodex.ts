import p5 from "p5";

import * as config from "../utils/config";
import * as utils from "../utils/utils";

import leftScreenInfoUrl from "../assets/images/left-screen-info.png";
import rightScreenInfoUrl from "../assets/images/right-screen-info.png";

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

export const initialize = async (p: p5) => {
  leftScreenInfoImg = await utils.loadImage(p, leftScreenInfoUrl, 1);
  rightScreenInfoImg = await utils.loadImage(p, rightScreenInfoUrl, 1);
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

  // RIGHT
  utils.image(
    p,
    rightScreenInfoImg,
    config.screens.right.x,
    config.screens.right.y
  );

  p.push();
  p.textAlign(p.LEFT, p.TOP);
  p.fill(config.color.black);

  p.textSize(32);
  p.textStyle(p.BOLD);
  p.text(
    promptState.data.title,
    config.screens.right.x + 60,
    config.screens.right.y + 60,
    220,
    238
  );

  p.textSize(24);
  p.text(
    `${promptState.data.date}\n${promptState.data.type}`,
    config.screens.right.x + 60,
    config.screens.right.y + 318,
    220,
    54
  );

  //   p.push();
  //   p.textSize(40);
  //   p.fill(0);
  //   p.noStroke();
  //   p.textAlign(p.LEFT, p.TOP);
  //   p.textStyle(p.BOLD);
  //   p.text(
  //     promptState.data.title,
  //     config.screens.right.x + 30,
  //     config.screens.right.y + 40
  //   );
  //   p.textSize(30);
  //   p.textStyle(p.NORMAL);
  //   p.text(
  //     promptState.data.description,
  //     config.screens.right.x + 30,
  //     config.screens.right.y + 110,
  //     config.screens.right.width - 40,
  //     config.screens.right.height - 100
  //   );

  // LEFT
  utils.image(
    p,
    leftScreenInfoImg,
    config.screens.left.x,
    config.screens.left.y
  );

  p.textSize(40);
  p.text(
    promptState.data.title,
    config.screens.left.x + 60,
    config.screens.left.y + 60,
    312,
    112
  );

  p.textSize(30);
  p.text(
    promptState.data.description,
    config.screens.left.x + 60,
    config.screens.left.y + 192,
    312,
    361
  );

  p.textSize(24);

  //   const image = promptState.data.image;
  //   if (!image) return;

  //   const maxWidth = config.screens.left.width - 60;
  //   const maxHeight = config.screens.left.height - 60;
  //   let displayWidth = image.width;
  //   let displayHeight = image.height;

  //   if (displayWidth > maxWidth) {
  //     const scaleFactor = maxWidth / displayWidth;
  //     displayWidth = maxWidth;
  //     displayHeight *= scaleFactor;
  //   }

  //   if (displayHeight > maxHeight) {
  //     const scaleFactor = maxHeight / displayHeight;
  //     displayHeight = maxHeight;
  //     displayWidth *= scaleFactor;
  //   }

  //   p.image(
  //     image,
  //     config.screens.left.x + (config.screens.left.width - displayWidth) / 2,
  //     config.screens.left.y + (config.screens.left.height - displayHeight) / 2,
  //     displayWidth,
  //     displayHeight
  //   );

  p.pop();
};

export const clear = () => {
  promptState.data = undefined;
  promptState.startTime = undefined;
};
