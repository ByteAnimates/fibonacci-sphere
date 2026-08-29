/**
 * SHAPES → CIRCLES. The one place that decides what a piece looks like.
 *
 * A scene emits geometry and one number per element: `e`, how alive it is. This turns that
 * into the circles that actually get drawn — how many per element, how big, how bright —
 * and it is shared by both renderers rather than implemented on each side.
 *
 * THAT SHARING IS THE POINT. The reel draws SVG through React and the published demo draws
 * canvas in a browser; two paint routines written to match by eye is how the thing on
 * GitHub becomes a rougher-looking cousin of the thing in the feed. Here the decisions —
 * the halo threshold, the spread, the exponent that darkens the middle — are made once, and
 * each renderer only has to know how to fill a circle.
 *
 * IT NAMES TONES, NOT COLOURS, for the same reason a scene does: this file is published, and
 * the palette belongs to the brand. `fill` is one of 'glow', 'rest', 'lead'; each renderer
 * resolves those against its own table, which is generated from `brand/showcase.ts` on the
 * way out so the two tables cannot disagree either.
 *
 * THREE CIRCLES PER ELEMENT, NOT ONE, and the middle one is the trick. A single circle whose
 * colour ramps from grey to blue reads as a colour change. A dim element with a bright one
 * fading in over it reads as something LIGHTING UP, because that is what light does — it
 * adds. The halo takes the same idea one step further: a lit thing in the dark spills.
 */

/**
 * AERIAL PERSPECTIVE — how much of its brightness the far side of a solid gives up.
 *
 * Depth arrives here for sorting, and sorting alone is not enough to make a solid look solid. A
 * sphere whose back is exactly as bright as its front reads as a transparent shell rather than
 * a ball, and the eye — offered a field of identical dots and no other cue — cannot decide
 * which way it is turning. Size already carries some of this, because perspective makes near
 * points bigger; brightness carries the rest, and it is the half the eye trusts.
 *
 * 0.55 is most of the way to invisible without losing the far side, which still has to be
 * there: a sphere with a black back is a disc.
 */
const DEPTH_FADE = 0.55;

/** Near (z = -1) → 1, far (z = +1) → 0.45. Flat pieces, which have no depth, get 1. */
const aerial = (z) =>
  z === undefined ? 1 : 1 - DEPTH_FADE * Math.min(1, Math.max(0, (z + 1) / 2));

/** Below this an element is at rest, and a halo on it is fog rather than light. */
export const HALO_FLOOR = 0.35;
/** Halo radius, as a multiple of the element's own. */
export const HALO_SPREAD = 5.5;
/** Weight of the resting layer. Constant, which is what stops a piece going blank. */
export const REST_OPACITY = 0.5;

/**
 * Energy → opacity for the lit layer, raised to a power on purpose.
 *
 * Linear, every element is half-lit half the time and the field reads as uniformly
 * grey-blue with nothing travelling through it. The exponent darkens the middle so the
 * crest has somewhere to be brighter than.
 */
const lit = (e) => Math.pow(e, 1.6);

/**
 * `box` is `{ size, cx, cy }` in destination pixels: the unit square [-1, 1] maps onto a
 * square `size` across, centred on `cx`/`cy`. The reel takes it from `SCENE`; the demo
 * computes it from the window, which is the whole reason it is an argument.
 *
 * Returns circles in DRAW ORDER — every halo, then every resting element, then every lit
 * one. Haloes go under the field entirely: a lit dot overlapping a neighbour's spill is
 * light on light, and a dot sitting behind one is a smudge.
 *
 * WITHIN each of those layers, a scene that reports depth is sorted far to near. A flat piece
 * has no `z` and keeps the order it was emitted in, which for a lattice is the order that
 * makes its structure legible. A solid needs the sort or it reads inside out: the far side of
 * a rotating sphere paints over the near side, and the eye — which has no other cue on a field
 * of identical dots — resolves it as a shape turning the wrong way.
 */
export const paint = (shapes, box) => {
  // `z` is present on every shape or on none — the engine checks that, so one probe decides
  // it for the whole frame. Descending, because `view` measures depth away from the eye.
  const ordered =
    shapes.length && shapes[0].z !== undefined
      ? [...shapes].sort((a, b) => b.z - a.z)
      : shapes;

  const half = box.size / 2;
  const px = (u) => box.cx + u * half;
  const py = (v) => box.cy + v * half;
  const pr = (r) => r * half;

  const halo = [];
  const rest = [];
  const lead = [];

  for (const s of ordered) {
    const x = px(s.x);
    const y = py(s.y);
    const r = pr(s.r);
    const far = aerial(s.z);

    if (s.e > HALO_FLOOR) {
      halo.push({
        x,
        y,
        r: r * HALO_SPREAD,
        fill: 'glow',
        o: Math.pow((s.e - HALO_FLOOR) / (1 - HALO_FLOOR), 1.5) * 0.55 * far,
      });
    }
    rest.push({ x, y, r, fill: 'rest', o: REST_OPACITY * far });
    lead.push({ x, y, r, fill: 'lead', o: lit(s.e) * far });
  }

  return [...halo, ...rest, ...lead];
};
