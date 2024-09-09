import { RestEndpointMethodTypes } from "@octokit/plugin-rest-endpoint-methods";
import { LeaderboardEntry } from "./leaderboard/shared";

export const GITHUB_TASKS_STORAGE_KEY = "ubq-leaderboard";

export type LeaderboardStorage = Record<string, LeaderboardEntry>;

export type GitHubUserResponse = RestEndpointMethodTypes["users"]["getByUsername"]["response"];
export type GitHubUser = GitHubUserResponse["data"];
export type GitHubIssue = RestEndpointMethodTypes["issues"]["get"]["response"]["data"];
