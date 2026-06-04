import { Sprite } from "jygame";
import { OPPOSITE_DIRECTIONS, CELL, COLOR_GREEN_DARK } from "../constants.js";

export class Snake {
  constructor(startSegments) {
    this.segments = startSegments.map(s => ({ x: s.x, y: s.y }));
    this.direction = "RIGHT";
    this.nextQueue = ["RIGHT"];
    this.grow = 0;
    this.sprites = [];
    this._syncSprites();
  }

  getHead() {
    return this.segments[0];
  }

  peekNextHead(cols, rows, wrapEdges) {
    let direction = this.direction;
    for (let i = 0; i < this.nextQueue.length; i++) {
      if (this.nextQueue[i] !== OPPOSITE_DIRECTIONS[direction]) {
        direction = this.nextQueue[i];
        break;
      }
    }

    const head = this.segments[0];
    let nx = head.x;
    let ny = head.y;

    switch (direction) {
      case "UP":    ny -= 1; break;
      case "DOWN":  ny += 1; break;
      case "LEFT":  nx -= 1; break;
      case "RIGHT": nx += 1; break;
    }

    if (wrapEdges) {
      nx = ((nx % cols) + cols) % cols;
      ny = ((ny % rows) + rows) % rows;
    }

    return { x: nx, y: ny };
  }

  move(cols, rows, wrapEdges) {
    let direction = this.direction;
    const queue = [...this.nextQueue];

    while (queue.length > 0) {
      const nextDir = queue.shift();
      if (nextDir !== OPPOSITE_DIRECTIONS[direction]) {
        direction = nextDir;
        break;
      }
    }

    const head = this.segments[0];
    let nx = head.x;
    let ny = head.y;

    switch (direction) {
      case "UP":    ny -= 1; break;
      case "DOWN":  ny += 1; break;
      case "LEFT":  nx -= 1; break;
      case "RIGHT": nx += 1; break;
    }

    if (wrapEdges) {
      nx = ((nx % cols) + cols) % cols;
      ny = ((ny % rows) + rows) % rows;
    }

    const newSnake = [{ x: nx, y: ny }, ...this.segments];

    if (this.grow > 0) {
      this.grow -= 1;
    } else {
      newSnake.pop();
    }

    this.segments = newSnake;
    this.direction = direction;
    this.nextQueue = queue;
    this._syncSprites();
  }

  queueDirection(dir) {
    const lastDir = this.nextQueue.length > 0
      ? this.nextQueue[this.nextQueue.length - 1]
      : this.direction;
    if (dir === OPPOSITE_DIRECTIONS[lastDir]) return;
    this.nextQueue = [...this.nextQueue, dir].slice(-4);
  }

  checkSelfCollision(head) {
    return this.segments.some((seg, i) => i > 0 && seg.x === head.x && seg.y === head.y);
  }

  _syncSprites() {
    while (this.sprites.length < this.segments.length) {
      const s = new Sprite(0, 0, CELL, CELL);
      s.style.fill = COLOR_GREEN_DARK;
      s.visible = false;
      this.sprites.push(s);
    }

    while (this.sprites.length > this.segments.length) {
      this.sprites.pop();
    }

    for (let i = 0; i < this.segments.length; i++) {
      const s = this.sprites[i];
      s.rect.x = this.segments[i].x * CELL;
      s.rect.y = this.segments[i].y * CELL;
      s.visible = true;
    }
  }
}
