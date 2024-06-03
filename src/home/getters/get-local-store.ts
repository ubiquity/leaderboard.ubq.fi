import { LeaderboardStorage } from "../github-types";
import { OAuthToken } from "./get-github-access-token";

export function getLocalStore(key: string): LeaderboardStorage | OAuthToken | null {
  const cachedIssues = localStorage.getItem(key);
  if (cachedIssues) {
    try {
      return JSON.parse(cachedIssues); // as OAuthToken;
    } catch (error) {
      console.error(error);
    }
  }
  return null;
}

export function setLocalStore(key: string, value: LeaderboardStorage | OAuthToken) {
  // remove state from issues before saving to local storage
  localStorage[key] = JSON.stringify(value);
}
