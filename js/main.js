import { Game } from "jygame";
import { MenuScene } from "./scenes/MenuScene.js";
import { CELL, DEFAULTS } from "./constants.js";

const NATIVE_W = 596;
const NATIVE_TOTAL_H = 478;
const VIEWPORT_PAD = 12;

function applyScale() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const availW = vw - VIEWPORT_PAD * 2;
  const availH = vh - VIEWPORT_PAD * 2;
  const scale = Math.min(1, availW / NATIVE_W, availH / NATIVE_TOTAL_H);
  const visualH = NATIVE_TOTAL_H * scale;
  const marginV = ((NATIVE_TOTAL_H - visualH) / 2) * -1;
  document.documentElement.style.setProperty('--scale', scale);
  document.documentElement.style.setProperty('--scale-margin-v', marginV + 'px');
}

document.addEventListener("DOMContentLoaded", () => {
  const app = document.getElementById("app");
  if (!app) return;

  // Scale bootsrap (runs fresh on DOMContentLoaded for safety)
  applyScale();

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
  });

  window.addEventListener("resize", applyScale);

  game.run(new MenuScene());
});
