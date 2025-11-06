import p5 from "p5";

import * as mediaPipe from "./libs/media-pipe";
import * as config from "./utils/config";
import * as utils from "./utils/utils";

import cardLUrl from "./assets/images/card-skew-x-y-l.png";
import cardMUrl from "./assets/images/card-skew-x-y-m.png";
import cardSUrl from "./assets/images/card-skew-x-y-s.png";
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
  let cardL: p5.Image;
  let cardM: p5.Image;
  let cardS: p5.Image;

  let cloudLeftX = 0;
  let cloudCenterX = 0;
  let cloudRightX = 0;

  let cloudLeftDirection = 1;
  let cloudCenterDirection = -1;
  let cloudRightDirection = -1;

  let cards: Array<{
    x: number;
    y: number;
    size: "S" | "M" | "L";
    speed: number;
  }> = [];

  const cardsArea: Array<{ x: number; y: number }> = [
    { x: 0, y: 750 },
    { x: 1600, y: 0 },
    { x: 2251, y: 0 },
    { x: 2251, y: 340 },
    { x: 0, y: 1200 },
  ];

  const baseCardsArea: Array<{ x: number; y: number }> = [
    { x: -540, y: 1000 },
    { x: 0, y: 750 },
    { x: 0, y: 1200 },
    { x: -540, y: 1400 },
  ];

  const createCards = (p: p5, amount: number = 25) => {
    for (let i = 0; i < amount; i++) {
      const pos = utils.randomPositionInPolygon(p, cardsArea);
      const size = p.random() < 0.3 ? "S" : p.random() < 0.6 ? "M" : "L";
      const speed = p.random(0.5, 2);
      cards.push({ x: pos.x, y: pos.y, size, speed });
    }
  };

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
    cardL = await utils.loadImage(p, cardLUrl);
    cardM = await utils.loadImage(p, cardMUrl);
    cardS = await utils.loadImage(p, cardSUrl);

    createCards(p, 50);
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
    p.image(sand, 0, config.screens.center.height - sand.height);

    p.image(cloudRight, cloudRightX, 400);

    for (let i = 0; i < cards.length; i++) {
      let cardImage: p5.Image;
      switch (cards[i].size) {
        case "L":
          cardImage = cardL;
          break;
        case "M":
          cardImage = cardM;
          break;
        case "S":
          cardImage = cardS;
          break;
      }

      cards[i].x += cards[i].speed;
      cards[i].y -= cards[i].speed * 0.67;

      if (cards[i].x > p.width || cards[i].y < -cardImage.height) {
        const pos = utils.randomPositionInPolygon(p, baseCardsArea);
        cards[i].x = pos.x;
        cards[i].y = pos.y;
      }

      p.image(
        cardImage,
        cards[i].x,
        cards[i].y,
        cardImage.width,
        cardImage.height
      );
    }

    p.image(cloudCenter, cloudCenterX, 140);
    p.image(cloudLeft, cloudLeftX, 320);

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
