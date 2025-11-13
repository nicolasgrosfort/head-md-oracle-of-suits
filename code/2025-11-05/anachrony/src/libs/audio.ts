import * as Tone from "tone";

import songUrl from "../assets/audios/audio.m4a";
import clacUrl from "../assets/audios/clac.m4a";
import drawCardUrl from "../assets/audios/draw-card.mp3";
import loaderUrl from "../assets/audios/loader.mp3";
import portalUrl from "../assets/audios/portal.mp3";

export let isSongLoaded = false;
export let isClacLoaded = false;
export let isPortalLoaded = false;
export let isLoaderLoaded = false;
export let isDrawCardLoaded = false;

export let song: Tone.Player;
export let clac: Tone.Player;
export let portal: Tone.Player;
export let loader: Tone.Player;
export let drawCard: Tone.Player;

export const load = () => {
  song = new Tone.Player({
    url: songUrl,
    autostart: true,
    loop: true,
    fadeIn: 4,
    fadeOut: 2,
    onload: () => {
      isSongLoaded = true;
      console.log("Song loaded");
    },
  }).toDestination();

  clac = new Tone.Player({
    url: clacUrl,
    autostart: false,
    onload: () => {
      isClacLoaded = true;
    },
  }).toDestination();

  portal = new Tone.Player({
    url: portalUrl,
    autostart: false,
    onload: () => {
      isPortalLoaded = true;
    },
  }).toDestination();

  loader = new Tone.Player({
    url: loaderUrl,
    autostart: false,
    onload: () => {
      isLoaderLoaded = true;
    },
  }).toDestination();

  drawCard = new Tone.Player({
    url: drawCardUrl,
    autostart: false,
    onload: () => {
      isDrawCardLoaded = true;
    },
  }).toDestination();
};

export const toggle = () => {
  if (!isSongLoaded) return;
  if (song.state === "stopped") song.start();
  else if (song.state === "started") song.stop();
};
