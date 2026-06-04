import { Storage } from "jygame";

const STORAGE_KEY = 'snake_stage_progress';

export function parseWallMap(rows) {
  const walls = [];
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      if (row[x] === '#') {
        walls.push({ x, y });
      }
    }
  });
  return walls;
}

export function getStageProgress() {
  const val = Storage.get(STORAGE_KEY);
  const n = parseInt(val, 10);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export function saveStageProgress(index) {
  Storage.set(STORAGE_KEY, String(index));
}

export function clearStageProgress() {
  Storage.remove(STORAGE_KEY);
}
