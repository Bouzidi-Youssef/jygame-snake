import { Scene, Input } from "jygame";
import { DIFFICULTIES, COLOR_GREEN_BG } from "../constants.js";
import { MenuScene } from "./MenuScene.js";
import { GameScene } from "./GameScene.js";

export class DifficultyScene extends Scene {
  enter() {
    const strip = document.getElementById("hud-strip");
    if (strip) strip.innerHTML = "";

    this.root.innerHTML = this._html();

    this.on(this.root, "click", (e) => {
      const level = e.target.closest(".btn-level");
      if (level) {
        this.transitionTo(new GameScene({ mode: "classic", difficulty: level.dataset.difficulty, backScene: DifficultyScene }));
      } else if (e.target.closest(".btn-back")) {
        this.transitionTo(new MenuScene());
      }
    });
  }

  update() {
    if (Input.justPressed("ESCAPE")) {
      this.transitionTo(new MenuScene());
    }
  }

  render(ctx) {
  }

  _html() {
    const buttons = Object.entries(DIFFICULTIES).map(([key, diff]) => `
      <div class="level-cell">
        <button class="btn btn-level" data-difficulty="${key}">${diff.LABEL}</button>
      </div>
    `).join("");

    return `
      <div class="screen-inner">
        <div class="game-title"><span class="game-title-text">snake</span></div>
        <div class="choose-label">CHOOSE LEVEL:</div>
        <div class="level-row">${buttons}</div>
        <button class="btn btn-back">← BACK</button>
      </div>
    `;
  }
}
