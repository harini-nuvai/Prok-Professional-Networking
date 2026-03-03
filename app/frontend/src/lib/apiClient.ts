/**
 * lib/apiClient.ts — Thin wrapper around fetch that:
 *   1. Points to the Flask backend at http://localhost:5000
 *   2. Sets Content-Type: application/json
 *   3. Attaches Authorization: Bearer <token> when a token exists
 *   4. Returns parsed JSON or throws an Error with the server's message
 */

import { getToken } from "./auth";

const BASE_URL = "http://localhost:5000/api";

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: unknown;
}

/**
 * Generic fetch wrapper.
 * Throws an Error (with `.message` populated from the server's JSON) on non-2xx.
 */
async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Attach JWT if present
  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // Parse JSON regardless of success/error so we can read server messages
  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    // Build a rich error so callers can inspect .errors for field-level feedback
    const err = new ApiError(
      json.message || `Request failed with status ${response.status}`,
      response.status,
      json.errors || null,
    );
    throw err;
  }

  return json as T;
}

/** Extended Error that carries HTTP status and field-level errors from the API. */
export class ApiError extends Error {
  status: number;
  /** Field-level errors: { username: "already taken", email: "invalid" } */
  errors: Record<string, string> | null;

  constructor(message: string, status: number, errors: Record<string, string> | null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

// ── Auth endpoints ────────────────────────────────────────────────────────────

export interface SignupPayload {
  username: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  /** Can be either a username or an email — backend accepts both. */
  username_or_email: string;
  password: string;
}

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

export interface SignupResponse {
  success: boolean;
  message: string;
  data: { user: AuthUser };
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: { access_token: string; user: AuthUser };
}

export interface MeResponse {
  success: boolean;
  message: string;
  data: { user: AuthUser };
}

export const authApi = {
  signup: (payload: SignupPayload) =>
    request<SignupResponse>("/signup", { method: "POST", body: payload }),

  login: (payload: LoginPayload) =>
    request<LoginResponse>("/login", { method: "POST", body: payload }),

  me: () => request<MeResponse>("/me"),
};
