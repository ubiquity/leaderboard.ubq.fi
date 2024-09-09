import { grid } from "../the-grid";
import { authentication } from "./authentication";
import { readyToolbar } from "./ready-toolbar";
import { displayLeaderboard } from "./rendering/display-leaderboard";
import { setupKeyboardNavigation } from "./rendering/setup-keyboard-navigation";
import { TaskManager } from "./task-manager";

grid(document.getElementById("grid") as HTMLElement, () => document.body.classList.add("grid-loaded")); // @DEV: display grid background
const container = document.getElementById("issues-container") as HTMLDivElement;

if (!container) {
  throw new Error("Could not find issues container");
}
setupKeyboardNavigation(container);

export const taskManager = new TaskManager(container);
void (async function home() {
  try {
    void authentication();
    void readyToolbar();
    return await displayLeaderboard();
  } catch (error) {
    console.error(error);
  }
})();
