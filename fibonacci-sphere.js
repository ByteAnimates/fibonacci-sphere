/**
 * FIBONACCI SPHERE
 *
 * 1100 points spread evenly over a sphere, and "evenly" is the whole problem. Wrap a
 * latitude/longitude grid around a ball and every row has the same number of points on a
 * circumference that shrinks to nothing, so the poles end up wearing a crown of dots packed
 * a hundred times tighter than the equator. There is no arrangement of N points on a sphere
 * that is exactly even for general N — the question is open — and this is the answer everyone
 * actually uses.
 *
 * TWO LINES DO IT. Walk `y` down the axis in equal steps, which spaces the points evenly by
 * AREA rather than by angle, because a sphere's surface per unit of height is constant — the
 * fact Archimedes wanted on his tombstone. Then turn by the golden angle each step, so no two
 * points ever line up into a seam. `k` is just the radius of the circle at that height.
 *
 * IT IS THE SAME ANGLE AS `golden-angle.js`, one dimension up, and it is doing a different
 * job: there it stops the spiral arms from collapsing into spokes, here it stops the whole
 * lattice from having a seam running pole to pole.
 *
 * THE BANDS ARE LIGHT, NOT STRUCTURE. Energy is a wave in `y`, so it sweeps the sphere from
 * pole to pole three times a turn while the sphere itself rotates once. Nothing on the surface
 * moves; what a viewer follows is a bright latitude crossing a lattice that is turning under
 * it, which is why the bands appear to tilt as they cross.
 *
 * WHY IT LOOPS EXACTLY. The rotation is `p` turns, so it returns. The wave is `p * 3`, a whole
 * number of periods, so it returns too. `view` takes turns rather than radians precisely so
 * that neither of those needs a TAU an author could forget.
 *
 * WHY IT IS NOT INSIDE OUT. `view` reports depth and `paint.js` draws far to near. Without the
 * sort the back of the sphere paints over the front and the eye reads it as turning the other
 * way — the classic silhouette ambiguity, and on a field of identical dots there is no other
 * cue to break it.
 */

// #region reel
import { view, wave } from './anim.js';
const N = 1100;
const PHI = Math.PI * (3 - Math.sqrt(5));
export const scene = (p) =>
  Array.from({ length: N }, (_, i) => {
    const y = 1 - (2 * i + 1) / N;
    const k = Math.sqrt(1 - y * y);
    const x = Math.cos(i * PHI) * k;
    const z = Math.sin(i * PHI) * k;
    const e = wave(p * 3 + y, 2);
    return view(x, y, z, p, e);
  });
// #endregion
