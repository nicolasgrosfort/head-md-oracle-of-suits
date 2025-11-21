export type ScreenName = "left" | "right" | "center";

export type Screen = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Screens = Record<ScreenName, Screen>;
