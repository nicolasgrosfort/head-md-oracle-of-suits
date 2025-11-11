import p5 from "p5";

import * as audio from "../libs/audio";
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

import hanafudaUrl from "../assets/images/hanafuda-skew.png";
import italianUrl from "../assets/images/italian-skew.png";
import mamlukUrl from "../assets/images/mamluk-skew.png";
import ramolosUrl from "../assets/images/pokemon-ramolos-skew.png";
import pokemonUrl from "../assets/images/pokemon-skew.png";
import tarotUrl from "../assets/images/tarot-skew.png";

import hanafudaFullUrl from "../assets/images/hanafuda.png";
import italianFullUrl from "../assets/images/italian.png";
import mamlukFullUrl from "../assets/images/mamluk.png";
import pokemonFullUrl from "../assets/images/pokemon.png";
import ramolosFullUrl from "../assets/images/ramolos.png";
import tarotFullUrl from "../assets/images/tarot.png";

import vesselUrl from "../assets/images/vessel.png";

const MAX_ZONE_RADIUS = 200;
const MIN_ZONE_RADIUS = 50;
const MAX_TIME_PROMPT = 10000;

const color = {
  blue: "#A8EEFE",
};

const cardPrompts = {
  Hanafuda: {
    title: "HANAFUDA",
    description: `Careful! These flower cards were once used for secret gambling in Japan.
    
    Nintendo actually started as a Hanafuda company long before making consoles...`,
  },

  Italian: {
    title: "ITALIAN",
    description: `Ah, the Latin ancestors of modern suits! 

    Swords, Cups, Coins, and Clubs—perfect tools for both fortune-telling and bar fights in Renaissance taverns.`,
  },

  Mamluk: {
    title: "MAMLUK",
    description: `Legend says these golden cards traveled from Egypt to Europe by caravan.
    
    It carrying the DNA of all modern decks—minus the queens, who appeared later.`,
  },

  Ramolos: {
    title: "RAMOLOS",
    description: `Oh! Looks like a Slowpoke has wandered in. It doesn't belong here.
    
    Plus, it's a shiny, a very rare version of this card...`,
  },

  Pokemon: {
    title: "POKEMON",
    description: `These creatures turned playgrounds into stock exchanges.
    
    Somewhere, a Charizard is still worth more than your rent.`,
  },

  Tarot: {
    title: "TAROT",
    description: `Originally a noble card game before becoming mystical, it’s now both art and prophecy.
    
    Be careful—The Fool might just predict your next design sprint.`,
  },
};

export const createMmkScene = (p: p5): Scene => {
  let zoomFactor = 2;
  let zoomSize = 300;
  let magnifier: p5.Graphics;

  let cloudLeft: p5.Image;
  let cloudCenter: p5.Image;
  let cloudRight: p5.Image;
  let sun: p5.Image;
  let sand: p5.Image;
  let cardL: p5.Image;
  let cardM: p5.Image;
  let cardS: p5.Image;
  let hanafuda: p5.Image;
  let pokemon: p5.Image;
  let tarot: p5.Image;
  let italian: p5.Image;
  let mamluk: p5.Image;
  let ramolos: p5.Image;
  let pokemonFull: p5.Image;
  let tarotFull: p5.Image;
  let italianFull: p5.Image;
  let hanafudaFull: p5.Image;
  let mamlukFull: p5.Image;
  let ramolosFull: p5.Image;
  let vessel: p5.Image;

  let cloudLeftX = 0;
  let cloudCenterX = 0;
  let cloudRightX = 0;

  let cloudLeftDirection = 1;
  let cloudCenterDirection = -1;
  let cloudRightDirection = -1;

  let isAnyHand = false;
  let handX = 0;
  let handY = 0;

  let lastFrameTime = 0;

  let frameDuringVessel = 0;
  let isOnVessel = false;
  let zoneRadius = MAX_ZONE_RADIUS;
  let vesselX = 70;
  let vesselY = 500;

  let cards: Array<{
    x: number;
    y: number;
    size: "S" | "M" | "L";
    speed: number;
    card?: "Hanafuda" | "Pokemon" | "Tarot" | "Italian" | "Ramolos" | "Mamluk";
  }> = [];

  let prompt = { title: "", description: "" };

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
    const specialCards: Array<
      "Hanafuda" | "Pokemon" | "Tarot" | "Italian" | "Ramolos" | "Mamluk"
    > = ["Hanafuda", "Pokemon", "Tarot", "Italian", "Ramolos", "Mamluk"];

    let specialCardsUsed = 0;

    for (let i = 0; i < amount; i++) {
      const pos = utils.randomPositionInPolygon(p, cardsArea);
      const size = p.random() < 0.3 ? "S" : p.random() < 0.6 ? "M" : "L";
      const speed = p.random(0.5, 2);

      let card:
        | "Hanafuda"
        | "Pokemon"
        | "Tarot"
        | "Italian"
        | "Ramolos"
        | "Mamluk"
        | undefined = undefined;

      // Assigner une carte spéciale seulement s'il en reste et avec une probabilité faible
      if (specialCardsUsed < specialCards.length && p.random() < 0.15) {
        card = specialCards[specialCardsUsed];
        specialCardsUsed++;
      }

      cards.push({ x: pos.x, y: pos.y, size, speed, card });
    }
  };
  const drawMagnifier = () => {
    const copySize = zoomSize / zoomFactor;
    const sx = handX - copySize / 2;
    const sy = handY - copySize / 2;

    p.push();
    const zoomedRegion = magnifier.get(sx, sy, copySize, copySize);

    // Activer le smooth pour la loupe uniquement
    (zoomedRegion as any).loadPixels();

    p.drawingContext.save();
    p.drawingContext.beginPath();
    p.drawingContext.arc(handX, handY, zoomSize / 2, 0, p.TWO_PI);
    p.drawingContext.clip();

    // Activer l'interpolation pour un zoom lisse
    p.drawingContext.imageSmoothingEnabled = true;
    p.drawingContext.imageSmoothingQuality = "high";

    p.translate(handX - zoomSize / 2, handY - zoomSize / 2);
    p.image(zoomedRegion, 0, 0, zoomSize, zoomSize);

    p.drawingContext.restore();

    p.noFill();
    p.stroke(0);
    p.strokeWeight(4);
    p.circle(handX, handY, zoomSize);
    p.pop();
  };

  const drawScene = (pg: p5 | p5.Graphics, isMagnifier?: boolean) => {
    pg.background(color.blue);

    utils.image(pg, sun, config.screens.center.x - sun.width * 0.25 + 160, 40);
    utils.image(pg, sand, 0, config.screens.center.height - sand.height * 0.25);
    utils.image(pg, cloudLeft, cloudLeftX, 320);

    utils.image(pg, vessel, vesselX, vesselY);

    for (let card of cards) {
      let cardImage: p5.Image;

      if (isMagnifier && card.card) {
        // Dans le magnifier, afficher les cartes spéciales
        switch (card.card) {
          case "Hanafuda":
            cardImage = hanafuda;
            break;
          case "Pokemon":
            cardImage = pokemon;
            break;
          case "Tarot":
            cardImage = tarot;
            break;
          case "Italian":
            cardImage = italian;
            break;
          case "Ramolos":
            cardImage = ramolos;
            break;
          case "Mamluk":
            cardImage = mamluk;
            break;
          default:
            cardImage =
              card.size === "L" ? cardL : card.size === "M" ? cardM : cardS;
        }
      } else {
        // Dans la scène normale, afficher les cartes blanches selon leur taille
        cardImage =
          card.size === "L" ? cardL : card.size === "M" ? cardM : cardS;
      }

      const ratio = card.size === "L" ? 1 : card.size === "M" ? 0.9 : 0.8;

      utils.image(pg, cardImage, card.x, card.y, { ratio: 0.25 * ratio });
    }

    utils.image(pg, cloudRight, cloudRightX, 340);
    utils.image(pg, cloudCenter, cloudCenterX, 140);

    if (isOnVessel) {
      p.push();
      p.fill(255, 80);
      p.stroke(0);
      p.circle(
        vesselX + vessel.width * 0.25 * 0.5,
        vesselY + vessel.height * 0.25 * 0.5,
        zoneRadius * 2
      );
      p.pop();
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

      hanafuda = await utils.loadImage(p, hanafudaUrl, 1);
      pokemon = await utils.loadImage(p, pokemonUrl, 1);
      tarot = await utils.loadImage(p, tarotUrl, 1);
      italian = await utils.loadImage(p, italianUrl, 1);
      mamluk = await utils.loadImage(p, mamlukUrl, 1);
      ramolos = await utils.loadImage(p, ramolosUrl, 1);

      pokemonFull = await utils.loadImage(p, pokemonFullUrl, 1);
      tarotFull = await utils.loadImage(p, tarotFullUrl, 1);
      italianFull = await utils.loadImage(p, italianFullUrl, 1);
      hanafudaFull = await utils.loadImage(p, hanafudaFullUrl, 1);
      mamlukFull = await utils.loadImage(p, mamlukFullUrl, 1);
      ramolosFull = await utils.loadImage(p, ramolosFullUrl, 1);

      vessel = await utils.loadImage(p, vesselUrl, 1);
      frameDuringVessel = 0;
      isOnVessel = false;

      magnifier = p.createGraphics(config.sketch.width, config.sketch.height);
      magnifier.pixelDensity(zoomFactor);
      magnifier.textFont("Monospace");

      cards = [];
      createCards(p, 36);
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

        const vesselWidth = vessel.width * 0.25;
        const vesselHeight = vessel.height * 0.25;

        const isHandOnVessel =
          handX > vesselX &&
          handX < vesselX + vesselWidth &&
          handY > vesselY &&
          handY < vesselY + vesselHeight;

        if (isHandOnVessel) {
          frameDuringVessel++;
          isOnVessel = true;

          zoneRadius = p.map(
            frameDuringVessel,
            config.frame.toTravel,
            0,
            MIN_ZONE_RADIUS,
            MAX_ZONE_RADIUS
          );

          prompt.title = "";
          prompt.description = "";

          if (frameDuringVessel >= config.frame.toTravel) {
            frameDuringVessel = 0;
            audio.portal.start();
            sceneManager.switchTo("itr");
          }
        } else {
          frameDuringVessel = 0;
          isOnVessel = false;
        }
      });

      if (!isAnyHand) {
        handX = 0;
        handY = 0;
      }

      // Mettre à jour les cartes et détecter les collisions
      // TODO : cleanup, plus la même logique
      for (let i = cards.length - 1; i >= 0; i--) {
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
        cards[i].y -= cards[i].speed * 0.6;

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
            const cardType = cards[i].card;
            if (!cardType) continue;

            prompt.title = cardPrompts[cardType]?.title || cardType;
            prompt.description = cardPrompts[cardType]?.description;

            lastFrameTime = p.millis();
          }
        }
      }

      if (lastFrameTime > 0 && p.millis() - lastFrameTime > MAX_TIME_PROMPT) {
        prompt.title = "";
        prompt.description = "";
        lastFrameTime = 0;
      }

      drawScene(p);
      drawScene(magnifier, true);

      if (isAnyHand && !isOnVessel) {
        drawMagnifier();
      }

      isAnyHand = false;

      if (prompt.title) {
        p.push();
        p.fill(255, 255, 255, 200);
        p.noStroke();
        p.rect(
          config.screens.right.x,
          config.screens.right.y,
          config.screens.right.width,
          config.screens.right.height,
          20
        );
        p.pop();

        p.push();
        p.textSize(40);
        p.fill(0);
        p.noStroke();
        p.textAlign(p.LEFT, p.TOP);
        p.textStyle(p.BOLD);
        p.text(
          prompt.title,
          config.screens.right.x + 30,
          config.screens.right.y + 40
        );
        p.textSize(30);
        p.textStyle(p.NORMAL);
        p.text(
          prompt.description,
          config.screens.right.x + 30,
          config.screens.right.y + 110,
          config.screens.right.width - 40,
          config.screens.right.height - 100
        );
        p.pop();

        // Display full card image on the screen left
        let fullCardImage: p5.Image;
        switch (prompt.title) {
          case "HANAFUDA":
            fullCardImage = hanafudaFull;
            break;
          case "POKEMON":
            fullCardImage = pokemonFull;
            break;
          case "TAROT":
            fullCardImage = tarotFull;
            break;
          case "ITALIAN":
            fullCardImage = italianFull;
            break;
          case "RAMOLOS":
            fullCardImage = ramolosFull;
            break;
          default:
            fullCardImage = mamlukFull;
        }

        const maxWidth = config.screens.left.width - 60;
        const maxHeight = config.screens.left.height - 60;
        let displayWidth = fullCardImage.width;
        let displayHeight = fullCardImage.height;

        // Scale down if necessary
        if (displayWidth > maxWidth) {
          const scaleFactor = maxWidth / displayWidth;
          displayWidth = maxWidth;
          displayHeight *= scaleFactor;
        }

        if (displayHeight > maxHeight) {
          const scaleFactor = maxHeight / displayHeight;
          displayHeight = maxHeight;
          displayWidth *= scaleFactor;
        }

        p.push();
        p.fill(255, 255, 255, 200);
        p.noStroke();
        p.rect(
          config.screens.left.x,
          config.screens.left.y,
          config.screens.left.width,
          config.screens.left.height,
          20
        );
        p.pop();

        p.image(
          fullCardImage,
          config.screens.left.x +
            (config.screens.left.width - displayWidth) / 2,
          config.screens.left.y +
            (config.screens.left.height - displayHeight) / 2,
          displayWidth,
          displayHeight
        );
      }

      const canvasContent = p.get();

      p.background(0);
      utils.drawScreens(p, config.screens, canvasContent);
    },

    cleanup: () => {},
  };
};
