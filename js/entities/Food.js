import { Sprite } from "jygame";
import { CELL } from "../constants.js";

function easeOutBack(t) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

function bezier(p1x, p1y, p2x, p2y, t) {
  const u = 1 - t;
  const tt = t * t;
  const uu = u * u;
  const x = 3 * uu * t * p1x + 3 * u * tt * p2x + tt * t;
  const y = 3 * uu * t * p1y + 3 * u * tt * p2y + tt * t;
  return { x, y };
}

function solveCubicBezier(p1x, p1y, p2x, p2y, x) {
  let lo = 0, hi = 1;
  for (let i = 0; i < 16; i++) {
    const mid = (lo + hi) / 2;
    const bx = bezier(p1x, p1y, p2x, p2y, mid).x;
    if (bx < x) lo = mid; else hi = mid;
  }
  return bezier(p1x, p1y, p2x, p2y, (lo + hi) / 2).y;
}

export class Food {
  constructor(image) {
    this.position = { x: 0, y: 0 };
    this.sprite = new Sprite(0, 0, CELL, CELL);
    this.sprite.image = image;
    this.spawnTime = 0;
  }

  generate(snake, walls, cols, rows) {
    while (true) {
      const candidate = {
        x: Math.floor(Math.random() * cols),
        y: Math.floor(Math.random() * rows),
      };

      if (
        !snake.segments.some(s => s.x === candidate.x && s.y === candidate.y) &&
        !walls.some(w => w.x === candidate.x && w.y === candidate.y)
      ) {
        this.position = candidate;
        this.sprite.rect.x = candidate.x * CELL;
        this.sprite.rect.y = candidate.y * CELL;
        this.spawnTime = performance.now();
        return;
      }
    }
  }

  updateAnimations() {
    const elapsed = (performance.now() - this.spawnTime) / 1000;

    const appearDuration = 0.2;
    if (elapsed < appearDuration) {
      const t = elapsed / appearDuration;
      const s = easeOutBack(t);
      this.sprite.scale.set(s, s);
    } else {
      this.sprite.scale.set(1, 1);
    }

    const spinDelay = 0.2;
    const spinDuration = 3.5;
    const spinTime = elapsed - spinDelay;

    if (spinTime > 0 && spinTime < spinDuration) {
      const progress = spinTime / spinDuration;
      const eased = solveCubicBezier(0.2, 0.6, 0.4, 1, progress);
      this.sprite.angle = eased * Math.PI * 2;
    } else if (spinTime >= spinDuration) {
      this.sprite.angle = Math.PI * 2;
    }
  }
}
