import type { Screens } from "./types";

export const sketch = {
  width: 2252,
  height: 1600,
};

export const screens: Screens = {
  left: { x: 0, y: 217, width: 432, height: 640 },
  center: { x: 482, y: 0, width: 1080, height: 1600 },
  right: { x: 1612, y: 285, width: 640, height: 432 },
};

export const landmark = {
  radius: 8,
  color: 0,
};

export const zoom = {
  factor: 4,
  size: 200,
};
