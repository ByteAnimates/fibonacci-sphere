/**
 * THE SERIES' STANDARD LIBRARY.
 *
 * Every scene imports from here and from nothing else. It is deliberately tiny, it has no
 * dependencies of its own, and it ships beside the scene in every companion repo — so the
 * import line a viewer reads in the panel resolves to a real file they can open, which is
 * the only reason the panel shows an import at all.
 *
 * IT ALSO OWNS THE CAMERA. `view` is the series' only route from three dimensions to two, and
 * it is here rather than in an episode for the same reason `SCENE` is a brand token rather
 * than a per-episode choice: a showcase whose pieces are each framed slightly differently is a
 * showcase of a wobbling camera. A scene says where a point IS; the camera says how it is seen.
 *
 * EVERYTHING HERE IS PERIODIC OR PURE. A scene is called with a phase in [0, 1) and has to
 * come back to where it started at the end of it, so a helper that drifts — anything
 * reading a clock, anything integrating a velocity — would break every piece that used it.
 * The one function that is not periodic, `settle`, says so in its own comment and exists
 * for use INSIDE a phase, never across one.
 *
 * WHY THIS IS NOT AN EASING LIBRARY OFF NPM. Two reasons, and the second is the real one.
 * A build that pulls a package in has to publish that package with the demo or publish a
 * demo that does not run. And a series about how motion is made should be able to show the
 * motion being made: `wave` is one line, and a viewer who reads it has learned the thing
 * the reel is about rather than learned a package name.
 */

export const TAU = Math.PI * 2;

/** Phase, wrapped into [0, 1). The only correct way to offset one. */
export const wrap = (p) => p - Math.floor(p);

/**
 * The base periodic: 0 → 1 → 0 across one turn, smooth at the seam.
 *
 * A raw sine is the same shape shifted, but it starts at its midpoint travelling fastest,
 * and a loop that begins mid-stride is a loop whose seam you can feel even when the
 * arithmetic is exact. This starts and ends at rest.
 *
 * `k` SHARPENS THE CREST, and it is a second argument rather than a second function because
 * a scene reaches for it constantly. At k=1 every element is half-lit on average, and
 * half-lit everywhere reads as nothing happening; raising it narrows the bright part and
 * lengthens the dark between, which is the difference between a field that breathes and a
 * field with something travelling across it.
 */
export const wave = (p, k = 1) => {
  const w = 0.5 - 0.5 * Math.cos(wrap(p) * TAU);
  return k === 1 ? w : Math.pow(w, k);
};

/** Cubic in-out, for a 0 → 1 run that is not itself a loop. */
export const inOut = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/**
 * Out and back within one turn, eased at both ends: 0 → 1 → 0.
 *
 * `wave` is the same journey taken sinusoidally. This one accelerates and decelerates like
 * something with mass, and holds at each end rather than passing through it — the right
 * choice when the element is going somewhere and coming back, rather than oscillating.
 */
export const there = (p) => inOut(1 - Math.abs(2 * wrap(p) - 1));

/**
 * Item `i` of `n`, offset around the turn by `spread` of it.
 *
 * A stagger is the cheapest elegance there is: the same motion on every element, started at
 * different times, reads as a system rather than as a group. `spread` of 1 puts one full
 * turn between the first element and the last, which is a wave that never has all of them
 * doing the same thing; below 1 they close ranks and the piece reads as a pulse.
 */
export const stagger = (p, i, n, spread = 1) => wrap(p - (i / n) * spread);

/**
 * Polar placement, in scene coordinates: angle in radians, distance from the centre.
 *
 * Here rather than in a scene because half the pieces worth making are polar, and because
 * `{ x: Math.cos(a) * d, y: Math.sin(a) * d }` written out is a line and a half that says
 * nothing — it crowds out the line above it, which is the one carrying the idea.
 */
export const at = (a, d) => ({ x: Math.cos(a) * d, y: Math.sin(a) * d });

/**
 * THE CAMERA. Fixed for the whole series — see the note at the top.
 *
 * `FOV` is the eye's distance from the origin. Lower is a wider lens and a more violent
 * perspective; 3.4 against a unit world gives near points about 1.8x the size of far ones,
 * which is enough to read as depth and not so much that the far side collapses.
 *
 * `FIT` maps the unit ball into the scene's unit square with room for the near side, which
 * perspective makes larger than 1. Without it every 3D piece would need its own scale constant
 * and they would all be slightly different.
 *
 * 0.78 puts the near edge of a unit ball at about 1.1 — outside the square, off the frame,
 * which is the point. The first cut used 0.62, which kept the whole ball comfortably inside
 * and looked exactly like that: a small object floating in a large black rectangle. A solid
 * that never reaches an edge reads as a diagram of a solid.
 */
const FOV = 3.4;
const FIT = 0.78;
/** Default dot radius, before depth. Overridable per piece, rarely worth overriding. */
const DOT = 0.0085;

/**
 * A point in the world, seen: rotated about the vertical axis by `p` turns, projected, and
 * handed back as a finished shape.
 *
 * IT RETURNS THE WHOLE SHAPE, energy included, rather than coordinates the scene then has to
 * assemble. That is not a convenience — it is what keeps a 3D piece inside the panel. Three
 * dimensions cost a scene three coordinates where a flat one spends two, and a `return` line
 * that also has to spread a projection and scale a radius is a line that does not fit twelve
 * rows at thirty-nine columns. So the camera hands back something finished.
 *
 * `z` IS THE DEPTH, and it is the only number in this system that is never drawn. `paint.js`
 * sorts by it so the far side of a solid goes down before the near side does; without that, a
 * point behind the object paints over one in front of it and the whole thing reads inside out.
 *
 * ROTATION IS IN TURNS, NOT RADIANS. Every other input to a scene is a phase in [0, 1), and a
 * camera that took radians would be the one place an author has to remember to multiply by
 * TAU — which is exactly where a loop stops closing. `lift` is in turns for the same reason.
 *
 * `lift` IS THE CAMERA'S ELEVATION — how far above the equator it sits, applied after the spin.
 * It defaults to none, and that default is load-bearing: a sphere is symmetric about the axis
 * it turns on, so an elevation buys it nothing, and baking one into the camera would have
 * changed a piece that was already published in order to improve a different one.
 *
 * A subject that is NOT symmetric needs it or it is seen edge-on. A torus lying in the plane it
 * spins in is a line. So elevation is per-shot rather than per-series — which is the honest
 * split: the framing is the series', the angle you look at a thing from is the thing's.
 */
export const view = (x, y, z, p, e, lift = 0, r = DOT) => {
  const a = wrap(p) * TAU;
  const c = Math.cos(a);
  const s = Math.sin(a);
  const spun = x * s + z * c;

  // Pitch about the horizontal axis. At lift = 0 this is cos 0 = 1 and sin 0 = 0, so both lines
  // are exact identities and a flat-camera piece is untouched to the bit.
  const cl = Math.cos(lift * TAU);
  const sl = Math.sin(lift * TAU);
  const high = y * cl - spun * sl;
  const depth = y * sl + spun * cl;

  const k = FOV / (FOV + depth);
  return {
    x: (x * c - z * s) * k * FIT,
    y: high * k * FIT,
    z: depth,
    r: r * k,
    e,
  };
};

/**
 * A spring settling from 0 to 1 over t in [0, 1], overshooting once.
 *
 * NOT PERIODIC — it ends where it ends and does not come back, so it belongs inside one
 * phase of a scene and never across the seam. `there(p)` is the periodic answer.
 *
 * `k` is the damping and `w` the frequency; the defaults are one clean overshoot of about
 * 6%, which is the amount that reads as weight rather than as a bounce.
 */
export const settle = (t, k = 7, w = 9) =>
  t <= 0 ? 0 : t >= 1 ? 1 : 1 - Math.exp(-k * t) * Math.cos(w * t);
