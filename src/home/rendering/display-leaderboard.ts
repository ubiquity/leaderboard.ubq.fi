import { getGitHubUser } from "../getters/get-github-user";
import { renderLeaderboard } from "../leaderboard/render";
import { displayPopupMessage } from "./display-popup-modal";

export async function displayLeaderboard() {
  if (!(await getGitHubUser())) {
    // TODO: remove this after using DB as data source
    displayPopupMessage("No GitHub token found", "Please sign in to GitHub to view the leaderboard.");
    return;
  }

  const killPopup = displayPopupMessage("Fetching leaderboard...", "This may take a moment if it's your first time.");
  await renderLeaderboard();
  killPopup();
}
