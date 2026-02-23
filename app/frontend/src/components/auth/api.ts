const API_URL = 'http://localhost:5000';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupPayload {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password: string;
}

async function request(path: string, body: object) {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || `Request failed (${res.status})`);
  }
  return data;
}

export const authApi = {
  login: (credentials: LoginCredentials) => request('/auth/login', credentials),
  signup: (userData: SignupPayload) => request('/auth/signup', userData),
};
