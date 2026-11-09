/* global Buffer, console, process, document, window, MessageChannel, CSSAnimation */
/*
 * Films Whiteboard AMDEC's thumbnail (journal n° 106) and encodes it for the card:
 *   src/apps/atelier/medias/alpine-film-av1.mp4    AV1, for machines that decode it in hardware
 *   src/apps/atelier/medias/alpine-film-h264.mp4   H.264, for every other one
 *   src/apps/atelier/medias/alpine-affiche.webp    the poster at rest, shown until the video plays
 *
 * The film is shot frame by frame from alpine-scene/tournage.html: the page's timers run on a fake
 * clock, and every animation is held and set to the frame's time, so each frame is exact. The loop
 * is sewn at COUTURE, in the middle of the sheet, where the poster is hidden: its own animations and
 * readings, which do not share the film's period, never jump in view. The poster at rest (the film's
 * own start) falls at AFFICHE seconds into the video, on a key frame: the card starts there.
 *
 * With `pnpm dev` running:
 *   FFMPEG=/path/to/ffmpeg node scripts/tournerAlpine.mjs [http://127.0.0.1:5173]
 * FFMPEG needs libsvtav1, libx264 and libwebp (a static build, such as pip's imageio-ffmpeg, has them).
 * CHROMIUM may point at a Chromium binary when Playwright's own is missing; BRUT keeps the lossless
 * shoot at that path, to try other encodings.
 */
import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium } from '@playwright/test';

const base = (process.argv[2] ?? 'http://127.0.0.1:5173').replace(/\/$/, '');
const ffmpeg = process.env.FFMPEG ?? 'ffmpeg';
const IPS = 30;
const MEDIAS = 'src/apps/atelier/medias';
/** Film time (ms) where the loop is sewn: the sheet is being filled, the poster is hidden. */
const COUTURE = 10_000;

const ff = (args, stdin = 'ignore') => {
  const p = spawn(ffmpeg, ['-y', '-hide_banner', '-loglevel', 'error', ...args], { stdio: [stdin, 'inherit', 'inherit'] });
  const fini = new Promise((ok, ko) => p.on('close', (code) => (code === 0 ? ok() : ko(new Error(`ffmpeg s'est arrêté (${code})`)))));
  return { p, fini };
};

const dossier = await mkdtemp(join(tmpdir(), 'tournage-'));
const brut = process.env.BRUT ?? join(dossier, 'film.mkv');
try {
  const navigateur = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
  const page = await navigateur.newPage({ viewport: { width: 512, height: 288 }, deviceScaleFactor: 2 });
  await page.clock.install({ time: 0 });
  await page.goto(`${base}/src/apps/atelier/alpine-scene/tournage.html`);
  await page.waitForSelector('.as[data-pret]', { timeout: 180_000 });
  await page.evaluate(() => document.fonts.ready);

  // Every animation held; the film's own (Web Animations) told apart from the poster's (CSS).
  const cycle = await page.evaluate(() => {
    const scene = document.querySelector('.as');
    const horloge = scene.getAnimations().find((a) => !(a instanceof CSSAnimation) && a.effect.getTiming().duration > 20_000);
    const toutes = document.getAnimations();
    for (const a of toutes) a.pause();
    window.piste = new Set(toutes.filter((a) => !(a instanceof CSSAnimation) && a.constructor.name === 'Animation'));
    window.nees = new WeakMap();
    window.premiere = true;
    // Sets the scene at film time T: the film at T within its cycle, each CSS animation at its age.
    window.pose = async (T, cycle) => {
      // let React commit what the clock's timers changed
      for (let i = 0; i < 3; i++)
        await new Promise((r) => {
          const c = new MessageChannel();
          c.port1.onmessage = r;
          c.port2.postMessage(0);
        });
      for (const a of document.getAnimations()) {
        a.pause();
        if (window.piste.has(a)) a.currentTime = T % cycle;
        else {
          // the poster's animations have run since the film began; a later one, since it appeared
          if (!window.nees.has(a)) window.nees.set(a, window.premiere ? 0 : T);
          a.currentTime = T - window.nees.get(a);
        }
      }
      window.premiere = false;
    };
    return horloge.effect.getTiming().duration;
  });
  const n = Math.round((cycle / 1000) * IPS);
  console.log(`cycle de ${cycle / 1000} s, ${n} images`);

  const prise = ff(['-f', 'image2pipe', '-framerate', String(IPS), '-c:v', 'png', '-i', '-', '-c:v', 'ffv1', '-pix_fmt', 'bgr0', brut], 'pipe');
  let horloge = 0;
  for (let k = 0; k < n; k++) {
    const T = COUTURE + (k * 1000) / IPS;
    const pas = Math.round(T - horloge);
    if (pas > 0) await page.clock.runFor(pas);
    horloge += pas;
    await page.evaluate(([t, c]) => window.pose(t, c), [T, cycle]);
    const image = await page.locator('#plateau').screenshot();
    if (!prise.p.stdin.write(Buffer.from(image))) await new Promise((r) => prise.p.stdin.once('drain', r));
    if (k % IPS === 0) console.log(`${k / IPS} / ${cycle / 1000} s`);
  }
  prise.p.stdin.end();
  await prise.fini;
  await navigateur.close();

  // The poster at rest is the film's start: (cycle − COUTURE) into the video, made a key frame
  // (-g), so that the card can start there at once.
  const affiche = Math.round(((cycle - COUTURE) / 1000) * IPS);
  const commun = ['-i', brut, '-an', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-g', String(affiche)];
  await ff([...commun, '-c:v', 'libsvtav1', '-preset', '5', '-crf', '52', '-svtav1-params', 'scd=0', join(MEDIAS, 'alpine-film-av1.mp4')]).fini;
  await ff([...commun, '-c:v', 'libx264', '-preset', 'slower', '-crf', '32', '-keyint_min', String(affiche), '-sc_threshold', '0', join(MEDIAS, 'alpine-film-h264.mp4')]).fini;
  await ff(['-i', brut, '-vf', `select=eq(n\\,${affiche})`, '-frames:v', '1', '-c:v', 'libwebp', '-quality', '82', '-compression_level', '6', join(MEDIAS, 'alpine-affiche.webp')]).fini;
  console.log(`fini : l'affiche est à ${affiche / IPS} s de la vidéo`);
} finally {
  await rm(dossier, { recursive: true, force: true });
}
