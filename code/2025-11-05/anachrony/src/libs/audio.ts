import * as Tone from "tone";

import songUrl from "../assets/audios/audio.m4a";
import clacUrl from "../assets/audios/clac.m4a";
import drawCardUrl from "../assets/audios/draw-card.mp3";
import loaderUrl from "../assets/audios/loader.mp3";
import lockUrl from "../assets/audios/lock.mp3";
import portalUrl from "../assets/audios/portal.mp3";
import successUrl from "../assets/audios/success.mp3";
import unlockUrl from "../assets/audios/unlock.mp3";

export let isSongLoaded = false;
export let isClacLoaded = false;
export let isPortalLoaded = false;
export let isLoaderLoaded = false;
export let isDrawCardLoaded = false;
export let isSuccessLoaded = false;
export let isUnlockLoaded = false;
export let isLockLoaded = false;

export let song: Tone.Player;
export let clac: Tone.Player;
export let portal: Tone.Player;
export let loader: Tone.Player;
export let drawCard: Tone.Player;
export let success: Tone.Player;
export let unlock: Tone.Player;
export let lock: Tone.Player;

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

  success = new Tone.Player({
    url: successUrl,
    autostart: false,
    onload: () => {
      isSuccessLoaded = true;
    },
  }).toDestination();

  unlock = new Tone.Player({
    url: unlockUrl,
    autostart: false,
    onload: () => {
      isUnlockLoaded = true;
    },
  }).toDestination();

  lock = new Tone.Player({
    url: lockUrl,
    autostart: false,
    onload: () => {
      isLockLoaded = true;
    },
  }).toDestination();
};

export const toggle = () => {
  if (!isSongLoaded) return;
  if (song.state === "stopped") song.start();
  else if (song.state === "started") song.stop();
};
