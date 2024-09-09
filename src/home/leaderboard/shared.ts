export type SupabaseUser = { id: string; created: string; wallet_id: string };
export type LeaderboardData = { address: string; balance: number };
export type LeaderboardEntry = { address: string; balance: number; username?: string; created_at?: string; id?: string };
