# Fibonacci Sphere

**1100 points, no poles**

The animation from the [@ByteAnimates](https://www.facebook.com/ByteAnimates) reel, and
the code that draws it. Not a port of it — `fibonacci-sphere.js` is the file the video was
rendered from, copied here unchanged.

```bash
python3 -m http.server 8000   # or any static server
open http://localhost:8000
```

No build, no dependencies, no npm install. Module scripts and a canvas.

### The idea

`scene(p)` is a pure function from a phase in `[0, 1)` to a list of elements. It takes no
clock and holds no state, which is what makes the loop exact rather than approximate:
the last frame of a turn is followed by the same call that produced the first one. The
reel drives it from a frame counter, `main.js` drives it from `performance.now()`, and
neither of them tells the scene which.

Each element carries `x`, `y`, `r` and `e`, plus a `z` that is never drawn. The first
three are geometry; `e` is *energy*, how alive that element is at this instant, from 0
to 1. The scene decides energy and `paint.js` decides what energy looks like, which is
why the same file draws the reel and this page.

`view` in `anim.js` is the camera: it takes a point in the unit ball, rotates it about
the vertical axis by `p` **turns** — not radians, so there is no TAU to forget and no
way for the rotation to fail to close — projects it, and scales its radius by depth.
The `z` it returns is what `paint.js` sorts by, drawing far to near. Without that sort
the back of the sphere paints over the front and the eye reads it as turning the wrong
way; `paint.js` also dims the far side, because sorting alone makes a shell, not a solid.

### Files

| | |
| --- | --- |
| `fibonacci-sphere.js` | the piece. The whole animation is in here |
| `anim.js` | the periodics it is built from, and `view`, the camera |
| `paint.js` | energy → circles. Shared with the reel, which is why they match |
| `main.js` | the canvas loop: read the clock, ask the scene, draw |
| `config.js` | generated — the palette, the length of a turn |

### Try changing it

Every constant in `fibonacci-sphere.js` is worth turning. The piece is short enough that you can
read it in a minute and wreck it in ten seconds, which is the fastest way anybody has ever
learned what a number was doing.

---

`fibonacci-sphere.js`, `anim.js` and `paint.js` are generated from the episode — what you read is
byte-for-byte what produced the video, so a fix to them belongs in the reel: open an issue
and the next one carries it. `main.js` and `index.html` are hand-written and welcome as a
pull request.
