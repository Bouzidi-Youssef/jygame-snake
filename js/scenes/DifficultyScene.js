import { Scene } from "jygame";
import { DIFFICULTIES, COLOR_GREEN_BG } from "../constants.js";
import { MenuScene } from "./MenuScene.js";
import { GameScene } from "./GameScene.js";

export class DifficultyScene extends Scene {
  enter() {
    const strip = document.getElementById("hud-strip");
    if (strip) strip.innerHTML = "";

    this.root.innerHTML = this._html();
    this.root.querySelectorAll(".btn-level").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.transitionTo(new GameScene({ mode: "classic", difficulty: btn.dataset.difficulty, backScene: DifficultyScene }));
      });
    });
    this.root.querySelector(".btn-back").addEventListener("click", () => {
      this.transitionTo(new MenuScene());
    });

    this._boundKeydown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        this.transitionTo(new MenuScene());
      }
    };
    document.addEventListener("keydown", this._boundKeydown);
  }

  exit() {
    if (this._boundKeydown) {
      document.removeEventListener("keydown", this._boundKeydown);
      this._boundKeydown = null;
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
