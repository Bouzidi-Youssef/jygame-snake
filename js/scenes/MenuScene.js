import { Scene } from "jygame";
import { DifficultyScene } from "./DifficultyScene.js";
import { GameScene } from "./GameScene.js";
import { getStageProgress } from "../stage-loader.js";
import { stages } from "../stages/index.js";
import { COLOR_GREEN_BG, MODES } from "../constants.js";

export class MenuScene extends Scene {
  enter() {
    const strip = document.getElementById("hud-strip");
    if (strip) strip.innerHTML = "";

    this.root.innerHTML = this._html();

    this.on(this.root, "click", (e) => {
      if (e.target.closest(".btn-play")) {
        this.transitionTo(new DifficultyScene());
      } else if (e.target.closest(".btn-stage")) {
        let idx = getStageProgress();
        if (idx >= stages.length) idx = 0;
        this.transitionTo(new GameScene({ mode: MODES.STAGE, stageIndex: idx, stageConfig: stages[idx], backScene: MenuScene }));
      }
    });
  }

  render(ctx) {
  }

  _html() {
    return `
      <div class="screen-inner">
        <div class="game-title"><span class="game-title-text">snake</span></div>
        <button class="btn btn-play">PLAY</button>
        <button class="btn btn-stage">STAGE</button>
      </div>
    `;
  }
}
