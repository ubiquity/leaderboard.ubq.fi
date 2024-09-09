import { checkSupabaseSession } from "../rendering/render-github-login-button";
import { getLocalStore } from "./get-local-store";
declare const SUPABASE_PROJECT_ID: string; // @DEV: passed in at build time check build/esbuild-build.ts
export async function getGitHubAccessToken(): Promise<string | null> {
  // better to use official function, looking up localstorage has flaws
  const authToken = await checkSupabaseSession();

  const expiresAt = authToken?.expires_at;
  if (expiresAt && expiresAt < Date.now() / 1000) {
    localStorage.removeItem(`sb-${SUPABASE_PROJECT_ID}-auth-token`);
    return null;
  }

  return authToken?.provider_token ?? null;
}

export function getGitHubUserName(): string | null {
  const authToken = getLocalStore(`sb-${SUPABASE_PROJECT_ID}-auth-token`) as OauthToken | null;
  return authToken?.user?.user_metadata?.user_name ?? null;
}

export interface OauthToken {
  provider_token: string;
  access_token: string;
  expires_in: number;
  expires_at: number;
  refresh_token: string;
  token_type: string;
  user: {
    id: string;
    aud: string;
    role: string;
    email: string;
    email_confirmed_at: string;
    phone: string;
    confirmed_at: string;
    last_sign_in_at: string;
    app_metadata: { provider: string; providers: string[] };
    user_metadata: {
      avatar_url: string;
      email: string;
      email_verified: boolean;
      full_name: string;
      iss: string;
      name: string;
      phone_verified: boolean;
      preferred_username: string;
      provider_id: string;
      sub: string;
      user_name: string;
    };
    identities: [
      {
        id: string;
        user_id: string;
        identity_data: {
          avatar_url: string;
          email: string;
          email_verified: boolean;
          full_name: string;
          iss: string;
          name: string;
          phone_verified: boolean;
          preferred_username: string;
          provider_id: string;
          sub: string;
          user_name: string;
        };
        provider: string;
        last_sign_in_at: string;
        created_at: string;
        updated_at: string;
      },
    ];
    created_at: string;
    updated_at: string;
  };
}
