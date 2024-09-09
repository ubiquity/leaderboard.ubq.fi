import { createClient } from "@supabase/supabase-js";
import { toolbar } from "../ready-toolbar";

declare const SUPABASE_PROJECT_ID: string; // @DEV: passed in at build time check build/esbuild-build.ts
declare const SUPABASE_DB_PASSWORD: string; // @DEV: passed in at build time check build/esbuild-build.ts

const SUPABASE_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co`;
const supabase = createClient(SUPABASE_URL, SUPABASE_DB_PASSWORD);

export function getSupabase() {
  return supabase;
}

export async function checkSupabaseSession() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session;
}

async function gitHubLoginButtonHandler() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      scopes: "repo",
    },
  });
  if (error) {
    console.error("Error logging in:", error);
  }
}
const gitHubLoginButton = document.createElement("button");
export function renderGitHubLoginButton() {
  gitHubLoginButton.id = "github-login-button";
  gitHubLoginButton.innerHTML = "<span>Login</span><span class='full'>&nbsp;With GitHub</span>";
  gitHubLoginButton.addEventListener("click", gitHubLoginButtonHandler);
  if (toolbar) {
    toolbar.appendChild(gitHubLoginButton);
    toolbar.classList.add("ready");
  }
}
export { gitHubLoginButton };
