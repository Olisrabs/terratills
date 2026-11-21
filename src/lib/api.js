/**
 * TerraTills frontend API client.
 * Single source for all API calls — session cookie auth, CSRF header included.
 */

const API_BASE = '/api';

export class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

/** Core fetch wrapper — credentials + CSRF header, 401 redirects to login. */
export async function apiFetch(url, options = {}) {
  const response = await fetch(API_BASE + url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'terratills',
      ...(options.headers || {}),
    },
  });

  if (response.status === 401) {
    const currentPath = window.location.pathname;
    if (currentPath.startsWith('/dashboard')) {
      window.location.href = `/login?next=${encodeURIComponent(currentPath)}`;
    }
    throw new ApiError(401, 'UNAUTHORIZED', 'Session expired. Please sign in.');
  }

  return response;
}

/** Fetch + parse JSON, throwing ApiError on non-OK response. */
export async function apiJson(url, options = {}) {
  const res = await apiFetch(url, options);
  const contentType = res.headers.get('content-type') || '';
  let data;
  if (contentType.includes('application/json')) {
    data = await res.json();
  } else {
    const text = await res.text();
    if (!res.ok) {
      throw new ApiError(
        res.status,
        'SERVER_ERROR',
        `Server returned error ${res.status}. Please make sure the backend server is running.`
      );
    }
    throw new ApiError(res.status, 'INVALID_RESPONSE', 'Invalid response format from server.');
  }

  if (!res.ok) {
    throw new ApiError(res.status, data?.code ?? 'ERROR', data?.error ?? 'Request failed');
  }
  return data;
}

// ── Auth ────────────────────────────────────────────────────────────────────

export const auth = {
  sendOtp: (phone, purpose = 'login') =>
    apiJson('/auth/otp/send', {
      method: 'POST',
      body: JSON.stringify({ phone, purpose }),
    }),

  verifyOtp: (phone, code, purpose = 'login') =>
    apiJson('/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ phone, code, purpose }),
    }),

  me: () => apiJson('/auth/me'),

  logout: () => apiJson('/auth/logout', { method: 'POST' }),
};

// ── Profile ─────────────────────────────────────────────────────────────────

export const profile = {
  get: () => apiJson('/profile'),
  update: (data) =>
    apiJson('/profile', { method: 'PATCH', body: JSON.stringify(data) }),
  completeOnboarding: (data) =>
    apiJson('/profile/onboarding', { method: 'POST', body: JSON.stringify(data) }),
};

// ── Categories ───────────────────────────────────────────────────────────────

export const categories = {
  list: () => apiJson('/categories'),
};

// ── Listings ─────────────────────────────────────────────────────────────────

export const listings = {
  browse: (params = {}) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') q.set(k, String(v));
    });
    return apiJson(`/listings?${q.toString()}`);
  },
  mine: () => apiJson('/listings/mine'),
  get: (id) => apiJson(`/listings/${id}`),
  create: (data) =>
    apiJson('/listings', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) =>
    apiJson(`/listings/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id) =>
    apiJson(`/listings/${id}`, { method: 'DELETE' }),
};

// ── Bookings ─────────────────────────────────────────────────────────────────

export const bookings = {
  list: () => apiJson('/bookings'),
  get: (id) => apiJson(`/bookings/${id}`),
  create: (data) =>
    apiJson('/bookings', { method: 'POST', body: JSON.stringify(data) }),
  proposeTerms: (id, data) =>
    apiJson(`/bookings/${id}/terms`, { method: 'POST', body: JSON.stringify(data) }),
  action: (id, action, extras = {}) =>
    apiJson(`/bookings/${id}/action`, {
      method: 'POST',
      body: JSON.stringify({ action, ...extras }),
    }),
};

// ── Notifications ─────────────────────────────────────────────────────────────

export const notifications = {
  list: () => apiJson('/notifications'),
  markRead: (id) => apiJson(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllRead: () => apiJson('/notifications/read-all', { method: 'PATCH' }),
};

// ── Messages ─────────────────────────────────────────────────────────────────

export const messages = {
  conversations: () => apiJson('/messages'),
  getMessages: (conversationId) => apiJson(`/messages/${conversationId}`),
  send: (conversationId, body) =>
    apiJson(`/messages/${conversationId}`, {
      method: 'POST',
      body: JSON.stringify({ body }),
    }),
};

// ── Dashboard ─────────────────────────────────────────────────────────────────

export const dashboard = {
  overview: () => apiJson('/dashboard/overview'),
};

// ── Support ───────────────────────────────────────────────────────────────────

export const support = {
  tickets: () => apiJson('/support/tickets'),
  create: (subject, body) =>
    apiJson('/support/tickets', {
      method: 'POST',
      body: JSON.stringify({ subject, body }),
    }),
};

// ── Verification ──────────────────────────────────────────────────────────────

export const verification = {
  list: () => apiJson('/verification'),
  submit: (type, submitted_documents = []) =>
    apiJson('/verification', {
      method: 'POST',
      body: JSON.stringify({ type, submitted_documents }),
    }),
};
