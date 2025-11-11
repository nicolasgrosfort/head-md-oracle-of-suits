import type p5 from "p5";
import type { Screens } from "./types";

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

export const randomPositionInPolygon = (
  p: p5,
  vertices: Array<{ x: number; y: number }>
): { x: number; y: number } => {
  const minX = Math.min(...vertices.map((v) => v.x));
  const maxX = Math.max(...vertices.map((v) => v.x));
  const minY = Math.min(...vertices.map((v) => v.y));
  const maxY = Math.max(...vertices.map((v) => v.y));

  let point: { x: number; y: number };
  let attempts = 0;
  const maxAttempts = 1000;

  do {
    point = {
      x: p.random(minX, maxX),
      y: p.random(minY, maxY),
    };
    attempts++;
  } while (!isPointInPolygon(point, vertices) && attempts < maxAttempts);

  return point;
};

const isPointInPolygon = (
  point: { x: number; y: number },
  vertices: Array<{ x: number; y: number }>
): boolean => {
  let inside = false;

  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    const xi = vertices[i].x;
    const yi = vertices[i].y;
    const xj = vertices[j].x;
    const yj = vertices[j].y;

    const intersect =
      yi > point.y !== yj > point.y &&
      point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;

    if (intersect) inside = !inside;
  }

  return inside;
};

export const lerp = (start: number, end: number, amount: number): number => {
  return start + (end - start) * amount;
};

export const imageToAscii = (
  pg: p5 | p5.Graphics,
  img: p5.Image,
  x: number,
  y: number,
  width: number,
  height: number,
  resolution: number = 15 // Augmenté pour moins de détails mais plus rapide
) => {
  // const chars = " .-+*#@";
  const chars = " @#*+-.";

  pg.push();
  pg.textAlign(pg.LEFT, pg.TOP);
  pg.textSize(resolution);
  pg.textFont("Monospace");
  pg.fill(0);
  pg.noStroke();

  const cols = Math.floor(width / (resolution * 0.6));
  const rows = Math.floor(height / resolution);

  // Accéder directement aux pixels est plus rapide
  img.loadPixels();

  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const imgX = Math.floor((i / cols) * img.width);
      const imgY = Math.floor((j / rows) * img.height);

      // Accès direct aux pixels au lieu de img.get()
      const pixelIndex = (imgY * img.width + imgX) * 4;
      const r = img.pixels[pixelIndex];
      const g = img.pixels[pixelIndex + 1];
      const b = img.pixels[pixelIndex + 2];

      const brightness = (r + g + b) / 3;
      const charIndex = Math.floor((brightness / 255) * (chars.length - 1));

      pg.text(chars[charIndex], x + i * resolution * 0.6, y + j * resolution);
    }
  }

  pg.pop();
};

export const image = (
  pg: p5 | p5.Graphics,
  image: p5.Image,
  x: number,
  y: number,
  options: { ratio?: number; ascii?: boolean } = {
    ratio: 0.25,
    ascii: false,
  }
) => {
  const ratio = options.ratio ?? 0.25;
  const ascii = options.ascii ?? false;

  if (ascii) {
    imageToAscii(pg, image, x, y, image.width * ratio, image.height * ratio);
  } else {
    pg.image(image, x, y, image.width * ratio, image.height * ratio);
  }
};

export const getAngle = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  base: number = 150,
  step: number = 30
): number => {
  const dx = x2 - x1;
  const dy = y2 - y1;

  let angle = -1 * (Math.atan2(dy, dx) * (180 / Math.PI) + base);
  angle = Math.round(angle / step) * step;

  while (angle > 180) angle -= 360;
  while (angle <= -180) angle += 360;

  angle === 0 ? 0 : angle;

  console.log(angle);

  return angle;
};

export const isInsideCircle = (
  pointX: number,
  pointY: number,
  circleX: number,
  circleY: number,
  radius: number
): boolean => {
  const dx = pointX - circleX;
  const dy = pointY - circleY;
  return dx * dx + dy * dy <= radius * radius;
};
