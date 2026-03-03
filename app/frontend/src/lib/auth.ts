/**
 * lib/auth.ts — Token storage helpers.
 *
 * All JWT read/write goes through these functions so there is ONE place
 * to change if you ever move from localStorage to httpOnly cookies.
 */

const TOKEN_KEY = "token";

/** Read the JWT from localStorage. Returns null if not present. */
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/** Persist the JWT in localStorage. */
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

/** Remove the JWT from localStorage (logout). */
export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/** True if a token string is stored (does NOT validate expiry). */
export function isLoggedIn(): boolean {
  return Boolean(getToken());
}
