import { Scene } from "jygame";
import { DIFFICULTIES, COLOR_GREEN_BG } from "../constants.js";
import { MenuScene } from "./MenuScene.js";
import { GameScene } from "./GameScene.js";

export class DifficultyScene extends Scene {
  enter() {
    const strip = document.getElementById("hud-strip");
    if (strip) strip.style.display = "none";

    const scoreEl = document.getElementById("hud-score");
    const rightEl = document.getElementById("hud-right");
    if (scoreEl) scoreEl.textContent = "0";
    if (rightEl) rightEl.textContent = "";

    this.root.innerHTML = this._html();

    this.root.querySelectorAll(".btn-level").forEach((btn) => {
      this.on(btn, "click", () => {
        this.transitionTo(new GameScene({ mode: "classic", difficulty: btn.dataset.difficulty, backScene: DifficultyScene }));
      });
    });

    this.on(this.root.querySelector(".btn-back"), "click", () => {
      this.transitionTo(new MenuScene());
    });

    this.on(document, "keydown", (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        this.transitionTo(new MenuScene());
      }
    });
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
