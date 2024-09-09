import { setLocalStore } from "./getters/get-local-store";
import { GITHUB_TASKS_STORAGE_KEY } from "./github-types";
import { LeaderboardEntry } from "./leaderboard/shared";

export class TaskManager {
  private _entries: Record<string, LeaderboardEntry> = {};
  private _container: HTMLDivElement;

  constructor(container: HTMLDivElement) {
    this._container = container;
  }

  public addEntry(entry: LeaderboardEntry) {
    if (!entry.id) throw new Error("Entry must have an id");
    this._entries[entry.id] = entry;
  }

  public getContainer() {
    return this._container;
  }

  getEntryById(position: number) {
    return this._entries[position];
  }
  public async writeToStorage() {
    setLocalStore(GITHUB_TASKS_STORAGE_KEY, this._entries);
  }
}
