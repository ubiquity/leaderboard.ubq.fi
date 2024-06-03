import { RestEndpointMethodTypes } from "@octokit/plugin-rest-endpoint-methods";
import { LeaderboardEntry } from "./rendering/display-leaderboard";

export const GITHUB_TASKS_STORAGE_KEY = "ubq-leaderboard";

export type LeaderboardStorage = {
  leaderboard: LeaderboardEntry[];
};

export type GitHubUserResponse = RestEndpointMethodTypes["users"]["getByUsername"]["response"];
export type GitHubUser = GitHubUserResponse["data"];
export type GitHubIssue = RestEndpointMethodTypes["issues"]["get"]["response"]["data"];
