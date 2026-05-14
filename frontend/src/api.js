/**
 * Discipleship API client.
 *
 * Talks to the FastAPI backend. The base URL defaults to localhost:8000
 * but can be overridden with the VITE_API_URL env var.
 */
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const TOKEN_KEY        = "discipleship_token";
const MENTEE_TOKEN_KEY = "discipleship_mentee_token"; // always holds the logged-in mentee's token
const PROFILE_KEY      = "discipleship_profile";
const MATCHES_KEY      = "discipleship_matches";
const REQUESTS_KEY     = "discipleship_requests";
const ROLE_KEY         = "discipleship_demo_role";    // active demo role: mentee | mentor | admin

// Pre-seeded demo accounts for the role switcher
const DEMO_CREDENTIALS = {
  mentor: { email: "sarah.mitchell@discipleship.demo", password: "demo1234" },
  admin:  { email: "admin@discipleship.demo",          password: "demo1234" },
};

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
    localStorage.removeItem(MENTEE_TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
  },

  /* ---- Role switcher ---- */

  currentRole() {
    return localStorage.getItem(ROLE_KEY) || "mentee";
  },

  async switchRole(role) {
    if (role === "mentee") {
      const menteeToken = localStorage.getItem(MENTEE_TOKEN_KEY);
      if (!menteeToken) throw new Error("No mentee session to restore — please complete onboarding first.");
      setToken(menteeToken);
      localStorage.setItem(ROLE_KEY, "mentee");
      return { role: "mentee" };
    }

    const creds = DEMO_CREDENTIALS[role];
    if (!creds) throw new Error(`Unknown role: ${role}`);

    // Save the current mentee token before switching away (only once)
    const current = getToken();
    if (current && !localStorage.getItem(MENTEE_TOKEN_KEY)) {
      localStorage.setItem(MENTEE_TOKEN_KEY, current);
    }

    const data = await request("/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(creds),
    });
    setToken(data.access_token);
    localStorage.setItem(ROLE_KEY, role);
    return data;
  },

  /* On page refresh: always restore the mentee session so the role switcher
     starts clean. The mentor/admin demo role is session-scoped, not persistent. */
  restoreMenteeOnRefresh() {
    const menteeToken = localStorage.getItem(MENTEE_TOKEN_KEY);
    if (menteeToken) {
      setToken(menteeToken);
      localStorage.setItem(ROLE_KEY, "mentee");
    }
  },

  /* ---- Auth ---- */

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
    // Save as the canonical mentee token for role-switching
    localStorage.setItem(MENTEE_TOKEN_KEY, data.access_token);
    localStorage.setItem(ROLE_KEY, "mentee");
    return { ...data, email: useEmail, password };
  },

  /* ---- Profiles ---- */

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

  /* ---- Matches ---- */

  async findMatches(topK = 10) {
    const data = await request(`/v1/matches/find?top_k=${topK}`);
    localStorage.setItem(MATCHES_KEY, JSON.stringify(data.matches));
    return data.matches;
  },

  /* ---- Requests ---- */

  async sendRequest({ mentorId, message }) {
    const data = await request("/v1/requests/", {
      method: "POST",
      body: JSON.stringify({
        mentor_id: mentorId,
        message: message || null,
        via_admin: true,
      }),
    });
    const existing = JSON.parse(localStorage.getItem(REQUESTS_KEY) || "{}");
    existing[mentorId] = { status: data.status, request_id: data.id };
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(existing));
    return data;
  },

  async myRequests() {
    return request("/v1/requests/mine");
  },

  async mentorDecision(requestId, action, reason = null) {
    return request(`/v1/requests/${requestId}/decision`, {
      method: "POST",
      body: JSON.stringify({ action, reason }),
    });
  },

  /* ---- Relationships ---- */

  async myRelationships() {
    return request("/v1/relationships/mine");
  },

  /* ---- Admin ---- */

  async adminQueue() {
    return request("/v1/admin/queue");
  },

  async adminUsers(role) {
    return request(`/v1/admin/users?role=${role}`);
  },

  async adminToggleAccepting(mentorId) {
    return request(`/v1/admin/mentors/${mentorId}/accepting`, { method: "PATCH" });
  },

  async adminShareRequest(requestId) {
    return request(`/v1/requests/${requestId}/admin-share`, { method: "POST" });
  },

  async adminCancelRequest(requestId) {
    return request(`/v1/admin/requests/${requestId}/cancel`, { method: "POST" });
  },

  async adminReports() {
    return request("/v1/admin/reports");
  },

  /* ---- Local cache reads (no network) ---- */
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
