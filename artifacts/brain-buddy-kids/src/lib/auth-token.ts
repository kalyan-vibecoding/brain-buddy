import { setAuthTokenGetter } from "@workspace/api-client-react";

const TOKEN_KEY = "bb_auth_token";

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function saveToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/** Call once at app startup to wire up the auth token getter */
export function initAuthToken(): void {
  setAuthTokenGetter(() => getStoredToken());
}
