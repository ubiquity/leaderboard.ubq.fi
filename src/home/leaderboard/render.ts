import { Octokit } from "@octokit/rest";
import { fetchAllLeaderboardData, fetchLeaderboardDataFromRepo, fetchUsernames, pullFromSupabase } from "./data-fetching";
import { getGitHubAccessToken } from "../getters/get-github-access-token";
import { taskManager } from "../home";
import { preview, previewBodyInner, titleAnchor, titleHeader } from "../rendering/render-preview-modal";
import { LeaderboardData, LeaderboardEntry, SupabaseUser } from "./shared";

export async function renderLeaderboard() {
  const container = taskManager.getContainer();

  const existingAddresses = new Set(Array.from(container.querySelectorAll(".issue-element-inner")).map((element) => element.getAttribute("data-preview-id")));

  const delay = 0;
  const baseDelay = 500 / 15;

  const cachedEntries = localStorage.getItem("ubq-leaderboard") || "[]";
  const lastUpdate = localStorage.getItem("ubq-leaderboard-last-update") || "0";
  const parsedEntries = JSON.parse(cachedEntries) as LeaderboardEntry[];

  let entries: LeaderboardEntry[] | undefined = [];
  let addrAndBalances: LeaderboardData[] = [];

  if (!cachedEntries || Date.now() - parseInt(lastUpdate) > 1000 * 60 * 60 * 24 * 7) {
    // fetches the most up to date leaderboard data from the repo
    entries = await fetchAllLeaderboardData();

    if (!entries) {
      return;
    }

    return launchLeaderboard(
      entries.sort((a, b) => b.balance - a.balance),
      container,
      existingAddresses,
      delay,
      baseDelay
    );
  } else {
    if (lastUpdate && Date.now() - parseInt(lastUpdate) < 1000 * 60 * 60 * 24) {
      entries = parsedEntries.sort((a, b) => b.balance - a.balance);

      return launchLeaderboard(entries, container, existingAddresses, delay, baseDelay);
    }

    addrAndBalances = await fetchLeaderboardDataFromRepo();

    const { walletMap, users } = (await pullFromSupabase()) || { walletMap: new Map(), users: { data: [] } };
    const USER_IDS = users.data.map((user) => user.id);
    const githubUsers = await fetchUsernames(USER_IDS, new Octokit({ auth: await getGitHubAccessToken() }));

    entries = (await makeLeaderboardEntries(walletMap, users, addrAndBalances, githubUsers)).sort((a, b) => b.balance - a.balance);

    if (!entries) {
      return;
    }

    return launchLeaderboard(entries, container, existingAddresses, delay, baseDelay);
  }
}

async function launchLeaderboard(
  entries: LeaderboardEntry[],
  container: HTMLDivElement,
  existingAddresses: Set<string | null>,
  delay: number,
  baseDelay: number
) {
  for (const entry of entries) {
    if (!existingAddresses.has(entry.address)) {
      const entryWrapper = await everyNewEntry({ entry, container });
      if (entryWrapper) {
        setTimeout(() => entryWrapper?.classList.add("active"), delay);
        delay += baseDelay;
      }
    }
  }
  container.classList.add("ready");
  container.setAttribute("data-leaderboard", "true");
  localStorage.setItem("ubq-leaderboard-last-update", Date.now().toString());

  return true;
}

async function everyNewEntry({ entry, container }: { entry: LeaderboardEntry; container: HTMLDivElement }) {
  const entryWrapper = document.createElement("div");
  const issueElement = document.createElement("div");
  issueElement.setAttribute("data-preview-id", entry.id || "");
  issueElement.classList.add("issue-element-inner");

  if (!entry.address) {
    console.warn("No address found");
    return;
  }

  taskManager.addEntry(entry);

  setUpIssueElement(issueElement, entry);
  entryWrapper.appendChild(issueElement);

  container.appendChild(entryWrapper);
  return entryWrapper;
}

function setUpIssueElement(entryElement: HTMLDivElement, entry: LeaderboardEntry) {
  entryElement.innerHTML = `
          <div class="info">
              <div class="entry-title">
                  <h3>${entry.username ?? "Contributor"}</h3>
                  <p>$${entry.balance.toLocaleString()}</p>
              </div>
              <div class="entry-body">
                  <p>${entry.address.toUpperCase()}</p>
              </div>
          </div>
      `;

  entryElement.addEventListener("click", () => {
    const entryWrapper = entryElement.parentElement;

    if (!entryWrapper) {
      throw new Error("No issue container found");
    }

    Array.from(entryWrapper.parentElement?.children || []).forEach((sibling) => {
      sibling.classList.remove("selected");
    });

    entryWrapper.classList.add("selected");

    previewEntryAdditionalDetails(entry);
  });
}

export async function makeLeaderboardEntries(
  walletMap: Map<number, string>,
  users: { data: SupabaseUser[] },
  addrAndBalances: LeaderboardData[],
  githubUsers: { id: string; username: string }[]
): Promise<LeaderboardEntry[]> {
  const wallets = users.data.map((user) => {
    const wId = Number(user.wallet_id);
    const uId = user.id;

    const username = githubUsers.find((user) => user.id === uId)?.username;

    const address = walletMap.get(wId);

    if (!address) {
      console.warn(`No address found for wallet ID ${wId}`);
      return { address: "", username: "", balance: 0, created_at: "" };
    }

    const balance = addrAndBalances.find((entry) => entry.address.toLowerCase() === address?.toLowerCase())?.balance || 0;
    return {
      address: address,
      username: username,
      balance: balance,
      created_at: user.created,
      id: user.id,
    };
  });

  localStorage.setItem("ubq-leaderboard", JSON.stringify(wallets));

  return wallets;
}

export function previewEntryAdditionalDetails(entry: LeaderboardEntry) {
  titleHeader.textContent = entry.address;
  titleAnchor.href = `https://etherscan.io/address/${entry.address}`;
  previewBodyInner.innerHTML = `
            <div class="entry">
                <div class="title">
                    <h3>${entry.username ?? "Contributor"}</h3>
                </div>
                <div class="body">
                      ${entry.created_at ? `<p>Joined: ${new Date(entry.created_at).toLocaleDateString()}</p>` : ""}
                    <p>Earnings To Date: $${entry.balance.toLocaleString()}</p>
                    </div>
            </div>
        `;

  // Show the preview
  preview.classList.add("active");
  document.body.classList.add("preview-active");
}
