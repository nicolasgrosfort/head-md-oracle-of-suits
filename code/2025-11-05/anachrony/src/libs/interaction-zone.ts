import type p5 from "p5";

import * as config from "../utils/config";
import * as utils from "../utils/utils";
import * as audio from "./audio";

export interface ZoneConfig {
  x: number;
  y: number;
  width?: number;
  height?: number;
  minRadius?: number;
  maxRadius?: number;
  requiredFrames: number;
  onProgress?: (progress: number, frameCount: number) => void;
  onComplete?: () => void;
  onEnter?: () => void;
  onExit?: () => void;
}

interface ZoneState {
  isActive: boolean;
  frameCount: number;
  progress: number;
  wasActive: boolean;
  currentX: number;
  currentY: number;
  config: Required<ZoneConfig>;
}

const zones = new Map<string, ZoneState>();

export const create = (id: string, config: ZoneConfig): void => {
  const fullConfig: Required<ZoneConfig> = {
    x: config.x,
    y: config.y,
    width: config.width ?? 100,
    height: config.height ?? 100,
    minRadius: config.minRadius ?? 50,
    maxRadius: config.maxRadius ?? 200,
    requiredFrames: config.requiredFrames,
    onProgress: config.onProgress ?? (() => {}),
    onComplete: config.onComplete ?? (() => {}),
    onEnter: config.onEnter ?? (() => {}),
    onExit: config.onExit ?? (() => {}),
  };

  // Calculer le centre de la zone (pour les rectangles)
  const centerX = config.x + (config.width ?? 100) / 2;
  const centerY = config.y + (config.height ?? 100) / 2;

  zones.set(id, {
    isActive: false,
    frameCount: 0,
    progress: 0,
    wasActive: false,
    currentX: centerX,
    currentY: centerY,
    config: fullConfig,
  });
};

export const update = (id: string, handX: number, handY: number): void => {
  const zone = zones.get(id);
  if (!zone) return;

  const isInside = utils.isInsideCircle(
    handX,
    handY,
    zone.currentX,
    zone.currentY,
    zone.config.maxRadius
  );

  if (isInside) {
    if (!zone.wasActive) {
      // Déplacer le centre de la zone vers la main
      zone.currentX = handX;
      zone.currentY = handY;
      zone.config.onEnter();
      audio.loader.start();
      zone.wasActive = true;
    }

    zone.isActive = true;
    zone.frameCount++;

    // Calcul de la progression
    zone.progress = Math.min(1, zone.frameCount / zone.config.requiredFrames);
    zone.config.onProgress(zone.progress, zone.frameCount);

    // Vérification de la complétion
    if (zone.frameCount >= zone.config.requiredFrames) {
      complete(id);
    }
  } else {
    if (zone.wasActive) {
      // Remettre le centre à sa position d'origine
      zone.currentX = zone.config.x + zone.config.width / 2;
      zone.currentY = zone.config.y + zone.config.height / 2;
      zone.config.onExit();
      zone.wasActive = false;
    }

    reset(id);
  }
};

export const draw = (p: p5, id: string, showDebug: boolean = false): void => {
  const zone = zones.get(id);
  if (!zone || !zone.isActive || !showDebug) return;

  const currentRadius = p.map(
    zone.frameCount,
    zone.config.requiredFrames,
    0,
    zone.config.minRadius,
    zone.config.maxRadius
  );

  p.push();
  p.fill(255, 100);
  p.strokeWeight(4);
  p.stroke(config.color.black);

  // Dessiner le cercle à la position d'origine de la zone
  const originalX = zone.config.x + zone.config.width / 2;
  const originalY = zone.config.y + zone.config.height / 2;
  p.circle(originalX, originalY, currentRadius * 2);

  p.pop();
};

export const getProgress = (id: string): number => {
  const zone = zones.get(id);
  return zone?.progress ?? 0;
};

export const getRadius = (p: p5, id: string): number => {
  const zone = zones.get(id);
  if (!zone) return 0;
  return p.map(
    zone.frameCount,
    zone.config.requiredFrames,
    0,
    zone.config.minRadius,
    zone.config.maxRadius
  );
};

export const isActive = (id: string): boolean => {
  const zone = zones.get(id);
  return zone?.isActive ?? false;
};

export const reset = (id: string): void => {
  const zone = zones.get(id);
  if (!zone) return;

  zone.isActive = false;
  zone.frameCount = 0;
  zone.progress = 0;
  audio.loader.stop();
};

const complete = (id: string): void => {
  const zone = zones.get(id);
  if (!zone) return;

  audio.loader.stop();
  audio.portal.start();
  zone.config.onComplete();
  reset(id);
  zone.wasActive = false;
};

export const remove = (id: string): void => {
  zones.delete(id);
};

export const clear = (): void => {
  zones.clear();
};
