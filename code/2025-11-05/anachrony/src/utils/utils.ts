import type p5 from "p5";
import type { Screens } from "./types";

export const drawVideo = (
  p: p5,
  video: p5.Element | null,
  options: { hide: boolean }
) => {
  if (options.hide) return;
  if (video) {
    p.push();
    p.translate(p.width, 0);
    p.scale(-1, 1);
    p.image(video as any, 0, 0, p.width, p.height);
    p.pop();
  }
};

export const drawScreens = (p: p5, screens: Screens, content?: p5.Image) => {
  if (!content) return;

  for (const screen of Object.values(screens)) {
    p.push();

    p.drawingContext.save();
    p.drawingContext.beginPath();
    p.drawingContext.rect(screen.x, screen.y, screen.width, screen.height);
    p.drawingContext.clip();

    p.image(content as any, 0, 0, p.width, p.height);

    p.drawingContext.restore();
    p.pop();

    p.noFill();
    p.stroke(0);
    p.strokeWeight(2);
    p.rect(screen.x, screen.y, screen.width, screen.height);
  }
};

export const loadImage = (
  p: p5,
  url: string,
  ratio: number = 4
): Promise<p5.Image> => {
  const scale = 1 / ratio;
  return new Promise<p5.Image>((resolve) => {
    p.loadImage(url, (img) => {
      img.resize(img.width * scale, img.height * scale);
      resolve(img);
    });
  });
};

export const animateX = (
  minX: number,
  maxX: number,
  speed: number,
  currentX: number,
  direction: number = 1
): { x: number; direction: number } => {
  let newX = currentX + speed * direction;
  let newDirection = direction;

  if (newX > maxX) {
    newX = maxX;
    newDirection = -1;
  }

  if (newX < minX) {
    newX = minX;
    newDirection = 1;
  }

  return { x: newX, direction: newDirection };
};
