/**
 * services/api.ts — Legacy API service (kept for backwards compatibility with
 * other components like profile, posts, etc.).
 *
 * For auth calls, components should import from lib/apiClient.ts instead.
 */
import { getToken } from "../lib/auth";

const BASE_URL = "http://localhost:5000/api";

/** Build request headers, attaching the JWT if present. */
function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

export const api = {
  // ── Profile ─────────────────────────────────────────────────────────────────
  getProfile: async () => {
    const response = await fetch(`${BASE_URL}/profile`, {
      headers: authHeaders(),
    });
    return response.json();
  },

  updateProfile: async (profileData: unknown) => {
    const response = await fetch(`${BASE_URL}/profile`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(profileData),
    });
    return response.json();
  },
};
