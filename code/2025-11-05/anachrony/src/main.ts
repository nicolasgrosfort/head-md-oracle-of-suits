import p5 from "p5";

import * as mediaPipe from "./libs/media-pipe";
import * as config from "./utils/config";
import * as utils from "./utils/utils";

import cloundCenterUrl from "./assets/images/cloud-center.png";
import cloudLeftUrl from "./assets/images/cloud-left.png";
import cloudRightUrl from "./assets/images/cloud-right.png";
import sandUrl from "./assets/images/mmk/sand.png";
import sunUrl from "./assets/images/sun.png";

new p5((p: p5) => {
  let cloudLeft: p5.Image;
  let cloudCenter: p5.Image;
  let cloudRight: p5.Image;
  let sun: p5.Image;
  let sand: p5.Image;

  let cloudLeftX = 0;
  let cloudCenterX = 0;
  let cloudRightX = 0;

  let cloudLeftDirection = 1;
  let cloudCenterDirection = -1;
  let cloudRightDirection = -1;

  p.setup = async () => {
    p.createCanvas(config.sketch.width, config.sketch.height);
    await mediaPipe.initialize(p);

    cloudLeft = await utils.loadImage(p, cloudLeftUrl);
    cloudLeftX = 40;

    cloudCenter = await utils.loadImage(p, cloundCenterUrl);
    cloudCenterX = p.width * 0.5;

    cloudRight = await utils.loadImage(p, cloudRightUrl);
    cloudRightX = p.width - cloudRight.width - 40;

    sand = await utils.loadImage(p, sandUrl);
    sun = await utils.loadImage(p, sunUrl);
  };

  p.draw = () => {
    p.background("#BDF7FF");
    mediaPipe.detect();

    const leftResult = utils.animateX(
      40,
      40 + 400,
      0.2,
      cloudLeftX,
      cloudLeftDirection
    );
    cloudLeftX = leftResult.x;
    cloudLeftDirection = leftResult.direction;

    const centerResult = utils.animateX(
      p.width * 0.5 - 100,
      p.width * 0.5,
      0.05,
      cloudCenterX,
      cloudCenterDirection
    );
    cloudCenterX = centerResult.x;
    cloudCenterDirection = centerResult.direction;

    const rightResult = utils.animateX(
      p.width - cloudRight.width - 40 - 400,
      p.width - cloudRight.width - 40,
      0.2,
      cloudRightX,
      cloudRightDirection
    );
    cloudRightX = rightResult.x;
    cloudRightDirection = rightResult.direction;

    p.image(sun, config.screens.center.x - sun.width * 0.5, 40);
    p.image(cloudRight, cloudRightX, 400);
    p.image(cloudCenter, cloudCenterX, 140);
    p.image(cloudLeft, cloudLeftX, 320);

    p.image(sand, 0, config.screens.center.height - sand.height);

    const video = mediaPipe.getVideo();
    utils.drawVideo(p, video, { hide: true });

    const handResults = mediaPipe.getGestureResults();
    mediaPipe.drawHands(p, handResults);

    const faceResults = mediaPipe.getFaceResults();
    mediaPipe.drawFace(p, faceResults);

    const poseResults = mediaPipe.getPoseResults();
    mediaPipe.drawBody(p, poseResults);

    const canvasContent = p.get();

    p.background(0);
    utils.drawScreens(p, config.screens, canvasContent);
  };
});
