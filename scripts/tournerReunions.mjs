/* global Buffer, console, process, window */
/*
 * Films Synthèse de réunions' background (journal n° 105) and encodes it for the card:
 *   src/apps/atelier/medias/reunions-fond-av1.mp4   AV1, for machines that decode it in hardware
 *   src/apps/atelier/medias/reunions-fond-h264.mp4  H.264, for every other one
 *   src/apps/atelier/medias/reunions-fond.webp      the first frame, shown until the video plays
 *
 * With `pnpm dev` running:
 *   FFMPEG=/path/to/ffmpeg node scripts/tournerReunions.mjs [http://127.0.0.1:5173]
 * FFMPEG needs libsvtav1, libx264 and libwebp (a static build, such as pip's imageio-ffmpeg, has them).
 * CHROMIUM may point at a Chromium binary when Playwright's own is missing.
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

const ff = (args, stdin = 'ignore') => {
  const p = spawn(ffmpeg, ['-y', '-hide_banner', '-loglevel', 'error', ...args], { stdio: [stdin, 'inherit', 'inherit'] });
  const fini = new Promise((ok, ko) => p.on('close', (code) => (code === 0 ? ok() : ko(new Error(`ffmpeg s'est arrêté (${code})`)))));
  return { p, fini };
};

const dossier = await mkdtemp(join(tmpdir(), 'tournage-'));
const brut = join(dossier, 'fond.mkv');
try {
  // 1. Every frame of the loop, lossless
  const navigateur = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
  const page = await navigateur.newPage();
  await page.goto(`${base}/src/apps/atelier/reunions-scene/tournage.html`);
  await page.waitForSelector('body[data-pret]', { timeout: 180_000 });
  const { largeur, hauteur, boucle } = await page.evaluate(() => window.plateau);
  const n = Math.round(boucle * IPS);
  const prise = ff(
    ['-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${largeur}x${hauteur}`, '-r', String(IPS), '-i', '-', '-vf', 'vflip', '-c:v', 'ffv1', '-pix_fmt', 'bgr0', brut],
    'pipe',
  );
  for (let i = 0; i < n; i++) {
    const image = await page.evaluate((t) => window.image(t), i / IPS);
    if (!prise.p.stdin.write(Buffer.from(image, 'base64'))) await new Promise((r) => prise.p.stdin.once('drain', r));
    if (i % IPS === 0) console.log(`${i / IPS} / ${boucle} s`);
  }
  prise.p.stdin.end();
  await prise.fini;
  await navigateur.close();

  // 2. One key frame per loop: the paper does not move, so it is encoded once, and the video is light
  const commun = ['-i', brut, '-an', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-g', String(n)];
  await ff([...commun, '-c:v', 'libsvtav1', '-preset', '5', '-crf', '40', '-svtav1-params', 'enable-overlays=1:scd=0', join(MEDIAS, 'reunions-fond-av1.mp4')]).fini;
  await ff([...commun, '-c:v', 'libx264', '-preset', 'slower', '-crf', '30', '-keyint_min', String(n), '-sc_threshold', '0', join(MEDIAS, 'reunions-fond-h264.mp4')]).fini;
  await ff(['-i', brut, '-frames:v', '1', '-c:v', 'libwebp', '-quality', '82', '-compression_level', '6', join(MEDIAS, 'reunions-fond.webp')]).fini;
  console.log('fini');
} finally {
  await rm(dossier, { recursive: true, force: true });
}
