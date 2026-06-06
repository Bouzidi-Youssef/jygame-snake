import { Scene, Input, Group, Sprite, ImageLoader, Clock } from "jygame";
import { Snake } from "../entities/Snake.js";
import { Food } from "../entities/Food.js";
import { parseWallMap, saveStageProgress } from "../stage-loader.js";
import { stages } from "../stages/index.js";
import { DIFFICULTIES, DEFAULTS, CELL, COLOR_GREEN_BG, COLOR_GREEN_DARK, MODES, GAME_STATUS } from "../constants.js";
import { MenuScene } from "./MenuScene.js";
import { getState, updateState, saveHighScore, subscribe } from "../game/state.js";

export class GameScene extends Scene {
  constructor({ mode, difficulty = null, stageIndex = null, stageConfig = null, backScene = MenuScene }) {
    super();
    this.mode = mode;
    this.difficulty = difficulty;
    this.stageIndex = stageIndex;
    this.stageConfig = stageConfig;
    this.backScene = backScene;

    this.snake = null;
    this.food = null;
    this.wallGroup = null;
    this.walls = [];
    this.foodImage = null;
    this.clock = new Clock(1000 / DEFAULTS.TICK_RATE);
    this.wrapEdges = true;
    this.cols = DEFAULTS.COLS;
    this.rows = DEFAULTS.ROWS;
    this.foodTarget = null;
  }

  enter() {
    if (window.innerHeight <= 500) {
      const credit = document.querySelector(".credit");
      if (credit) credit.style.display = "none";
    }
    this.clock.reset();
    updateState({ status: GAME_STATUS.RUNNING, score: 0 });

    const foodSvgUrl = new URL('../../assets/images/food.svg', import.meta.url).href;
    ImageLoader.load(foodSvgUrl)
      .then(img => {
        this.foodImage = img;
        if (this.food) this.food.sprite.image = img;
      })
      .catch(() => {});

    if (this.mode === MODES.CLASSIC) {
      const diff = DIFFICULTIES[this.difficulty];
      this.clock.fps = 1000 / diff.TICK_RATE;
      this.wrapEdges = true;
      this.walls = [];

      const start = [
        { x: 10, y: 7 },
        { x: 9, y: 7 },
        { x: 8, y: 7 },
      ];
      this.snake = new Snake(start);
      this.food = new Food(null);
      this.food.generate(this.snake, this.walls, this.cols, this.rows);
      this.food.sprite.image = this.foodImage;
    } else {
      const cfg = this.stageConfig;
      this.clock.fps = 1000 / cfg.tickRate;
      this.wrapEdges = cfg.wrapEdges;
      this.foodTarget = cfg.foodTarget;
      this.walls = parseWallMap(cfg.walls);

      const start = [
        { x: cfg.snakeStart.x, y: cfg.snakeStart.y },
        { x: cfg.snakeStart.x - 1, y: cfg.snakeStart.y },
        { x: cfg.snakeStart.x - 2, y: cfg.snakeStart.y },
      ];
      this.snake = new Snake(start);
      this.food = new Food(null);
      this.food.generate(this.snake, this.walls, this.cols, this.rows);
      this.food.sprite.image = this.foodImage;
    }

    this.wallGroup = new Group();
    for (const w of this.walls) {
      const s = new Sprite(w.x * CELL, w.y * CELL, CELL, CELL);
      this.wallGroup.add(s);
    }

    this.onSwipe((dir) => {
      if (getState().status === GAME_STATUS.RUNNING) {
        this.snake.queueDirection(dir);
      }
    });

    this.onTap(() => {
      const { status } = getState();
      if (status === GAME_STATUS.RUNNING) {
        updateState({ status: GAME_STATUS.PAUSED });
      } else if (status === GAME_STATUS.PAUSED) {
        updateState({ status: GAME_STATUS.RUNNING });
      }
    });

    this.on(this.root, "click", (e) => {
      if (e.target.closest(".btn-replay")) { this._retry(); return; }
      if (e.target.closest(".btn-menu")) { this.transitionTo(new MenuScene()); return; }
      if (e.target.closest(".stage-complete-overlay")) { this._advanceStage(); return; }
    });

    this.cleanup(subscribe(() => {
      this._updateHUD();
      this.game.refreshUI();
    }));

    this._updateHUD();
  }

  exit() {
    super.exit();
    if (window.innerHeight <= 500) {
      const credit = document.querySelector(".credit");
      if (credit) credit.style.display = "";
    }
    const strip = document.getElementById("hud-strip");
    if (strip) strip.innerHTML = "";
  }

  update(dt) {
    this._pollInput();

    if (getState().status === GAME_STATUS.RUNNING) {
      const ticks = this.clock.tick(dt);
      for (let i = 0; i < ticks; i++) {
        this._tick();
      }
    }

    if (this.food) {
      this.food.updateAnimations();
    }
  }

  _tick() {
    const head = this.snake.peekNextHead(this.cols, this.rows, this.wrapEdges);

    if (this._wouldCollide(head)) {
      this._gameOver();
      return;
    }

    this.snake.move(this.cols, this.rows, this.wrapEdges);

    const hp = this.snake.getHead();
    if (hp.x === this.food.position.x && hp.y === this.food.position.y) {
      this._eatFood();
    }

    if (this.mode === MODES.STAGE && getState().score >= this.foodTarget) {
      this._stageComplete();
    }
  }

  _wouldCollide(head) {
    if (this.snake.checkSelfCollision(head)) return true;
    if (!this.wrapEdges) {
      if (head.x < 0 || head.y < 0 || head.x >= this.cols || head.y >= this.rows) return true;
    }
    if (this.walls.some(w => w.x === head.x && w.y === head.y)) return true;
    return false;
  }

  _eatFood() {
    updateState({ score: getState().score + 1 });
    this.snake.grow++;
    this.food.generate(this.snake, this.walls, this.cols, this.rows);
    this.food.sprite.image = this.foodImage;
  }

  _gameOver() {
    const state = getState();
    saveHighScore(this.difficulty, state.score);
    updateState({ status: GAME_STATUS.GAMEOVER });
  }

  _stageComplete() {
    updateState({ status: GAME_STATUS.STAGE_COMPLETE });
    this.food = null;
    saveStageProgress(this.stageIndex + 1);
  }

  _pollInput() {
    if (Input.justPressed("ESCAPE")) {
      this.transitionTo(new this.backScene());
      return;
    }

    if (Input.justPressed("SPACE")) {
      const { status } = getState();
      if (status === GAME_STATUS.RUNNING) {
        updateState({ status: GAME_STATUS.PAUSED });
      } else if (status === GAME_STATUS.PAUSED) {
        updateState({ status: GAME_STATUS.RUNNING });
      } else if (status === GAME_STATUS.STAGE_COMPLETE) {
        this._advanceStage();
      } else if (status === GAME_STATUS.GAMEOVER) {
        this._retry();
      }
      return;
    }

    if (getState().status !== GAME_STATUS.RUNNING) return;

    if (Input.justPressed("UP")) this.snake.queueDirection("UP");
    if (Input.justPressed("DOWN")) this.snake.queueDirection("DOWN");
    if (Input.justPressed("LEFT")) this.snake.queueDirection("LEFT");
    if (Input.justPressed("RIGHT")) this.snake.queueDirection("RIGHT");
  }

  _retry() {
    if (this.mode === MODES.CLASSIC) {
      this.transitionTo(new GameScene({ mode: MODES.CLASSIC, difficulty: this.difficulty, backScene: this.backScene }));
    } else {
      this.transitionTo(new GameScene({
        mode: MODES.STAGE,
        stageIndex: this.stageIndex,
        stageConfig: this.stageConfig,
        backScene: this.backScene,
      }));
    }
  }

  _advanceStage() {
    const next = this.stageIndex + 1;
    if (next >= stages.length) {
      this.transitionTo(new MenuScene());
    } else {
      this.transitionTo(new GameScene({
        mode: MODES.STAGE,
        stageIndex: next,
        stageConfig: stages[next],
        backScene: this.backScene,
      }));
    }
  }

  _updateHUD() {
    const strip = document.getElementById("hud-strip");
    if (!strip) return;
    const { score, highScore } = getState();

    if (this.mode === MODES.STAGE) {
      strip.innerHTML = `
        <span class="hud-score">${score}</span>
        <span>Stage ${this.stageIndex + 1}/${stages.length}</span>`;
    } else {
      const label = DIFFICULTIES[this.difficulty]?.LABEL || "---";
      const high = highScore[this.difficulty] || 0;
      strip.innerHTML = `
        <span class="hud-score">${score}</span>
        <span>${label.toUpperCase()}<span class="hud-highscore">${high}</span></span>`;
    }
  }

  render(ctx) {
    this._drawWalls(ctx);
    this._drawSnake(ctx);
    this._drawFood(ctx);
  }

  _drawBackground(ctx) {
    ctx.fillStyle = COLOR_GREEN_BG;
    ctx.fillRect(0, 0, this.game.width, this.game.height);
  }

  _drawWalls(ctx) {
    if (!this.walls.length) return;
    ctx.fillStyle = COLOR_GREEN_DARK;
    ctx.globalAlpha = 0.5;
    for (const wall of this.walls) {
      ctx.beginPath();
      ctx.roundRect(wall.x * CELL, wall.y * CELL, CELL, CELL, 4);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  _drawSnake(ctx) {
    ctx.fillStyle = COLOR_GREEN_DARK;
    for (const seg of this.snake.segments) {
      ctx.beginPath();
      ctx.roundRect(seg.x * CELL, seg.y * CELL, CELL, CELL, 8);
      ctx.fill();
    }
  }

  _drawFood(ctx) {
    if (!this.food) return;
    const sprite = this.food.sprite;

    if (sprite.image) {
      ctx.save();
      ctx.translate(sprite.rect.centerx, sprite.rect.centery);
      ctx.rotate(sprite.angle);
      ctx.scale(sprite.scale.x, sprite.scale.y);
      ctx.globalAlpha = 0.75;
      const hw = sprite.rect.w / 2;
      const hh = sprite.rect.h / 2;
      ctx.drawImage(sprite.image, -hw, -hh, sprite.rect.w, sprite.rect.h);
      ctx.restore();
    } else {
      ctx.globalAlpha = 0.75;
      ctx.beginPath();
      ctx.arc(sprite.rect.centerx, sprite.rect.centery, CELL / 2 - 2, 0, Math.PI * 2);
      ctx.fillStyle = "#ff4444";
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  renderUI() {
    const { status, score, highScore } = getState();
    let html = "";

    if (status === GAME_STATUS.PAUSED) {
      html = `
        <div class="pause-overlay">
          <div class="pause-text">PAUSED</div>
          <div class="pause-hint">Press SPACE to Resume</div>
        </div>`;
    }

    if (status === GAME_STATUS.GAMEOVER) {
      const key = this.difficulty || "stage";
      const high = highScore[key] || 0;
      html = `
        <div class="gameover-overlay">
          <div class="gameover-title">GAME OVER</div>
          <div class="gameover-score">SCORE: <span class="gameover-score-value">${score}</span></div>
          <div class="gameover-highscore">HIGH SCORE: ${high}</div>
          <div class="gameover-btns">
            <button class="btn btn-replay">RETRY</button>
            <button class="btn btn-menu">MENU</button>
          </div>
        </div>`;
    }

    if (status === GAME_STATUS.STAGE_COMPLETE) {
      const isLast = this.stageIndex >= stages.length - 1;
      html = `
        <div class="stage-complete-overlay">
          <div class="stage-complete-title">${isLast ? "ALL STAGES CLEARED!" : "STAGE COMPLETE!"}</div>
          <div class="stage-complete-hint">${isLast ? "Tap to return to menu" : "Tap to continue"}</div>
        </div>`;
    }

    return html;
  }
}
