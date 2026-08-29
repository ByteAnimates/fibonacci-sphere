/**
 * The published demo — the same piece, running in a browser.
 *
 * This file is a template: it is copied into every motion repo unchanged, and everything
 * that differs between pieces arrives through `config.js`, which the export generates. So a
 * viewer who clones two of these repos finds the same three shared files and one scene, and
 * the diff between the projects is the diff between the animations.
 *
 * WHAT IT SHARES WITH THE REEL, and why that list is the whole design:
 *
 *   `<scene>.js`  the animation. Byte for byte the file that produced the video.
 *   `anim.js`     the periodics it is built out of.
 *   `paint.js`    how energy becomes circles — the look, decided once.
 *
 * What it does NOT share is this file, because drawing is where the two genuinely differ:
 * the reel puts SVG nodes on a 1080x1920 frame at a fixed 60fps, and this puts arcs on a
 * canvas sized to whatever window it is in. Both ask `paint` the same question first.
 *
 * TIME. The reel advances a frame counter; this reads the clock. Same phase either way —
 * `(t mod cycle) / cycle` — which is exactly why the scene never sees either one. A scene
 * that took a timestamp could not be driven by both.
 */

import { CYCLE_MS, PALETTE, scene } from './config.js';
import { paint } from './paint.js';

const canvas = document.getElementById('stage');
const ctx = canvas.getContext('2d');

/**
 * The halo, pre-rendered once.
 *
 * The reel gets its glow from one SVG gradient referenced by every halo. A canvas has no
 * such thing — a radial gradient built per circle per frame is hundreds of gradient objects
 * sixty times a second — so it is drawn once into an offscreen canvas and stamped, which is
 * the same picture and roughly free. The stops are the reel's, at the same offsets.
 */
const SPRITE = 128;
const sprite = (() => {
  const c = document.createElement('canvas');
  c.width = c.height = SPRITE * 2;
  const g = c.getContext('2d');
  const [r, gr, b, a] = PALETTE.glow;
  const grad = g.createRadialGradient(SPRITE, SPRITE, 0, SPRITE, SPRITE, SPRITE);
  grad.addColorStop(0, `rgba(${r}, ${gr}, ${b}, ${a * 0.9})`);
  grad.addColorStop(0.55, `rgba(${r}, ${gr}, ${b}, ${a * 0.28})`);
  grad.addColorStop(1, `rgba(${r}, ${gr}, ${b}, 0)`);
  g.fillStyle = grad;
  g.fillRect(0, 0, SPRITE * 2, SPRITE * 2);
  return c;
})();

/**
 * The scene box: the largest square the window holds, with a little air.
 *
 * The reel's box is a fixed 940px because it has a panel to sit above. Here there is nothing
 * else on the page, so the piece takes the room — which is the same `paint` call with a
 * different box, and the reason the box is an argument rather than a constant.
 */
let box = { size: 0, cx: 0, cy: 0 };

const resize = () => {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = window.innerWidth;
  const h = window.innerHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  box = { size: Math.min(w, h) * 0.94, cx: w / 2, cy: h / 2 };
};

window.addEventListener('resize', resize);
resize();

const frame = (t) => {
  const p = (t % CYCLE_MS) / CYCLE_MS;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const c of paint(scene(p), box)) {
    ctx.globalAlpha = c.o;
    if (c.fill === 'glow') {
      ctx.drawImage(sprite, c.x - c.r, c.y - c.r, c.r * 2, c.r * 2);
    } else {
      ctx.fillStyle = c.fill === 'lead' ? PALETTE.lead : PALETTE.rest;
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.globalAlpha = 1;
  requestAnimationFrame(frame);
};

requestAnimationFrame(frame);
