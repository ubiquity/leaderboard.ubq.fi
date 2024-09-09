import { Octokit } from "@octokit/rest";
import { GitHubUser, GitHubUserResponse } from "../github-types";
import { OauthToken } from "./get-github-access-token";
import { getLocalStore } from "./get-local-store";
declare const SUPABASE_STORAGE_KEY: string; // @DEV: passed in at build time check build/esbuild-build.ts

export async function getGitHubUser(): Promise<GitHubUser | null> {
  const activeSessionToken = await getSessionToken();
  if (activeSessionToken) {
    return getNewGitHubUser(activeSessionToken);
  } else {
    return null;
  }
}

async function getSessionToken(): Promise<string | null> {
  const cachedSessionToken = getLocalStore(`sb-${SUPABASE_STORAGE_KEY}-auth-token`) as OauthToken | null;
  if (cachedSessionToken) {
    return cachedSessionToken.provider_token;
  }
  const newSessionToken = await getNewSessionToken();
  if (newSessionToken) {
    return newSessionToken;
  }
  return null;
}

async function getNewSessionToken(): Promise<string | null> {
  const hash = window.location.hash;
  const params = new URLSearchParams(hash.substr(1)); // remove the '#' and parse
  const providerToken = params.get("provider_token");
  if (!providerToken) {
    return null;
  }
  return providerToken;
}

async function getNewGitHubUser(providerToken: string): Promise<GitHubUser> {
  const octokit = new Octokit({ auth: providerToken });
  const response = (await octokit.request("GET /user")) as GitHubUserResponse;
  return response.data;
}
