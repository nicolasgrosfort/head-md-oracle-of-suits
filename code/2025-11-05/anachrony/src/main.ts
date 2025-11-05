import p5 from "p5";

import * as mediaPipe from "./libs/media-pipe";
import * as utils from "./utils/utils";

new p5((p: p5) => {
  p.setup = async () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    await mediaPipe.initialize(p);
  };

  p.draw = () => {
    p.background(220);
    mediaPipe.detect();

    const video = mediaPipe.getVideo();
    utils.drawVideo(p, video, { hide: true });

    const handResults = mediaPipe.getGestureResults();
    utils.drawHands(p, handResults);

    const faceResults = mediaPipe.getFaceResults();
    utils.drawFace(p, faceResults);

    const poseResults = mediaPipe.getPoseResults();
    utils.drawBody(p, poseResults);
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };
});
