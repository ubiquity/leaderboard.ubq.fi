import { grid } from "../the-grid";
import { authentication } from "./authentication";
import { readyToolbar } from "./ready-toolbar";
import { renderLeaderboard } from "./rendering/display-leaderboard";
import { displayPopupMessage } from "./rendering/display-popup-modal";
import { TaskManager } from "./task-manager";

grid(document.getElementById("grid") as HTMLElement, () => document.body.classList.add("grid-loaded")); // @DEV: display grid background
const container = document.getElementById("issues-container") as HTMLDivElement;

if (!container) {
  throw new Error("Could not find issues container");
}

export const taskManager = new TaskManager(container);

async function leaderboardLoaderWhileRendering() {
  const killPopup = displayPopupMessage("Fetching leaderboard...", "This may take a moment if it's your first time.");
  await renderLeaderboard();
  killPopup();
}

void (async function home() {
  try {
    void authentication();
    void readyToolbar();
    return await leaderboardLoaderWhileRendering();
  } catch (error) {
    console.error(error);
  }
})();
