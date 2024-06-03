import { marked } from "marked";
import { GitHubIssue } from "../github-types";
import { preview, previewBodyInner, titleAnchor, titleHeader } from "./render-preview-modal";

export function viewIssueDetails(full: GitHubIssue) {
  // Update the title and body for the new issue
  titleHeader.textContent = full.title;
  titleAnchor.href = full.html_url;
  if (!full.body) return;
  previewBodyInner.innerHTML = marked(full.body) as string;

  // Show the preview
  preview.classList.add("active");
  document.body.classList.add("preview-active");
}
