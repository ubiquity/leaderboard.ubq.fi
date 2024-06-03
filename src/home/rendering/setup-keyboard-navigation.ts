import { taskManager } from "../home";
import { previewEntryAdditionalDetails } from "../leaderboard/render";

const DATA_PREVIEW_ID = "data-preview-id";

const keyDownHandlerCurried = keyDownHandler();
const disableKeyBoardNavigationCurried = disableKeyboardNavigationCurry;

let isKeyDownListenerAdded = false;
let isMouseOverListenerAdded = false;

export function setupKeyboardNavigation(container: HTMLDivElement) {
  if (!isKeyDownListenerAdded) {
    document.addEventListener("keydown", keyDownHandlerCurried);
    isKeyDownListenerAdded = true;
  }
  if (!isMouseOverListenerAdded) {
    container.addEventListener("mouseover", disableKeyBoardNavigationCurried);
    isMouseOverListenerAdded = true;
  }
}

function disableKeyboardNavigationCurry() {
  const container = document.getElementById("issues-container") as HTMLDivElement;
  return disableKeyboardNavigation(container);
}

function disableKeyboardNavigation(container: HTMLDivElement) {
  container.classList.remove("keyboard-selection");
}

function keyDownHandler() {
  const container = document.getElementById("issues-container") as HTMLDivElement;
  return function keyDownHandler(event: KeyboardEvent) {
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      verticalKeys(event, container);
    } else if (event.key === "Enter") {
      const selectedIssue = container.querySelector("#issues-container > div.selected");
      const previewId = selectedIssue?.children[0].getAttribute(DATA_PREVIEW_ID);
      const issueFull = taskManager.getEntryById(Number(previewId));

      previewEntryAdditionalDetails(issueFull);
    } else if (event.key === "Escape") {
      console.log("ecapekey");
      disableKeyboardNavigation(container);
    }
  };
}

function verticalKeys(event: KeyboardEvent, container: HTMLDivElement) {
  const issues = Array.from(container.children) as HTMLElement[];
  const visibleIssues = issues.filter((issue) => issue.style.display !== "none");
  const activeIndex = visibleIssues.findIndex((issue) => issue.classList.contains("selected"));
  const originalIndex = activeIndex === -1 ? -1 : activeIndex;
  let newIndex = originalIndex;

  if (event.key === "ArrowUp" && originalIndex > 0) {
    newIndex = originalIndex - 1;
    event.preventDefault();
  } else if (event.key === "ArrowDown" && originalIndex < visibleIssues.length - 1) {
    newIndex = originalIndex + 1;
    event.preventDefault();
  }

  if (newIndex !== originalIndex) {
    visibleIssues.forEach((issue) => {
      issue.classList.remove("selected");
    });

    visibleIssues[newIndex]?.classList.add("selected");
    visibleIssues[newIndex].scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    container.classList.add("keyboard-selection");

    const previewId = visibleIssues[newIndex].children[0].getAttribute(DATA_PREVIEW_ID);

    const issueElement = visibleIssues.find((issue) => issue.children[0].getAttribute(DATA_PREVIEW_ID) === previewId);

    if (!issueElement) {
      throw new Error("No issue found");
    }

    const issueFull = taskManager.getEntryById(Number(previewId));

    previewEntryAdditionalDetails(issueFull);
  }
}
