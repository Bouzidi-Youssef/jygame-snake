import { Game } from "jygame";
import { MenuScene } from "./scenes/MenuScene.js";
import { CELL, DEFAULTS } from "./constants.js";

document.addEventListener("DOMContentLoaded", () => {
  const app = document.getElementById("app");
  if (!app) return;

  app.innerHTML = `
    <div class="game-screen">
      <div class="snake-game-container" id="game-container"></div>
      <div class="game-hud-strip" id="hud-strip">
        <span class="hud-score" id="hud-score">0</span>
        <span id="hud-right"></span>
      </div>
    </div>
    <div class="credit">Made with Jygame</div>
  `;

  const game = new Game({
    parent: "#game-container",
    width: DEFAULTS.COLS * CELL,
    height: DEFAULTS.ROWS * CELL,
    fps: 60,
    scaleToFit: { width: 596, height: 478, padding: 12, element: ".game-screen" },
  });

  game.run(new MenuScene());
});
