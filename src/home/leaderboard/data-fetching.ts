import { Octokit } from "@octokit/rest";
import { getGitHubAccessToken } from "../getters/get-github-access-token";
import { getSupabase } from "../rendering/render-github-login-button";
import { makeLeaderboardEntries } from "./render";
import { LeaderboardData, SupabaseUser } from "./shared";

export async function pullFromSupabase() {
  const supabase = getSupabase();

  // pull all wallets from the database
  const { data, error } = await supabase.from("wallets").select("address, id");

  if (error || !data?.length) {
    console.error(error);
    return;
  }

  const walletMap = new Map<number, string>();

  for (const wallet of data) {
    walletMap.set(wallet.id, wallet.address);
  }

  // pull all users with wallets that are in the walletMap
  const users = (await supabase.from("users").select("id, created, wallet_id").in("wallet_id", Array.from(walletMap.keys()))) as { data: SupabaseUser[] };

  if (!users.data) {
    return;
  }

  return { walletMap, users };
}

export async function fetchAllLeaderboardData() {
  const octokit = new Octokit({ auth: await getGitHubAccessToken() });
  const addrAndBalances = await fetchLeaderboardDataFromRepo();

  const { walletMap, users } = (await pullFromSupabase()) || { walletMap: new Map(), users: { data: [] } };

  const USER_IDS = users.data.map((user) => user.id);
  const githubUsers = await fetchUsernames(USER_IDS, octokit);
  const wallets = await makeLeaderboardEntries(walletMap, users, addrAndBalances, githubUsers);

  return wallets.sort((a, b) => b.balance - a.balance);
}

export async function fetchUsernames(userIds: string[], octokit: Octokit) {
  const usernames = [];

  for (const userId of userIds) {
    const { data, status } = await octokit.request(`GET /user/${userId}`);

    if (status !== 200) {
      console.error(`Failed to fetch user data for ${userId}`);
      continue;
    }

    usernames.push({
      id: data.id,
      username: data.login,
      avatar: data.avatar_url,
      name: data.name,
    });
  }

  return usernames;
}

export async function fetchLeaderboardDataFromRepo(): Promise<LeaderboardData[]> {
  try {
    const token = await getGitHubAccessToken();
    const octokit = new Octokit({ auth: token });

    // @TODO: create an action that updates this every 24hrs and pulls from a Ubiquity repo

    const path = "leaderboard.csv";
    // cspell: disable
    const url = "https://github.com/keyrxng/ubq-airdrop-cli";

    const { data, status } = await octokit.repos.getContent({
      owner: "keyrxng",
      repo: "ubq-airdrop-cli",
      path,
    });

    if (status !== 200) {
      throw new Error(`Failed to fetch leaderboard data from ${url}`);
    }
    let parsedData;

    // TODO: remove in place of db pulled stats
    if ("content" in data) {
      parsedData = atob(data.content);
    } else {
      throw new Error("No content found in leaderboard data");
    }

    const entries = cvsToLeaderboardData(parsedData);

    if (entries.length === 0) {
      throw new Error("No entries found in leaderboard data");
    }

    return entries;
  } catch (err) {
    console.log(err);
    return [];
  }
}

function cvsToLeaderboardData(cvsData: string): { address: string; balance: number }[] {
  const lines = cvsData.split("\n");
  const data = [];
  for (const line of lines) {
    const [address, balance] = line.split(",");

    if (balance === undefined || isNaN(parseInt(balance))) {
      continue;
    }

    data.push({ address: address.toUpperCase(), balance: parseInt(balance) });
  }

  return data.sort((a, b) => b.balance - a.balance);
}
