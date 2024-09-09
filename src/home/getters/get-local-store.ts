import { LeaderboardStorage } from "../github-types";
import { OauthToken } from "./get-github-access-token";

export function getLocalStore(key: string): LeaderboardStorage | OauthToken | null {
  const cachedIssues = localStorage.getItem(key);
  if (cachedIssues) {
    try {
      return JSON.parse(cachedIssues); // as OauthToken;
    } catch (error) {
      console.error(error);
    }
  }
  return null;
}

export function setLocalStore(key: string, value: LeaderboardStorage | OauthToken) {
  // remove state from issues before saving to local storage
  localStorage[key] = JSON.stringify(value);
}
