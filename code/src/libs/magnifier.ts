import type p5 from "p5";

interface MagnifierConfig {
  zoomFactor?: number;
  size?: number;
  strokeWeight?: number;
  strokeColor?: number | string | number[];
}

interface MagnifierState {
  graphics: p5.Graphics;
  zoomFactor: number;
  size: number;
  strokeWeight: number;
  strokeColor: number | string | number[];
}

const magnifiers = new Map<string, MagnifierState>();

export const create = (
  p: p5,
  id: string,
  config: MagnifierConfig = {},
): void => {
  const zoomFactor = config.zoomFactor ?? 2;
  const size = config.size ?? 300;
  const strokeWeight = config.strokeWeight ?? 4;
  const strokeColor = config.strokeColor ?? 0;

  const graphics = p.createGraphics(p.width, p.height);
  graphics.pixelDensity(zoomFactor);
  graphics.textFont("Monospace");

  magnifiers.set(id, {
    graphics,
    zoomFactor,
    size,
    strokeWeight,
    strokeColor,
  });
};

export const draw = (
  p: p5,
  id: string,
  handX: number,
  handY: number,
  sourceGraphics?: p5.Graphics,
): void => {
  const magnifier = magnifiers.get(id);
  if (!magnifier) return;

  // Si pas de source spécifiée, utiliser le canvas principal
  const source = sourceGraphics ?? (p as any);

  const copySize = magnifier.size / magnifier.zoomFactor;
  const sx = handX - copySize / 2;
  const sy = handY - copySize / 2;

  p.push();
  const zoomedRegion = source.get(sx, sy, copySize, copySize);

  const ctx = p.drawingContext as CanvasRenderingContext2D;

  ctx.save();
  ctx.beginPath();
  ctx.arc(handX, handY, magnifier.size / 2, 0, p.TWO_PI);
  ctx.clip();

  // Activer l'interpolation pour un zoom lisse
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  p.translate(handX - magnifier.size / 2, handY - magnifier.size / 2);
  p.image(zoomedRegion, 0, 0, magnifier.size, magnifier.size);

  ctx.restore();

  p.noFill();

  if (Array.isArray(magnifier.strokeColor)) {
    const c = magnifier.strokeColor as number[];
    if (c.length === 1) {
      p.stroke(c[0]);
    } else if (c.length === 2) {
      p.stroke(c[0], c[1]);
    } else if (c.length === 3) {
      p.stroke(c[0], c[1], c[2]);
    } else if (c.length >= 4) {
      p.stroke(c[0], c[1], c[2], c[3]);
    } else {
      p.stroke(0);
    }
  } else {
    // stroke accepts number or string color
    p.stroke(magnifier.strokeColor as any);
  }

  p.strokeWeight(magnifier.strokeWeight);
  p.circle(handX, handY, magnifier.size);
  p.pop();
};

export const getGraphics = (id: string): p5.Graphics | null => {
  const magnifier = magnifiers.get(id);
  return magnifier?.graphics ?? null;
};

export const updateConfig = (
  id: string,
  config: Partial<MagnifierConfig>,
): void => {
  const magnifier = magnifiers.get(id);
  if (!magnifier) return;

  if (config.zoomFactor !== undefined) {
    magnifier.zoomFactor = config.zoomFactor;
    magnifier.graphics.pixelDensity(config.zoomFactor);
  }
  if (config.size !== undefined) {
    magnifier.size = config.size;
  }
  if (config.strokeWeight !== undefined) {
    magnifier.strokeWeight = config.strokeWeight;
  }
  if (config.strokeColor !== undefined) {
    magnifier.strokeColor = config.strokeColor;
  }
};

export const remove = (id: string): void => {
  const magnifier = magnifiers.get(id);
  if (magnifier) {
    magnifier.graphics.remove();
    magnifiers.delete(id);
  }
};

export const clear = (): void => {
  for (const [id] of magnifiers) {
    remove(id);
  }
};
