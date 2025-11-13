import p5 from "p5";

import * as cardodex from "../libs/cardodex";
import * as interactionZone from "../libs/interaction-zone";
import * as magnifier from "../libs/magnifier";
import * as mediaPipe from "../libs/media-pipe";
import * as sceneManager from "../libs/scene-manager";
import * as config from "../utils/config";
import * as utils from "../utils/utils";

import type { Scene } from "../libs/scene-manager";

import cardLUrl from "../assets/images/card-skew-x-y-l.png";
import cardMUrl from "../assets/images/card-skew-x-y-m.png";
import cardSUrl from "../assets/images/card-skew-x-y-s.png";
import cloundCenterUrl from "../assets/images/cloud-center.png";
import cloudLeftUrl from "../assets/images/cloud-left.png";
import cloudRightUrl from "../assets/images/cloud-right.png";
import sandUrl from "../assets/images/mmk/sand.png";
import sunUrl from "../assets/images/sun.png";

import cardChinese1FullUrl from "../assets/images/mmk/card-chinese-1-full.png";
import cardHanafuda1FullUrl from "../assets/images/mmk/card-hanafuda-1-full.png";
import cardMmk1FullUrl from "../assets/images/mmk/card-mmk-1-full.png";
import cardMmk2FullUrl from "../assets/images/mmk/card-mmk-2-full.png";
import cardMmk3FullUrl from "../assets/images/mmk/card-mmk-3-full.png";
import cardMmk4FullUrl from "../assets/images/mmk/card-mmk-4-full.png";
import cardPachinon1FullUrl from "../assets/images/mmk/card-pachimon-1-full.png";
import cardTarotOsho1FullUrl from "../assets/images/mmk/card-tarot-osho-1-full.png";

import cardChinese1SkewUrl from "../assets/images/mmk/card-chinese-1-skew.png";
import cardHanafuda1SkewUrl from "../assets/images/mmk/card-hanafuda-1-skew.png";
import cardMmk1SkewUrl from "../assets/images/mmk/card-mmk-1-skew.png";
import cardMmk2SkewUrl from "../assets/images/mmk/card-mmk-2-skew.png";
import cardMmk3SkewUrl from "../assets/images/mmk/card-mmk-3-skew.png";
import cardMmk4SkewUrl from "../assets/images/mmk/card-mmk-4-skew.png";
import cardPachinon1SkewUrl from "../assets/images/mmk/card-pachimon-1-skew.png";
import cardTarotOsho1SkewUrl from "../assets/images/mmk/card-tarot-osho-1-skew.png";

import cardChineseSkewBlankUrl from "../assets/images/mmk/card-chinese-skew-blank.png";
import cardHanafudaSkewBlankUrl from "../assets/images/mmk/card-hanafuda-skew-blank.png";
import cardMmkSkewBlankUrl from "../assets/images/mmk/card-mmk-skew-blank.png";
import cardPachinonSkewBlankUrl from "../assets/images/mmk/card-pachimon-skew-blank.png";
import cardTarotOshoSkewBlankUrl from "../assets/images/mmk/card-tarot-osho-skew-blank.png";

import vesselUrl from "../assets/images/vessel.png";

type Card =
  | "CardMmk1"
  | "CardMmk2"
  | "CardMmk3"
  | "CardMmk4"
  | "CardPachimon1"
  | "CardTarotOsho1"
  | "CardChinese1"
  | "CardHanafuda1";

const specialCards: Array<Card> = [
  "CardMmk1",
  "CardMmk2",
  "CardMmk3",
  "CardMmk4",
  "CardPachimon1",
  "CardTarotOsho1",
  "CardChinese1",
  "CardHanafuda1",
];

const color = {
  blue: "#A8EEFE",
};

const cardPrompts = {
  CardMmk1: {
    title: "8 of Cups Tuman",
    description: `A rare find! This card blends the classic suit of Cups with the enigmatic Tuman design.
    Perfect for those who appreciate both tradition and mystery in their decks.`,
    type: "Mameluk Card",
    date: "1500",
  },
  CardMmk2: {
    title: "Deputy Na'ib",
    description: `A rare find! This card blends the classic suit of Cups with the enigmatic Tuman design.
    Perfect for those who appreciate both tradition and mystery in their decks.`,
    type: "Mameluk Card",
    date: "1500",
  },
  CardMmk3: {
    title: "Second deputy Na'ib thani",
    description: `A rare find! This card blends the classic suit of Cups with the enigmatic Tuman design.
    Perfect for those who appreciate both tradition and mystery in their decks.`,
    type: "Mameluk Card",
    date: "1500",
  },
  CardMmk4: {
    title: "King Malik",
    description: `A rare find! This card blends the classic suit of Cups with the enigmatic Tuman design.
    Perfect for those who appreciate both tradition and mystery in their decks.`,
    type: "Mameluk Card",
    date: "1500",
  },
  CardPachimon1: {
    title: "Pachimon Card 1",
    description: `An intriguing Pachimon card, showcasing unique artwork and symbolism.
    A must-have for collectors of rare and exotic playing cards.`,
    type: "Pachimon Card",
    date: "1800",
  },
  CardTarotOsho1: {
    title: "Osho Zen Tarot Card 1",
    description: `A captivating card from the Osho Zen Tarot deck, known for its deep spiritual insights.
    Ideal for those seeking enlightenment through their tarot readings.`,
    type: "Osho Zen Tarot Card",
    date: "1970",
  },
  CardChinese1: {
    title: "Chinese Playing Card 1",
    description: `A beautifully crafted Chinese playing card, rich in cultural heritage and design.
    Perfect for enthusiasts of traditional Asian card games.`,
    type: "Chinese Playing Card",
    date: "1600",
  },
  CardHanafuda1: {
    title: "Hanafuda Card 1",
    description: `A stunning Hanafuda card, featuring intricate floral designs and vibrant colors.
    A prized addition for fans of Japanese card games and art.`,
    type: "Hanafuda Card",
    date: "1700",
  },
};

export const createMmkScene = (p: p5): Scene => {
  let cloudLeft: p5.Image;
  let cloudCenter: p5.Image;
  let cloudRight: p5.Image;

  let sun: p5.Image;
  let sand: p5.Image;

  let cardL: p5.Image;
  let cardM: p5.Image;
  let cardS: p5.Image;

  let vessel: p5.Image;

  let cardMmk1Full: p5.Image;
  let cardMmk2Full: p5.Image;
  let cardMmk3Full: p5.Image;
  let cardMmk4Full: p5.Image;
  let cardPachinon1Full: p5.Image;
  let cardTarotOsho1Full: p5.Image;
  let cardChinese1Full: p5.Image;
  let cardHanafuda1Full: p5.Image;

  let cardMmk1Skew: p5.Image;
  let cardMmk2Skew: p5.Image;
  let cardMmk3Skew: p5.Image;
  let cardMmk4Skew: p5.Image;
  let cardPachinon1Skew: p5.Image;
  let cardTarotOsho1Skew: p5.Image;
  let cardChinese1Skew: p5.Image;
  let cardHanafuda1Skew: p5.Image;

  let cardMmkSkewBlank: p5.Image;
  let cardPachinonSkewBlank: p5.Image;
  let cardTarotOshoSkewBlank: p5.Image;
  let cardChineseSkewBlank: p5.Image;
  let cardHanafudaSkewBlank: p5.Image;

  let cloudLeftX = 0;
  let cloudCenterX = 0;
  let cloudRightX = 0;

  let cloudLeftDirection = 1;
  let cloudCenterDirection = -1;
  let cloudRightDirection = -1;

  let isAnyHand = false;
  let handX = 0;
  let handY = 0;

  let isOnVessel = false;
  let vesselX = 70;
  let vesselY = 500;

  let cards: Array<{
    x: number;
    y: number;
    size: "S" | "M" | "L" | "default";
    speed: number;
    card?: Card | "blank";
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
    // Create blank cards
    for (let i = 0; i < amount; i++) {
      const pos = utils.randomPositionInPolygon(p, cardsArea);
      const size = p.random() < 0.3 ? "S" : p.random() < 0.6 ? "M" : "L";
      const speed = p.random(0.5, 2);

      cards.push({ x: pos.x, y: pos.y, size, speed, card: "blank" });
    }

    // Create special cards
    for (const specialCard of specialCards) {
      const pos = utils.randomPositionInPolygon(p, cardsArea);
      const speed = p.random(0.5, 2);

      cards.push({
        x: pos.x,
        y: pos.y,
        size: "default",
        speed,
        card: specialCard,
      });
    }
  };

  const drawScene = (pg: p5 | p5.Graphics, isMagnifier?: boolean) => {
    pg.background(color.blue);

    utils.image(pg, sun, config.screens.center.x - sun.width * 0.25 + 160, 40);
    utils.image(pg, sand, 0, config.screens.center.height - sand.height * 0.25);
    utils.image(pg, cloudLeft, cloudLeftX, 320);

    utils.image(pg, vessel, vesselX, vesselY);

    for (let card of cards) {
      let cardImage: p5.Image | null = null;

      if (isMagnifier && card.card) {
        console.log(card.card);
        switch (card.card) {
          case "CardMmk1":
            cardImage = cardMmk1Skew;
            break;
          case "CardMmk2":
            cardImage = cardMmk2Skew;
            break;
          case "CardMmk3":
            cardImage = cardMmk3Skew;
            break;
          case "CardMmk4":
            cardImage = cardMmk4Skew;
            break;
          case "CardPachimon1":
            cardImage = cardPachinon1Skew;
            break;
          case "CardTarotOsho1":
            cardImage = cardTarotOsho1Skew;
            break;
          case "CardChinese1":
            cardImage = cardChinese1Skew;
            break;
          case "CardHanafuda1":
            cardImage = cardHanafuda1Skew;
            break;
          case "blank":
            cardImage =
              card.size === "L" ? cardL : card.size === "M" ? cardM : cardS;
        }
      } else {
        switch (card.card) {
          case "CardMmk1":
            cardImage = cardMmkSkewBlank;
            break;
          case "CardMmk2":
            cardImage = cardMmkSkewBlank;
            break;
          case "CardMmk3":
            cardImage = cardMmkSkewBlank;
            break;
          case "CardMmk4":
            cardImage = cardMmkSkewBlank;
            break;
          case "CardPachimon1":
            cardImage = cardPachinonSkewBlank;
            break;
          case "CardTarotOsho1":
            cardImage = cardTarotOshoSkewBlank;
            break;
          case "CardChinese1":
            cardImage = cardChineseSkewBlank;
            break;
          case "CardHanafuda1":
            cardImage = cardHanafudaSkewBlank;
            break;
          case "blank":
            cardImage =
              card.size === "L" ? cardL : card.size === "M" ? cardM : cardS;
        }
      }

      if (!cardImage) continue;

      utils.image(pg, cardImage, card.x, card.y);
    }

    utils.image(pg, cloudRight, cloudRightX, 340);
    utils.image(pg, cloudCenter, cloudCenterX, 140);

    if (isOnVessel && !isMagnifier) {
      interactionZone.draw(p, "vessel", true);
    }
  };

  return {
    setup: async () => {
      cloudLeft = await utils.loadImage(p, cloudLeftUrl, 1);
      cloudLeftX = 40;

      cloudCenter = await utils.loadImage(p, cloundCenterUrl, 1);
      cloudCenterX = p.width * 0.5;

      cloudRight = await utils.loadImage(p, cloudRightUrl, 1);
      cloudRightX = p.width - 40 - cloudRight.width * 0.25;

      sand = await utils.loadImage(p, sandUrl, 1);
      sun = await utils.loadImage(p, sunUrl, 1);
      cardL = await utils.loadImage(p, cardLUrl, 1);
      cardM = await utils.loadImage(p, cardMUrl, 1);
      cardS = await utils.loadImage(p, cardSUrl, 1);

      cardMmk1Full = await utils.loadImage(p, cardMmk1FullUrl, 1);
      cardMmk2Full = await utils.loadImage(p, cardMmk2FullUrl, 1);
      cardMmk3Full = await utils.loadImage(p, cardMmk3FullUrl, 1);
      cardMmk4Full = await utils.loadImage(p, cardMmk4FullUrl, 1);
      cardChinese1Full = await utils.loadImage(p, cardChinese1FullUrl, 1);
      cardPachinon1Full = await utils.loadImage(p, cardPachinon1FullUrl, 1);
      cardTarotOsho1Full = await utils.loadImage(p, cardTarotOsho1FullUrl, 1);
      cardHanafuda1Full = await utils.loadImage(p, cardHanafuda1FullUrl, 1);

      cardMmk1Skew = await utils.loadImage(p, cardMmk1SkewUrl, 1);
      cardMmk2Skew = await utils.loadImage(p, cardMmk2SkewUrl, 1);
      cardMmk3Skew = await utils.loadImage(p, cardMmk3SkewUrl, 1);
      cardMmk4Skew = await utils.loadImage(p, cardMmk4SkewUrl, 1);
      cardChinese1Skew = await utils.loadImage(p, cardChinese1SkewUrl, 1);
      cardPachinon1Skew = await utils.loadImage(p, cardPachinon1SkewUrl, 1);
      cardTarotOsho1Skew = await utils.loadImage(p, cardTarotOsho1SkewUrl, 1);
      cardHanafuda1Skew = await utils.loadImage(p, cardHanafuda1SkewUrl, 1);

      cardMmkSkewBlank = await utils.loadImage(p, cardMmkSkewBlankUrl, 1);
      cardPachinonSkewBlank = await utils.loadImage(
        p,
        cardPachinonSkewBlankUrl,
        1
      );
      cardTarotOshoSkewBlank = await utils.loadImage(
        p,
        cardTarotOshoSkewBlankUrl,
        1
      );
      cardChineseSkewBlank = await utils.loadImage(
        p,
        cardChineseSkewBlankUrl,
        1
      );
      cardHanafudaSkewBlank = await utils.loadImage(
        p,
        cardHanafudaSkewBlankUrl,
        1
      );

      vessel = await utils.loadImage(p, vesselUrl, 1);
      isOnVessel = false;

      magnifier.create(p, "mmk", {
        zoomFactor: 2,
        size: 300,
        strokeWeight: 4,
        strokeColor: config.color.black,
      });

      cards = [];
      createCards(p, 22);

      interactionZone.create("vessel", {
        x: vesselX,
        y: vesselY,
        width: vessel.width * 0.25,
        height: vessel.height * 0.25,
        requiredFrames: config.frame.toTravel,
        onProgress: () => {
          cardodex.clear();
        },
        onComplete: () => {
          console.log("Vessel interaction complete");
          sceneManager.switchTo("itr");
        },
      });
    },

    draw: () => {
      console.log("Drawing MMK scene");

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
        p.width - cloudRight.width * 0.25 - 40 - 400,
        p.width - cloudRight.width * 0.25 - 40,
        0.2,
        cloudRightX,
        cloudRightDirection
      );
      cloudRightX = rightResult.x;
      cloudRightDirection = rightResult.direction;

      mediaPipe.onHandMove((hand) => {
        isAnyHand = true;
        handX = hand.x * config.sketch.width;
        handY = hand.y * config.sketch.height;

        interactionZone.update("vessel", handX, handY);
        isOnVessel = interactionZone.isActive("vessel");
      });

      if (!isAnyHand) {
        handX = 0;
        handY = 0;
        interactionZone.reset("vessel");
        isOnVessel = false;
      }

      // Mettre à jour les cartes et détecter les collisions
      // TODO : cleanup, plus la même logique
      for (let i = cards.length - 1; i >= 0; i--) {
        let cardImage: p5.Image | null = null;
        const cardType = cards[i].card;

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
          case "default":
            switch (cardType) {
              case "CardMmk1":
                cardImage = cardMmkSkewBlank;
                break;
              case "CardMmk2":
                cardImage = cardMmkSkewBlank;
                break;
              case "CardMmk3":
                cardImage = cardMmkSkewBlank;
                break;
              case "CardMmk4":
                cardImage = cardMmkSkewBlank;
                break;
              case "CardPachimon1":
                cardImage = cardPachinonSkewBlank;
                break;
              case "CardTarotOsho1":
                cardImage = cardTarotOshoSkewBlank;
                break;
              case "CardChinese1":
                cardImage = cardChineseSkewBlank;
                break;
              case "CardHanafuda1":
                cardImage = cardHanafudaSkewBlank;
                break;
            }
        }

        cards[i].x += cards[i].speed;
        cards[i].y -= cards[i].speed * 0.6;

        if (!cardImage) continue;

        if (cards[i].x > p.width || cards[i].y < -cardImage.height) {
          const pos = utils.randomPositionInPolygon(p, baseCardsArea);
          cards[i].x = pos.x;
          cards[i].y = pos.y;
        }

        // Collision avec la position lissée (handX, handY)
        if (isAnyHand) {
          const ratio =
            cards[i].size === "L" ? 1 : cards[i].size === "M" ? 0.9 : 0.8;

          if (
            handX > cards[i].x &&
            handX < cards[i].x + cardImage.width * 0.25 * ratio &&
            handY > cards[i].y &&
            handY < cards[i].y + cardImage.height * 0.25 * ratio
          ) {
            if (!cardType) continue;

            let fullCardImage: p5.Image | null = null;

            switch (cardType) {
              case "CardMmk1":
                fullCardImage = cardMmk1Full;
                break;
              case "CardMmk2":
                fullCardImage = cardMmk2Full;
                break;
              case "CardMmk3":
                fullCardImage = cardMmk3Full;
                break;
              case "CardMmk4":
                fullCardImage = cardMmk4Full;
                break;
              case "CardPachimon1":
                fullCardImage = cardPachinon1Full;
                break;
              case "CardTarotOsho1":
                fullCardImage = cardTarotOsho1Full;
                break;
              case "CardChinese1":
                fullCardImage = cardChinese1Full;
                break;
              case "CardHanafuda1":
                fullCardImage = cardHanafuda1Full;
                break;
            }

            if (!fullCardImage || cardType === "blank") continue;

            cardodex.setPrompt({
              ...cardPrompts[cardType],
              image: fullCardImage,
            });
          }
        }
      }

      drawScene(p, false);

      const magnifierGraphics = magnifier.getGraphics("mmk");
      if (magnifierGraphics) {
        drawScene(magnifierGraphics, true);
      }

      if (isAnyHand && !isOnVessel && magnifierGraphics) {
        magnifier.draw(p, "mmk", handX, handY, magnifierGraphics);
      }

      isAnyHand = false;

      const canvasContent = p.get();

      p.background(0);
      utils.drawScreens(p, config.screens, canvasContent);
      cardodex.draw(p);
    },

    cleanup: () => {
      interactionZone.remove("vessel");
      magnifier.remove("mmk");

      cardodex.clear();
    },
  };
};
