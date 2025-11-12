import p5 from "p5";
import * as config from "../utils/config";

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

const PROMPT_DURATION = 8000;

const promptState: Prompt = {
  data: undefined,
  startTime: undefined,
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

  // Right screen - Text
  p.push();
  p.fill(255, 255, 255, 200);
  p.noStroke();
  p.rect(
    config.screens.right.x,
    config.screens.right.y,
    config.screens.right.width,
    config.screens.right.height,
    20
  );
  p.pop();

  p.push();
  p.textSize(40);
  p.fill(0);
  p.noStroke();
  p.textAlign(p.LEFT, p.TOP);
  p.textStyle(p.BOLD);
  p.text(
    promptState.data.title,
    config.screens.right.x + 30,
    config.screens.right.y + 40
  );
  p.textSize(30);
  p.textStyle(p.NORMAL);
  p.text(
    promptState.data.description,
    config.screens.right.x + 30,
    config.screens.right.y + 110,
    config.screens.right.width - 40,
    config.screens.right.height - 100
  );
  p.pop();

  // Left screen - Image
  const image = promptState.data.image;
  if (!image) return;

  const maxWidth = config.screens.left.width - 60;
  const maxHeight = config.screens.left.height - 60;
  let displayWidth = image.width;
  let displayHeight = image.height;

  if (displayWidth > maxWidth) {
    const scaleFactor = maxWidth / displayWidth;
    displayWidth = maxWidth;
    displayHeight *= scaleFactor;
  }

  if (displayHeight > maxHeight) {
    const scaleFactor = maxHeight / displayHeight;
    displayHeight = maxHeight;
    displayWidth *= scaleFactor;
  }

  p.push();
  p.fill(255, 255, 255, 200);
  p.noStroke();
  p.rect(
    config.screens.left.x,
    config.screens.left.y,
    config.screens.left.width,
    config.screens.left.height,
    20
  );
  p.pop();

  p.image(
    image,
    config.screens.left.x + (config.screens.left.width - displayWidth) / 2,
    config.screens.left.y + (config.screens.left.height - displayHeight) / 2,
    displayWidth,
    displayHeight
  );
};

export const clear = () => {
  promptState.data = undefined;
  promptState.startTime = undefined;
};
