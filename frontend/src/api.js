/**
 * Discipleship API client.
 *
 * Talks to the FastAPI backend. The base URL defaults to localhost:8000
 * but can be overridden with the VITE_API_URL env var.
 */
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const TOKEN_KEY = "discipleship_token";
const PROFILE_KEY = "discipleship_profile";
const MATCHES_KEY = "discipleship_matches";
const REQUESTS_KEY = "discipleship_requests";

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(t) {
  if (t) localStorage.setItem(TOKEN_KEY, t);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}, retries = 4) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let lastErr;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(`${API_URL}${path}`, { ...options, headers });
      if (!res.ok) {
        // 5xx are transient (backend still warming up) — retry.
        if (res.status >= 500 && attempt < retries - 1) {
          await new Promise((r) => setTimeout(r, 2500));
          continue;
        }
        let detail;
        try {
          const body = await res.json();
          detail = body.detail || JSON.stringify(body);
        } catch {
          detail = res.statusText;
        }
        throw new Error(`${res.status}: ${detail}`);
      }
      return res.json();
    } catch (err) {
      lastErr = err;
      // TypeError from fetch = network error / connection refused.
      const transient =
        err.name === "TypeError" ||
        /Failed to fetch|NetworkError|reach/i.test(err.message);
      if (!transient || attempt === retries - 1) {
        if (transient) {
          throw new Error(
            `Couldn't reach the backend at ${API_URL}. Make sure it's running ` +
              `(cd backend && docker compose up). First start can take a few minutes.`
          );
        }
        throw err;
      }
      // Backend probably still spinning up — wait and retry.
      await new Promise((r) => setTimeout(r, 2500));
    }
  }
  throw lastErr;
}

/* ----------  Helpers  ---------- */
function emailFromName(name) {
  const slug = (name || "friend").toLowerCase().replace(/[^a-z0-9]/g, "") || "friend";
  const rand = Math.random().toString(36).slice(2, 8);
  return `${slug}-${rand}@discipleship.demo`;
}

function randomPassword() {
  return (
    Math.random().toString(36).slice(2, 14) +
    Math.random().toString(36).slice(2, 6).toUpperCase()
  );
}

/* ----------  Public API  ---------- */
export const api = {
  isAuthenticated: () => !!getToken(),

  reset() {
    setToken(null);
    localStorage.removeItem(PROFILE_KEY);
    localStorage.removeItem(MATCHES_KEY);
    localStorage.removeItem(REQUESTS_KEY);
  },

  async signupMentee({ email, name }) {
    const useEmail = email && email.trim() ? email.trim() : emailFromName(name);
    const password = randomPassword();
    const data = await request("/v1/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        email: useEmail,
        password,
        name: name || "Friend",
        role: "mentee",
      }),
    });
    setToken(data.access_token);
    return { ...data, email: useEmail, password };
  },

  async saveProfile(profile) {
    const body = {
      life_stage: profile.lifeStage || [],
      faith_stage: profile.faith || [],
      support_areas: profile.support || [],
      strengths: profile.strengths || [],
      interests: profile.interests || [],
      description: profile.description || "",
    };
    const data = await request("/v1/profiles/me", {
      method: "PUT",
      body: JSON.stringify(body),
    });
    localStorage.setItem(PROFILE_KEY, JSON.stringify(data));
    return data;
  },

  async findMatches(topK = 10) {
    const data = await request(`/v1/matches/find?top_k=${topK}`);
    localStorage.setItem(MATCHES_KEY, JSON.stringify(data.matches));
    return data.matches;
  },

  async sendRequest({ mentorId, message }) {
    const data = await request("/v1/requests/", {
      method: "POST",
      body: JSON.stringify({
        mentor_id: mentorId,
        message: message || null,
        via_admin: true, // route through pastoral admin
      }),
    });
    // Track locally for UI badges
    const existing = JSON.parse(localStorage.getItem(REQUESTS_KEY) || "{}");
    existing[mentorId] = { status: data.status, request_id: data.id };
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(existing));
    return data;
  },

  async myRequests() {
    return request("/v1/requests/mine");
  },

  /* ---------- Local cache reads (no network) ---------- */
  cachedMatches() {
    const raw = localStorage.getItem(MATCHES_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  cachedProfile() {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  cachedRequests() {
    const raw = localStorage.getItem(REQUESTS_KEY);
    return raw ? JSON.parse(raw) : {};
  },

  noteRequestSent(mentorId, status = "admin_review", requestId = null) {
    const existing = JSON.parse(localStorage.getItem(REQUESTS_KEY) || "{}");
    existing[mentorId] = { status, request_id: requestId };
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(existing));
  },
};
