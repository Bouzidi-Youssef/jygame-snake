import { State, Storage } from "jygame";

const STORAGE_HIGHSCORES = "snake_highscores";

function loadHighScores() {
  return Storage.get(STORAGE_HIGHSCORES, {});
}

const store = new State({
  status: "idle",
  score: 0,
  highScore: loadHighScores(),
});

export const getState = () => store.get();
export const updateState = (partial) => store.set(partial);
export const subscribe = (fn) => store.subscribe(fn);
export const unsubscribe = (fn) => store.unsubscribe(fn);

export function saveHighScore(difficulty, score) {
  const key = difficulty || "stage";
  const current = store.get().highScore[key] || 0;
  if (score > current) {
    const updated = { ...store.get().highScore, [key]: score };
    store.set({ highScore: updated });
    Storage.set(STORAGE_HIGHSCORES, updated);
  }
}
