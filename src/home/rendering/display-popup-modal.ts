import { toolbar } from "../ready-toolbar";
import { gitHubLoginButton } from "./render-github-login-button";
import { preview, previewBodyInner, titleAnchor, titleHeader } from "./render-preview-modal";

export function displayPopupMessage(header: string, message: string, url?: string) {
  titleHeader.textContent = header;
  if (url) {
    titleAnchor.href = url;
  }
  previewBodyInner.innerHTML = message;

  preview.classList.add("active");
  document.body.classList.add("preview-active");

  if (toolbar) {
    toolbar.scrollTo({
      left: toolbar.scrollWidth,
      behavior: "smooth",
    });

    gitHubLoginButton?.classList.add("highlight");
  }

  function killPopup() {
    preview.classList.remove("active");
    document.body.classList.remove("preview-active");
    gitHubLoginButton?.classList.remove("highlight");
  }

  return killPopup;
}
