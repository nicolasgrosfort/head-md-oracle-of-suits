import p5 from "p5";

import * as mediaPipe from "./libs/media-pipe";
import * as config from "./utils/config";
import * as utils from "./utils/utils";

import cloudLeftUrl from "./assets/images/cloud-l.png";
import cloudRightUrl from "./assets/images/cloud-r.png";
import sunUrl from "./assets/images/sun.png";

new p5((p: p5) => {
  let cloudLeft: p5.Image;
  let cloudCenter: p5.Image;
  let cloudRight: p5.Image;
  let sun: p5.Image;

  let cloudLeftX = 0;
  let cloudCenterX = 0;
  let cloudRightX = 0;

  let cloudLeftDirection = 1;
  let cloudCenterDirection = -1;
  let cloudRightDirection = -1;

  p.setup = async () => {
    p.createCanvas(config.sketch.width, config.sketch.height);
    await mediaPipe.initialize(p);

    sun = await utils.loadImage(p, sunUrl);
    sun.resize(400, 400);

    cloudLeft = await utils.loadImage(p, cloudLeftUrl);
    cloudLeft.resize(300, 180);

    cloudCenter = await utils.loadImage(p, cloudLeftUrl);
    cloudCenter.resize(400, 240);

    cloudRight = await utils.loadImage(p, cloudRightUrl);
    cloudRight.resize(200, 120);

    cloudLeftX = 40;
    cloudCenterX = p.width * 0.5;
    cloudRightX = p.width - cloudRight.width - 40;
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
      0.01,
      cloudCenterX,
      cloudCenterDirection
    );
    cloudCenterX = centerResult.x;
    cloudCenterDirection = centerResult.direction;

    const rightResult = utils.animateX(
      p.width - cloudRight.width - 40 - 400,
      p.width - cloudRight.width - 40,
      0.1,
      cloudRightX,
      cloudRightDirection
    );
    cloudRightX = rightResult.x;
    cloudRightDirection = rightResult.direction;

    p.image(sun, config.screens.center.x - sun.width * 0.5, 40);
    p.image(cloudRight, cloudRightX, 400);
    p.image(cloudCenter, cloudCenterX, 140);
    p.image(cloudLeft, cloudLeftX, 320);

    const video = mediaPipe.getVideo();
    utils.drawVideo(p, video, { hide: true });

    const handResults = mediaPipe.getGestureResults();
    utils.drawHands(p, handResults);

    const faceResults = mediaPipe.getFaceResults();
    utils.drawFace(p, faceResults);

    const poseResults = mediaPipe.getPoseResults();
    utils.drawBody(p, poseResults);

    const canvasContent = p.get();

    p.background(0);
    utils.drawScreens(p, config.screens, canvasContent);
  };
});
